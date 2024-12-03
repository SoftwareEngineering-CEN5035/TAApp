package course

import (
	"context"
	"fmt"
	"net/http"
	"ta-manager-api/repository"

	"firebase.google.com/go/auth"
	"github.com/labstack/echo/v4"
)

func AuthUser(ctx context.Context, tokenString string, repo *repository.Repository, authClient *auth.Client) (bool, string) {
	// Validate the token using VerifyIDToken
	fmt.Println(tokenString)
	token, err := authClient.VerifyIDToken(ctx, tokenString)
	if err != nil {
		fmt.Println(err)
		return false, "Invalid or expired token"
	}

	// Extract the UID from the validated token
	uid := token.UID

	// Check if the user exists in the database
	_, err = repo.FetchUserByUID(ctx, uid)
	if err != nil {
		return false, "User not found"
	}

	return true, "Authentication successful"
}

func GetCoursesByTA(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
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

	courses, err := repo.FetchCoursesByTaID(ctx, taID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Courses not found"})
	}

	return c.JSON(http.StatusOK, courses)
}
