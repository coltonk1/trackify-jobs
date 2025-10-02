import time
import json
import spacy
import faiss
import numpy as np
from collections import Counter
from sentence_transformers import SentenceTransformer, util

# -------------------------------
# | Avg Time   | Accuracy | Noise |
# |------------|----------|-------|
# | ~0.32s     | 70%      | Low-Medium|
# -------------------------------

# ----------------------------------------------------------------------
# Load spaCy + Skill DB
# ----------------------------------------------------------------------
print("Loading spaCy + Skill DB...")
nlp = spacy.load("en_core_web_lg")

with open("skill_db.json", "r") as f:
    skill_db = json.load(f)

skill_names = [v["skill_name"] for v in skill_db.values()]
skill_ids = list(skill_db.keys())

# ----------------------------------------------------------------------
# Embedding model + precompute skill embeddings
# ----------------------------------------------------------------------
print("Loading embedding model...")
embedder = SentenceTransformer("sentence-transformers/all-distilroberta-v1")

print("Encoding skill DB...")
start = time.time()

skill_embeddings = embedder.encode(
    skill_names, 
    convert_to_numpy=True, 
    show_progress_bar=True
)

end = time.time()
print(f"Encoded {len(skill_names)} skills in {end - start:.4f} seconds")

# ----------------------------------------------------------------------
# Build FAISS index (cosine similarity)
# ----------------------------------------------------------------------
dim = skill_embeddings.shape[1]
index = faiss.IndexFlatIP(dim)
faiss.normalize_L2(skill_embeddings)
index.add(skill_embeddings)
print(f"FAISS index built with {index.ntotal} skills")


# ----------------------------------------------------------------------
# Pre-cluster the skill DB into groups
# ----------------------------------------------------------------------
n_clusters = 70  # tweak depending on granularity you want
print(f"Clustering {len(skill_embeddings)} skills into {n_clusters} groups...")
kmeans = faiss.Kmeans(dim, n_clusters, niter=20, verbose=False)
kmeans.train(skill_embeddings.astype(np.float32))
_, cluster_ids = kmeans.index.search(skill_embeddings.astype(np.float32), 1)
skill_to_cluster = {sid: int(cid[0]) for sid, cid in zip(skill_ids, cluster_ids)}
print("Clustering complete.")

# ----------------------------------------------------------------------
# Candidate phrase generator
# ----------------------------------------------------------------------
def get_candidates(doc):
    candidates = set()
    for chunk in doc.noun_chunks:
        if len(chunk) <= 5:
            candidates.add(chunk.text)
    for token in doc:
        if token.is_alpha and len(token.text) > 2:
            candidates.add(token.text)
    return list(candidates)

# ----------------------------------------------------------------------
# Skill extraction with centroid filtering
# ----------------------------------------------------------------------
def extract_skills(text, top_k=1, loose_thresh=0.65, cluster_cohesion_thresh=0.5):
    doc = nlp(text)
    candidates = get_candidates(doc)
    if not candidates:
        return []

    cand_embs = embedder.encode(candidates, convert_to_numpy=True, batch_size=32)
    faiss.normalize_L2(cand_embs)

    D, I = index.search(cand_embs, top_k)

    # Step 1: collect loose matches
    matches = []
    cluster_map = {}
    for cand, scores, idxs in zip(candidates, D, I):
        best_score = scores[0]
        best_idx = idxs[0]
        sid = skill_ids[best_idx]
        skill_type = skill_db[sid]["skill_type"]

        if skill_type != "Hard Skill":
            continue

        cand_len = len(cand.split())
        dynamic_thresh = 0.75 if cand_len == 1 else 0.70
        if best_score >= max(dynamic_thresh, loose_thresh):
            cluster_id = skill_to_cluster[sid]
            m = {
                "candidate": cand,
                "skill_name": skill_names[best_idx],
                "id": sid,
                "type": skill_type,
                "score": float(best_score),
                "cluster": cluster_id
            }
            matches.append(m)
            cluster_map.setdefault(cluster_id, []).append(skill_embeddings[best_idx])

    if not matches:
        return []

    # Step 2: compute global centroid
    all_vecs = np.vstack([skill_embeddings[skill_ids.index(m["id"])] for m in matches])
    global_centroid = all_vecs.mean(axis=0)
    global_centroid /= np.linalg.norm(global_centroid)

    # Step 3: score clusters against global centroid
    kept_clusters = []
    for cid, vecs in cluster_map.items():
        cluster_centroid = np.vstack(vecs).mean(axis=0)
        cluster_centroid /= np.linalg.norm(cluster_centroid)
        sim = cluster_centroid @ global_centroid
        if sim >= cluster_cohesion_thresh:
            kept_clusters.append(cid)

    # Step 4: keep only matches from relevant clusters
    filtered = [m for m in matches if m["cluster"] in kept_clusters]

    return sorted(filtered, key=lambda x: x["score"], reverse=True)


# ----------------------------------------------------------------------
# Example run
# ----------------------------------------------------------------------
text = """
Results-driven software engineer skilled in Python, JavaScript, REST APIs, PostgreSQL, and Flask. Proven in full-stack development, debugging, and enterprise deployments. Experienced with Linux or UNIX type Operating Systems and scripting; adept at guiding teams and delivering scalable, secure solutions.

Web Developer
- Engineered scalable full-stack apps using Next.js and PostgreSQL; improved data integrity and user experience.
- Implemented secure coding practices across three client projects, reducing security risk and improving performance.

Co-Director of Project Track
- Led Project Track for student developers; scoped projects, set timelines, and guided 20+ students to completion.
- Mentored on technical implementation and problem-solving; reviewed progress and prioritized features.
- Coordinated with instructors; organized project showcases and created learning resources.

Web Development Officer
- Collaborated on web security exercises; applied JavaScript best practices to improve project outcomes.

- Designed TrackifyJobs backend with Python and Flask; implemented OpenAI-powered resume parsing, scoring, and cover letter generation.
- Built centralized dashboard to manage subscription-based job applications; integrated NLP pipelines for resume analytics.

Documentation & Collaboration: Technical documentation, Mentoring, Project leadership
Networking & Security: IP addressing, Firewalls, OSI model
OS & Administration: Linux or UNIX type Operating Systems, Troubleshooting, Systems administration
Web & Data: JavaScript, Python, Flask, REST APIs, PostgreSQL, SQL, OpenAI, NLP
"""

n_runs = 20
times = []

for _ in range(n_runs):
    start = time.time()
    skills = extract_skills(text)
    end = time.time()
    times.append(end - start)

avg_time = sum(times) / n_runs
print(f"Ran {n_runs} times")
print(f"Average time: {avg_time:.4f} seconds")
print(f"All times: {[round(t, 4) for t in times]}")
print(f"Last run extracted {len(skills)} skills")
print([skill['skill_name'] for skill in skills])

# print("\n--- Extracted Skills ---")
# for s in skills:
#     print(f"{s['candidate']} → {s['skill_name']} (score={s['score']:.3f})")

# print(f"\nProcessing time: {end - start:.4f} seconds")
