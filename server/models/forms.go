package models

type Form struct {
	ID              string `firestore:"id,omitempty"`
	UploaderID      string `firestore:"uploaderID"`
	CourseAppliedID string `firestore:"courseAppliedID"`
	FileTitle       string `firestore:"fileTitle"`
	FileURL         string `firestore:"fileURL"`
	Status          string `firestore:"status"`
}
