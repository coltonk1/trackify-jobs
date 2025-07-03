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

	llmService := services.NewLLMService()

	documentService := services.NewDocumentService(db, cfg.MainFolder)
	documentHandler := handlers.NewDocumentHandler(documentService)
	suggestionsHandler := handlers.NewLLMHandler(llmService)

	stripeService := services.NewStripeService(db)
	stripeHandler := handlers.NewStripeHandler(authClient, stripeService, db, firebaseApp)

	// Setup router
	router := mux.NewRouter()
	// router.Handle("/protected", middleware.FirebaseMiddleware(
	// 	http.HandlerFunc(handlers.ProtectedEndpoint),
	// ))
	webhookHandler := handlers.NewStripeWebhookHandler(db)

	api := router.PathPrefix("/api").Subrouter()

	public := api.PathPrefix("").Subrouter()
	// Public routes (no auth)
	public.HandleFunc("/set-cookie", handlers.SetAuthCookie).Methods("POST")
	public.HandleFunc("/logout", handlers.Logout).Methods("POST")
	public.HandleFunc("/init-user", stripeHandler.CreateNewUserHandler).Methods("POST")
	public.HandleFunc("/stripe/webhook", webhookHandler.Handle)

	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.FirebaseMiddleware)

	// Resume management
	protected.HandleFunc("/resumes", documentHandler.CreateResume).Methods("POST")
	protected.HandleFunc("/resumes", documentHandler.GetUserResumes).Methods("GET")
	protected.HandleFunc("/resumes/{id}", documentHandler.GetResumeByID).Methods("GET")
	protected.HandleFunc("/resumes/{id}", documentHandler.DeleteResume).Methods("DELETE")

	// NLP usage
	protected.HandleFunc("/analyze", handlers.UploadHandler).Methods("POST")

	// Stripe billing routes
	protected.HandleFunc("/stripe/current-user", stripeHandler.EnsureCustomer).Methods("POST")
	protected.HandleFunc("/stripe/create-checkout-session", stripeHandler.CreateCheckoutSession).Methods("POST")
	protected.HandleFunc("/stripe/create-customer-portal-session", stripeHandler.CreateCustomerPortalSession).Methods("POST")

	// Feedback + account
	protected.HandleFunc("/feedback", NotImplemented).Methods("POST")
	protected.HandleFunc("/delete-account", NotImplemented).Methods("POST")

	// Tracked job routes
	protected.HandleFunc("/jobs", NotImplemented).Methods("POST")        // create job
	protected.HandleFunc("/jobs", NotImplemented).Methods("GET")         // get jobs
	protected.HandleFunc("/jobs/{id}", NotImplemented).Methods("PATCH")  // update job
	protected.HandleFunc("/jobs/{id}", NotImplemented).Methods("DELETE") // delete job

	// Cover letter storage routes
	protected.HandleFunc("/cover-letters", documentHandler.CreateCoverLetter).Methods("POST")
	protected.HandleFunc("/cover-letters", documentHandler.GetUserCoverLetters).Methods("GET")
	protected.HandleFunc("/cover-letters/{id}", documentHandler.GetCoverLetterByID).Methods("GET")
	protected.HandleFunc("/cover-letters/{id}", documentHandler.DeleteCoverLetter).Methods("DELETE")

	// Pro-only LLM routes
	subMiddleware := &middleware.Handler{DB: db}
	pro := api.PathPrefix("").Subrouter()
	pro.Use(middleware.FirebaseMiddleware)
	pro.Use(subMiddleware.RequireProSubscription)

	pro.HandleFunc("/llm/recommendations", suggestionsHandler.RecommendationsHandler).Methods("POST")
	pro.HandleFunc("/llm/rewrite", suggestionsHandler.ResumeRewriteHandler).Methods("POST")
	pro.HandleFunc("/llm/cover-letter", suggestionsHandler.CoverLetterHandler).Methods("POST")

	// Apply CORS middleware
	http.Handle("/", middleware.CORSMiddleware(router))

	PrintRoutes(public, "Public")
	log.Println(" ")
	PrintRoutes(protected, "Authentication")
	log.Println(" ")
	PrintRoutes(pro, "Pro Subscription")

	// Start server
	log.Printf("Server listening on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, middleware.LoggingMiddleware(router)))
}

func NotImplemented(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "Not implemented", http.StatusNotImplemented)
}
