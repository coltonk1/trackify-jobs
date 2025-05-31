package database

import (
	"database/sql"
	"fmt"
	"trackify-jobs/models"

	_ "github.com/lib/pq"
)

// PostgresDB is a wrapper around the *sql.DB type that represents a PostgreSQL database connection.
type PostgresDB struct {
	*sql.DB // Embeds the *sql.DB type to use its methods for database operations
}

// NewPostgresDB creates a new PostgresDB instance by opening a connection to the PostgreSQL database.
// It checks if the connection is successful by calling db.Ping().
func NewPostgresDB(connStr string) (*PostgresDB, error) {
	// Open a connection to the PostgreSQL database using the provided connection string.
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		// If an error occurs while opening the connection, return nil and the error.
		return nil, err
	}

	// Check if the database connection is alive by calling db.Ping().
	if err = db.Ping(); err != nil {

		// If Ping fails, return nil and the error.
		return nil, err
	}

	// Return a new PostgresDB instance with the open connection.
	return &PostgresDB{db}, nil
}

// ===================================
//  Reminder & Email Scheduling Logic
// ===================================

// CreateReminder inserts a new reminder into the database and returns the created reminder.
func (db *PostgresDB) CreateReminder(reminder *models.Reminder) (*models.Reminder, error) {
	// Execute the query to insert a new reminder.
	row := db.QueryRow(
		"INSERT INTO reminders (user_id, email, reminder_time, content, status) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		reminder.UserID, reminder.Email, reminder.ReminderTime, reminder.Content, reminder.Status,
	)

	// Scan the returned ID into the reminder object.
	err := row.Scan(&reminder.ID)
	if err != nil {
		// Return error if insertion fails.
		return nil, fmt.Errorf("error creating reminder: %w", err)
	}

	// Return the created reminder with its assigned ID.
	return reminder, nil
}

// GetReminder retrieves a reminder by its ID from the database.
func (db *PostgresDB) GetReminder(id int) (*models.Reminder, error) {
	// Execute the query to fetch a reminder by ID.
	row := db.QueryRow("SELECT id, user_id, email, reminder_time, content, status FROM reminders WHERE id = $1", id)

	// Create a Reminder object to hold the data from the query.
	reminder := &models.Reminder{}
	// Scan the row and populate the reminder fields with the values from the database.
	err := row.Scan(&reminder.ID, &reminder.UserID, &reminder.Email, &reminder.ReminderTime, &reminder.Content, &reminder.Status)

	if err != nil {
		if err == sql.ErrNoRows {
			// If no rows are found, return nil to indicate the reminder doesn't exist.
			return nil, nil
		}
		// Return error if scanning fails.
		return nil, fmt.Errorf("error scanning reminder: %w", err)
	}

	// Return the populated reminder object if no errors occurred.
	return reminder, nil
}

// GetImmediatePendingReminders retrieves all reminders that are pending or need to be sent.
func (db *PostgresDB) GetImmediatePendingReminders() ([]models.Reminder, error) {
	// Query to fetch reminders with status 'pending' or 'resend' and the reminder time is in the past.
	query := `SELECT id, user_id, email, reminder_time, content, status
			  FROM reminders
			  WHERE status IN ('pending') AND reminder_time <= NOW()`

	// Execute the query to retrieve all matching reminders.
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error getting pending reminders: %w", err)
	}
	defer rows.Close()

	// Create a slice to hold the reminders.
	var reminders []models.Reminder

	// Loop through each row and scan the data into Reminder objects.
	for rows.Next() {
		var reminder models.Reminder
		if err := rows.Scan(&reminder.ID, &reminder.UserID, &reminder.Email, &reminder.ReminderTime, &reminder.Content, &reminder.Status); err != nil {
			return nil, fmt.Errorf("error scanning reminder: %w", err)
		}
		reminders = append(reminders, reminder)
	}

	// Check for errors during row iteration.
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over reminders: %w", err)
	}

	// Return the list of pending reminders.
	return reminders, nil
}

// GetFutureReminders retrieves all reminders that are pending and need to be scheduled.
func (db *PostgresDB) GetFutureReminders() ([]models.Reminder, error) {
	// Query to fetch reminders with status 'pending' or 'resend' and the reminder time is in the past.
	query := `SELECT id, user_id, email, reminder_time, content, status
			  FROM reminders
			  WHERE status IN ('pending') AND reminder_time > NOW()`

	// Execute the query to retrieve all matching reminders.
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error getting pending reminders: %w", err)
	}
	defer rows.Close()

	// Create a slice to hold the reminders.
	var reminders []models.Reminder

	// Loop through each row and scan the data into Reminder objects.
	for rows.Next() {
		var reminder models.Reminder
		if err := rows.Scan(&reminder.ID, &reminder.UserID, &reminder.Email, &reminder.ReminderTime, &reminder.Content, &reminder.Status); err != nil {
			return nil, fmt.Errorf("error scanning reminder: %w", err)
		}
		reminders = append(reminders, reminder)
	}

	// Check for errors during row iteration.
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over reminders: %w", err)
	}

	// Return the list of pending reminders.
	return reminders, nil
}

