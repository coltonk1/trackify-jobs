package services

import (
	"go-template/database"
	"go-template/models"
)

// UserService is responsible for handling user-related business logic.
type UserService struct {
	DB *database.PostgresDB // Database instance for interacting with user data.
}

// NewUserService creates a new instance of UserService with the provided database.
func NewUserService(db *database.PostgresDB) *UserService {
	return &UserService{DB: db}
}

// GetUser retrieves a user by their ID from the database.
func (s *UserService) GetUser(id int) (*models.User, error) {
	return s.DB.GetUser(id)
}

// CreateUser adds a new user to the database and returns the created user.
func (s *UserService) CreateUser(user *models.User) (*models.User, error) {
	return s.DB.CreateUser(user)
}