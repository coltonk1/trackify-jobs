from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import torch
from transformers import AutoTokenizer, AutoModel
import pdfplumber
import torch.nn.functional as F
from io import BytesIO
import clamav

app = Flask(__name__)
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

### Constants and Device Setup
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CLASSIFIER_NAME = 'jjzha/jobbert_skill_extraction'

### Functions
def amplify_similarity(similarity, threshold=0.8, lower_power=1, upper_power=2):
    """Amplifies similarity scores based on a threshold."""
    if similarity < threshold:
        return similarity ** upper_power
    elif similarity > threshold:
        return similarity ** lower_power
    else:
        return similarity

def get_embeddings(text, tokenizer, model):
    """Gets embeddings for a given text."""
    tokens = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    tokens = {key: value.to(DEVICE) for key, value in tokens.items()} 
    with torch.no_grad():
        outputs = model(**tokens)
        embeddings = outputs.last_hidden_state.mean(dim=1) 
    return embeddings

def extract_text_from_pdf(pdf_file):
    """Extracts text from a PDF file."""
    try:
        with pdfplumber.open(pdf_file) as pdf:
            return "\n".join(page.extract_text(x_tolerance=1.5, y_tolerance=3.0) for page in pdf.pages)
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

@app.route('/rank-resumes', methods=['POST'])
@limiter.limit("10 per minute")
def rank_resumes():
    file = request.files['file']
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    if file.mimetype != 'application/pdf':
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    clamav.init()
    if clamav.scan_file(file.stream):
        return jsonify({'error': 'File contains malware'}), 400
    if file.content_length > 5 * 1024 * 1024:
        return jsonify({'error': 'File size exceeds 5MB limit'}), 413
    
    job_description = request.form.get('job_description', '')
    if not isinstance(job_description, str):
        return jsonify({'error': 'Job description must be a string'}), 400
    if len(job_description) > 1000:
        return jsonify({'error': 'Job description is too long'}), 400

    # Load model and tokenizer
    tokenizer = AutoTokenizer.from_pretrained(CLASSIFIER_NAME)
    model = AutoModel.from_pretrained(CLASSIFIER_NAME).to(DEVICE)

    # Get job description embeddings
    job_desc_embeddings = get_embeddings(job_description, tokenizer, model)

    # Extract text from PDF
    pdf_file = BytesIO(file.stream.read())
    resume_text = extract_text_from_pdf(pdf_file)

    # Get resume embeddings
    resume_embeddings = get_embeddings(resume_text, tokenizer, model)

    # Calculate similarity
    similarity = F.cosine_similarity(resume_embeddings, job_desc_embeddings)
    scaled_similarity = amplify_similarity(similarity)

    # Return result
    return jsonify({'similarity': scaled_similarity.item()})

if __name__ == '__main__':
    app.run(debug=True)