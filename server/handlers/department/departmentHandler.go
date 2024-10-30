package department

import (
    "context"
    "net/http"
    "ta-manager-api/models"
    "ta-manager-api/repository"

    "github.com/labstack/echo/v4"
    "firebase.google.com/go/auth"
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

    if user.Role != "Department Staff" {
		return false, "User is not proper role"
	}

    return true, "Success"
}

func CreateCourseHandler(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
    ctx := context.Background()
    var course models.Course

    authHeader := c.Request().Header.Get("Authorization")
    if authHeader == "" {
        return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
    }
    tokenString := authHeader[len("Bearer "):] 
    isAuth, authMessage := AuthUser(ctx, tokenString, repo, authClient)

    if(!isAuth){
        return c.JSON(http.StatusBadRequest, map[string]string{"error": authMessage})
    }

    // Bind json data to course object
    if err := c.Bind(&course); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }

    // Save course object
    err := repo.CreateCourse(ctx, &course)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusCreated, course)
}

