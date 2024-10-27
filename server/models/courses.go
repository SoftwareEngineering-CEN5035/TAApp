package models

type Course struct {
	ID           string   `firestore:"id,omitempty"`
	Name         string   `firestore:"name"`
	InstructorID string   `firestore:"instructorId"`
	TaList       []string `firestore:"taList"`
	CoursePicture string  `firestore:"coursePicture"`
}
