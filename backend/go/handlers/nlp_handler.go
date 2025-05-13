package handlers

import (
	"fmt"
	"net/http"

	"trackify-jobs/services"
)

var nlpService *services.NLPService

func init() {
	nlpService = services.NewNLPService()
}

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Missing file", http.StatusBadRequest)
		return
	}

	jobDesc := r.FormValue("job_description")
	if jobDesc == "" {
		http.Error(w, "Missing job description", http.StatusBadRequest)
		return
	}

	result, err := nlpService.Analyze(file, header, jobDesc)
	if err != nil {
		http.Error(w, fmt.Sprintf("NLP service error: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(result))
}
