package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"

	"trackify-jobs/database"

	"github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/webhook"
)

type StripeWebhookHandler struct {
	DB *database.PostgresDB
}

func NewStripeWebhookHandler(db *database.PostgresDB) *StripeWebhookHandler {
	return &StripeWebhookHandler{DB: db}
}

func (h *StripeWebhookHandler) Handle(w http.ResponseWriter, r *http.Request) {
	const maxBodyBytes = int64(65536)
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)

	payload, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Unable to read request body", http.StatusServiceUnavailable)
		return
	}

	sigHeader := r.Header.Get("Stripe-Signature")
	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if endpointSecret == "" {
		http.Error(w, "Missing webhook secret", http.StatusInternalServerError)
		return
	}

	event, err := webhook.ConstructEvent(payload, sigHeader, endpointSecret)
	if err != nil {
		http.Error(w, "Signature verification failed", http.StatusBadRequest)
		return
	}

	switch event.Type {
	case "invoice.payment_succeeded":
		var inv stripe.Invoice
		if err := json.Unmarshal(event.Data.Raw, &inv); err != nil {
			http.Error(w, "Failed to parse invoice", http.StatusBadRequest)
			return
		}
		if inv.Customer.ID != "" && inv.Subscription != nil {
			if err := h.DB.SetUserPlan(inv.Customer.ID, "Pro"); err != nil {
				log.Printf("Failed to upgrade plan: %v", err)
			}
		}

	case "customer.subscription.deleted":
		var sub stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
			http.Error(w, "Failed to parse subscription", http.StatusBadRequest)
			return
		}
		if sub.Customer.ID != "" {
			if err := h.DB.SetUserPlan(sub.Customer.ID, "Free"); err != nil {
				log.Printf("Failed to downgrade plan: %v", err)
			}
		}
	}

	w.WriteHeader(http.StatusOK)
}
