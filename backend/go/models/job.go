package models

import "time"

type Job struct {
	ID        int       `json:"id"`
	UserID    string    `json:"user_id"`
	Title     string    `json:"title"`
	Company   string    `json:"company"`
	Location  string    `json:"location"`
	Status    string    `json:"status"` // e.g. "applied", "interviewing", etc.
	Notes     string    `json:"notes"`
	URL       string    `json:"url"` // link to the job posting
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
