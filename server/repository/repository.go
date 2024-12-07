package repository

import (
	"context"
	"fmt"
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

func (r *Repository) FetchCourseByID(ctx context.Context, ID string) (*models.Course, error) {
	iter := r.client.Collection("courses").Where("id", "==", ID).Limit(1).Documents(ctx)
	doc, err := iter.Next()
	if err != nil {
		return nil, err
	}
	var course models.Course
	if err := doc.DataTo(&course); err != nil {
		return nil, err
	}

	return &course, nil
}

func (r *Repository) FetchUsersByRole(ctx context.Context, role string) ([]models.User, error) {
	iter := r.client.Collection("users").Where("role", "==", role).Documents(ctx)

	var users []models.User
	for {
		doc, err := iter.Next()
		if err != nil {
			if err == iterator.Done {
				break
			}
			return nil, err
		}

		var user models.User
		if err := doc.DataTo(&user); err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	return users, nil
}
func (r *Repository) CreateUser(ctx context.Context, user *models.User) error {
	// Check if a user with the same UID already exists
	iter := r.client.Collection("users").Where("id", "==", user.ID).Documents(ctx)
	defer iter.Stop()

	if snapshot, err := iter.Next(); err == nil && snapshot.Exists() {
		// User with the same UID already exists
		return fmt.Errorf("user with ID %s already exists", user.ID)
	} else if err != nil && err != iterator.Done {
		// Some error occurred during query
		log.Printf("Failed to query users: %v", err)
		return err
	}

	// Add new user since no duplicates were found
	_, _, err := r.client.Collection("users").Add(ctx, map[string]interface{}{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
	})
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
	println("this is uid")
	println(uid)

	iter := r.client.Collection("users").Where("id", "==", uid).Limit(1).Documents(ctx)
	doc, err := iter.Next()
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	var user models.User
	if err := doc.DataTo(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) CheckUserExists(ctx context.Context, uid string) error {
	iter := r.client.Collection("users").Where("id", "==", uid).Limit(1).Documents(ctx)
	_, err := iter.Next()

	if err == iterator.Done {
		return nil
	}

	if err != nil {
		return err
	}

	return fmt.Errorf("user with ID %s already exists", uid)
}

func (r *Repository) UpdateUser(ctx context.Context, user *models.User) error {
	_, err := r.client.Collection("users").Doc(user.ID).Set(ctx, map[string]interface{}{
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
	}, firestore.MergeAll)
	return err
}

func (r *Repository) UpdateCourse(ctx context.Context, course *models.Course) error {
	courseQuery := r.client.Collection("courses").Where("id", "==", course.ID).Limit(1)
	courseDocs, err := courseQuery.Documents(ctx).GetAll()
	if err != nil {
		log.Printf("Failed to retrieve course by ID: %v", err)
		return err
	}

	if len(courseDocs) == 0 {
		log.Printf("No course found with ID: %s", course.ID)
		return fmt.Errorf("course not found")
	}

	courseRef := courseDocs[0].Ref

	_, err = courseRef.Set(ctx, map[string]interface{}{
		"name":           course.Name,
		"type":           course.Type,
		"instructorName": course.InstructorName,
		"instructorID":   course.InstructorID,
		"taList":         course.TaList,
		"taIDList":       course.TaIDList,
	}, firestore.MergeAll)
	if err != nil {
		log.Printf("Failed to update course: %v", err)
		return err
	}

	log.Printf("Successfully updated course with ID: %s", course.ID)
	return nil
}

func (r *Repository) UpdateFormDepartment(ctx context.Context, form *models.Form) error {
	formQuery := r.client.Collection("forms").Where("id", "==", form.ID).Limit(1)
	formDocs, err := formQuery.Documents(ctx).GetAll()
	if err != nil {
		log.Printf("Failed to retrieve form by ID: %v", err)
		return err
	}

	if len(formDocs) == 0 {
		log.Printf("No form found with ID: %s", form.ID)
		return fmt.Errorf("form not found")
	}

	formRef := formDocs[0].Ref

	_, err = formRef.Set(ctx, map[string]interface{}{
		"status": form.Status,
	}, firestore.MergeAll)
	if err != nil {
		log.Printf("Failed to update Form: %v", err)
		return err
	}

	log.Printf("Successfully updated form with ID: %s", form.ID)
	return nil
}

func (r *Repository) DeleteCourseByID(ctx context.Context, courseID string) error {
	query := r.client.Collection("courses").Where("id", "==", courseID).Limit(1).Documents(ctx)
	defer query.Stop()
	doc, err := query.Next()
	if err != nil {
		if err == iterator.Done {
			println("no course found with ID: %s", courseID)
			return fmt.Errorf("no course found with ID: %s", courseID)
		}
		return fmt.Errorf("error fetching course: %w", err)
	}

	_, err = doc.Ref.Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete course with ID %s: %w", courseID, err)
	}

	return nil
}

func (r *Repository) RemoveTAFromCourse(ctx context.Context, courseID string, taID string) error {
	query := r.client.Collection("courses").Where("id", "==", courseID).Limit(1).Documents(ctx)
	defer query.Stop()

	doc, err := query.Next()
	if err != nil {
		if err == iterator.Done {
			log.Printf("No course found with ID: %s", courseID)
			return fmt.Errorf("no course found with ID: %s", courseID)
		}
		log.Printf("Error fetching course: %v", err)
		return err
	}

	var course models.Course
	if err := doc.DataTo(&course); err != nil {
		log.Printf("Failed to parse course data: %v", err)
		return err
	}

	newTaList := []string{}
	for _, ta := range course.TaList {
		if ta != taID {
			newTaList = append(newTaList, ta)
		}
	}

	_, err = doc.Ref.Update(ctx, []firestore.Update{
		{Path: "taList", Value: newTaList},
	})
	if err != nil {
		log.Printf("Failed to update course TA list: %v", err)
		return err
	}

	log.Printf("Successfully removed TA %s from course %s", taID, courseID)
	return nil
}

func (r *Repository) GetFormsByStatus(ctx context.Context, status string) ([]models.Form, error) {
	var forms []models.Form
	iter := r.client.Collection("forms").Where("status", "==", status).Documents(ctx)
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
		forms = append(forms, form)
	}
	return forms, nil
}

func (r *Repository) FetchFormsByUploaderID(ctx context.Context, uploaderID string) ([]models.Form, error) {
	var forms []models.Form
	iter := r.client.Collection("forms").Where("uploaderID", "==", uploaderID).Documents(ctx)
	for {
		doc, err := iter.Next()
		if err != nil {
			if err == iterator.Done {
				break
			}
			return nil, err
		}
		var form models.Form
		if err := doc.DataTo(&form); err != nil {
			return nil, err
		}
		forms = append(forms, form)
	}
	return forms, nil
}

func (r *Repository) GetFormsPending(ctx context.Context) ([]models.Form, error) {
	var forms []models.Form
	iter := r.client.Collection("forms").Where("status", "in", []interface{}{"Pending Applicant Approval", "TA Rejected", "Accepted"}).Documents(ctx)
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
		forms = append(forms, form)
	}
	return forms, nil
}

