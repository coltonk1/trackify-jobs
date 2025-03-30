import json
import os
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

def extract_resume_features(resume_data):
    skills = " ".join(resume_data.get("Skills", []))
    work_experience = " ".join([job['description'] for job in resume_data.get("Work Experience", [])])
    projects = " ".join([project['description'] for project in resume_data.get("Projects", [])])
    education = " ".join([edu['degree'] + " " + edu['field'] for edu in resume_data.get("Education", [])])
    
    return f"{skills} {work_experience} {projects} {education}"

def rank_resumes(job_description, resumes):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    resume_texts = [extract_resume_features(resume) for resume in resumes]
    all_texts = [job_description] + resume_texts
    embeddings = model.encode(all_texts)
    similarity_scores = cosine_similarity([embeddings[0]], embeddings[1:])
    ranked_resumes = sorted(zip(similarity_scores[0], resumes), key=lambda x: x[0], reverse=True)
    return [(score, resume) for score, resume in ranked_resumes]

def load_resumes_from_folder(folder_path):
    resumes = []
    for filename in os.listdir(folder_path):
        if filename.endswith(".json"):
            file_path = os.path.join(folder_path, filename)
            with open(file_path, "r") as file:
                try:
                    resume = json.load(file)
                    resumes.append(resume)
                except json.JSONDecodeError as e:
                    print(f"Error decoding {filename}: {e}")
    return resumes

if __name__ == "__main__":
    job_description = """
    We're looking for a Software Engineer with experience in full-stack web development, especially with Next.js, React, and MongoDB.
    Must have expertise in building RESTful APIs and working with cloud technologies like AWS and Docker. Strong problem-solving and
    team collaboration skills are essential.
    """
    
    folder_path = "resumes"
    resumes = load_resumes_from_folder(folder_path)
    
    ranked_resumes = rank_resumes(job_description, resumes)
    
    for score, resume in ranked_resumes:
        print(f"Similarity Score: {score:.4f} - {resume['Name']} - {resume['Email']}")
