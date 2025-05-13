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

type ResumeHandler struct {
	ResumeService *services.ResumeService
}

func NewResumeHandler(s *services.ResumeService) *ResumeHandler {
	return &ResumeHandler{ResumeService: s}
}

func (h *ResumeHandler) CreateResume(w http.ResponseWriter, r *http.Request) {
	uid := r.Context().Value("uid").(string)

	err := r.ParseMultipartForm(10 << 20)
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

	savePath := filepath.Join(h.ResumeService.ResumeFolder, handler.Filename)
	out, err := os.Create(savePath)
	if err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		http.Error(w, "Failed to write file", http.StatusInternalServerError)
		return
	}

	resume, err := h.ResumeService.CreateResume(uid, handler.Filename)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(resume)
}

func (h *ResumeHandler) GetUserResumes(w http.ResponseWriter, r *http.Request) {
	uid := r.Context().Value("uid").(string)

	resumes, err := h.ResumeService.GetUserResumes(uid)
	if err != nil {
		log.Println(err.Error())
		http.Error(w, "Failed to fetch resumes", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(resumes)
}

func (h *ResumeHandler) GetResumeByID(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	resume, err := h.ResumeService.GetResumeByID(id)
	if err != nil {
		http.Error(w, "Resume not found", http.StatusNotFound)
		return
	}

	filePath := filepath.Join(h.ResumeService.ResumeFolder, resume.Filename)
	http.ServeFile(w, r, filePath)
}
