package models

type Course struct {
	ID             string   `firestore:"id" json:"ID"`
	Name           string   `firestore:"name" json:"Name"`
	Type           string   `firestore:"type" json:"Type"`
	InstructorName string   `firestore:"instructorName" json:"InstructorName"`
	InstructorID   string   `firestore:"instructorId" json:"InstructorID"`
	TaList         []string `firestore:"taList" json:"TaList"`
}
