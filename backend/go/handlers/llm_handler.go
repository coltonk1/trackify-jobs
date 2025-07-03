// handlers/llm_handler.go
package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"trackify-jobs/services"
)

type ResumeRewriteRequest struct {
	ResumeText     string `json:"resume_text"`
	JobDescription string `json:"job_description"`
}

type CoverLetterRequest struct {
	ResumeText     string `json:"resume_text"`
	JobDescription string `json:"job_description"`
}

type RecommendationsRequest struct {
	ResumeText     string `json:"resume_text"`
	JobDescription string `json:"job_description"`
}

type ResumeRewriteResponse struct {
	Rewrites json.RawMessage `json:"rewrites"` // JSON object or array
}

type CoverLetterResponse struct {
	CoverLetter json.RawMessage `json:"cover_letter"` // JSON object
}

type RecommendationsResponse struct {
	Recommendations json.RawMessage `json:"recommendations"` // JSON object
}

type LLMHandler struct {
	LLMService *services.LLMService
}

func NewLLMHandler(s *services.LLMService) *LLMHandler {
	return &LLMHandler{LLMService: s}
}

func (h *LLMHandler) ResumeRewriteHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ResumeRewriteRequest
	if err := parseJSON(r, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	rewrites, err := h.LLMService.RewriteResume(req.ResumeText, req.JobDescription)
	if err != nil {
		http.Error(w, fmt.Sprintf("Resume rewrite failed: %v", err), http.StatusInternalServerError)
		return
	}

	resp := ResumeRewriteResponse{Rewrites: rewrites}
	writeJSON(w, resp)
}

func (h *LLMHandler) CoverLetterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CoverLetterRequest
	if err := parseJSON(r, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	letter, err := h.LLMService.GenerateCoverLetter(req.ResumeText, req.JobDescription)
	if err != nil {
		http.Error(w, fmt.Sprintf("Cover letter generation failed: %v", err), http.StatusInternalServerError)
		return
	}

	resp := CoverLetterResponse{CoverLetter: letter}
	writeJSON(w, resp)
}

func (h *LLMHandler) RecommendationsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RecommendationsRequest
	if err := parseJSON(r, &req); err != nil {
		http.Error(w, fmt.Sprintf("Parsing JSON failed: %v", err.Error()), http.StatusBadRequest)
		return
	}

	recommendations, err := h.LLMService.GetSuggestions(req.ResumeText, req.JobDescription)
	if err != nil {
		http.Error(w, fmt.Sprintf("Recommendation generation failed: %v", err), http.StatusInternalServerError)
		return
	}

	var tmp json.RawMessage
	if err := json.Unmarshal([]byte(recommendations), &tmp); err != nil {
		fmt.Printf("Invalid recommendations JSON: %v", err)
		http.Error(w, "Internal error: invalid AI output", http.StatusInternalServerError)
		return
	}

	resp := RecommendationsResponse{Recommendations: tmp}
	writeJSON(w, resp)
}

// Utility methods
func parseJSON(r *http.Request, v interface{}) error {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return fmt.Errorf("unable to read request body")
	}
	defer r.Body.Close()

	if err := json.Unmarshal(body, v); err != nil {
		return fmt.Errorf("invalid JSON payload")
	}
	return nil
}

func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
