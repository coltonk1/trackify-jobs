import json
import os
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re
import PyPDF2
from google import genai
from google.genai import types
import json
client = genai.Client(
        api_key="API_KEY",
    )
model = "gemini-2.0-flash"

non_technical_words = {
    "looking", "for", "experience", "with", "we", "in", "as", "a", "the", "to", "especially", "and", "your", "on",
    "this", "that", "software", "engineer", "are", "you", "must", "have", "essential", "skills", "required",
    "position", "will", "of", "job", "description", "at", "is", "be", "an", "in"
}

synonyms = {
    "react": ["react", "reactjs", "react.js"],
    "aws": ["aws", "amazon web services", "amazon web services cloud"],
    "javascript": ["javascript", "js"],
    "api": ["api", "rest api", "web api"],
    "nodejs": ["nodejs", "node.js"],
    "python": ["python", "python3"],
    "docker": ["docker", "docker containers"],
    "mongodb": ["mongodb", "mongo db", "mongodb atlas"]
}

def extract_resume_features(resume_data):
    skills = " ".join(resume_data.get("Skills", []))
    work_experience = " ".join([job['description'] for job in resume_data.get("Work Experience", [])])
    projects = " ".join([project['description'] for project in resume_data.get("Projects", [])])
    education = " ".join([edu['degree'] + " " + edu['field'] for edu in resume_data.get("Education", [])])
    return f"{skills} {work_experience} {projects} {education}"

def extract_technical_keywords(job_description):
    job_description = job_description.lower()
    words = re.findall(r'\b\w+\b', job_description)
    filtered_words = [word for word in words if word not in non_technical_words]
    expanded_keywords = []
    for word in filtered_words:
        for key, variations in synonyms.items():
            if word in variations:
                expanded_keywords.append(key)
                break
        else:
            expanded_keywords.append(word)

    return expanded_keywords

def optimize_resume(job_description, resume):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    resume_text = extract_resume_features(resume)
    all_texts = [job_description, resume_text]
    embeddings = model.encode(all_texts)
    similarity_score = cosine_similarity([embeddings[0]], [embeddings[1]])
    suggestions = []
    if similarity_score[0][0] < 0.7:
        job_keywords = extract_technical_keywords(job_description)
        resume_skills = set(skill.lower() for skill in resume.get('Skills', [])) 

        for keyword in job_keywords:
            if len(keyword) > 2 and keyword.lower() not in resume_skills:
                suggestions.append(f"Add skill or mention {keyword} in your resume.")

        for project in resume.get('Projects', []):
            if "api" not in project['description'].lower():
                suggestions.append(f"Consider expanding your project {project['title']} to mention API usage.")

        for job in resume.get('Work Experience', []):
            if "leadership" not in job['description'].lower():
                suggestions.append(f"Consider mentioning leadership or team collaboration in your role at {job['company']}.")

    else:
        suggestions.append("Your resume is well-aligned with the job description.")

    return similarity_score[0][0], suggestions

def load_resume(file_path):
    with open(file_path, "r") as file:
        try:
            resume = json.load(file)
            return resume
        except json.JSONDecodeError as e:
            print(f"Error decoding {file_path}: {e}")
            return None
        
def get_revised_suggestions(resume, job_description):
    prompt = f"""
    You are an AI assistant. The following is a job applicant's resume and a job description:

    Resume:
    {str(resume)}

    Job Description:
    {job_description}
    
    Task: 
    1. Compare the resume against the job description.
    2. Provide a list of suggestions for improving the resume to better match the job description.
    3. Ensure that any suggestions you provide are relevant to the job description and will help improve the alignment of the resume.
    4. Remove any suggestions that are already covered in the resume, such as skills or experiences that are mentioned in the resume.
    5. Avoid suggesting basic terms or common phrases that do not add value or are already assumed in a typical resume (e.g., "team player", "problem-solving skills").

    Please output the revised list of suggestions only, without any explanations or commentary.
    """

    contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=prompt),
                ],
            ),
        ]

    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
    )

    full_response = ""
        
    try:
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            full_response += chunk.text
        
        return full_response

    except Exception as e:
        print(f"Error during API call: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    with open('job_description.txt', 'r') as file:
        job_description = file.read()
    
    resume_path = "resumes/resume.json"
    resume = load_resume(resume_path)

    if resume:
        similarity_score, suggestions = optimize_resume(job_description, resume)
        
        print(f"Resume Similarity Score: {similarity_score:.4f}")
        print("Suggestions for Optimization:")
        revised_suggestions = get_revised_suggestions(resume, job_description)
        print(revised_suggestions)
