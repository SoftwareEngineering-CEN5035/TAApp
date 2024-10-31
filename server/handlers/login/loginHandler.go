package login

import (
	"context"
	"net/http"
	"ta-manager-api/handlers/department"
	"ta-manager-api/models"
	"ta-manager-api/repository"

	"firebase.google.com/go/auth"
	"github.com/labstack/echo/v4"
)

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

// Expects request in the form of UpdateRoleRequest
func UpdateUserRoleHandler(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
    ctx := context.Background()
    type UpdateRoleRequest struct {
        UserID string `json:"ID"`
        Role   string `json:"Role"`
    }

	authHeader := c.Request().Header.Get("Authorization")
    if authHeader == "" {
        return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
    }
    tokenString := authHeader[len("Bearer "):] 
    isAuth, authMessage := department.AuthUser(ctx, tokenString, repo, authClient)

    if(!isAuth){
        return c.JSON(http.StatusBadRequest, map[string]string{"error": authMessage})
    }

    var updateReq UpdateRoleRequest
    if err := c.Bind(&updateReq); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
    }

    user, err := repo.FetchUserByUID(ctx, updateReq.UserID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "User not found"})
    }

    user.Role = updateReq.Role
    if err := repo.UpdateUser(ctx, user); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update user role"})
    }

    return c.JSON(http.StatusOK, map[string]interface{}{
        "data": "User role updated successfully",
    })
}