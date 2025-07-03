CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_stripe(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'applied',
    notes TEXT,
    url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id);
