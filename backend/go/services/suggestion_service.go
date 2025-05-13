package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type SuggestionsService struct {
	APIKey string
}

func NewSuggestionsService() *SuggestionsService {
	return &SuggestionsService{
		APIKey: os.Getenv("GEMINI_API_KEY"),
	}
}

// Gemini API request structure
type GeminiContent struct {
	Role  string       `json:"role"`
	Parts []GeminiPart `json:"parts"`
}

type GeminiPart struct {
	Text string `json:"text"`
}

type GeminiRequest struct {
	Contents []GeminiContent `json:"contents"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func (s *SuggestionsService) GetSuggestions(resumeText, jobDescription string) (string, error) {
	prompt := fmt.Sprintf(
		`You are a helpful assistant that reviews a candidate's resume and provides structured suggestions to improve alignment with a job description.
	
	Resume Text:
	%s
	
	Job Description:
	%s
	
	Please return your response strictly as a JSON object in the following format:
	
	{
	  "missing_skills": ["string", "string"],
	  "keyword_gaps": ["string", "string"],
	  "experience_alignment": ["string", "string"],
	  "general_advice": ["string", "string"]
	}
	
	- "missing_skills": key skills or tools mentioned in the job description but not found in the resume.
	- "keyword_gaps": important terms or phrases from the job description not present in the resume.
	- "experience_alignment": parts of the resume that are relevant but should be emphasized or reworded.
	- "general_advice": overall improvements that don't fall into the above categories.
	
	Only output a valid JSON object. Do not include any explanation or prose.`, resumeText, jobDescription)

	requestBody := GeminiRequest{
		Contents: []GeminiContent{
			{
				Role: "user",
				Parts: []GeminiPart{
					{Text: prompt},
				},
			},
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=%s", s.APIKey)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Gemini API error: %s", string(body))
	}

	var parsed GeminiResponse
	err = json.Unmarshal(body, &parsed)
	if err != nil {
		return "", err
	}
	if len(parsed.Candidates) == 0 || len(parsed.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("No suggestions returned from Gemini")
	}

	return parsed.Candidates[0].Content.Parts[0].Text, nil
}
