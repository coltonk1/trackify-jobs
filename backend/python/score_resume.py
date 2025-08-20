from datetime import datetime
import math
from time import time
from flask import Flask, request, jsonify
import re
from io import BytesIO
import numpy as np
import pdfplumber
from sentence_transformers import SentenceTransformer, util
import torch
import os
import pandas as pd
import spacy
from spacy.matcher import PhraseMatcher
from skillNer.general_params import SKILL_DB
from skillNer.skill_extractor_class import SkillExtractor
import xgboost as xgb

# --- Setup NLP + SkillNer ---
nlp = spacy.load("en_core_web_lg")
skill_extractor = SkillExtractor(nlp, SKILL_DB, PhraseMatcher)

device = torch.device("cpu")
model = SentenceTransformer('all-MiniLM-L6-v2', device=device)

# --- Load trained XGB regression model ---
script_dir = os.path.dirname(os.path.abspath(__file__))
scoring_model = xgb.XGBRegressor(tree_method="hist", device="cpu", n_jobs=1)
scoring_model.load_model(script_dir + "/xgboost_resume_match_model_v2.json")

app = Flask(__name__)

# ------------------ UTILITIES ------------------

def clean_text(text: str) -> str:
    text = text.replace("\n", " ").lower()
    return re.sub(r"\s+", " ", text).strip()

def extract_phrases(text):
    lines = re.split(r'[\n.;•\-]+', text)
    return [line.strip() for line in lines if len(line.strip()) > 4]

def embed_phrases(phrases):
    return model.encode(phrases, convert_to_tensor=True, normalize_embeddings=True)

def nonlinear_boost(x):
    raw = 1 / (1 + math.exp(-14 * (x - 0.65)))
    return 0.2 + 0.8 * raw

def extract_text_from_pdf(pdf_file):
    try:
        with pdfplumber.open(pdf_file) as pdf:
            return "\n".join(
                page.extract_text(x_tolerance=1.5, y_tolerance=3.0) or ""
                for page in pdf.pages
            )
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

# ------------------ SKILL EXTRACTION ------------------

def extract_with_skillner(text):
    annotations = skill_extractor.annotate(text)
    extracted = []
    for section in ["full_matches", "ngram_scored"]:
        for match in annotations["results"].get(section, []):
            skill_id = match["skill_id"]
            if skill_id in SKILL_DB:
                entry = SKILL_DB[skill_id]
                extracted.append({
                    "skill_id": skill_id,
                    "name": entry["skill_name"].lower(),
                    "type": entry["skill_type"]  # hard, soft, certification
                })
    return extracted

def split_skills(skills):
    hard = [s for s in skills if s["type"] == "Hard Skill"]
    soft = [s for s in skills if s["type"] == "Soft Skill"]
    certs = [s for s in skills if s["type"] == "Certification"]
    return hard, soft, certs

# ------------------ SCORING ------------------

def compute_skill_similarity(job_skills, resume_skills):
    """Return avg similarity and matched pairs between two skill sets."""
    if not job_skills or not resume_skills:
        return 0.0, 0.0, []

    job_names = [s["name"] for s in job_skills]
    resume_names = [s["name"] for s in resume_skills]

    emb_resume_skills = embed_phrases(resume_names)
    emb_job_skills = embed_phrases(job_names)

    skill_sim_matrix = util.cos_sim(emb_job_skills, emb_resume_skills)
    skill_top_similarities = skill_sim_matrix.max(dim=1).values.cpu().numpy()

    avg_sim = float(round(np.mean(skill_top_similarities) * 100, 2))
    max_sim = float(round(np.max(skill_top_similarities) * 100, 2))

    matched = []
    for i, job_skill in enumerate(job_names):
        j = torch.argmax(skill_sim_matrix[i]).item()
        matched.append({
            "job_skill": job_skills[i],
            "closest_resume_skill": resume_skills[j],
            "similarity": float(round(skill_sim_matrix[i][j].item() * 100, 2))
        })

    return avg_sim, max_sim, matched

