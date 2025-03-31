import torch
from transformers import AutoTokenizer, AutoModel
import json
import torch.nn.functional as F
import os

def amplify_similarity(similarity, threshold=0.8, lower_power=1.25, upper_power=3):
    if similarity < threshold:
        return similarity ** upper_power
    elif similarity > threshold:
        return similarity ** lower_power
    else:
        return similarity
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

tokenizer = AutoTokenizer.from_pretrained('intfloat/e5-base-v2')
model = AutoModel.from_pretrained('intfloat/e5-base-v2').to(device)

with open('./job_description.txt', 'r') as file:
    job_description = file.read()

def get_embeddings(text):
    tokens = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    tokens = {key: value.to(device) for key, value in tokens.items()} 
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
    scaled_similarity = amplify_similarity(similarity)
    ranked_resumes.append((resume_file, scaled_similarity.item()))

ranked_resumes.sort(key=lambda x: x[1], reverse=True)

for resume, score in ranked_resumes:
    print(f"Resume: {resume}, Similarity Score: {score:.4f}")
