CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    reminder_time TIMESTAMPTZ NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL
);
