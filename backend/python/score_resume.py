import math
from time import sleep
from flask import Flask, request, jsonify
import re
from io import BytesIO
import nltk
import numpy as np
import pdfplumber
from sentence_transformers import SentenceTransformer, util
import torch
from transformers import pipeline
import textwrap
nltk.download("punkt")
from nltk.tokenize import sent_tokenize
import xgboost as xgb

# nlp = spacy.load("en_core_web_sm")
# ner = pipeline("ner", model="algiraldohe/lm-ner-linkedin-skills-recognition", aggregation_strategy="simple")
ner = pipeline("ner", model="GalalEwida/lm-ner-skills-recognition", aggregation_strategy="simple")

app = Flask(__name__)

model = SentenceTransformer('all-MiniLM-L6-v2')

scoring_model = xgb.XGBRegressor()
scoring_model.load_model("xgboost_resume_match_model.json")

def clean_text(text):
    text = text.lower()
    text = re.sub(r'\n+', ' ', text)                  # remove line breaks
    text = re.sub(r'[^A-Za-z0-9+.#/:-]+', ' ', text)  # remove extra punctuation
    text = re.sub(r'\s+', ' ', text)                  # collapse whitespace
    return text.strip()

def is_valid_skill(word):
    if len(word.split(" ")) > 3:
        return False
    if word.lower() in {"and", "or", "with", "for", "to", "the", "a"}:
        return False
    if re.fullmatch(r"[^\w]+", word):  # symbols only
        return False
    if word.startswith("##"):
        return False
    if re.search(r"\d", word):  # numbers in "skills" = probably phone number, dates
        return False
    return True

def extract_keyphrases_from_tokens(token_outputs):
    phrases = []
    current_phrase = []
    
    for token in token_outputs:
        label = token['entity']
        word = token['word']
        
        # Clean up wordpiece token (remove special prefix like 'Ġ')
        clean_word = word.lstrip('Ġ')

        if label == 'B-KEY':
            # Start of a new phrase
            if current_phrase:
                phrases.append(' '.join(current_phrase))
                current_phrase = []
            current_phrase.append(clean_word)

        elif label == 'I-KEY':
            if current_phrase:
                current_phrase.append(clean_word)
            else:
                # Rare case: I-KEY without B-KEY before it
                current_phrase = [clean_word]

    if current_phrase:
        phrases.append(' '.join(current_phrase))

    # Deduplicate and lowercase
    clean_phrases = list({p.lower() for p in phrases if len(p.strip()) > 1})
    return sorted(clean_phrases)

def extract_with_ner(text):
    text = clean_text(text)  # still sanitize the input
    raw_entities = []

    try:
        doc = ner(text)
        raw_entities.extend([
            {"group": ent['entity_group'], "word": ent['word']}
            for ent in doc
        ])
    except Exception as e:
        print(f"NER failed: {e}")
        return []
    
    seen = set()
    useful = []
    for ent in raw_entities:
        word = ent['word'].strip().lower()
        word = word.replace('. ', '.').replace(' .', '.')
        if word in seen:
            continue
        seen.add(word)
        if is_valid_skill(word) and ent['group'] in ("TECHNICAL", "TECHNOLOGY"):
            useful.append(word)

    return useful

def extract_soft_skills(text, main_threshold, secondary_threshold):
    text = clean_text(text)

    soft_skills = [
        # Communication
        "verbal communication",
        "written communication",
        "active listening",

        # Team Collaboration
        "teamwork",
        "interpersonal skills",
        "collaboration",

        # Leadership & Influence
        "leadership",
        "delegation",
        "mentoring",
        "influencing others",

        # Decision & Judgment
        "critical thinking",
        "analytical thinking",
        "problem solving",
        "decision making",
        "strategic thinking",

        # Work Ethic & Ownership
        "initiative",
        "ownership",
        "accountability",
        "dependability",
        "integrity",
        "work ethic",

        # Adaptability & Self-Management
        "adaptability",
        "flexibility",
        "resilience",
        "stress tolerance",
        "handling ambiguity",

        # Personal Development
        "curiosity",
        "growth mindset",
        "willingness to learn",
        "learning agility",

        # Productivity & Focus
        "time management",
        "prioritization",
        "attention to detail",
        "goal setting",

        # Creativity
        "creativity",
        "innovation",
        "resourcefulness",

        # Emotional & Social Intelligence
        "emotional intelligence",
        "conflict resolution",
        "empathy",

        # Inclusion & Culture
        "cultural sensitivity",
        "inclusion",
        "ethical judgment"
    ]

    soft_skill_embeddings = model.encode(soft_skills, convert_to_tensor=True)
    parts = re.split(r'[\n\r•\-–—.?!]+', text)
    phrases = [p.strip() for p in parts if len(p.strip()) > 6]

    scored_skills = {}

    if phrases:
        scores = util.cos_sim(model.encode(phrases, convert_to_tensor=True), soft_skill_embeddings)
        for row in scores:
            for skill, score in zip(soft_skills, row):
                s = score.item()
                if s >= secondary_threshold:
                    scored_skills[skill] = max(s, scored_skills.get(skill, 0))

    # Primary: For resumes make it 0.5, 0.3 for job descriptions
    main = [{"item": s, "score": round(v,2)} for s, v in scored_skills.items() if v >= main_threshold]
    # Seconday: Resumes - 0.35 <= score < 0.50, Job Descriptions - 0.20 <= score < 0.30
    secondary = [{"item": s, "score": round(v,2)} for s, v in scored_skills.items() if secondary_threshold <= v < main_threshold]

    return {
        "primary": main,
        "secondary": secondary
    }

