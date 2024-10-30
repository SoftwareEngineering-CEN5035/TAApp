// routes/routes.go
package routes

import (
	"firebase.google.com/go/auth"
    "github.com/labstack/echo/v4"
    "ta-manager-api/handlers/department"
    "ta-manager-api/repository"
)

func RegisterRoutes(e *echo.Echo, repo *repository.Repository, authClient *auth.Client) {
    e.POST("/courses", func(c echo.Context) error {
        return department.CreateCourseHandler(c, repo, authClient)
    })

}
