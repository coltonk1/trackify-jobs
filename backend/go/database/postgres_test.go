package database

import (
	"database/sql"
	"errors"
	"go-template/models"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
)

// TestGetUser tests the GetUser method of PostgresDB using mock data for different cases.
func TestGetUser(t *testing.T) {
    // Create a mock database connection using sqlmock.
    db, mock, err := sqlmock.New()
    if err != nil {
        t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
    }
    defer db.Close() // Ensure the mock DB is closed after the test

    // Create a PostgresDB instance with the mock DB.
    pdb := &PostgresDB{db}

    // Test Case 1: User found
    // Define the mock rows to return when a user is found with ID = 1.
    rows := sqlmock.NewRows([]string{"id", "name", "email"}).
        AddRow(1, "John Doe", "[email protected]") // Mocked user data
    // Expect the query to select a user by ID and return the mocked rows.
    mock.ExpectQuery("SELECT id, name, email FROM users WHERE id = \\$1").
        WithArgs(1).WillReturnRows(rows)

    // Call GetUser and check if it returns the correct user and no error.
    user, err := pdb.GetUser(1)
    assert.NoError(t, err) // Ensure no error occurred
    assert.Equal(t, &models.User{ID: 1, Name: "John Doe", Email: "[email protected]"}, user) // Ensure returned user is correct

    // Check if the expectations set with sqlmock were met.
    if err := mock.ExpectationsWereMet(); err != nil {
        t.Errorf("there were unfulfilled expectations: %s", err)
    }

    // Test Case 2: User not found
    // Expect the query for user ID = 2 to return an error (no rows found).
    mock.ExpectQuery("SELECT id, name, email FROM users WHERE id = \\$1").
        WithArgs(2).WillReturnError(sql.ErrNoRows)

    // Call GetUser and check that no user is returned and no error occurred.
    user, err = pdb.GetUser(2)
    assert.NoError(t, err) // Ensure no error occurred
    assert.Nil(t, user) // Ensure no user was returned

    // Check if the expectations set with sqlmock were met.
    if err := mock.ExpectationsWereMet(); err != nil {
        t.Errorf("there were unfulfilled expectations: %s", err)
    }

    // Test Case 3: Database error
    // Expect the query for user ID = 3 to return a database error.
    mock.ExpectQuery("SELECT id, name, email FROM users WHERE id = \\$1").
        WithArgs(3).WillReturnError(errors.New("database error"))

    // Call GetUser and check that an error is returned, and no user is found.
    user, err = pdb.GetUser(3)
    assert.Error(t, err) // Ensure an error occurred
    assert.Nil(t, user) // Ensure no user was returned

    // Check if the expectations set with sqlmock were met.
    if err := mock.ExpectationsWereMet(); err != nil {
        t.Errorf("there were unfulfilled expectations: %s", err)
    }
}

// TestCreateUser tests the CreateUser method of PostgresDB with mock data for a successful creation.
func TestCreateUser(t *testing.T) {
    // Create a mock database connection using sqlmock.
    db, mock, err := sqlmock.New()
    if err != nil {
        t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
    }
    defer db.Close() // Ensure the mock DB is closed after the test

    // Create a PostgresDB instance with the mock DB.
    pdb := &PostgresDB{db}

    // Test Case 1: Successful creation
    // Define the mock rows to return the ID of the created user (3).
    mock.ExpectQuery("INSERT INTO users \\(name, email\\) VALUES \\(\\$1, \\$2\\) RETURNING id").
        WithArgs("Jane Doe", "[email protected]").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(3))

    // Create a user object to pass to CreateUser.
    user := &models.User{Name: "Jane Doe", Email: "[email protected]"}
    // Call CreateUser and check if it returns the created user with the correct ID.
    createdUser, err := pdb.CreateUser(user)
    assert.NoError(t, err) // Ensure no error occurred
    assert.Equal(t, 3, createdUser.ID) // Ensure the correct ID is returned
    assert.Equal(t, "Jane Doe", createdUser.Name) // Ensure the name is correct
    assert.Equal(t, "[email protected]", createdUser.Email) // Ensure the email is correct

    // Check if the expectations set with sqlmock were met.
    if err := mock.ExpectationsWereMet(); err != nil {
        t.Errorf("there were unfulfilled expectations: %s", err)
    }
}
