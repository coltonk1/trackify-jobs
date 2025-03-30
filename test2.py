import os
import re
import pandas as pd
import numpy as np
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer
import PyPDF2
import docx2txt
import spacy
from sklearn.metrics.pairwise import cosine_similarity
from spacy.matcher import Matcher

model = SentenceTransformer('all-MiniLM-L6-v2')
# Load models
keybert_model = KeyBERT(model='all-MiniLM-L6-v2')
nlp = spacy.load('en_core_web_sm')

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF files"""
    text = ""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num in range(len(pdf_reader.pages)):
            text += pdf_reader.pages[page_num].extract_text()
    return text

def extract_text_from_docx(docx_path):
    """Extract text from DOCX files"""
    return docx2txt.process(docx_path)

def extract_text(file_path):
    """Extract text from various file formats"""
    if file_path.endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx'):
        return extract_text_from_docx(file_path)
    elif file_path.endswith('.txt'):
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    else:
        return None

def extract_name(text):
    """Extract candidate name using rule-based matching"""
    doc = nlp(text[:5000])
    matcher = Matcher(nlp.vocab)
    
    # Pattern: Firstname Lastname (e.g., John Doe)
    pattern = [
        {"POS": "PROPN"}, 
        {"POS": "PROPN"}
    ]
    matcher.add("NAME", [pattern])
    
    matches = matcher(doc)
    for match_id, start, end in matches:
        return doc[start:end].text
    
    # Fallback to NER
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text.strip()
    
    return "Unknown"


def extract_email(text):
    """Extract email address"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    return emails[0] if emails else None

def extract_phone(text):
    """Extract and clean phone number by removing special characters."""
    phone_pattern = r'\+?\d{1,3}?\s*\(?\d{3}\)?\s*\d{3}\s*\d{4}'
    phones = re.findall(phone_pattern, text)
    clean_phones = [''.join(filter(str.isdigit, phone)) for phone in phones]
    return clean_phones[0] if clean_phones else None

def extract_skills(text, top_n=15):
    """Extract skills using KeyBERT"""
    # Use n-grams to capture multi-word skills
    keywords = keybert_model.extract_keywords(
        text, 
        keyphrase_ngram_range=(1, 3),
        stop_words='english',
        use_maxsum=True,
        top_n=top_n
    )
    
    # Extract just the keywords, not the scores
    skills = [keyword[0] for keyword in keywords]
    
    # Filter out likely non-skill terms
    skill_terms = []
    for skill in skills:
        # Skip common resume section headers and non-skill terms
        if skill.lower() in ['resume', 'cv', 'name', 'email', 'phone', 'education', 'experience', 'contact']:
            continue
        skill_terms.append(skill)
    
    return skill_terms

def parse_resume(file_path):
    """Parse resume and extract key information"""
    text = extract_text(file_path)
    if not text:
        return None
    
    # Extract basic info
    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    
    # Extract skills
    skills = extract_skills(text)
    
    # Return structured data
    return {
        'filename': os.path.basename(file_path),
        'name': name,
        'email': email,
        'phone': phone,
        'skills': skills,
        'full_text': text
    }

def match_resume_to_job(resume_data, job_description):
    """Match resume to job description using KeyBERT"""
    if not resume_data:
        return 0
    
    # Extract keywords from job description
    job_keywords = keybert_model.extract_keywords(
        job_description,
        keyphrase_ngram_range=(1, 3),
        stop_words='english',
        top_n=15
    )
    job_skills = [keyword[0] for keyword in job_keywords]
    
    # Get resume skills
    resume_skills = resume_data['skills']
    
    # Simple counting match (number of job skills found in resume)
    direct_matches = len(set(job_skills).intersection(set(resume_skills)))
    match_score_count = direct_matches / len(job_skills) if job_skills else 0
    
    # Semantic similarity match
    # Get embeddings for job skills and resume full text
    job_desc_doc = ' '.join(job_skills)
    resume_doc = resume_data['full_text']
    
    # Use KeyBERT's sentence transformer to get embeddings
    job_embedding = model.encode([job_desc_doc])
    resume_embedding = model.encode([resume_doc])
    
    # Calculate cosine similarity
    similarity = cosine_similarity(job_embedding, resume_embedding)[0][0]
    
    # Combine the scores (50% direct matches, 50% semantic similarity)
    combined_score = (match_score_count * 0.5) + (similarity * 0.5)
    
    return combined_score

def rank_resumes(resume_folder, job_description):
    """Rank resumes against a job description"""
    results = []
    
    # Process all resumes in folder
    for filename in os.listdir(resume_folder):
        if filename.endswith(('.pdf', '.docx', '.txt')):
            file_path = os.path.join(resume_folder, filename)
            resume_data = parse_resume(file_path)
            
            if resume_data:
                # Match resume to job
                match_score = match_resume_to_job(resume_data, job_description)
                
                # Add to results
                results.append({
                    'filename': resume_data['filename'],
                    'name': resume_data['name'],
                    'email': resume_data['email'],
                    'phone': resume_data['phone'],
                    'match_score': match_score,
                    'skills': resume_data['skills']
                })
    
    # Sort by match score
    results = sorted(results, key=lambda x: x['match_score'], reverse=True)
    
    return results

# Example usage
if __name__ == "__main__":
    # Example job description
    job_description = """
    Software Engineer
    
    We are looking for a skilled software engineer with expertise in Python, machine learning, and data analysis.
    The ideal candidate will have experience with NLP, deep learning frameworks like TensorFlow or PyTorch,
    and database systems. Knowledge of cloud platforms like AWS is a plus.
    
    Requirements:
    - 3+ years of Python development experience
    - Experience with machine learning libraries
    - Strong problem-solving skills
    - Bachelor's degree in Computer Science or related field
    - Excellent communication skills
    """
    
    # Path to resume folder
    resume_folder = "./resumes"
    
    # Ensure the resume folder exists
    if not os.path.exists(resume_folder):
        os.makedirs(resume_folder)
        print(f"Created folder: {resume_folder}")
        print("Please add resume files to this folder.")
    else:
        # Rank the resumes
        results = rank_resumes(resume_folder, job_description)
        
        # Display results
        if results:
            print(f"Found {len(results)} resumes. Top matches:")
            for i, result in enumerate(results[:5], 1):
                print(f"\n{i}. {result['name']} ({result['filename']})")
                print(f"   Match Score: {result['match_score']:.2f}")
                print(f"   Email: {result['email']}")
                print(f"   Phone: {result['phone']}")
                print(f"   Top Skills: {', '.join(result['skills'][:5])}")
        else:
            print("No resumes found in the folder.")