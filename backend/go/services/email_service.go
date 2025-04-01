package services

import (
	"fmt"
	"time"

	"github.com/resend/resend-go/v2"
)

// EmailService handles sending emails and respects the rate-limiting of the Resend API.
type EmailService struct {
	Client          *resend.Client                   // Resend API client
	emailQueue      chan []*resend.SendEmailRequest // Queue for emails (single or batch)
	stopChannel     chan bool                        // Channel to stop the goroutine
	rateLimitTime   time.Duration                   // Time between requests (1 request per second)
}

// NewEmailService initializes the email service with the Resend client and queue.
func NewEmailService(apiKey string) *EmailService {
	client := resend.NewClient(apiKey)
	service := &EmailService{
		Client:        client,
		emailQueue:    make(chan []*resend.SendEmailRequest, 100), // Queue to hold emails as to not reach rate limit
		stopChannel:   make(chan bool),
		rateLimitTime: time.Second, // 1 request per second (Resend can handle 2 per second, but still)
	}

	// Start the email worker to process the queue
	go service.ProcessEmailQueue()

	return service
}

func (s *EmailService) CreateEmail(to, subject, body string) (*resend.SendEmailRequest) {
	// Create a single email request without sending it
	emailData := &resend.SendEmailRequest{
		From:    "email@example.com", // Replace with  actual sender email
		To:      []string{to},
		Subject: subject,
		Text:    body,
	}

	return emailData
}

// SendEmail adds a single email to the queue.
func (s *EmailService) SendEmail(to, subject, body string) error {
	// Create a single email request
	emailData := &resend.SendEmailRequest{
		From:    "email@example.com", // Sender email
		To:      []string{to},
		Subject: subject,
		Text:    body,
	}

	// Add the email to the queue
	select {
	case s.emailQueue <- []*resend.SendEmailRequest{emailData}: // Send as a batch with one email
		return nil
	case <-time.After(time.Second): // Timeout if queue is full
		return fmt.Errorf("email queue is full, try again later")
	}
}

// SendEmailBatch adds a batch of emails to the queue.
func (s *EmailService) SendEmailBatch(batch []*resend.SendEmailRequest) error {
	// Add the batch of emails to the queue
	select {
	case s.emailQueue <- batch:
		return nil
	case <-time.After(time.Second): // Timeout if queue is full
		return fmt.Errorf("email queue is full, try again later")
	}
}

// processEmailQueue processes the email queue, sending one request every second.
func (s *EmailService) ProcessEmailQueue() {
	ticker := time.NewTicker(s.rateLimitTime) // Rate-limiting to 1 request per second
	defer ticker.Stop()

	for {
		select {
		case batch := <-s.emailQueue:
			// Process a batch of emails (single or multiple emails in a batch)
			err := s.SendEmailBatch(batch)
			if err != nil {
				// Handle the error (you could log it, for example)
				fmt.Printf("Error sending email batch: %v\n", err)
			}
		case <-ticker.C:
			// Nothing needs to be done here, the select case handles email sending
		case <-s.stopChannel:
			// Stop the goroutine when signaled
			return
		}
	}
}

// Stop stops the email processing goroutine and cleans up resources.
func (s *EmailService) Stop() {
	close(s.stopChannel)
}
