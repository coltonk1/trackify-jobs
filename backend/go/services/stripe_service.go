package services

import (
	"context"
	"fmt"
	"os"
	"trackify-jobs/database"

	"github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/customer"
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
