import torch
from transformers import LongformerTokenizer, LongformerModel
import json
import torch.nn.functional as F
import os

tokenizer = LongformerTokenizer.from_pretrained('allenai/longformer-base-4096')
model = LongformerModel.from_pretrained('allenai/longformer-base-4096')

with open('./job_description.txt', 'r') as file:
    job_description = file.read()

def get_embeddings(text):
    tokens = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=4096)
    with torch.no_grad():
        outputs = model(**tokens)
        embeddings = outputs.last_hidden_state.mean(dim=1)
    return embeddings

resume_folder = './resumes/'
resumes = []
for resume_file in os.listdir(resume_folder):
    if resume_file.endswith(".json"):
        with open(os.path.join(resume_folder, resume_file), 'r') as file:
            data = json.load(file)
            json_string = json.dumps(data, indent=4) 
            resumes.append((resume_file, json_string))

job_desc_embeddings = get_embeddings(job_description)
ranked_resumes = []
for resume_file, resume_text in resumes:
    resume_embeddings = get_embeddings(resume_text)
    similarity = F.cosine_similarity(resume_embeddings, job_desc_embeddings)
    ranked_resumes.append((resume_file, similarity.item()))

ranked_resumes.sort(key=lambda x: x[1], reverse=True)

for resume, score in ranked_resumes:
    print(f"Resume: {resume}, Similarity Score: {score:.4f}")
