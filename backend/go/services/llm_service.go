package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	openai "github.com/sashabaranov/go-openai"
)

type LLMService struct {
	APIKey string
}

func NewLLMService() *LLMService {
	return &LLMService{}
}

type RewrittenResume struct {
	Name      string `json:"name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	LinkedIn  string `json:"linkedin"`
	GitHub    string `json:"github"`
	Summary   string `json:"summary"`
	Education []struct {
		Degree string `json:"degree"`
		School string `json:"school"`
		Date   string `json:"date"`
	} `json:"education"`
	Experience []struct {
		Title   string   `json:"title"`
		Company string   `json:"company"`
		Date    string   `json:"date"`
		Bullets []string `json:"bullets"`
	} `json:"experience"`
	Projects []struct {
		Name    string   `json:"name"`
		Date    string   `json:"date"`
		Bullets []string `json:"bullets"`
	} `json:"projects"`
	Skills map[string][]string `json:"skills"`
}

// Resume Suggestions
func (s *LLMService) GetSuggestions(resumeText, jobDescription string) (json.RawMessage, error) {
	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))

	systemPrompt := `You are an expert resume analyst. Your task is to review a candidate's resume and evaluate how well it aligns with a given job description. You will be talking directly to the candidate. You should use easy to understand and specific language.

You must return **only** a valid JSON object in the exact format below:

{
  "missing_skills": string[],
  "keyword_gaps": string[],
  "experience_alignment": string[],
  "general_advice": string[]
}

Definitions:
- "missing_skills": Skills mentioned in the job description that are not clearly present in the resume.
- "keyword_gaps": Relevant terms or phrases from the job description that are absent in the resume.
- "experience_alignment": Specific ways the candidate's experience either matches or partially matches the job requirements.
- "general_advice": Actionable suggestions for improving alignment, excluding skills or keywords.

Strict instructions:
- Do not fabricate experience or qualifications not present in the resume.
- Be concrete and precise. Avoid generic or vague suggestions.
- Do not include markdown, labels, commentary, or formatting outside the JSON object.
- You must include at least 1 item per key.
- Do not use em dashes or non-standard punctuation.
- Output **only** the JSON object. Nothing more.`

	userPrompt := fmt.Sprintf("Resume:\n%s\n\nJob Description:\n%s", resumeText, jobDescription)

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4Dot1Mini,
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

func (s *LLMService) RewriteResume(resumeText string, jobDescription string, missingSkills []string) (*RewrittenResume, error) {
	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))

	systemPrompt := `You are a senior technical resume rewriting specialist.  
Your job is to transform the provided resume into a **highly targeted, job-specific version** that excels with both **Applicant Tracking Systems (ATS)** and human recruiters.  
This is a **complete rewrite**, not an edit — restructure and reword for maximum **relevance, precision, and measurable impact** based on the given job description.

---

## Primary Goals
1. **Tightly align** the resume with the provided job description.
2. **Maximize ATS match** by integrating job-specific keywords, action verbs, and relevant domain terms naturally.
3. Use **concise, results-focused language** that highlights measurable business value and technical execution.
4. Maintain a **modern, one-page format** with ruthless prioritization of relevance.

---

## Rewrite Rules
- Rewrite the following sections entirely:  
  summary, experience[].bullets, projects[].bullets, skills
- Follow **X–Y–Z structure** for every bullet:  
  - **X (Action):** What was done  
  - **Y (Tool/Method):** How it was done  
  - **Z (Impact):** Why it mattered or what it achieved
- 1–3 bullets per role or project.  
- Each bullet should contain **specific, measurable results** where reasonable. Never invent unsupported numbers.
- Use **complete sentences**, max 20 words each.
- Remove vague or soft-skill-focused bullets — prioritize **technical depth and results**.

---

## Skill Integration
You are given {{missingSkills}}.  
These are critical skills from the job description that are missing or underemphasized in the original resume.  

You must:
- Include these skills wherever they can be **reasonably inferred** from the candidate’s work.  
- Use **exact job description phrasing** when integrating them.  
- Favor technical nouns and strong verbs (e.g., “Built RESTful APIs with Express.js” instead of “Developed backend”).  
- Do not fabricate experience with skills that cannot be plausibly supported.

---

## Section-Specific Guidelines
### Summary
- ≤ 50 words.  
- Include 8–10 job-relevant keywords from the job description.

### Skills
- Max 20 skills, grouped into **no more than 4 categories**.  
- Categories should be relevant to the role.  
- Skills must be comma-separated within each category.

### Experience & Projects
- Total combined bullets ≤ 25 across all roles and projects.  
- Reverse chronological order.  
- Combine or remove low-relevance entries.  
- Emphasize tech stack, architecture, integrations, performance, deployment, and user impact.  
- Reorder or relabel job titles if it improves clarity and alignment with the job description.

---

## Prohibited
- Keeping any original phrasing or structure.
- Adding new top-level sections.
- Outputting anything except the required JSON.

---

## Output Format
Return **only** a valid JSON object in this structure:

{
  "name": string,
  "email": string,
  "phone": string,
  "linkedin": string,
  "github": string,
  "summary": string,
  "education": [{degree: string, school: string, date: string}],
  "experience": [
    {
      "title": string,
      "company": string,
      "date": string,
      "bullets": string[]
    }
  ],
  "projects": [
    {
      "name": string,
      "date": string,
      "bullets": string[]
    }
  ],
  "skills": {category: string[]}
}

`

	missingSkillsText := strings.Join(missingSkills, ", ")

	injectedPrompt := strings.Replace(systemPrompt, "{{missingSkills}}", missingSkillsText, 1)

	userPrompt := fmt.Sprintf("Resume:\n%s\n\nJob Description:\n%s", resumeText, jobDescription)

	start := time.Now()

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: "gpt-5-nano",
			Messages: []openai.ChatCompletionMessage{
				{Role: openai.ChatMessageRoleSystem, Content: injectedPrompt},
				{Role: openai.ChatMessageRoleUser, Content: userPrompt},
			},
			ResponseFormat: &openai.ChatCompletionResponseFormat{
				Type: "json_object",
			},
		},
	)

	duration := time.Since(start)
	fmt.Printf("OpenAI call took %s\n", duration)

	if err != nil {
		return nil, fmt.Errorf("OpenAI call failed: %w", err)
	}

	var rewritten RewrittenResume
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &rewritten); err != nil {
		return nil, fmt.Errorf("failed to parse LLM output: %w", err)
	}
	return &rewritten, nil
}

func (s *LLMService) GenerateCoverLetter(resumeText, jobDescription string) (json.RawMessage, error) {
	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))

	systemPrompt := `You are a career coach writing professional, personalized cover letters tailored to the applicant’s resume and the job description.

Your task is to create a cover letter that clearly demonstrates why the applicant is a strong fit for the role, using relevant experience, skills, and motivations drawn from the resume and **clearly aligned with the job description**.

### Writing Guidelines:
- Do **not** fabricate experience, qualifications, or skills that are not clearly supported by the resume.
- The tone must be professional, confident, and **human**—not inflated, robotic, or overly formal.
- Write in a way that sounds like a real person: natural, direct, and thoughtfully worded.
- The letter must reflect genuine interest in the specific job, not read like a generic template.
- Rephrase and contextualize resume content rather than copying it verbatim.
- **Incorporate specific language, responsibilities, tools, or qualifications from the job description** to show the applicant read and understood the role.
- Mention aspects of the job or company that align with the applicant’s background or interests when possible.
- Avoid vague platitudes or empty enthusiasm. Focus on substance: what the candidate offers, and why they are well-matched to this job.
- Never include an em dash or any form of dash to separate sentences. You must write using human language.

### Output Format:
Return only a valid JSON object with a single field:
{
  "cover_letter": "string"
}

The cover letter should include:
- A greeting
- A brief, specific opening paragraph (1–2 sentences)
- A body section (1–2 concise paragraphs) that connects the applicant’s background to the job requirements
- A short closing paragraph and signoff

Use newline characters (\n) between logical sections.

Never use this character: —.
Never use an em dash to break up a sentence or punctuation separator. Use regular punctuation.

Do **not** include explanations, markdown, labels, or anything outside the JSON object. Output only the JSON.`

	userPrompt := fmt.Sprintf("Resume:\n%s\n\nJob Description:\n%s", resumeText, jobDescription)

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4Dot1Nano,
			Messages: []openai.ChatCompletionMessage{
				{Role: openai.ChatMessageRoleSystem, Content: systemPrompt},
				{Role: openai.ChatMessageRoleUser, Content: userPrompt},
			},
			Temperature: 0.4,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("OpenAI call failed: %w", err)
	}

	return json.RawMessage(resp.Choices[0].Message.Content), nil
}
