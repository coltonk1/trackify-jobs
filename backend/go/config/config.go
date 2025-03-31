package config

import "os"

// Config struct holds configuration settings for the application, such as the database URL and port.
type Config struct {
    DatabaseURL string // The URL to connect to the database.
    Port        string // The port number the server will listen on.
}

// LoadConfig loads configuration values from environment variables and returns a Config struct.
func LoadConfig() (*Config, error) {
    // Create and return a Config instance with values loaded from environment variables.
    return &Config{
        DatabaseURL: os.Getenv("DATABASE_URL"), // Load the DATABASE_URL environment variable.
        Port:        os.Getenv("PORT"),          // Load the PORT environment variable.
    }, nil
}
