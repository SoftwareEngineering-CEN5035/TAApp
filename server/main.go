package main

import (
    "context"
    "encoding/base64"
    "log"
    "net/http"
    "os"

    "ta-manager-api/repository"
    "ta-manager-api/routes"

    firebase "firebase.google.com/go"
    "github.com/joho/godotenv"
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
    "google.golang.org/api/option"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }

    firebaseKeyBase64 := os.Getenv("FIREBASE_SERVICE_ACCOUNT")
    firebaseKey, err := base64.StdEncoding.DecodeString(firebaseKeyBase64)
    if err != nil {
        log.Fatalf("Failed to decode service account key: %v", err)
    }

    ctx := context.Background()
    app, err := firebase.NewApp(ctx, nil, option.WithCredentialsJSON(firebaseKey))
    if err != nil {
        log.Fatalf("error initializing app: %v", err)
    }

    client, err := app.Firestore(ctx)
    if err != nil {
        log.Fatalf("error initializing Firestore client: %v", err)
    }
    defer client.Close()

    authClient, err := app.Auth(ctx)
    if err != nil {
        log.Fatalf("Error initializing Firebase Auth client: %v", err)
    }

    e := echo.New()

    // Middleware
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())
    e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
        AllowOrigins: []string{
            "http://localhost:3000", 
        },
        AllowMethods: []string{
            http.MethodGet,
            http.MethodPost,
            http.MethodPut,
            http.MethodPatch,
            http.MethodDelete,
        },
        AllowHeaders: []string{
			"Content-Type",
            "Authorization",
            "Accept",
        },
    }))

    repo := repository.NewRepository(client)
    routes.RegisterRoutes(e, repo, authClient)

    e.GET("/", func(c echo.Context) error {
        return c.String(http.StatusOK, "Firebase and Echo are working!")
    })

    e.Start(":9000")
}