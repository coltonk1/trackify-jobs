package services

import (
	"trackify-jobs/database"
	"trackify-jobs/models"
)

type ResumeService struct {
	DB           *database.PostgresDB
	ResumeFolder string
}

func NewResumeService(db *database.PostgresDB, folder string) *ResumeService {
	return &ResumeService{DB: db, ResumeFolder: folder}
}

func (s *ResumeService) CreateResume(userID, filename string) (*models.Resume, error) {
	return s.DB.CreateResume(&models.Resume{
		UserID:   userID,
		Filename: filename,
	})
}

func (s *ResumeService) GetUserResumes(userID string) ([]models.Resume, error) {
	return s.DB.GetResumesByUserID(userID)
}

func (s *ResumeService) GetResumeByID(id int) (*models.Resume, error) {
	return s.DB.GetResumeByID(id)
}
