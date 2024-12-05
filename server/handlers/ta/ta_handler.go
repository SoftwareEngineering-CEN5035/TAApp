package ta

import (
	"context"
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

	if user.Role != "TA" {
		return false, "User is not a TA"
	}

	return true, "Success"
}
func CreateTAApplication(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	ctx := context.Background()

	// Retrieve and validate the Authorization header
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]
	token, err := authClient.VerifyIDToken(ctx, tokenString)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
	}
	uid := token.UID

	// Fetch user details
	user, err := repo.FetchUserByUID(ctx, uid)
	if err != nil || user.Role != "TA" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "User is not authorized to apply"})
	}

	// Bind the request body to the Form struct
	var application models.Form
	if err := c.Bind(&application); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
	}

	// Ensure a course is selected
	if application.CourseAppliedID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "You must select a course to apply for"})
	}

	// Populate application fields
	application.ID = uuid.NewString()
	application.UploaderID = uid
	application.UploaderName = user.Name
	application.Status = "Pending"

	// Save application to Firestore
	if err := repo.CreateTAApplication(ctx, &application); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save application"})
	}

	return c.JSON(http.StatusCreated, application)
}
