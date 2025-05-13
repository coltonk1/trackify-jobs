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
	File         multipart.File
	FileHeader   *multipart.FileHeader
	JobDesc      string
	ResponseChan chan NLPResponse
}

// NLPResponse carries the similarity result or error.
type NLPResponse struct {
	Similarity string
	Err        error
}

// NLPService manages a queue for NLP analysis requests.
type NLPService struct {
	requestQueue  chan NLPRequest
	rateLimitTime time.Duration
	stopChannel   chan bool
}

// NewNLPService creates and starts the NLPService.
func NewNLPService() *NLPService {
	service := &NLPService{
		requestQueue:  make(chan NLPRequest, 100),
		rateLimitTime: time.Second, // 1 request/sec
		stopChannel:   make(chan bool),
	}
	go service.processQueue()
	return service
}

// Analyze queues a request and returns a channel for the response.
func (s *NLPService) Analyze(file multipart.File, header *multipart.FileHeader, jobDesc string) (string, error) {
	respChan := make(chan NLPResponse, 1)
	req := NLPRequest{
		File:         file,
		FileHeader:   header,
		JobDesc:      jobDesc,
		ResponseChan: respChan,
	}

	select {
	case s.requestQueue <- req:
		resp := <-respChan
		return resp.Similarity, resp.Err
	case <-time.After(2 * time.Second):
		return "", fmt.Errorf("NLP request queue timeout")
	}
}

// processQueue handles queued requests one-by-one with rate limiting.
func (s *NLPService) processQueue() {
	ticker := time.NewTicker(s.rateLimitTime)
	defer ticker.Stop()

	for {
		select {
		case req := <-s.requestQueue:
			result, err := sendToFlask(req)
			req.ResponseChan <- NLPResponse{Similarity: result, Err: err}
		case <-s.stopChannel:
			return
		}
	}
}

// Stop signals the service to stop processing.
func (s *NLPService) Stop() {
	close(s.stopChannel)
}

// sendToFlask does the actual HTTP POST to the Flask endpoint.
func sendToFlask(req NLPRequest) (string, error) {
	defer req.File.Close()

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	// Attach file
	formFile, err := writer.CreateFormFile("file", req.FileHeader.Filename)
	if err != nil {
		return "", err
	}
	if _, err := io.Copy(formFile, req.File); err != nil {
		return "", err
	}

	// Attach job description
	if err := writer.WriteField("job_description", req.JobDesc); err != nil {
		return "", err
	}

	writer.Close()

	resp, err := http.Post("http://localhost:5000/rank-resumes", writer.FormDataContentType(), &buf)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	respData, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(respData), nil
}
