package repository

import (
    "context"
    "cloud.google.com/go/firestore"
    "log"
    "ta-manager-api/models"
)

type Repository struct {
    client *firestore.Client
}

func NewRepository(client *firestore.Client) *Repository {
    return &Repository{client: client}
}

func (r *Repository) CreateUser(ctx context.Context, user *models.User) error {
    _, _, err := r.client.Collection("users").Add(ctx, user)
    if err != nil {
        log.Printf("Failed to create user: %v", err)
        return err
    }
    return nil
}

func (r *Repository) CreateCourse(ctx context.Context, course *models.Course) error {
    _, _, err := r.client.Collection("courses").Add(ctx, course)
    if err != nil {
        log.Printf("Failed to create course: %v", err)
        return err
    }
    return nil
}

func (r *Repository) CreateForm(ctx context.Context, form *models.Form) error {
    _, _, err := r.client.Collection("forms").Add(ctx, form)
    if err != nil {
        log.Printf("Failed to create form: %v", err)
        return err
    }
    return nil
}

func (r *Repository) FetchUserByUID(ctx context.Context, uid string) (*models.User, error) {
	iter := r.client.Collection("users").Where("id", "==", uid).Limit(1).Documents(ctx)
	doc, err := iter.Next()
	if err != nil {
		return nil, err
	}

	var user models.User
	if err := doc.DataTo(&user); err != nil {
		return nil, err
	}

	return &user, nil
}


