import time
import json
import spacy
from sentence_transformers import SentenceTransformer, util
from skillNer.skill_extractor_class import SkillExtractor
from spacy.matcher import PhraseMatcher
from openai import OpenAI

# -------------------------------
# | Avg Time   | Accuracy | Noise |
# |------------|----------|-------|
# | ~3.0s      | ~90%     | Low   |
# -------------------------------

# ----------------------------------------------------------------------
# Setup (load once)
# ----------------------------------------------------------------------
print("Loading models + DB...")

nlp = spacy.load("en_core_web_lg")

with open("skill_db.json", "r") as f:
    skill_db = json.load(f)

skill_extractor = SkillExtractor(nlp, skills_db=skill_db, phraseMatcher=PhraseMatcher)

embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
skill_names = [v["skill_name"] for v in skill_db.values()]
skill_ids = list(skill_db.keys())
skill_embeddings = embedder.encode(skill_names, convert_to_tensor=True)

client = OpenAI(api_key="sk...")

# ----------------------------------------------------------------------
# Extract + normalize pipeline
# ----------------------------------------------------------------------
def extract_skills(text: str):
    prompt = f"""
    Extract all skill names from the following input text.
    Normalize each skill to its most common professional full name.
    For example:
    - "sql" → "sql (programming language)"
    - "apis" → "application programming interface"
    - "agile" → "agile methodology"
    - ".net" → ".net framework"
    - "aws" → "amazon web services"
    - "gcp" → "google cloud platform"
    - "restapi" → "restapi"

    Return ONLY a valid JSON array of lowercase, normalized skill names.
    Do not include explanations, just the JSON array.

    Input text:
    {text}
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "You are a skill extractor that outputs JSON only."},
            {"role": "user", "content": prompt}
        ],
        stream=False,
        temperature=0.0,
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content
    try:
        extracted = json.loads(raw).get("skills", [])
    except Exception:
        extracted = []

    # Normalize using SkillNer + embeddings
    combined_text = " | ".join(extracted)
    annotations = skill_extractor.annotate(combined_text)

    normalized = {}
    for section in ["full_matches", "ngram_scored"]:
        for match in annotations["results"].get(section, []):
            skill_id = match["skill_id"]
            normalized[match["doc_node_value"].lower()] = skill_db[skill_id]["skill_name"]

    for skill in extracted:
        if skill.lower() not in normalized:
            emb = embedder.encode(skill, convert_to_tensor=True)
            cos_scores = util.cos_sim(emb, skill_embeddings)[0]
            best_idx = int(cos_scores.argmax())
            normalized[skill.lower()] = skill_names[best_idx]

    return list(normalized.values())

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
print(skills)