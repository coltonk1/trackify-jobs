package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	openai "github.com/sashabaranov/go-openai"
)

type LLMService struct {
	APIKey string
}

var geminiLimiter = make(chan struct{}, 10)

func acquire() bool {
	select {
	case geminiLimiter <- struct{}{}:
		return true
	default:
		return false
	}
}
func release() { <-geminiLimiter }

func NewLLMService() *LLMService {
	return &LLMService{
		APIKey: os.Getenv("GEMINI_API_KEY"),
	}
}

type GeminiContent struct {
	Role  string       `json:"role"`
	Parts []GeminiPart `json:"parts"`
}

type GeminiPart struct {
	Text string `json:"text"`
}

type GeminiRequest struct {
	Contents         []GeminiContent   `json:"contents"`
	GenerationConfig *GenerationConfig `json:"generationConfig,omitempty"`
}

type GenerationConfig struct {
	ResponseMimeType string `json:"responseMimeType,omitempty"`
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

func (s *LLMService) callGemini(prompt string) (string, error) {
	if !acquire() {
		return "", fmt.Errorf("callGemini: concurrency limit reached")
	}
	defer release()

	fmt.Printf("Prompt size: %d bytes\n", len(prompt))

	reqBody := GeminiRequest{
		Contents: []GeminiContent{
			{
				Role: "user",
				Parts: []GeminiPart{
					{Text: prompt},
				},
			},
		},
		GenerationConfig: &GenerationConfig{
			ResponseMimeType: "application/json",
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("callGemini: failed to marshal request body: %w", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=%s", s.APIKey)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("callGemini: failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("callGemini: request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("callGemini: failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("callGemini: API returned %d: %s", resp.StatusCode, string(body))
	}

	var parsed GeminiResponse
	if err := json.Unmarshal(body, &parsed); err != nil {
		return "", fmt.Errorf("callGemini: failed to parse JSON response: %w", err)
	}

	if len(parsed.Candidates) == 0 || len(parsed.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("callGemini: incomplete response")
	}

	return parsed.Candidates[0].Content.Parts[0].Text, nil
}

// Resume Suggestions
func (s *LLMService) GetSuggestions(resumeText, jobDescription string) (string, error) {
	prompt := fmt.Sprintf(`
You are a helpful assistant that reviews a candidate's resume and provides structured suggestions to improve alignment with a job description.

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

Only output a valid JSON object.`, resumeText, jobDescription)

	return s.callGemini(prompt)
}

func (s *LLMService) RewriteResume(resumeText string, jobDescription string) (json.RawMessage, error) {
	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))

	systemPrompt := `You are an expert resume optimizer. Your task is to transform the following resume into a highly effective, modern, and **job-specific** version that excels with both **human recruiters** and **Applicant Tracking Systems (ATS)**.

This is not a surface-level edit. You must **rewrite and restructure** the resume with precision and judgment, applying best practices for one-page technical resumes.

Extract and match as many keywords, tools, and phrasing from the job description as possible in a natural way. Prioritize noun phrases and skills verbs used in the JD.

Score the relevance of each experience or project against the job description. Keep only the highest scoring ones that match the required skills, duties, or technologies in the job post.

The summary must include 8–10 key phrases directly derived from the job description.

### Key Goals:
- Prioritize **clarity**, **impact**, and **alignment with the job description**
- Use concise, quantifiable, and outcome-driven language
- Highlight **relevant technologies**, **measurable results**, and **business value**
- **Maximize ATS compatibility by incorporating high-impact, job-relevant keywords naturally throughout the resume—especially in bullet points, summary, and skills**
- Ensure keyword integration does not come at the cost of clarity or readability to a human reviewer
- Remove or condense less relevant roles/projects to ensure tight, high-impact content
- Completely discard original bullet phrasing—**do not just improve language**, rewrite to emphasize value
- Avoid generic adjectives (e.g., "motivated," "hardworking") and use **concrete skills**, **tools**, and **outcomes**
- From the remaining roles/projects you choose to keep, they should be reordered to most recent first.
- Extract and integrate as many specific keywords, tools, and task phrases from the job description as possible. Focus especially on technical nouns, action verbs, and industry-standard terminology.
- Ensure the top 20 skills match or strongly align with those listed in the job description.
- Eliminate any soft-skill-oriented or vague phrasing that does not contribute to ATS keyword matching.
- Avoid unecessary filler, each point should be clear

### Rewrite and Optimize:
You must revise the following fields:
- summary
- experience[].bullets
- projects[].bullets
- skills

### Bullet Guidelines:
- Every bullet must follow the **X-Y-Z format**:
  - **X:** What was done (action)
  - **Y:** How it was done (tools, frameworks, methods)
  - **Z:** Why it mattered (impact, metric, or value)
- Use concise, single-sentence bullets (no filler)
- **Each bullet must be ≤ 25 words**
- **Use 1–3 bullets per experience or project**, prioritizing relevance. Fewer is often better.
- You may **omit entire roles or projects** if they are not relevant or add no clear value

### Summary and Skills Constraints:
To ensure the resume fits **on one page at 11 pt font with standard margins**:
- The **summary** must be ≤ 50 words and keyword-rich
- The **skills** field must list **no more than 20 skills**, separated by commas

### Global Page Limit Constraints:
- Total number of bullets across all experience and projects must **not exceed 25**
- You may remove or combine redundant content across roles or projects

### You MAY:
- Adjust job titles for clarity if they were informal or vague
- Create new, plausible bullets based on reasonable inferences
- Remove low-value or outdated experiences/projects
- Improve clarity or conciseness in any field while preserving the original keys

### You MUST NOT:
- Keep original bullet phrasing or structure
- Fabricate unrealistic or unverifiable achievements
- Add or remove any top-level fields or keys
- Include any line breaks, bullet characters, or markdown
- Change the JSON format

### Output Format:
Return only a valid JSON object in the following format:

{ 
  "name": "string",
  "email": "string",
  "phone": "string",
  "linkedin": "string",
  "github": "string",
  "summary": "string",
  "education": "string",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "date": "string",
      "bullets": ["string", "string", ...]
    }
  ],
  "projects": [
    {
      "name": "string",
      "date": "string",
      "bullets": ["string", "string", ...]
    }
  ],
  "skills": "string"
}

Return only the transformed JSON object. Do not include commentary, labels, or explanations.`

	userPrompt := fmt.Sprintf("Resume:\n%s\n\nJob Description:\n%s", resumeText, jobDescription)

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4Dot1Nano,
			Messages: []openai.ChatCompletionMessage{
				{Role: openai.ChatMessageRoleSystem, Content: systemPrompt},
				{Role: openai.ChatMessageRoleUser, Content: userPrompt},
			},
			Temperature: 0.3,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("OpenAI call failed: %w", err)
	}

	return json.RawMessage(resp.Choices[0].Message.Content), nil
}

func (s *LLMService) GenerateCoverLetter(resumeText, jobDescription string) (json.RawMessage, error) {
	prompt := fmt.Sprintf(`
You are a career coach writing a professional and personalized cover letter based on the applicant's resume and the job description.

Avoid buzzwords and focus on relevant skills and experience. Keep the tone professional, confident, and thankful — not robotic or generic.

Output a valid JSON object with the following fields:
{
  "greeting": "string",
  "opening_paragraph": "string",
  "body_paragraph": "string",
  "closing_paragraph": "string",
  "signoff": "string"
}

Resume:
%s

Job Description:
%s

Only output a valid JSON object.`, resumeText, jobDescription)

	text, err := s.callGemini(prompt)
	return json.RawMessage(text), err
}
