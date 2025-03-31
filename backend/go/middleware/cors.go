// middleware/cors.go
package middleware

import (
	"net/http"
)

// CORSMiddleware is a custom middleware function to handle CORS (Cross-Origin Resource Sharing) in HTTP requests.
func CORSMiddleware(next http.Handler) http.Handler {
	// Return a handler function that wraps the next handler to modify headers for CORS.
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set the 'Access-Control-Allow-Origin' header to '*' allowing any origin.
		// It is recommended to specify specific origins instead of '*' for security reasons.
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// Set allowed HTTP methods for CORS requests.
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		// Set allowed headers for CORS requests.
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// If the incoming request is an OPTIONS request (preflight request), respond with a 200 OK status.
		// This is necessary for handling certain types of CORS requests.
		if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
		}

		// Continue processing the request by passing it to the next handler in the chain.
		next.ServeHTTP(w, r)
	})
}