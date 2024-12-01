// routes/routes.go
package routes

import (
	"ta-manager-api/handlers/course"
	"ta-manager-api/handlers/department"
	"ta-manager-api/handlers/login"
	"ta-manager-api/repository"

	"firebase.google.com/go/auth"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo, repo *repository.Repository, authClient *auth.Client) {
	e.POST("/courses", func(c echo.Context) error {
		return department.CreateCourseHandler(c, repo, authClient)
	})
	e.POST("/CreateAccount", func(c echo.Context) error {
		return login.CreateAccount(c, repo, authClient)
	})
	e.PATCH("/Login", func(c echo.Context) error {
		return login.Login(c, repo, authClient)
	})
	e.POST("/GoogleLogin", func(c echo.Context) error {
        return login.GoogleLogin(c, repo, authClient)
    })
	e.DELETE("/courses/:id", func(c echo.Context) error {
		return department.DeleteCourse(c, repo, authClient)
	})
	e.PATCH("/removeTaFromCourse", func(c echo.Context) error {
		return department.RemoveTAFromCourse(c, repo, authClient)
	})
	e.PATCH("/approveTaForCourse", func(c echo.Context) error {
		return department.ApproveTaForCourse(c, repo, authClient)
	})
	e.GET("/forms", func(c echo.Context) error {
		return department.GetForms(c, repo, authClient)
	})
	e.GET("/courses", func(c echo.Context) error {
		return course.GetAllCourses(c, repo, authClient)
	})
	e.GET("/coursesByTA", func(c echo.Context) error {
		return course.GetCoursesByTA(c, repo, authClient)
	})
	e.GET("/forms/:id", func(c echo.Context) error {
		return department.GetFormById(c, repo, authClient)
	})
	e.GET("/users/:role", func(c echo.Context) error {
		return course.GetUserByRole(c, repo, authClient)
	})
}
