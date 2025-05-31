package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"trackify-jobs/config"
	"trackify-jobs/database"
	"trackify-jobs/handlers"
	"trackify-jobs/middleware"
	"trackify-jobs/services"

	firebase "firebase.google.com/go/v4"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

func PrintRoutes(r *mux.Router, label string) {
	err := r.Walk(func(route *mux.Route, router *mux.Router, ancestors []*mux.Route) error {
		pathTemplate, _ := route.GetPathTemplate()
		methods, _ := route.GetMethods()
		log.Printf("[%s] Route: %s\tMethods: %v", label, pathTemplate, methods)
		return nil
	})
	if err != nil {
		log.Printf("Error walking routes: %v", err)
	}
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	// Load config
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	// Connect to PostgreSQL
	db, err := database.NewPostgresDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	defer db.Close()

	// Initialize Firebase
	credPath := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")
	opt := option.WithCredentialsFile(credPath)

	firebaseApp, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatalf("Firebase init error: %v", err)
	}

	authClient, err := firebaseApp.Auth(context.Background())
	if err != nil {
		log.Fatalf("Auth client init error: %v", err)
	}
	middleware.InitFirebaseAuth(authClient)

	// Start services
	emailService := services.NewEmailService("")
	defer emailService.Stop()

	suggestionService := services.NewSuggestionsService()

	resumeService := services.NewResumeService(db, cfg.ResumeFolder)
	resumeHandler := handlers.NewResumeHandler(resumeService)
	suggestionsHandler := handlers.NewSuggestionsHandler(suggestionService)

	stripeService := services.NewStripeService(db)
	stripeHandler := handlers.NewStripeHandler(authClient, stripeService)

	// Setup router
	router := mux.NewRouter()
	// router.Handle("/protected", middleware.FirebaseMiddleware(
	// 	http.HandlerFunc(handlers.ProtectedEndpoint),
	// ))
	webhookHandler := handlers.NewStripeWebhookHandler(db)
	api := router.PathPrefix("/api").Subrouter()
	// Public routes (no auth)
	api.HandleFunc("/set-cookie", handlers.SetAuthCookie).Methods("POST")
	api.HandleFunc("/logout", handlers.Logout).Methods("POST")
	api.HandleFunc("/init-user", stripeHandler.CreateNewUserHandler).Methods("POST")
	api.HandleFunc("/stripe/webhook", webhookHandler.Handle)

	// Protected routes
	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.FirebaseMiddleware)
	protected.HandleFunc("/resumes", resumeHandler.CreateResume).Methods("POST")
	protected.HandleFunc("/resumes", resumeHandler.GetUserResumes).Methods("GET")
	protected.HandleFunc("/resumes/{id}", resumeHandler.GetResumeByID).Methods("GET")
	protected.HandleFunc("/analyze", handlers.UploadHandler).Methods("POST")
	protected.HandleFunc("/suggestions", suggestionsHandler.ResumeSuggestionsHandler).Methods("POST")
	// Apply CORS middleware
	http.Handle("/", middleware.CORSMiddleware(router))

	PrintRoutes(api, "All")
	log.Println(" ")
	PrintRoutes(protected, "Protected")

	// Start server
	log.Printf("Server listening on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, middleware.LoggingMiddleware(router)))
}