func (r *Repository) GetAllCourses(ctx context.Context) ([]models.Course, error) {
	var courses []models.Course
	iter := r.client.Collection("courses").Documents(ctx)
	defer iter.Stop()
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("Error retrieving courses: %v", err)
			return nil, err
		}
		var course models.Course
		if err := doc.DataTo(&course); err != nil {
			log.Printf("Error decoding course data: %v", err)
			return nil, err
		}
		courses = append(courses, course)
	}
	return courses, nil
}

func (r *Repository) FetchFormById(ctx context.Context, formID string) (*models.Form, error) {
	docRef := r.client.Collection("forms").Doc(formID) // Replace with your document ID
	doc, err := docRef.Get(ctx)                        // Retrieve the document snapshot
	if err != nil {
		fmt.Println("Error retrieving document:", err)
		return nil, err
	}

	var application models.Form
	if err := doc.DataTo(&application); err != nil {
		fmt.Println("Error mapping document data:", err)
		return nil, err
	}

	return &application, nil
}

// func (r *Repository) UpdateFormStatus(ctx context.Context, form *models.Form) error {
// 	_, err := r.client.Collection("forms").Doc(form.ID).Set(ctx, form)
// 	return err
// }

func (r *Repository) UpdateFormStatusToApproved(ctx context.Context, formID string) error {
	query := r.client.Collection("forms").Where("id", "==", formID).Limit(1).Documents(ctx)
	defer query.Stop()

	doc, err := query.Next()
	if err != nil {
		if err == iterator.Done {
			log.Printf("No form found with ID: %s", formID)
			return fmt.Errorf("no form found with ID: %s", formID)
		}
		log.Printf("Error fetching form: %v", err)
		return err
	}

	_, err = doc.Ref.Update(ctx, []firestore.Update{
		{Path: "status", Value: "Approved"},
	})
	if err != nil {
		log.Printf("Failed to update form status: %v", err)
		return err
	}

	log.Printf("Successfully updated form status to Approved for ID %s", formID)
	return nil
}

// UpdateFormStatus updates the status of a form identified by formID to newStatus.
func (r *Repository) UpdateFormStatus(ctx context.Context, formID string, newStatus string) error {
	// Reference to the specific document in the "forms" collection
	docRef := r.client.Collection("forms").Doc(formID)

	// Attempt to get the document to ensure it exists
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		// For other errors, log and return
		log.Printf("Error fetching form with ID %s: %v", formID, err)
		return err
	}

	// Optional: Log the current status before update
	var currentStatus string
	if err := docSnapshot.DataTo(&currentStatus); err != nil {
		log.Printf("Error retrieving current status for form ID %s: %v", formID, err)
		// Proceeding with the update even if current status retrieval fails
	}

	// Perform the update operation
	_, err = docRef.Update(ctx, []firestore.Update{
		{Path: "status", Value: newStatus},
	})
	if err != nil {
		log.Printf("Failed to update form status for ID %s: %v", formID, err)
		return err
	}

	log.Printf("Successfully updated form status to '%s' for ID %s", newStatus, formID)
	return nil
}

