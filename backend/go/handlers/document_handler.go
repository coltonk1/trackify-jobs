package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"trackify-jobs/services"

	"github.com/gorilla/mux"
)

type DocumentHandler struct {
	DocumentService *services.DocumentService
}

func NewDocumentHandler(s *services.DocumentService) *DocumentHandler {
	return &DocumentHandler{DocumentService: s}
}

//
// Resume Handlers
//

func (h *DocumentHandler) CreateResume(w http.ResponseWriter, r *http.Request) {
	uid := r.Context().Value("uid").(string)

	err := r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("resume")
	if err != nil {
		http.Error(w, "Failed to get file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	savePath := filepath.Join(h.DocumentService.ResumeFolder, handler.Filename)
	out, err := os.Create(savePath)
	if err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		http.Error(w, "Failed to write file", http.StatusInternalServerError)
		return
	}

	resume, err := h.DocumentService.CreateResume(uid, handler.Filename)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(resume)
}

func (h *DocumentHandler) GetUserResumes(w http.ResponseWriter, r *http.Request) {
	uid := r.Context().Value("uid").(string)

	resumes, err := h.DocumentService.GetUserResumes(uid)
	if err != nil {
		log.Println(err.Error())
		http.Error(w, "Failed to fetch resumes", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(resumes)
}

func (h *DocumentHandler) GetResumeByID(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	resume, err := h.DocumentService.GetResumeByID(id)
	if err != nil {
		http.Error(w, "Resume not found", http.StatusNotFound)
		return
	}

	filePath := filepath.Join(h.DocumentService.ResumeFolder, resume.Filename)
	http.ServeFile(w, r, filePath)
}

func (h *DocumentHandler) DeleteResume(w http.ResponseWriter, r *http.Request) {
	uid := r.Context().Value("uid").(string)
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid resume ID", http.StatusBadRequest)
		return
	}

	err = h.DocumentService.DeleteResumeByID(id, uid)
	if err != nil {
		http.Error(w, "Failed to delete resume", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

//
// Cover Letter Handlers
//

func (h *DocumentHandler) CreateCoverLetter(w http.ResponseWriter, r *http.Request) {
	uid := r.Context().Value("uid").(string)

	var payload struct {
		Content string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	letter, err := h.DocumentService.CreateCoverLetter(uid, payload.Content)
	if err != nil {
		http.Error(w, "Failed to save cover letter", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(letter)
}

func (h *DocumentHandler) GetUserCoverLetters(w http.ResponseWriter, r *http.Request) {
	uid := r.Context().Value("uid").(string)

	letters, err := h.DocumentService.GetUserCoverLetters(uid)
	if err != nil {
		http.Error(w, "Failed to fetch cover letters", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(letters)
}

func (h *DocumentHandler) GetCoverLetterByID(w http.ResponseWriter, r *http.Request) {
	uid := r.Context().Value("uid").(string)
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	letter, err := h.DocumentService.GetUserCoverLetterByID(id, uid)
	if err != nil {
		http.Error(w, "Cover letter not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(letter)
}

func (h *DocumentHandler) DeleteCoverLetter(w http.ResponseWriter, r *http.Request) {
	uid := r.Context().Value("uid").(string)
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	err = h.DocumentService.DeleteCoverLetterByID(id, uid)
	if err != nil {
		http.Error(w, "Failed to delete cover letter", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
