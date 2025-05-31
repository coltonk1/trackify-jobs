package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"trackify-jobs/services"

	"firebase.google.com/go/v4/auth"
)

type StripeHandler struct {
	AuthClient    *auth.Client
	StripeService *services.StripeService
}

func NewStripeHandler(ac *auth.Client, ss *services.StripeService) *StripeHandler {
	return &StripeHandler{
		AuthClient:    ac,
		StripeService: ss,
	}
}

func (h *StripeHandler) CreateNewUserHandler(w http.ResponseWriter, r *http.Request) {
	// Extract token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
		return
	}
	idToken := strings.TrimPrefix(authHeader, "Bearer ")

	// Verify token with Firebase
	token, err := h.AuthClient.VerifyIDToken(context.Background(), idToken)
	if err != nil {
		http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
		return
	}
	userID := token.UID

	emailClaim, ok := token.Claims["email"]
	if !ok {
		http.Error(w, "Email claim not found in token", http.StatusBadRequest)
		return
	}
	email, ok := emailClaim.(string)
	if !ok {
		http.Error(w, "Invalid email claim type", http.StatusBadRequest)
		return
	}

	// Ensure user exists in Stripe table
	err = h.StripeService.CreateNewStripeUser(r.Context(), userID, email)
	if err != nil {
		http.Error(w, "Failed to initialize user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
