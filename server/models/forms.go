package models

type Form struct {
	ID              string `firestore:"id,omitempty" json:"ID"`
	UploaderID      string `firestore:"uploaderID" json:"UploaderID"`
	UploaderName    string `firestore:"uploaderName" json:"UploaderName"`
	CourseAppliedID string `firestore:"courseAppliedID" json:"CourseAppliedID"`
	FileTitle       string `firestore:"fileTitle" json:"FileTitle"`
	FileURL         string `firestore:"fileURL" json:"FileURL"`
	Status          string `firestore:"status" json:"Status"`
}
