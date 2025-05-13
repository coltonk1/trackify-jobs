// handlers/suggestions_handler.go
package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"trackify-jobs/services"
)

type SuggestionRequest struct {
	ResumeText     string `json:"resume_text"`
	JobDescription string `json:"job_description"`
}

type SuggestionResponse struct {
	Suggestions string `json:"suggestions"`
}

type SuggestionsHandler struct {
	SuggestionsService *services.SuggestionsService
}

func NewSuggestionsHandler(s *services.SuggestionsService) *SuggestionsHandler {
	return &SuggestionsHandler{SuggestionsService: s}
}

func (h *SuggestionsHandler) ResumeSuggestionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Unable to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req SuggestionRequest
	err = json.Unmarshal(body, &req)
	if err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	suggestions, err := h.SuggestionsService.GetSuggestions(req.ResumeText, req.JobDescription)
	if err != nil {
		http.Error(w, fmt.Sprintf("Suggestion generation failed: %v", err), http.StatusInternalServerError)
		return
	}

	resp := SuggestionResponse{Suggestions: suggestions}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