def score_resume_vs_job(resume_text, job_description):
    resume_text = clean_text(resume_text)
    job_description = clean_text(job_description)

    # Phrase-level similarity
    resume_chunks = extract_phrases(resume_text)
    job_chunks = extract_phrases(job_description)
    if not resume_chunks or not job_chunks:
        return {"similarity": 0.0, "reason": "Empty input"}

    emb_resume = embed_phrases(resume_chunks)
    emb_job = embed_phrases(job_chunks)

    sim_matrix = util.cos_sim(emb_job, emb_resume)
    top_similarities = sim_matrix.max(dim=1).values.cpu().numpy()
    avg_score = np.mean(top_similarities)
    max_score = np.max(top_similarities)

    # SkillNer extraction
    resume_skills = extract_with_skillner(resume_text)
    job_skills = extract_with_skillner(job_description)

    # Split skills by type
    resume_hard, resume_soft, resume_certs = split_skills(resume_skills)
    job_hard, job_soft, job_certs = split_skills(job_skills)

    # Compute similarities
    hard_avg_sim, hard_max_sim, hard_matches = compute_skill_similarity(job_hard, resume_hard)
    soft_avg_sim, soft_max_sim, soft_matches = compute_skill_similarity(job_soft, resume_soft)
    cert_avg_sim, cert_max_sim, cert_matches = compute_skill_similarity(job_certs, resume_certs)

    # Weighted score: balance semantic & skills
    weighted_score = max_score * 0.5 + (hard_avg_sim / 100) * 0.3 + (soft_avg_sim / 100) * 0.2
    final_score = nonlinear_boost(weighted_score)

    if final_score < avg_score:
        final_score = avg_score
    elif final_score > max_score * 1.2:
        final_score = max_score * 1.2
    if final_score > max_score:
        final_score = max_score

    # Regression model score
    job_results = np.array([[float(round(avg_score * 100, 2)),
                             hard_avg_sim,
                             float(round(max_score * 100, 2))]])
    predicted_score = float(scoring_model.predict(job_results)[0])

    return {
        "average_similarity": float(round(avg_score * 100, 2)),
        "max_similarity": float(round(max_score * 100, 2)),
        "similarity": float(round(final_score * 100, 2)),

        "resume_hard_skills": resume_hard,
        "resume_soft_skills": resume_soft,
        "resume_certifications": resume_certs,
        "job_hard_skills": job_hard,
        "job_soft_skills": job_soft,
        "job_certifications": job_certs,

        "average_hard_skill_similarity": hard_avg_sim,
        "max_hard_skill_similarity": hard_max_sim,
        "matched_hard_skills": hard_matches,

        "average_soft_skill_similarity": soft_avg_sim,
        "max_soft_skill_similarity": soft_max_sim,
        "matched_soft_skills": soft_matches,

        "average_certification_similarity": cert_avg_sim,
        "max_certification_similarity": cert_max_sim,
        "matched_certifications": cert_matches,

        "ai_score": predicted_score
    }

# ------------------ API ------------------

@app.route('/rank-resumes', methods=['POST'])
def rank_resumes():
    start_time = datetime.now()

    file = request.files['file']
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    if file.content_length > 5 * 1024 * 1024:
        return jsonify({'error': 'File size exceeds 5MB limit'}), 413

    job_description = request.form.get('job_description', '')
    if not isinstance(job_description, str):
        return jsonify({'error': 'Job description must be a string'}), 400
    if len(job_description) > 10000:
        return jsonify({'error': 'Job description is too long'}), 400

    pdf_file = BytesIO(file.stream.read())
    resume_text = extract_text_from_pdf(pdf_file)
    if not resume_text:
        return jsonify({'error': 'Failed to extract text from PDF'}), 400

    result = score_resume_vs_job(resume_text, job_description)

    elapsed = (datetime.now() - start_time).total_seconds() * 1000
    print(f"/rank-resumes took {elapsed:.2f} ms", flush=True)

    return jsonify(result)

if __name__ == '__main__':
    app.run()
