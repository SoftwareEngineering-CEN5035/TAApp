package department

import (
    "context"
    "net/http"
    "ta-manager-api/models"
    "ta-manager-api/repository"

    "github.com/labstack/echo/v4"
    "firebase.google.com/go/auth"
)


func CreateCourseHandler(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
    ctx := context.Background()
    var course models.Course

    authHeader := c.Request().Header.Get("Authorization")
    if authHeader == "" {
        return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
    }
    tokenString := authHeader[len("Bearer "):] 

    // Verify jwt token
    token, err := authClient.VerifyIDToken(ctx, tokenString)
    if err != nil {
        return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid or expired token"})
    }

    uid := token.UID

	user, err := repo.FetchUserByUID(context.Background(), uid)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve user information"})
	}

    // Authenticate User role
    if user.Role != "Department Staff" {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Insufficient permissions"})
	}

    // Bind json data to course object
    if err := c.Bind(&course); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }

    // Save course object
    err = repo.CreateCourse(ctx, &course)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusCreated, course)
}

