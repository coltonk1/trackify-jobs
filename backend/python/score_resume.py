import math
from flask import Flask, request, jsonify
import re
from io import BytesIO
import torch
import numpy as np
import pdfplumber
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)

model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_phrases(text):
    lines = re.split(r'[\n.;•\-]+', text)
    return [line.strip() for line in lines if len(line.strip()) > 4]

def embed_phrases(phrases):
    embeddings = model.encode(phrases, convert_to_tensor=True, normalize_embeddings=True)
    return embeddings

def nonlinear_boost(x):
    x = 1 / (1 + math.exp(-((100 * x / 9) - 4.5))) - .01
    if x < 0.5:
        return x ** 1.2
    return x

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
    weighted_score = avg_score * .8 + max_score * .2

    final_score = nonlinear_boost(weighted_score)
    if final_score < avg_score:
        final_score = avg_score
    elif final_score > max_score * 1.2:
        final_score = max_score * 1.2

    return {
        "average_similarity": float(round(avg_score * 100, 2)),
        "max_similarity": float(round(max_score * 100, 2)),
        "similarity": float(round(final_score * 100, 2)),
        "job_chunks_evaluated": len(job_chunks)
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
    print(result)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
