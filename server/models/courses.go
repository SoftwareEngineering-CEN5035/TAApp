package models

type Course struct {
	ID           string   `firestore:"id,omitempty" json:"ID"`
	Name         string   `firestore:"name" json:"Name"`
	InstructorID string   `firestore:"instructorId" json:"InstructorID"`
	TaList       []string `firestore:"taList" json:"TaList"`
	CoursePicture string  `firestore:"coursePicture" json:"CoursePicture"`
}
