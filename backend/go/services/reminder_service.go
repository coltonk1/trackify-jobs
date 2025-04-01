package services

import (
	"fmt"
	"log"
	"time"
	"trackify-jobs/database"
	"trackify-jobs/models"

	"github.com/resend/resend-go/v2"
)

// ReminderService handles the logic for creating, retrieving, and processing reminders.
type ReminderService struct {
	DB           *database.PostgresDB // Database instance for interacting with reminders.
	EmailService *EmailService        // Email service for sending emails.
}

func NewReminderService(db *database.PostgresDB, emailService *EmailService) *ReminderService {
	return &ReminderService{DB: db, EmailService: emailService}
}

// StartReminderChecker starts a periodic task to check for emails to send every hour.
func (s *ReminderService) StartReminderChecker() {
	ticker := time.NewTicker(time.Hour) // Check every hour
	defer ticker.Stop()

	for range ticker.C {
		err := s.ProcessPendingReminders()
		if err != nil {
			log.Printf("Error processing reminders: %v", err)
		}
	}
}

// ProcessPendingReminders checks and sends emails for any reminders that are due.
func (s *ReminderService) ProcessPendingReminders() error {
	// Process immediate reminders (send emails that are past due).
	err := s.ProcessImmediateReminders()
	if err != nil {
		return fmt.Errorf("error processing immediate reminders: %w", err)
	}

	return nil
}

// ProcessImmediateReminders sends all immediate reminders that are overdue in chunks of 100 emails.
func (s *ReminderService) ProcessImmediateReminders() error {
	// Fetch all immediate pending reminders
	reminders, err := s.DB.GetImmediatePendingReminders()
	if err != nil {
		return fmt.Errorf("error fetching immediate pending reminders: %w", err)
	}

	// Prepare the list of emails to be sent
	var emailBatch []*resend.SendEmailRequest
	for _, reminder := range reminders {
		// Create email data for each reminder
		emailData := s.EmailService.CreateEmail(reminder.Email, reminder.Content, reminder.Content)
		emailBatch = append(emailBatch, emailData)
	}

	// Split emails into chunks of 100 and send each chunk
	const chunkSize = 99
	for i := 0; i < len(emailBatch); i += chunkSize {
		end := i + chunkSize
		if end > len(emailBatch) {
			end = len(emailBatch)
		}
		chunk := emailBatch[i:end]

		// Send the current chunk of emails
		err := s.EmailService.SendEmailBatch(chunk)
		if err != nil {
			return fmt.Errorf("error sending email batch: %w", err)
		}
	}

	// Update the status of each reminder after successful email sending
	for _, reminder := range reminders {
		if err := s.DB.UpdateReminderStatus(reminder.ID, "sent"); err != nil {
			log.Printf("Failed to update reminder status for reminder %d: %v", reminder.ID, err)
		}
	}

	return nil
}

// GetRemindersByUserID retrieves all reminders for a specific user by their user ID.
func (s *ReminderService) GetRemindersByUserID(userID int) ([]models.Reminder, error) {
	reminders, err := s.DB.GetRemindersByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("error fetching reminders for user %d: %w", userID, err)
	}
	return reminders, nil
}

// GetReminderByID retrieves a specific reminder by its ID.
func (s *ReminderService) GetReminderByID(id int) (*models.Reminder, error) {
	reminder, err := s.DB.GetReminderByID(id)
	if err != nil {
		return nil, fmt.Errorf("error fetching reminder with ID %d: %w", id, err)
	}
	if reminder == nil {
		return nil, fmt.Errorf("reminder with ID %d not found", id)
	}
	return reminder, nil
}

// UpdateReminder updates the details of an existing reminder.
func (s *ReminderService) UpdateReminder(id int, updatedReminder *models.Reminder) error {
	// Get the existing reminder first.
	existingReminder, err := s.DB.GetReminderByID(id)
	if err != nil {
		return fmt.Errorf("error fetching existing reminder with ID %d: %w", id, err)
	}
	if existingReminder == nil {
		return fmt.Errorf("reminder with ID %d not found", id)
	}

	// Update the reminder fields with the new data.
	existingReminder.Content = updatedReminder.Content
	existingReminder.ReminderTime = updatedReminder.ReminderTime
	existingReminder.Status = updatedReminder.Status

	// Update reminder in the database.
	err = s.DB.UpdateReminder(existingReminder)
	if err != nil {
		return fmt.Errorf("error updating reminder with ID %d: %w", id, err)
	}

	return nil
}