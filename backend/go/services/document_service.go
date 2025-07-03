package services

import (
	"trackify-jobs/database"
	"trackify-jobs/models"
)

type DocumentService struct {
	DB           *database.PostgresDB
	ResumeFolder string
}

func NewDocumentService(db *database.PostgresDB, folder string) *DocumentService {
	return &DocumentService{DB: db, ResumeFolder: folder}
}

//
// Resume logic
//

func (s *DocumentService) CreateResume(userID, filename string) (*models.Resume, error) {
	return s.DB.CreateResume(&models.Resume{
		UserID:   userID,
		Filename: filename,
	})
}

func (s *DocumentService) GetUserResumes(userID string) ([]models.Resume, error) {
	return s.DB.GetResumesByUserID(userID)
}

func (s *DocumentService) GetResumeByID(id int) (*models.Resume, error) {
	return s.DB.GetResumeByID(id)
}

func (s *DocumentService) DeleteResumeByID(id int, userID string) error {
	return s.DB.DeleteResumeByID(id, userID)
}

//
// Cover letter logic
//

func (s *DocumentService) CreateCoverLetter(userID string, content string) (*models.CoverLetter, error) {
	return s.DB.CreateCoverLetter(&models.CoverLetter{
		UserID:  userID,
		Content: content,
	})
}

func (s *DocumentService) GetUserCoverLetters(userID string) ([]models.CoverLetter, error) {
	return s.DB.GetCoverLettersByUserID(userID)
}

func (s *DocumentService) GetUserCoverLetterByID(id int, userID string) (*models.CoverLetter, error) {
	return s.DB.GetCoverLetterByIDAndUser(id, userID)
}

func (s *DocumentService) DeleteCoverLetterByID(id int, userID string) error {
	return s.DB.DeleteCoverLetterByID(id, userID)
}