// UpdateReminderStatus updates the status of a reminder (e.g., sent, resend).
func (db *PostgresDB) UpdateReminderStatus(id int, status string) error {
	// Execute the query to update the status of a reminder.
	_, err := db.Exec("UPDATE reminders SET status = $1 WHERE id = $2", status, id)
	if err != nil {
		return fmt.Errorf("error updating reminder status: %w", err)
	}
	return nil
}

// GetRemindersByUserID retrieves all reminders for a specific user by their user ID.
func (db *PostgresDB) GetRemindersByUserID(userID int) ([]models.Reminder, error) {
	// Query to fetch all reminders for a specific user.
	query := `SELECT id, user_id, email, reminder_time, content, status
			  FROM reminders
			  WHERE user_id = $1`

	// Execute the query to retrieve all matching reminders.
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error fetching reminders for user %d: %w", userID, err)
	}
	defer rows.Close()

	// Create a slice to hold the reminders.
	var reminders []models.Reminder

	// Loop through each row and scan the data into Reminder objects.
	for rows.Next() {
		var reminder models.Reminder
		if err := rows.Scan(&reminder.ID, &reminder.UserID, &reminder.Email, &reminder.ReminderTime, &reminder.Content, &reminder.Status); err != nil {
			return nil, fmt.Errorf("error scanning reminder: %w", err)
		}
		reminders = append(reminders, reminder)
	}

	// Check for errors during row iteration.
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over reminders: %w", err)
	}

	// Return the list of reminders for the user.
	return reminders, nil
}

// GetReminderByID retrieves a reminder by its ID from the database.
func (db *PostgresDB) GetReminderByID(id int) (*models.Reminder, error) {
	// Execute the query to fetch a reminder by ID.
	row := db.QueryRow("SELECT id, user_id, email, reminder_time, content, status FROM reminders WHERE id = $1", id)

	// Create a Reminder object to hold the data from the query.
	reminder := &models.Reminder{}
	// Scan the row and populate the reminder fields with the values from the database.
	err := row.Scan(&reminder.ID, &reminder.UserID, &reminder.Email, &reminder.ReminderTime, &reminder.Content, &reminder.Status)

	if err != nil {
		if err == sql.ErrNoRows {
			// If no rows are found, return nil to indicate the reminder doesn't exist.
			return nil, nil
		}
		// Return error if scanning fails.
		return nil, fmt.Errorf("error scanning reminder: %w", err)
	}

	// Return the populated reminder object if no errors occurred.
	return reminder, nil
}

// UpdateReminder updates the details of an existing reminder.
func (db *PostgresDB) UpdateReminder(reminder *models.Reminder) error {
	// Execute the query to update the reminder's details.
	_, err := db.Exec(`
		UPDATE reminders
		SET content = $1, reminder_time = $2, status = $3
		WHERE id = $4`,
		reminder.Content, reminder.ReminderTime, reminder.Status, reminder.ID)

	if err != nil {
		return fmt.Errorf("error updating reminder with ID %d: %w", reminder.ID, err)
	}

	// Return nil if the update was successful.
	return nil
}

// ===================================
//  Resume Logic
// ===================================

func (db *PostgresDB) CreateResume(resume *models.Resume) (*models.Resume, error) {
	query := `INSERT INTO resumes (user_id, filename) VALUES ($1, $2) RETURNING id, uploaded_at`
	err := db.QueryRow(query, resume.UserID, resume.Filename).Scan(&resume.ID, &resume.UploadedAt)
	return resume, err
}

func (db *PostgresDB) GetResumesByUserID(userID string) ([]models.Resume, error) {
	query := `SELECT id, user_id, filename, uploaded_at FROM resumes WHERE user_id=$1`
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resumes []models.Resume
	for rows.Next() {
		var r models.Resume
		if err := rows.Scan(&r.ID, &r.UserID, &r.Filename, &r.UploadedAt); err != nil {
			return nil, err
		}
		resumes = append(resumes, r)
	}
	return resumes, nil
}

func (db *PostgresDB) GetResumeByID(id int) (*models.Resume, error) {
	query := `SELECT id, user_id, filename, uploaded_at FROM resumes WHERE id=$1`
	var r models.Resume
	err := db.QueryRow(query, id).Scan(&r.ID, &r.UserID, &r.Filename, &r.UploadedAt)
	if err != nil {
		return nil, err
	}
	return &r, nil
}

func (db *PostgresDB) CreateNewStripeUser(userID, stripeCustomerID string) error {
	query := `
		INSERT INTO user_stripe (user_id, stripe_customer_id)
		VALUES ($1, $2)
		ON CONFLICT (user_id) DO NOTHING;
	`
	_, err := db.Exec(query, userID, stripeCustomerID)
	return err
}

func (db *PostgresDB) SetUserPlan(stripeCustomerID, plan string) error {
	query := `UPDATE user_stripe SET plan = $1 WHERE stripe_customer_id = $2`
	_, err := db.Exec(query, plan, stripeCustomerID)
	return err
}