func (r *Repository) AddTaToCourse(ctx context.Context, courseID, taID string) error {
	query := r.client.Collection("courses").Where("id", "==", courseID).Limit(1).Documents(ctx)
	defer query.Stop()

	doc, err := query.Next()
	if err != nil {
		if err == iterator.Done {
			log.Printf("No course found with ID: %s", courseID)
			return fmt.Errorf("no course found with ID: %s", courseID)
		}
		log.Printf("Error fetching course: %v", err)
		return err
	}

	_, err = doc.Ref.Update(ctx, []firestore.Update{
		{Path: "taList", Value: firestore.ArrayUnion(taID)},
	})
	if err != nil {
		log.Printf("Failed to add TA to course: %v", err)
		return err
	}

	log.Printf("Successfully added TA %s to course with ID %s", taID, courseID)
	return nil
}

func (r *Repository) FetchCoursesByTaID(ctx context.Context, taID string) ([]models.Course, error) {
	var courses []models.Course

	query := r.client.Collection("courses").Where("taList", "array-contains", taID)
	iter := query.Documents(ctx)

	defer iter.Stop()

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		var course models.Course
		if err := doc.DataTo(&course); err != nil {
			return nil, err
		}
		courses = append(courses, course)
	}

	return courses, nil
}

func (r *Repository) FetchDepartmentFormsByTaID(ctx context.Context, taID string) ([]models.Form, error) {
	var forms []models.Form

	query := r.client.Collection("forms").Where("uploaderID", "==", taID).Where("status", "==", "New")
	iter := query.Documents(ctx)

	defer iter.Stop()

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		var form models.Form
		if err := doc.DataTo(&form); err != nil {
			return nil, err
		}
		forms = append(forms, form)
	}

	return forms, nil
}

func (r *Repository) FetchFormsByStatus(ctx context.Context, status string) ([]models.Form, error) {
	var forms []models.Form

	// Update the query to filter by "Status" instead of "uploaderID"
	query := r.client.Collection("forms").Where("status", "==", status)
	iter := query.Documents(ctx)

	defer iter.Stop()

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		var form models.Form
		if err := doc.DataTo(&form); err != nil {
			return nil, err
		}
		form.ID = doc.Ref.ID
		forms = append(forms, form)
	}

	return forms, nil
}

func (r *Repository) FetchFormsByTaID(ctx context.Context, taID string) ([]models.Form, error) {
	var forms []models.Form

	query := r.client.Collection("forms").Where("uploaderID", "==", taID)
	iter := query.Documents(ctx)

	defer iter.Stop()

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		var form models.Form
		if err := doc.DataTo(&form); err != nil {
			return nil, err
		}
		form.ID = doc.Ref.ID
		forms = append(forms, form)
	}

	return forms, nil
}

func (r *Repository) CreateTAApplication(ctx context.Context, application *models.Form) error {
	_, _, err := r.client.Collection("forms").Add(ctx, application)
	if err != nil {
		log.Printf("Failed to create TA application: %v", err)
		return err
	}
	return nil
}

func (r *Repository) GetApplicationByID(ctx context.Context, id string) (*models.Form, error) {
	fmt.Println("this yo mf id bum?:", id)

	iter := r.client.Collection("forms").Where("id", "==", id).Limit(1).Documents(ctx)
	doc, err := iter.Next() // Fetch the next document in the iterator
	if err != nil {
		if err == iterator.Done {
			fmt.Println("No matching document found")
			return nil, nil
		}
		fmt.Println(err)
		return nil, err
	}

	var application models.Form
	if err := doc.DataTo(&application); err != nil {
		return nil, err
	}

	return &application, nil

}

// UpdateApplicationStatus updates the status of an application
func (r *Repository) UpdateApplicationStatus(ctx context.Context, id, status string) error {
	fmt.Println("Updating status for ID:", id)

	// Query for the document where `id` matches
	iter := r.client.Collection("forms").Where("id", "==", id).Limit(1).Documents(ctx)
	doc, err := iter.Next() // Fetch the first document in the iterator
	if err != nil {
		if err == iterator.Done {
			fmt.Println("No matching document found")
			return nil // No document found; nothing to update
		}
		fmt.Println("Error fetching document:", err)
		return err
	}

	// Update the status field
	_, err = doc.Ref.Update(ctx, []firestore.Update{
		{
			Path:  "status", // The field you want to update
			Value: status,   // The new value for the field
		},
	})
	if err != nil {
		fmt.Println("Error updating document status:", err)
		return err
	}

	fmt.Println("Status updated successfully for ID:", id)
	return nil
}
