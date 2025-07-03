package services

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"
)

// NLPRequest represents a file + job description to be processed.
type NLPRequest struct {
	File       multipart.File
	FileHeader *multipart.FileHeader
	JobDesc    string
}

// NLPService provides NLP analysis through Flask with concurrency limiting.
type NLPService struct {
	MaxConcurrent int
	semaphore     chan struct{}
}

// NewNLPService initializes the service with concurrency limit.
func NewNLPService(maxConcurrent int) *NLPService {
	return &NLPService{
		MaxConcurrent: maxConcurrent,
		semaphore:     make(chan struct{}, maxConcurrent),
	}
}

// Analyze sends the file and job description to Flask (with concurrency limit).
func (s *NLPService) Analyze(file multipart.File, header *multipart.FileHeader, jobDesc string) (string, error) {
	select {
	case s.semaphore <- struct{}{}:
		defer func() { <-s.semaphore }()
	case <-time.After(2 * time.Second):
		return "", fmt.Errorf("Too many concurrent resume requests. Please try again shortly.")
	}

	defer file.Close()

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	// Attach file
	formFile, err := writer.CreateFormFile("file", header.Filename)
	if err != nil {
		return "", err
	}
	if _, err := io.Copy(formFile, file); err != nil {
		return "", err
	}

	// Attach job description
	if err := writer.WriteField("job_description", jobDesc); err != nil {
		return "", err
	}
	writer.Close()

	// Send POST request to Flask
	resp, err := http.Post("http://localhost:5000/rank-resumes", writer.FormDataContentType(), &buf)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	respData, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Flask error: %s", string(respData))
	}

	return string(respData), nil
}
