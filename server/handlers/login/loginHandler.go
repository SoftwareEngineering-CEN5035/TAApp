package login

import (
	"context"
	"net/http"
	"ta-manager-api/models"
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
	_, err = repo.FetchUserByUID(context.Background(), uid)
	if err != nil {
		return false, "User not found"
	}

    return true, "Success"
}

/*Expects a request with the following user object parameter -
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

	existingUser, err := repo.FetchUserByUID(ctx, user.ID)
	if err != nil && err.Error() != "user not found" {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error checking user existence"})
	}

	if existingUser == nil {
		if err := repo.CreateUser(ctx, &user); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create new user"})
		}
		existingUser = &user
	}else{
		return c.JSON(http.StatusOK, map[string]interface{}{
			"data": "User already exists",
		})	
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": existingUser,
	})	
}

func Login(c echo.Context, authClient *auth.Client) error {
	type LoginRequest struct {
		UserID string `json:"ID"`
	}
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request, user id does not exist"})
	}

	ctx := context.Background()
	token, err := authClient.CustomToken(ctx, req.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token": token,
	})

}