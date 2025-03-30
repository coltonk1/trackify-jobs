import json
import numpy as np
from google import genai
from sklearn.metrics.pairwise import cosine_similarity


with open("./resumes/resume.json", "r") as file:
    resume_data_json = json.load(file)

resume_data = json.dumps(resume_data_json, indent=4)

with open("./job_description.txt", "r") as file:
    job_description = file.read()

client = genai.Client(api_key="API_KEY")

def get_embeddings(text):
    result = client.models.embed_content(
        model="gemini-embedding-exp-03-07",
        contents=text
    )
    embeddings = result.embeddings

    if hasattr(embeddings, 'values'):
        embeddings = embeddings.values

    embeddings = np.array(embeddings)
    return embeddings

job_desc_embedding = get_embeddings(job_description)
resume_embedding = get_embeddings(resume_data)

similarity = cosine_similarity(job_desc_embedding, resume_embedding)
print(f"Similarity {similarity[0][0]:.4f}")
