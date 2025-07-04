CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_stripe(user_id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_user_event_time
    ON analytics(user_id, event_type, timestamp);
