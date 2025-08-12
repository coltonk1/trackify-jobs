// handlers/llm_handler.go
package handlers

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
	"trackify-jobs/database"
	"trackify-jobs/services"

	"github.com/google/uuid"
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
	DB         *database.PostgresDB
}

func NewLLMHandler(s *services.LLMService, n *services.NLPService, d *database.PostgresDB) *LLMHandler {
	return &LLMHandler{LLMService: s, NLPService: n, DB: d}
}

func (h *LLMHandler) ResumeRewriteHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		log.Printf("Failed to parse multipart form: %v", err)
		http.Error(w, fmt.Sprintf("Failed to parse multipart form: %v", err), http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("resume_file")
	if err != nil {
		http.Error(w, fmt.Sprintf("Missing resume_file: %v", err), http.StatusBadRequest)
		return
	}
	defer file.Close()

	resumeText := r.FormValue("resume_text")
	jobDescription := r.FormValue("job_description")
	if resumeText == "" || jobDescription == "" {
		http.Error(w, "Missing resume_text or job_description", http.StatusBadRequest)
		return
	}

	jobID := uuid.NewString()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{
		"job_id": jobID,
		"status": "processing",
	})

	go func() {
		log.Println("Starting")

		analysis, err := h.NLPService.Analyze(file, header, jobDescription)
		if err != nil {
			log.Printf("NLP analysis failed for job %s: %v", jobID, err)
			h.saveJobError(jobID, err)
			return
		}

		var parsedAnalysis map[string]interface{}
		if err := json.Unmarshal([]byte(analysis), &parsedAnalysis); err != nil {
			log.Printf("Failed to parse analysis JSON for job %s: %v", jobID, err)
			h.saveJobError(jobID, err)
			return
		}

		var lowSimilaritySkills []string
		if matched, ok := parsedAnalysis["matched_skills"].([]interface{}); ok {
			for _, item := range matched {
				if skillMap, ok := item.(map[string]interface{}); ok {
					if sim, okSim := skillMap["similarity"].(float64); okSim {
						if skill, okSkill := skillMap["job_skill"].(string); okSkill && sim < 75 {
							lowSimilaritySkills = append(lowSimilaritySkills, skill)
						}
					}
				}
			}
		}

		rewrites, err := h.LLMService.RewriteResume(resumeText, jobDescription, lowSimilaritySkills)
		if err != nil {
			log.Printf("Resume rewrite failed for job %s: %v", jobID, err)
			h.saveJobError(jobID, err)
			return
		}

		// ✅ Save results to DB so client can fetch later
		err = h.saveJobResult(jobID, rewrites)
		if err != nil {
			log.Printf("Failed to save results for job %s: %v", jobID, err)
		}

		log.Println("Finished")
	}()
}

func encryptAESGCM(key, plaintext []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	// ciphertext = nonce || gcm(nonce, plaintext)
	ct := gcm.Seal(nonce, nonce, plaintext, nil)
	return ct, nil
}

func decryptAESGCM(key, ciphertext []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	ns := gcm.NonceSize()
	if len(ciphertext) < ns {
		return nil, errors.New("ciphertext too short")
	}

	nonce, data := ciphertext[:ns], ciphertext[ns:]
	pt, err := gcm.Open(nil, nonce, data, nil)
	if err != nil {
		return nil, err
	}
	return pt, nil
}

// QueryJob returns the status of a rewrite job and, if completed, the rewritten resume JSON.
// GET /llm/rewrite/status?job_id=UUID
func (h *LLMHandler) QueryJob(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	jobID := r.URL.Query().Get("job_id")
	if jobID == "" {
		http.Error(w, "Missing job_id", http.StatusBadRequest)
		return
	}

	// Short DB timeout so this endpoint stays snappy
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	// If you store plaintext JSONB in result_json and optionally ciphertext in result_json_enc
	// Select both. Prefer decrypting enc if present. Fall back to plain JSON.
	var (
		status  string
		encJSON []byte // from BYTEA
		errMsg  sql.NullString
	)

	err := h.DB.QueryRowContext(ctx, `
		SELECT status,
		       COALESCE(result_json_enc, ''::bytea)  AS result_json_enc,
		       error_message
		FROM resume_jobs
		WHERE job_id = $1
	`, jobID).Scan(&status, &encJSON, &errMsg)
	if err == sql.ErrNoRows {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Database error"+err.Error(), http.StatusInternalServerError)
		return
	}

	// Decrypt if encrypted payload exists
	var payload []byte
	if len(encJSON) > 0 {
		key := []byte(os.Getenv("RESUME_JSON_KEY")) // 32 bytes for AES-256
		pt, decErr := decryptAESGCM(key, encJSON)
		if decErr != nil {
			http.Error(w, "Failed to decrypt result", http.StatusInternalServerError)
			return
		}
		payload = pt
	}

	// For non completed states do not return rewrites
	type resp struct {
		Status   string          `json:"status"`
		Rewrites json.RawMessage `json:"rewrites"`        // null if not ready
		Error    *string         `json:"error,omitempty"` // present if failed
	}

	out := resp{Status: status, Rewrites: nil}
	if errMsg.Valid && errMsg.String != "" {
		out.Error = &errMsg.String
	}

	if status == "completed" && len(payload) > 0 && json.Valid(payload) {
		out.Rewrites = json.RawMessage(payload)
	}

	w.Header().Set("Content-Type", "application/json")
	// You can return 200 for all statuses. If you prefer semantics, you can do 202 when processing.
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(out)
}

// saveJobResult stores the successful rewrite + analysis in your DB or cache.
func (h *LLMHandler) saveJobResult(jobID string, rewrites interface{}) error {
	data, err := json.Marshal(struct {
		Rewrites interface{} `json:"rewrites"`
	}{
		Rewrites: rewrites,
	})
	if err != nil {
		return err
	}

	key := []byte(os.Getenv("RESUME_JSON_KEY")) // 32 bytes from a secret manager
	if len(key) != 32 {
		return fmt.Errorf("bad key length")
	}
	ciphertext, err := encryptAESGCM(key, data)
	if err != nil {
		return err
	}

	_, err = h.DB.Exec(`
  INSERT INTO resume_jobs (job_id, status, result_json_enc)
  VALUES ($1, $2, $3)
  ON CONFLICT (job_id) DO UPDATE
  SET status = EXCLUDED.status,
      result_json_enc = EXCLUDED.result_json_enc
`, jobID, "completed", ciphertext)

	return err
}

// saveJobError stores an error message for a job in your DB or cache.
func (h *LLMHandler) saveJobError(jobID string, err error) {
	log.Println("Save job failed.")
	// Example using a database (pseudo-code)
	h.DB.Exec(`INSERT INTO resume_jobs (job_id, status, error_message) VALUES ($1, $2, $3) 
	         ON CONFLICT(job_id) DO UPDATE SET status = $4, error_message = $5`,
		jobID, "failed", err.Error(), "failed", err.Error())
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
