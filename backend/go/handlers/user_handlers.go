package handlers

import (
	"encoding/json"
	"go-template/models"
	"go-template/services"
	"net/http"
	"strconv"
)

// UserHandler is a struct that holds a reference to the UserService,
// which handles the business logic related to users.
type UserHandler struct {
        UserService *services.UserService // Reference to the UserService to interact with user-related data
}

// NewUserHandler is a constructor function that creates and returns a new UserHandler
// with the provided UserService.
func NewUserHandler(userService *services.UserService) *UserHandler {
        return &UserHandler{UserService: userService}
}

// GetUser handles HTTP requests to retrieve a user by their ID.
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	// Retrieve the 'id' query parameter from the URL.
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		// If 'id' is not provided, return a 400 Bad Request error.
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	// Convert the 'id' parameter from string to an integer.
	id, err := strconv.Atoi(idStr)
	if err != nil {
		// If the conversion fails, return a 400 Bad Request error.
		http.Error(w, "Invalid id parameter", http.StatusBadRequest)
		return
	}

	// Call the UserService to retrieve the user by ID.
	user, err := h.UserService.GetUser(id)
	if err != nil {
		// If there is an error with the service, return a 500 Internal Server Error.
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// If no user is found, return a 404 Not Found error.
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Set the response header to indicate the content is JSON.
	w.Header().Set("Content-Type", "application/json")
	// Encode the user data as JSON and send it in the response body.
	json.NewEncoder(w).Encode(user)
}

// CreateUser handles HTTP requests to create a new user.
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var user models.User
	// Decode the JSON body of the request into a User struct.
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		// If decoding fails, return a 400 Bad Request error.
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Call the UserService to create the user.
	createdUser, err := h.UserService.CreateUser(&user)

	if err != nil {
		// If there is an error with creating the user, return a 500 Internal Server Error.
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Set the response header to indicate the content is JSON.
	w.Header().Set("Content-Type", "application/json")
	// Set the status code to 201 Created and encode the newly created user as JSON in the response body.
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdUser)
}