package committee

import (
	"context"
	"fmt"
	"net/http"
	"ta-manager-api/repository"

	"firebase.google.com/go/auth"
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

	if user.Role != "Department" && user.Role != "Committee" {
		return false, "User is not proper role"
	}

	return true, "Success"
}

func UpdateFormStatus(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
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
	fmt.Println("parm test", formID)
	if formID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Form ID is required"})
	}

	var updateData struct {
		Status string `json:"status"`
	}
	if err := c.Bind(&updateData); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	fmt.Println("test outs ", updateData)
	err := repo.UpdateFormStatus(ctx, formID, updateData.Status)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Form not found"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Status updated successfully"})
}

func GetCommitteeFormsByStatus(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
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

	status := c.QueryParam("status")
	if status == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "TA ID is required"})
	}

	forms, err := repo.FetchFormsByStatus(ctx, status)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Forms not found"})
	}

	return c.JSON(http.StatusOK, forms)
}
