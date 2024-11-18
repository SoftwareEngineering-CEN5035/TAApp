package models

type TAApplication struct {
	ID                 string          `firestore:"id,omitempty"`
	UserID             string          `firestore:"userId"`
	HasPriorExperience bool            `firestore:"hasPriorExperience"`
	PriorCourses       []PriorTACourse `firestore:"priorCourses"`
	PreferredCourses   []string        `firestore:"preferredCourses"` // Course IDs
	CVUrl              string          `firestore:"cvUrl"`
	Status             string          `firestore:"status"` // "Pending", "Approved", "Rejected"
	CreatedAt          int64           `firestore:"createdAt"`
}

type PriorTACourse struct {
	CourseID   string `firestore:"courseId"`
	CourseName string `firestore:"courseName"`
	StartDate  string `firestore:"startDate"`
	EndDate    string `firestore:"endDate"`
}
