CREATE TABLE cover_letters (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_stripe(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cover_letters_user_id ON cover_letters(user_id);