def extract_phrases(text):
    lines = re.split(r'[\n.;•\-]+', text)
    return [line.strip() for line in lines if len(line.strip()) > 4]

def embed_phrases(phrases):
    embeddings = model.encode(phrases, convert_to_tensor=True, normalize_embeddings=True)
    return embeddings

def nonlinear_boost(x):
    print(x)
    raw = 1 / (1 + math.exp(-14 * (x - 0.6)))
    return 0.2 + 0.8 * raw
    # y = 1 / (1 + math.exp(-12 * (x - 0.6)))
    # return y
    # x = 1 / (1 + math.exp(-((100 * x / 9) - 4.5))) - .01
    # if x < 0.6:
    #     return x ** 1.3
    # return x ** 0.8

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

def score_resume_vs_job(resume_text, job_description):
    resume_text += " communication, teamwork, leadership, adaptability, problem-solving, critical thinking, time management, creativity, emotional intelligence, conflict resolution, decision making, attention to detail, collaboration, resilience, empathy, work ethic, flexibility, active listening, accountability, interpersonal skills"
    resume_chunks = extract_phrases(resume_text) 
    job_chunks = extract_phrases(job_description)

    if not resume_chunks or not job_chunks:
        return {"similarity": 0.0, "reason": "Empty input"}

    emb_resume = embed_phrases(resume_chunks)
    emb_job = embed_phrases(job_chunks)

    sim_matrix = util.cos_sim(emb_job, emb_resume)  # [job_phrases x resume_phrases]
    top_similarities = sim_matrix.max(dim=1).values.cpu().numpy()

    avg_score = np.mean(top_similarities)
    max_score = np.max(top_similarities)

    resume_skills = extract_with_ner(resume_text)
    job_skills = extract_with_ner(job_description)

    # Skill-level similarity scoring
    if resume_skills and job_skills:
        emb_resume_skills = embed_phrases(resume_skills)
        emb_job_skills = embed_phrases(job_skills)
        skill_sim_matrix = util.cos_sim(emb_job_skills, emb_resume_skills)
        skill_top_similarities = skill_sim_matrix.max(dim=1).values.cpu().numpy()
        skill_avg_sim = float(round(np.mean(skill_top_similarities) * 100, 2))
        skill_max_sim = float(round(np.max(skill_top_similarities) * 100, 2))

        matched_skills = []
        for i, job_skill in enumerate(job_skills):
            j = torch.argmax(skill_sim_matrix[i]).item()
            matched_skills.append({
                "job_skill": job_skill,
                "closest_resume_skill": resume_skills[j],
                "similarity": float(round(skill_sim_matrix[i][j].item() * 100, 2))
            })
    else:
        skill_avg_sim = 0.0
        skill_max_sim = 0.0
        matched_skills = []

    job_soft = extract_soft_skills(job_description, 0.35, 0.3)
    resume_soft = extract_soft_skills(resume_text, 0.45, 0.37)

    weighted_score = max_score * .5 + (skill_avg_sim / 100) * .5

    final_score = nonlinear_boost(weighted_score)
    if final_score < avg_score:
        final_score = avg_score
    elif final_score > max_score * 1.2:
        final_score = max_score * 1.2

    if final_score > max_score:
        final_score = max_score

    job_results = np.array([[float(round(avg_score * 100, 2)), skill_avg_sim, float(round(max_score * 100, 2))]])
    predicted_score = float(scoring_model.predict(job_results)[0])

    return {
        "average_similarity": float(round(avg_score * 100, 2)),
        "max_similarity": float(round(max_score * 100, 2)),
        "similarity": float(round(final_score * 100, 2)),
        "job_chunks_evaluated": len(job_chunks),
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "average_skill_similarity": skill_avg_sim,
        "max_skill_similarity": skill_max_sim,
        "matched_skills": matched_skills,
        "resume_soft_skills": resume_soft,
        "job_soft_skills": job_soft,
        "ai_score": predicted_score
    }


@app.route('/rank-resumes', methods=['POST'])
def rank_resumes():
    file = request.files['file']
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    if file.content_length > 5 * 1024 * 1024:
        return jsonify({'error': 'File size exceeds 5MB limit'}), 413

    job_description = request.form.get('job_description', '')
    if not isinstance(job_description, str):
        return jsonify({'error': 'Job description must be a string'}), 400
    if len(job_description) > 5000:
        return jsonify({'error': 'Job description is too long'}), 400

    pdf_file = BytesIO(file.stream.read())
    resume_text = extract_text_from_pdf(pdf_file)
    if not resume_text:
        return jsonify({'error': 'Failed to extract text from PDF'}), 400

    result = score_resume_vs_job(resume_text, job_description)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
