package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"trackify-jobs/database"

	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/webhook"
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
		fmt.Println("FAILED RB")
		http.Error(w, "Unable to read request body", http.StatusBadRequest)
		return
	}

	sigHeader := r.Header.Get("Stripe-Signature")
	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if endpointSecret == "" {
		fmt.Println("FAILED WEBHOOK SECRET")
		http.Error(w, "Missing webhook secret", http.StatusInternalServerError)
		return
	}

	event, err := webhook.ConstructEvent(payload, sigHeader, endpointSecret)
	if err != nil {
		fmt.Println("FAILED SIGNATURE: " + err.Error())
		http.Error(w, "Invalid signature", http.StatusBadRequest)
		return
	}

	log.Printf("Received Stripe event: %s", event.Type)

	switch event.Type {

	case "customer.subscription.created":
		var sub stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
			http.Error(w, "Invalid subscription data", http.StatusBadRequest)
			return
		}

		customerID := sub.Customer.ID
		subID := sub.ID
		if customerID != "" && subID != "" {
			if err := h.DB.SetUserPlanByCustomerID(customerID, "Pro"); err != nil {
				log.Printf("Failed to set plan from subscription.created: %v", err)
			}
		}

	// case "invoice.payment_succeeded":
	// 	var invoice stripe.Invoice
	// 	if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
	// 		http.Error(w, "Invalid invoice data", http.StatusBadRequest)
	// 		return
	// 	}

	// 	customerID := invoice.Customer.ID
	// 	if customerID != "" {
	// 		if err := h.DB.SetUserPlanByCustomerID(customerID, "Pro"); err != nil {
	// 			log.Printf("Failed to upgrade plan: %v", err)
	// 		}
	// 	}

	// case "invoice.payment_failed":
	// 	var invoice stripe.Invoice
	// 	if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
	// 		http.Error(w, "Invalid invoice data", http.StatusBadRequest)
	// 		return
	// 	}

	// 	customerID := invoice.Customer.ID
	// 	if customerID != "" {
	// 		if err := h.DB.FlagUserAsDelinquent(customerID); err != nil {
	// 			log.Printf("Failed to flag delinquent user: %v", err)
	// 		}
	// 	}

	case "customer.subscription.updated":
		var sub stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
			http.Error(w, "Invalid subscription data", http.StatusBadRequest)
			return
		}

		customerID := sub.Customer.ID
		cancelAtPeriodEnd := sub.CancelAtPeriodEnd

		if customerID == "" {
			log.Printf("Subscription updated with no customer ID")
			return
		}

		if cancelAtPeriodEnd {
			log.Printf("User %s has set subscription to cancel at period end", customerID)
			// Optional: mark in DB that access will expire later
			// h.DB.FlagUserPendingCancellation(customerID)
		} else {
			// Optional: clear cancellation flag if user resumed
			log.Printf("User %s has renewed", customerID)
			// h.DB.ClearPendingCancellationFlag(customerID)
		}

	case "customer.subscription.deleted":
		var sub stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
			http.Error(w, "Invalid subscription data", http.StatusBadRequest)
			return
		}

		customerID := sub.Customer.ID
		if customerID != "" {
			if err := h.DB.SetUserPlanByCustomerID(customerID, "Free"); err != nil {
				log.Printf("Failed to downgrade plan: %v", err)
			}
		}

	default:
		log.Printf("Unhandled event type: %s", event.Type)
	}

	w.WriteHeader(http.StatusOK)
}
