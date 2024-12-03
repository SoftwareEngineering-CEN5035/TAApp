package models

type User struct {
	ID    string `firestore:"id,omitempty"`
	Name  string `firestore:"name"`
	Email string `firestore:"email"`
	Role  string `firestore:"role"`
}
