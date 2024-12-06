package department

import (
	"context"
	"fmt"
	"net/http"
	"ta-manager-api/models"
	"ta-manager-api/repository"

	"firebase.google.com/go/auth"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func AuthUser(ctx context.Context, tokenString string, repo *repository.Repository, authClient *auth.Client) (bool, string) {
	token, err := authClient.VerifyIDToken(ctx, tokenString)
	if err != nil {
		return false, "Token invalid"
	}

	uid := token.UID
	user, err := repo.FetchUserByUID(context.Background(), uid)
	if err != nil {
		return false, "User not found"
	}

	if user.Role != "Department" {
		return false, "User is not proper role"
	}

	return true, "Success"
}

func CreateCourseHandler(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	ctx := context.Background()
	var course models.Course

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]
	isAuth, authMessage := AuthUser(ctx, tokenString, repo, authClient)

	if !isAuth {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": authMessage})
	}

	// Bind json data to course object
	if err := c.Bind(&course); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	customID := uuid.New().String()
	course.ID = customID

	fmt.Println("yo")
	// Save course object
	err := repo.CreateCourse(ctx, &course)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, course)
}

func DeleteCourse(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	ctx := context.Background()

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]
	isAuth, authMessage := AuthUser(ctx, tokenString, repo, authClient)

	if !isAuth {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": authMessage})
	}

	courseID := c.Param("id")
	if courseID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Course ID is required"})
	}
	err := repo.DeleteCourseByID(ctx, courseID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete course"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Course deleted successfully"})
}

func RemoveTAFromCourse(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	type RemoveTaFromCourseRequest struct {
		ID   string `json:"ID"`
		TaID string `json:"TaID"`
	}
	ctx := context.Background()

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]
	isAuth, authMessage := AuthUser(ctx, tokenString, repo, authClient)

	if !isAuth {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": authMessage})
	}

	var deleteReq RemoveTaFromCourseRequest
	if err := c.Bind(&deleteReq); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
	}

	err := repo.RemoveTAFromCourse(ctx, deleteReq.ID, deleteReq.TaID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to remove TA"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Ta Removed Succesfully"})
}

// Returns all forms
func GetNewForms(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	ctx := context.Background()

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]
	isAuth, authMessage := AuthUser(ctx, tokenString, repo, authClient)

	if !isAuth {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": authMessage})
	}

	formsList, err := repo.GetFormsByStatus(ctx, "New")
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve forms"})
	}

	return c.JSON(http.StatusOK, formsList)
}

// Returns all forms
func GetFormsPending(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	ctx := context.Background()

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]
	isAuth, authMessage := AuthUser(ctx, tokenString, repo, authClient)

	if !isAuth {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": authMessage})
	}

	formsList, err := repo.GetFormsPending(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve forms"})
	}

	return c.JSON(http.StatusOK, formsList)
}

// Gets specifc form by Id
func GetFormById(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	ctx := context.Background()

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]
	isAuth, authMessage := AuthUser(ctx, tokenString, repo, authClient)

	if !isAuth {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": authMessage})
	}

	formID := c.Param("id")
	if formID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Form ID is required"})
	}

	form, err := repo.FetchFormById(ctx, formID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Form not found"})
	}

	return c.JSON(http.StatusOK, form)
}

// Changes form status to approved, and adds TA to the course
func ApproveTaForCourse(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	type ApproveTaRequest struct {
		FormID   string `json:"FormID"`
		TaID     string `json:"TaID"`
		CourseID string `json:"CourseID"`
	}

	ctx := context.Background()

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]
	isAuth, authMessage := AuthUser(ctx, tokenString, repo, authClient)

	if !isAuth {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": authMessage})
	}

	var approveReq ApproveTaRequest
	if err := c.Bind(&approveReq); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
	}

	if err := repo.UpdateFormStatusToApproved(ctx, approveReq.FormID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to approve form"})
	}

	if err := repo.AddTaToCourse(ctx, approveReq.CourseID, approveReq.TaID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to add TA to course"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "TA approved for course successfully"})

}

func GetFormsByTA(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	ctx := context.Background()

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]
	isAuth, authMessage := AuthUser(ctx, tokenString, repo, authClient)

	if !isAuth {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": authMessage})
	}

	taID := c.Param("id")
	if taID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "TA ID is required"})
	}

	forms, err := repo.FetchFormsByTaID(ctx, taID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Forms not found"})
	}

	return c.JSON(http.StatusOK, forms)
}

func UpdateDepartmentForm(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	var form models.Form
	ctx := context.Background()

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]
	isAuth, authMessage := AuthUser(ctx, tokenString, repo, authClient)

	if !isAuth {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": authMessage})
	}

	// Bind json data to form object
	if err := c.Bind(&form); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// Update form object
	err := repo.UpdateFormDepartment(ctx, &form)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, form)
}

func GetDepartmentFormsByTA(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	ctx := context.Background()

	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]
	isAuth, authMessage := AuthUser(ctx, tokenString, repo, authClient)
	if !isAuth {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": authMessage})
	}

	taID := c.Param("taId")
	if taID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "TA ID is required"})
	}

	forms, err := repo.FetchDepartmentFormsByTaID(ctx, taID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Forms not found"})
	}

	return c.JSON(http.StatusOK, forms)
}
