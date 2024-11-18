package ta

import (
    "context"
    "net/http"
    "ta-manager-api/models"
    "ta-manager-api/repository"
    "time"

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

    if user.Role != "TA" {
        return false, "User is not a TA"
    }

    return true, "Success"
}

func CreateTAApplication(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
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

    var application models.TAApplication
    if err := c.Bind(&application); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
    }

    application.CreatedAt = time.Now().Unix()
    application.Status = "Pending"

    if err := repo.CreateTAApplication(ctx, &application); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create application"})
    }

    return c.JSON(http.StatusCreated, application)
}