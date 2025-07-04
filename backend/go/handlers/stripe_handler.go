package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"trackify-jobs/database"
	"trackify-jobs/services"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
)

// StripeHandler handles Firebase-authenticated Stripe initialization
type StripeHandler struct {
	AuthClient    *auth.Client
	StripeService *services.StripeService
	DB            *database.PostgresDB
	FirebaseApp   *firebase.App
}

func NewStripeHandler(ac *auth.Client, ss *services.StripeService, db *database.PostgresDB, fb *firebase.App) *StripeHandler {
	return &StripeHandler{
		AuthClient:    ac,
		StripeService: ss,
		DB:            db,
		FirebaseApp:   fb,
	}
}

func (h *StripeHandler) CreateNewUserHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
		return
	}
	idToken := strings.TrimPrefix(authHeader, "Bearer ")

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

	err = h.StripeService.CreateNewStripeUser(r.Context(), userID, email)
	if err != nil {
		http.Error(w, "Failed to initialize user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func (h *StripeHandler) EnsureCustomer(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid, ok := ctx.Value("uid").(string)
	if !ok || uid == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	stripeUser, err := h.DB.GetStripeUserByUID(uid)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		http.Error(w, "database error", http.StatusInternalServerError)
		return
	}

	if err == nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"id":                 stripeUser.UserID,
			"stripeCustomerId":   stripeUser.StripeCustomerID,
			"subscriptionId":     stripeUser.SubscriptionID.String,
			"subscriptionStatus": stripeUser.SubscriptionStatus.String,
			"plan":               stripeUser.Plan,
			"isDelinquent":       stripeUser.IsDelinquent,
		})
		return
	}

	var body struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Email == "" {
		http.Error(w, "invalid or missing email", http.StatusBadRequest)
		return
	}

	if err := h.StripeService.CreateNewStripeUser(ctx, uid, body.Email); err != nil {
		http.Error(w, "failed to create stripe customer", http.StatusInternalServerError)
		return
	}

	stripeUser, err = h.DB.GetStripeUserByUID(uid)
	if err != nil {
		http.Error(w, "stripe user not found after creation", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":                 stripeUser.UserID,
		"stripeCustomerId":   stripeUser.StripeCustomerID,
		"subscriptionId":     stripeUser.SubscriptionID.String,
		"subscriptionStatus": stripeUser.SubscriptionStatus.String,
		"plan":               stripeUser.Plan,
		"isDelinquent":       stripeUser.IsDelinquent,
	})
}

func (h *StripeHandler) CreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	uid, ok := r.Context().Value("uid").(string)
	if !ok || uid == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	stripeID, err := h.DB.GetStripeCustomerID(uid)
	if err != nil {
		http.Error(w, "stripe customer not found", http.StatusBadRequest)
		return
	}

	url, err := h.StripeService.CreateCheckoutSession(stripeID)
	if err != nil {
		http.Error(w, "failed to create checkout session", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"url": url})
}

func (h *StripeHandler) CreateCustomerPortalSession(w http.ResponseWriter, r *http.Request) {
	uid, ok := r.Context().Value("uid").(string)
	if !ok || uid == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	stripeID, err := h.DB.GetStripeCustomerID(uid)
	if err != nil {
		http.Error(w, "stripe customer not found", http.StatusBadRequest)
		return
	}

	url, err := h.StripeService.CreateCustomerPortalSession(stripeID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"url": url})
}
