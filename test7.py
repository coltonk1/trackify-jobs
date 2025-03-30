import re
from collections import Counter

def extract_keywords(text):
    """Extracts keywords from a text string.
    Simplistic approach: splits by non-alphanumeric characters and lowercases.
    Consider more sophisticated NLP techniques for better results.
    """
    words = re.split(r'\W+', text.lower())
    stop_words = set(['the', 'a', 'an', 'is', 'are', 'of', 'and', 'in', 'to', 'for', 'with', 'on'])
    keywords = [word for word in words if word and word not in stop_words]
    return keywords

def calculate_similarity(resume_text, job_description_text):
    """Calculates the similarity between resume and job description based on keyword overlap."""
    resume_keywords = extract_keywords(resume_text)
    job_description_keywords = extract_keywords(job_description_text)

    if not job_description_keywords:
        return 0.0

    match_count = 0
    for r_keyword in resume_keywords:
        if r_keyword in job_description_keywords:
            match_count += 1

    similarity_score = match_count / len(job_description_keywords)
    return similarity_score

job_description_string = """
"""

resume_string = """

"""

similarity = calculate_similarity(resume_string, job_description_string)
print(f"Similarity Score: {similarity:.4f}")