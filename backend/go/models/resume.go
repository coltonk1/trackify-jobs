package models

type Resume struct {
	ID         int    `json:"id"`
	UserID     string `json:"user_id"`
	Filename   string `json:"filename"`
	UploadedAt string `json:"uploaded_at"`
}
