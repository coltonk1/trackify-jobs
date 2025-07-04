package services

import (
	"context"
	"fmt"
	"os"
	"trackify-jobs/database"

	"github.com/stripe/stripe-go/v82"
	billingportalsession "github.com/stripe/stripe-go/v82/billingportal/session"
	checkoutsession "github.com/stripe/stripe-go/v82/checkout/session"
	"github.com/stripe/stripe-go/v82/customer"
)

type StripeService struct {
	DB *database.PostgresDB
}

func NewStripeService(db *database.PostgresDB) *StripeService {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	return &StripeService{DB: db}
}

func (s *StripeService) CreateNewStripeUser(ctx context.Context, userID, email string) error {
	params := &stripe.CustomerParams{
		Email: stripe.String(email),
	}
	params.AddMetadata("firebase_uid", userID)

	cust, err := customer.New(params)
	if err != nil {
		return fmt.Errorf("failed to create stripe customer: %w", err)
	}

	err = s.DB.CreateNewStripeUser(userID, cust.ID)
	if err != nil {
		return fmt.Errorf("failed to insert stripe user into DB: %w", err)
	}

	return nil
}

func (s *StripeService) CreateCheckoutSession(stripeCustomerID string) (string, error) {
	params := &stripe.CheckoutSessionParams{
		Customer: stripe.String(stripeCustomerID),
		Mode:     stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String("price_1RONylDAv1jqyNi3r7w87kJh"), // replace with actual price ID
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String("http://localhost:3000/success"),
		CancelURL:  stripe.String("http://localhost:3000/cancel"),
	}
	created_session, err := checkoutsession.New(params)
	if err != nil {
		return "", err
	}
	return created_session.URL, nil
}

func (s *StripeService) CreateCustomerPortalSession(stripeCustomerID string) (string, error) {
	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(stripeCustomerID),
		ReturnURL: stripe.String("http://localhost:3000/subscription"),
	}
	created_session, err := billingportalsession.New(params)
	if err != nil {
		return "", err
	}
	return created_session.URL, nil
}
