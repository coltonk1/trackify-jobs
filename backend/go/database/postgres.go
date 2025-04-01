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

// ============
//  User Logic
// ============

// GetUser retrieves a user from the database by their ID.
// It returns a pointer to the User model and an error if any.
func (db *PostgresDB) GetUser(id int) (*models.User, error) {
	// Execute a query to fetch the user data from the 'users' table by ID.
	row := db.QueryRow("SELECT id, name, email FROM users WHERE id = $1", id)

	// Create a User object to hold the data from the query.
	user := &models.User{}
	// Scan the row and populate the user fields with the values from the database.
	err := row.Scan(&user.ID, &user.Name, &user.Email)

	if err != nil {
		if err == sql.ErrNoRows {
			// If no rows are found, return nil to indicate the user doesn't exist.
			return nil, nil 
		}
		// If there is another error (e.g., scan failure), return the error with context.
		return nil, fmt.Errorf("error scanning user: %w", err)
	}

	// Return the populated user object if no errors occurred.
	return user, nil
}

// CreateUser inserts a new user into the database and returns the created user with the assigned ID.
func (db *PostgresDB) CreateUser(user *models.User) (*models.User, error) {
	// Insert the new user into the 'users' table and retrieve the assigned ID.
	row := db.QueryRow("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id", user.Name, user.Email)
	// Scan the returned ID into the user object.
	err := row.Scan(&user.ID)
	if err != nil {
		// If there is an error while creating the user, return the error with context.
		return nil, fmt.Errorf("error creating user: %w", err)
	}

	// Return the created user with the assigned ID.
	return user, nil
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