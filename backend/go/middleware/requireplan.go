package middleware

import (
	"log"
	"net/http"
	"trackify-jobs/database"
)

type Handler struct {
	DB *database.PostgresDB
}

func (h *Handler) RequireProSubscription(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Grab user ID from context (assumes auth middleware set it)
		userID, ok := r.Context().Value("uid").(string)
		if !ok || userID == "" {
			log.Println("User id not given")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Fetch plan from DB
		plan, err := h.DB.GetUserPlan(userID)
		if err != nil {
			log.Printf("Failed to fetch user plan: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Check if user is Pro
		if plan != "Pro" {
			log.Println("User is not pro, but still attempted to use a pro feature. " + userID)
			http.Error(w, "Pro subscription required", http.StatusPaymentRequired)
			return
		}

		// User is authorized; continue
		next.ServeHTTP(w, r)
	})
}
