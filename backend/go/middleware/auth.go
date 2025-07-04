package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"firebase.google.com/go/v4/auth"
)

// Pass in your Firebase auth client at server startup
var FirebaseAuth *auth.Client

func InitFirebaseAuth(client *auth.Client) {
	FirebaseAuth = client
}

func GetFirebaseAuth() *auth.Client {
	return FirebaseAuth
}

// FirebaseMiddleware verifies Firebase ID tokens from Authorization header
func FirebaseMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized: No token provided", http.StatusUnauthorized)
			return
		}

		idToken := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := FirebaseAuth.VerifyIDToken(r.Context(), idToken)
		if err != nil {
			http.Error(w, "Unauthorized: Invalid Firebase token", http.StatusUnauthorized)
			return
		}

		fmt.Println(token.UID)

		// Optionally pass UID or whole token in context for later use
		ctx := context.WithValue(r.Context(), "uid", token.UID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
