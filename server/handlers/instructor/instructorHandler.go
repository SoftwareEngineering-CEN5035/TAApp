package instructor

import (
	"context"
	"ta-manager-api/repository"

	"firebase.google.com/go/auth"
)

// AuthUser function checks if the user is authenticated and has the role of "Department"
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
		return false, "User is not the proper role"
	}

	return true, "Success"
}
