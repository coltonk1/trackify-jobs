CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE user_stripe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT NOT NULL UNIQUE,

    plan TEXT NOT NULL DEFAULT 'Free',
    is_delinquent BOOLEAN NOT NULL DEFAULT FALSE,

    subscription_id TEXT, 
    subscription_status TEXT, 

    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);