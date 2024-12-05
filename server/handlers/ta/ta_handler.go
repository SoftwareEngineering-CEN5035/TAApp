package ta

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

	if user.Role != "TA" {
		return false, "User is not a TA"
	}

	return true, "Success"
}

// Function to create a TA application
func CreateTAApplication(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	fmt.Println("Starting to create the TA application")
	ctx := context.Background()

	// Retrieve the Authorization header
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]

	// Verify and authenticate user
	token, err := authClient.VerifyIDToken(ctx, tokenString)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
	}
	uid := token.UID

	// Fetch user details from Firebase
	user, err := repo.FetchUserByUID(ctx, uid)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve user details"})
	}

	// Validate user role
	if user.Role != "TA" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "User is not authorized to apply"})
	}

	// Bind the request body to the application struct
	var application models.Form
	if err := c.Bind(&application); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
	}
	fmt.Println(application)

	// Populate application details
	application.ID = uuid.NewString()
	fmt.Println("this yo uid n name:", uid, user.Name)
	application.UploaderID = uid
	application.UploaderName = user.Name
	application.Status = "Pending"

	// Save application to Firebase
	if err := repo.CreateTAApplication(ctx, &application); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save application"})
	}

	fmt.Println("Successfully created the TA application")
	return c.JSON(http.StatusCreated, application)
}
