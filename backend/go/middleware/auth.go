package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// jwtSecret holds the secret key used to sign and verify JWT tokens.
var jwtSecret []byte

// init is called automatically when the program starts.
// It loads the JWT_SECRET environment variable and checks if it's set. 
// If not, the program panics with an error message.
func init() {
	// Retrieve the JWT_SECRET environment variable value.
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// If the environment variable is not set, panic with an error.
		panic("JWT_SECRET environment variable not set")
	}
	// Convert the secret string to a byte slice and assign it to the global jwtSecret variable.
	jwtSecret = []byte(secret)
}

// JWTMiddleware is a custom middleware that checks the validity of a JWT token in the request's Authorization header.
func JWTMiddleware(next http.Handler) http.Handler {
	// Return a handler function that wraps the next handler to check for a valid JWT.
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Retrieve the Authorization header from the incoming request.
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			// If no Authorization header is provided, return an Unauthorized error response.
			http.Error(w, "Unauthorized: No token provided", http.StatusUnauthorized)
			return
		}

		// Remove the 'Bearer ' prefix from the token string to get the actual JWT token.
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Parse the JWT token and validate it using the secret key.
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Check if the signing method used to sign the token is HMAC (secure key-based signature).
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				// If the signing method is not HMAC, return an error (invalid signature).
				return nil, jwt.ErrSignatureInvalid
			}
			// Return the secret key used to validate the token.
			return jwtSecret, nil
		})

		// If an error occurred or the token is invalid, return an Unauthorized error response.
		if err != nil || !token.Valid {
			http.Error(w, "Unauthorized: Invalid token", http.StatusUnauthorized)
			return
		}

		// If the token is valid, continue processing the request by passing it to the next handler.
		next.ServeHTTP(w, r)
	})
}
