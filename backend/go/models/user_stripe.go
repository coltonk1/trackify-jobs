package models

import "time"

type UserStripe struct {
	ID               string    `db:"id"`
	UserID           string    `db:"user_id"`
	StripeCustomerID string    `db:"stripe_customer_id"`
	Plan             string    `db:"plan"`
	CreatedAt        time.Time `db:"created_at"`
	UpdatedAt        time.Time `db:"updated_at"`
}
