package models

type User struct {
    ID             string `firestore:"id,omitempty"`
    Name           string `firestore:"name"`
    Email          string `firestore:"email"`
    Password       string `firestore:"password"`
    Role           string `firestore:"role"`
    ProfilePicture string `firestore:"profilePicture"`
}