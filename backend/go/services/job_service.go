package services

import (
	"trackify-jobs/database"
	"trackify-jobs/models"
)

type JobService struct {
	DB *database.PostgresDB
}

func NewJobService(db *database.PostgresDB) *JobService {
	return &JobService{DB: db}
}

func (s *JobService) CreateJob(job *models.Job) (*models.Job, error) {
	return s.DB.CreateJob(job)
}

func (s *JobService) GetUserJobs(userID string) ([]models.Job, error) {
	return s.DB.GetJobsByUserID(userID)
}

func (s *JobService) UpdateJob(id int, userID string, job *models.Job) (*models.Job, error) {
	return s.DB.UpdateJob(id, userID, job)
}

func (s *JobService) DeleteJob(id int, userID string) error {
	return s.DB.DeleteJob(id, userID)
}
