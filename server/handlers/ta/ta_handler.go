package ta

import (
	"bytes"
	"context"
	"fmt"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"ta-manager-api/models"
	"ta-manager-api/repository"

	"firebase.google.com/go/auth"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
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

// UploadFileToS3 uploads a file to an S3 bucket and returns the file URL
func UploadFileToS3(ctx context.Context, bucketName string, file multipart.File, fileName string) (string, error) {
	fmt.Println("we gettin started with s3 upload n shiii")

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return "", err
	}

	s3Client := s3.NewFromConfig(cfg)

	// Read file content
	buffer := bytes.NewBuffer(nil)
	if _, err := buffer.ReadFrom(file); err != nil {
		return "", err
	}

	// Upload file
	_, err = s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(fileName),
		Body:        bytes.NewReader(buffer.Bytes()),
		ContentType: aws.String("application/pdf"),
	})
	if err != nil {
		return "", err
	}

	// Return the file URL
	fmt.Println("we done uploading n shiii")

	return "https://" + bucketName + ".s3.amazonaws.com/" + fileName, nil
}

func CreateTAApplication(c echo.Context, repo *repository.Repository, authClient *auth.Client) error {
	fmt.Println("we startin shiii")
	ctx := context.Background()

	// Validate token
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
	}
	tokenString := authHeader[len("Bearer "):]
	token, err := authClient.VerifyIDToken(ctx, tokenString)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
	}
	uid := token.UID

	// Fetch user details

	user, err := repo.FetchUserByUID(ctx, uid)
	if err != nil || user.Role != "TA" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "User is not authorized to apply"})
	}
	fmt.Println("we gettin users n shiii")

	// Read form values
	hasPriorExperience := c.FormValue("hasPriorExperience") == "true"
	preferredCourse := c.FormValue("preferredCourse")

	// Validate file upload
	file, err := c.FormFile("file")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "File is required"})
	}
	src, err := file.Open()
	fmt.Println("we gettin files n shiii")

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to open file"})
	}
	defer src.Close()

	// Generate a unique file name
	fileID := uuid.New().String()
	fileName := fileID + filepath.Ext(file.Filename)

	// Upload file to S3
	fileURL, err := UploadFileToS3(ctx, "taapplication", src, fileName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to upload file to S3"})
	}

	// Create application record
	application := models.Form{
		ID:                 uuid.NewString(),
		UploaderID:         uid,
		UploaderName:       user.Name,
		HasPriorExperience: hasPriorExperience,
		CourseAppliedID:    preferredCourse,
		FileURL:            fileURL,
		Status:             "Pending",
	}

	if err := repo.CreateTAApplication(ctx, &application); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save application"})
	}

	return c.JSON(http.StatusCreated, application)
}
