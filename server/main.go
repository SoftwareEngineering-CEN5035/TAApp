package main

import (
	"context"
	"encoding/base64"
	"log"
	"net/http"
	"os"
    //"ta-manager-api/repository"

	"firebase.google.com/go"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
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

    // userRepo := repository.NewRepository(client)

    e := echo.New()
    e.GET("/", func(c echo.Context) error {
        return c.String(http.StatusOK, "Firebase and Echo are working!")
    })

    e.Start(":9000")
}
