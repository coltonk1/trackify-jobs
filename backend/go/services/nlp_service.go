package services

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"

	openai "github.com/sashabaranov/go-openai"
	"rsc.io/pdf"
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

	// newJobDescription, err := ExtractRequirementsFromJD(jobDesc)
	// if(err != nil) {
	// 	return "", err
	// }

	// Attach job description
	if err := writer.WriteField("job_description", jobDesc); err != nil {
		return "", err
	}

	// cleaned_resume, err := ExtractRelevantSectionsWithGPT(file);
	// fmt.Println(cleaned_resume)
	
	// if err != nil {
	// 	return "", nil
	// }

	// if err := writer.WriteField("cleaned_resume", cleaned_resume); err != nil {
	// 	return "", err
	// }
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
		return "", fmt.Errorf("flask error: %s", string(respData))
	}

	return string(respData), nil
}

func ExtractRelevantSectionsWithGPT(file io.Reader) (string, error) {
	buf := new(bytes.Buffer)
	if _, err := io.Copy(buf, file); err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	r, err := pdf.NewReader(bytes.NewReader(buf.Bytes()), int64(buf.Len()))
	if err != nil {
		return "", fmt.Errorf("failed to open PDF: %w", err)
	}

	var out string
	for i := 1; i <= r.NumPage(); i++ {
		page := r.Page(i)
		if page.V.IsNull() {
			continue
		}
		content := page.Content()
		for _, txt := range content.Text {
			out += txt.S + " "
		}
	}

	fmt.Println("H")
	fmt.Println(out)

	// --- Step 2: Ask GPT to isolate sections ---
	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))

	systemPrompt := `You are an assistant that extracts only specific sections from resumes.
Keep only the text from the following sections if present:
- Summary / Profile
- Skills / Technical Skills
- Projects
- Experience / Work Experience
Remove education, awards, extracurriculars, and other irrelevant text.
Return the result as plain text.`

	userPrompt := fmt.Sprintf("Resume text:\n\n%s", out)

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: "gpt-5-nano", 
			Messages: []openai.ChatCompletionMessage{
				{Role: openai.ChatMessageRoleSystem, Content: systemPrompt},
				{Role: openai.ChatMessageRoleUser, Content: userPrompt},
			},
			Temperature: 0.0,
		},
	)
	if err != nil {
		return "", fmt.Errorf("OpenAI call failed: %w", err)
	}

	return resp.Choices[0].Message.Content, nil
}

