package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"trackify-jobs/models"
	"trackify-jobs/services"

	"github.com/gorilla/mux"
)

type JobHandler struct {
	JobService *services.JobService
}

func NewJobHandler(js *services.JobService) *JobHandler {
	return &JobHandler{JobService: js}
}

func (h *JobHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	uid, ok := r.Context().Value("uid").(string)
	if !ok || uid == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var job models.Job
	if err := json.NewDecoder(r.Body).Decode(&job); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	job.UserID = uid

	created, err := h.JobService.CreateJob(&job)
	if err != nil {
		http.Error(w, "could not create job", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(created)
}

func (h *JobHandler) GetUserJobs(w http.ResponseWriter, r *http.Request) {
	uid, ok := r.Context().Value("uid").(string)
	if !ok || uid == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	jobs, err := h.JobService.GetUserJobs(uid)
	if err != nil {
		http.Error(w, "could not fetch jobs", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(jobs)
}

func (h *JobHandler) UpdateJob(w http.ResponseWriter, r *http.Request) {
	uid, ok := r.Context().Value("uid").(string)
	if !ok || uid == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "invalid job id", http.StatusBadRequest)
		return
	}

	var update models.Job
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	updated, err := h.JobService.UpdateJob(id, uid, &update)
	if err != nil {
		http.Error(w, "could not update job", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(updated)
}

func (h *JobHandler) DeleteJob(w http.ResponseWriter, r *http.Request) {
	uid, ok := r.Context().Value("uid").(string)
	if !ok || uid == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "invalid job id", http.StatusBadRequest)
		return
	}

	if err := h.JobService.DeleteJob(id, uid); err != nil {
		http.Error(w, "could not delete job", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
