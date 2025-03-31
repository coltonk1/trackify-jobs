package handlers

import (
	"encoding/json"
	"net/http"
)

// ProtectedEndpoint handles requests to a protected route.
// It returns a message indicating successful access to a protected resource.
func ProtectedEndpoint(w http.ResponseWriter, r *http.Request) {
	// Create a response map with a message indicating successful access.
	response := map[string]string{"message": "You have accessed a protected route!"}
	// Set the response header to indicate the content is JSON.
	w.Header().Set("Content-Type", "application/json")
	// Encode the response map as JSON and send it in the HTTP response body.
	json.NewEncoder(w).Encode(response)
}
