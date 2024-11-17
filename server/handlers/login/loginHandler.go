package login

import (
	"context"
	"net/http"
	"ta-manager-api/models"
	"ta-manager-api/repository"

	"firebase.google.com/go/auth"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

func AuthUser(ctx context.Context, tokenString string, repo *repository.Repository, authClient *auth.Client) (bool, string) {
	token, err := authClient.VerifyIDToken(ctx, tokenString)
	if err != nil {
		return false, "Token invalid"
	}

	uid := token.UID
	_, err = repo.FetchUserByUID(context.Background(), uid)
	if err != nil {
		return false, "User not found"
	}

	return true, "Success"
}

/*
Expects a request with the following user object parameter -

	{
		ID: "string"
		Name: "string"
		Email: "string"
		Role: "",
		ProfilePicture: "Default (Will probably be a placeholder like the youtuber pfp)"
	}
*/
func CreateAccount(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	ctx := context.Background()
	var user models.User

	if err := c.Bind(&user); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
	}

	// Hash the password before storing it
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to hash password"})
	}
	user.Password = string(hashedPassword)

	err = repo.CheckUserExists(ctx, user.ID)
	if err != nil && err.Error() != "user not found" {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error checking user existence"})
	}

	if err := repo.CreateUser(ctx, &user); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create new user"})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"data": user,
	})
}

func Login(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	type LoginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
	}

	ctx := context.Background()
	user, err := repo.FetchUserByEmail(ctx, req.Email)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid email or password"})
	}

	// Compare the hashed password with the provided password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid email or password"})
	}

	token, err := authClient.CustomToken(ctx, user.ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token": token,
		"id": user.ID,
	})
}

func GoogleLogin(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	type GoogleLoginRequest struct {
		Token string `json:"token"`
	}
	var req GoogleLoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
	}

	ctx := context.Background()
	token, err := authClient.VerifyIDToken(ctx, req.Token)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
	}

	uid := token.UID
	user, err := repo.FetchUserByUID(ctx, uid)
	if err != nil {
		// If user does not exist, create a new user
		user = &models.User{
			ID:    uid,
			Email: token.Claims["email"].(string),
			Name:  token.Claims["name"].(string),
			Role:  "user",
		}
		if err := repo.CreateUser(ctx, user); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create new user"})
		}
	}

	// Generate a custom token for the user
	customToken, err := authClient.CustomToken(ctx, user.ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token": customToken,
		"id": user.ID,
	})
}
