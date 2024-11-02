package repository

import (
	"context"
	"log"
	"ta-manager-api/models"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
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

func (r *Repository) UpdateUser(ctx context.Context, user *models.User) error {
    _, err := r.client.Collection("users").Doc(user.ID).Set(ctx, map[string]interface{}{
		"name": user.Name,
		"email": user.Email,
		"profilePicture": user.ProfilePicture,
        "role": user.Role,
    }, firestore.MergeAll)
    return err
}

func (r *Repository) DeleteCourseByID(ctx context.Context, courseID string) error {
	_, err := r.client.Collection("courses").Doc(courseID).Delete(ctx)
	return err
}

func (r *Repository) RemoveTAFromCourse(ctx context.Context, courseID string, taID string) error {
	courseRef := r.client.Collection("courses").Doc(courseID)
	
	courseSnap, err := courseRef.Get(ctx)
	if err != nil {
		log.Printf("Failed to get course: %v", err)
		return err
	}

	var course models.Course
	if err := courseSnap.DataTo(&course); err != nil {
		log.Printf("Failed to parse course data: %v", err)
		return err
	}

	newTaList := []string{}
	for _, ta := range course.TaList {
		if ta != taID {
			newTaList = append(newTaList, ta)
		}
	}
	
	_, err = courseRef.Update(ctx, []firestore.Update{
		{Path: "taList", Value: newTaList},
	})
	if err != nil {
		log.Printf("Failed to update course TA list: %v", err)
		return err
	}

	log.Printf("Successfully removed TA %s from course %s", taID, courseID)
	return nil
}

func (r *Repository) GetAllForms(ctx context.Context) ([]models.Form, error) {
    var forms []models.Form
    iter := r.client.Collection("forms").Documents(ctx)
    defer iter.Stop() 
    for {
        doc, err := iter.Next()
        if err == iterator.Done {
            break
        }
        if err != nil {
            log.Printf("Error retrieving forms: %v", err)
            return nil, err
        }
        var form models.Form
        if err := doc.DataTo(&form); err != nil {
            log.Printf("Error decoding form data: %v", err)
            return nil, err
        }
        form.ID = doc.Ref.ID
        forms = append(forms, form)
    }
    return forms, nil
}

func (r *Repository) FetchFormById(ctx context.Context, formID string) (*models.Form, error) {
	iter := r.client.Collection("forms").Where("id", "==", formID).Limit(1).Documents(ctx)
	doc, err := iter.Next()
	if err != nil {
		return nil, err
	}
	var form models.Form
	if err := doc.DataTo(&form); err != nil {
		return nil, err
	}

	return &form, nil
}

func (r *Repository) UpdateFormStatusToApproved(ctx context.Context, formID string) error {
	formRef := r.client.Collection("forms").Doc(formID)

	_, err := formRef.Update(ctx, []firestore.Update{
		{Path: "status", Value: "Approved"},
	})
	if err != nil {
		log.Printf("Failed to update form status: %v", err)
		return err
	}
	return nil
}

func (r *Repository) AddTaToCourse(ctx context.Context, courseID, taID string) error {
    courseRef := r.client.Collection("courses").Doc(courseID)
    _, err := courseRef.Update(ctx, []firestore.Update{
        {Path: "taList", Value: firestore.ArrayUnion(taID)},
    })
    return err
}
