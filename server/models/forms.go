package models

type Form struct {
	ID                 string `firestore:"id,omitempty"`
	UploaderID         string `firestore:"uploaderID"`
	UploaderName       string `firestore:"uploaderName"` // Corrected field tag for UploaderName
	HasPriorExperience bool   `firestore:"hasPriorExperience"`
	CourseAppliedID    string `firestore:"courseAppliedID"`
	FileTitle          string `firestore:"fileTitle"`
	FileURL            string `firestore:"fileURL"`
	Status             string `firestore:"status"`
}
