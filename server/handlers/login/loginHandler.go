package login

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"ta-manager-api/models"
	"ta-manager-api/repository"

	"firebase.google.com/go/auth"
	"github.com/labstack/echo/v4"
	"google.golang.org/api/iterator"
)

func CheckUserDocument(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	fmt.Println("fixin check")
	tokenHeader := c.Request().Header.Get("Authorization")
	if tokenHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Authorization header is required"})
	}
	idToken := tokenHeader[len("Bearer "):]

	token, err := authClient.VerifyIDToken(context.Background(), idToken)
	fmt.Println("this yo token:", token)
	if err != nil {
		log.Printf("Invalid token: %v", err)
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
	}

	uid := token.UID
	user, err := repo.FetchUserByUID(context.Background(), uid)
	if err != nil {
		if err == iterator.Done {
			// No document found
			return c.JSON(http.StatusOK, map[string]interface{}{
				"exists": false,
			})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error fetching user document"})
	}
	fmt.Println("this yo uid:", token)

	if user != nil {
		fmt.Println(user.Role)
		return c.JSON(http.StatusOK, map[string]interface{}{
			"exists": true,
			"role":   user.Role,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"exists": false,
	})
}

func AuthUser(ctx context.Context, tokenString string, repo *repository.Repository, authClient *auth.Client) (bool, string) {
	// Validate the token using VerifyIDToken
	token, err := authClient.VerifyIDToken(ctx, tokenString)
	if err != nil {
		fmt.Println(err)
		return false, "Invalid or expired token"
	}

	// Extract the UID from the validated token
	uid := token.UID

	return true, uid
}
func Login(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]

	ctx := context.Background()
	_, UID := AuthUser(ctx, tokenString, repo, authClient)
	user, err := repo.FetchUserByUID(ctx, UID)
	if err != nil || user == nil {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"isAccountMade": false,
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"isAccountMade": true,
		"role":          user.Role, // Returning the user's role
	})
}

var validRoles = map[string]bool{
	"TA":                  true,
	"TA Committee Member": true,
	"Teacher":             true,
	"Department Staff":    true,
}

func NewUserWelcome(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	// Extract Firebase token from Authorization header
	fmt.Println("check")

	tokenHeader := c.Request().Header.Get("Authorization")
	if tokenHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Authorization header is required"})
	}
	idToken := tokenHeader[len("Bearer "):]
	fmt.Println("check")
	// Verify token with Firebase
	token, err := authClient.VerifyIDToken(context.Background(), idToken)
	if err != nil {
		log.Printf("Invalid token: %v", err)
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
	}

	// Extract user email and ID from token
	email := token.Claims["email"].(string)
	uid := token.UID
	fmt.Println(email, uid)

	// Parse form data
	var req struct {
		Name string `json:"name"`
		Role string `json:"role"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	// Validate role
	if !validRoles[req.Role] {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid role"})
	}

	// Create user
	user := &models.User{
		ID:    uid,
		Name:  req.Name,
		Email: email,
		Role:  req.Role,
	}
	if err := repo.CreateUser(context.Background(), user); err != nil {
		log.Printf("Failed to create user: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create user"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "User created successfully"})
}
