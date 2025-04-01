package models

import "time"

// Reminder struct to represent the reminder in the database
type Reminder struct {
    ID           int       `json:"id"`
    UserID       int       `json:"user_id"`
    Email        string    `json:"email"`
    ReminderTime time.Time `json:"reminder_time"`
    Content      string    `json:"content"`
    Status       string    `json:"status"`
}
