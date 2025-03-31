package main

import (
	"go-template/config"
	"go-template/database"
	"go-template/handlers"
	"go-template/middleware"
	"go-template/services"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Load application configuration (e.g., database URL, server port)
	cfg, err := config.LoadConfig()
	if err != nil {
			log.Fatalf("Error loading config: %v", err)
	}

	// Initialize a connection to the PostgreSQL database
	db, err := database.NewPostgresDB(cfg.DatabaseURL)
	if err != nil {
			log.Fatalf("Error connecting to database: %v", err)
	}
	defer db.Close() // Ensure the database connection is closed when the application stops

	// Initialize services that handle business logic
	userService := services.NewUserService(db)
	// Create HTTP handlers for user-related requests
	userHandler := handlers.NewUserHandler(userService)

	// Create a new Gorilla Mux router for handling HTTP routes
	r := mux.NewRouter()
	// Define API routes for user operations
	r.HandleFunc("/users", userHandler.GetUser).Methods("GET") // Fetch user data
	r.HandleFunc("/users", userHandler.CreateUser).Methods("POST") // Create a new user

	// Define a protected route that requires authentication
	r.Handle("/protected", middleware.JWTMiddleware(http.HandlerFunc(handlers.ProtectedEndpoint)))

	// Apply CORS middleware
	http.Handle("/", middleware.CORSMiddleware(r))

	// Start the HTTP server
	log.Printf("Server listening on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}