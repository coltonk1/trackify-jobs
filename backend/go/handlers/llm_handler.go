// handlers/llm_handler.go
package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
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
	NLPService *services.NLPService
}

func NewLLMHandler(s *services.LLMService, n *services.NLPService) *LLMHandler {
	return &LLMHandler{LLMService: s, NLPService: n}
}

func (h *LLMHandler) ResumeRewriteHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse multipart form data
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		log.Printf("Failed to parse multipart form: %v", err)
		http.Error(w, fmt.Sprintf("Failed to parse multipart form: %v", err), http.StatusBadRequest)
		return
	}

	// Extract file from "resume_file"
	file, header, err := r.FormFile("resume_file")
	if err != nil {
		http.Error(w, fmt.Sprintf("Missing resume_file: %v", err), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Extract resume_text and job_description from form fields
	resumeText := r.FormValue("resume_text")
	jobDescription := r.FormValue("job_description")

	if resumeText == "" || jobDescription == "" {
		http.Error(w, "Missing resume_text or job_description", http.StatusBadRequest)
		return
	}

	// Analyze the uploaded file (NLP metadata, matched skills, etc.)
	analysis, err := h.NLPService.Analyze(file, header, jobDescription)
	if err != nil {
		http.Error(w, fmt.Sprintf("NLP analysis failed: %v", err), http.StatusInternalServerError)
		return
	}

	var parsedAnalysis map[string]interface{}
	if err := json.Unmarshal([]byte(analysis), &parsedAnalysis); err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse analysis JSON: %v", err), http.StatusInternalServerError)
		return
	}

	var lowSimilaritySkills []string

	// Get matched_skills from the parsed map
	if matched, ok := parsedAnalysis["matched_skills"].([]interface{}); ok {
		for _, item := range matched {
			if skillMap, ok := item.(map[string]interface{}); ok {
				sim, okSim := skillMap["similarity"].(float64)
				skill, okSkill := skillMap["job_skill"].(string)

				if okSim && okSkill && sim < 75 {
					lowSimilaritySkills = append(lowSimilaritySkills, skill)
				}
			}
		}
	}

	// Rewrite the provided resume text with job description
	rewrites, err := h.LLMService.RewriteResume(resumeText, jobDescription, lowSimilaritySkills)
	if err != nil {

		http.Error(w, fmt.Sprintf("Resume rewrite failed: %v", err), http.StatusInternalServerError)
		return
	}

	// Return both rewrites and analysis (if you want both in one response)
	resp := struct {
		Rewrites interface{} `json:"rewrites"`
		Analysis interface{} `json:"analysis"`
	}{
		Rewrites: rewrites,
		Analysis: parsedAnalysis,
	}

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
