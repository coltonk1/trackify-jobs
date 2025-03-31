package database

import (
	"database/sql"
	"fmt"
	"go-template/models"

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