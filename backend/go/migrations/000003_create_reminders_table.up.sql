CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_stripe(user_id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    reminder_time TIMESTAMPTZ NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL
);
