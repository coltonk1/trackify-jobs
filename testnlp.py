import re
import spacy
from spacy.tokens import Span
from spacy.language import Language
from spacy.matcher import Matcher, PhraseMatcher
from spacy.util import filter_spans

nlp = spacy.load("en_core_web_sm")

@Language.component("extract_email")
def extract_email(doc):
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    matches = re.finditer(email_pattern, doc.text)
    
    new_entities = []
    for match in matches:
        start, end = match.span()
        span = doc.char_span(start, end)
        if span is not None:
            new_entities.append(Span(doc, span.start, span.end, label="EMAIL"))
    
    entities = list(doc.ents) + new_entities
    doc.ents = filter_spans(entities) 
    
    return doc

@Language.component("extract_phone")
def extract_phone(doc):
    phone_pattern = r'\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
    matches = re.finditer(phone_pattern, doc.text)
    
    new_entities = []
    for match in matches:
        start, end = match.span()
        span = doc.char_span(start, end)
        if span is not None:
            new_entities.append(Span(doc, span.start, span.end, label="PHONE"))
    
    entities = list(doc.ents) + new_entities
    doc.ents = filter_spans(entities)  
    
    return doc

@Language.component("extract_education")
def extract_education(doc):
    education_keywords = ["degree", "bachelor", "master", "phd", "bsc", "msc", "b.s.", "m.s.", "ph.d", "university", "college", "school"]
    education_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = []
    for keyword in education_keywords:
        patterns.append(nlp.make_doc(keyword)) 
    
    education_matcher.add("EDUCATION", None, *patterns)
    
    new_entities = []
    matches = education_matcher(doc)
    
    for match_id, start, end in matches:
        token = doc[start]
        for sent in doc.sents:
            if token in sent:
                new_entities.append(Span(doc, sent.start, sent.end, label="EDUCATION"))
                break
    
    entities = list(doc.ents) + new_entities
    doc.ents = filter_spans(entities) 
    
    return doc

@Language.component("extract_work")
def extract_work(doc):
    work_keywords = ["experience", "work", "employment", "job", "career", "position", "role"]
    company_keywords = ["at", "for", "with"]
    
    work_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    company_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    
    work_patterns = [nlp.make_doc(keyword) for keyword in work_keywords]
    company_patterns = [nlp.make_doc(keyword) for keyword in company_keywords]
    
    work_matcher.add("WORK", None, *work_patterns)
    company_matcher.add("COMPANY", None, *company_patterns)
    
    new_entities = []
    
    for match_id, start, end in company_matcher(doc):
        token = doc[start]
        if token.i + 1 < len(doc):
            for sent in doc.sents:
                if token in sent:
                    for ent in doc.ents:
                        if ent.label_ == "ORG" and ent in sent:
                            new_entities.append(Span(doc, sent.start, sent.end, label="WORK_EXPERIENCE"))
                            break
                    else:
                        company_start = token.i + 1
                        company_end = company_start + 1
                        while company_end < len(doc) and (doc[company_end].is_alpha or doc[company_end].text == ")"):
                            company_end += 1
                        if company_end > company_start:
                            new_entities.append(Span(doc, sent.start, sent.end, label="WORK_EXPERIENCE"))
                    break
    
    entities = list(doc.ents) + new_entities
    doc.ents = filter_spans(entities) 
    
    return doc

@Language.component("extract_skills")
def extract_skills(doc, skill_list=None):
    if skill_list is None:
        skill_list = [
            "javascript", "react", "node.js", "python", "machine learning", "sql",
            "java", "c++", "c#", "ruby", "php", "html", "css", "aws", "azure", 
            "docker", "kubernetes", "git", "agile", "scrum", "data analysis",
            "tensorflow", "pytorch", "nlp", "tableau", "power bi", "excel"
        ]
    
    skill_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    
    skill_patterns = [nlp.make_doc(skill.lower()) for skill in skill_list]
    skill_matcher.add("SKILL", None, *skill_patterns)
    
    new_entities = []
    matches = skill_matcher(doc)
    
    for match_id, start, end in matches:
        new_entities.append(Span(doc, start, end, label="SKILL"))
    
    entities = list(doc.ents) + new_entities
    doc.ents = filter_spans(entities)  
    
    return doc

nlp.add_pipe("extract_email", after="ner")
nlp.add_pipe("extract_phone", after="extract_email")
nlp.add_pipe("extract_education", after="extract_phone")
nlp.add_pipe("extract_work", after="extract_education")
nlp.add_pipe("extract_skills", after="extract_work")

def extract_name(doc):
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            first_few_lines_text = "\n".join(doc.text.split("\n")[:5]) 
            if ent.text in first_few_lines_text:
                return ent.text
    
    lines = [line.strip() for line in doc.text.strip().split("\n") if line.strip()]
    for line in lines[:5]: 
        if re.search(r'@|^\d|^\+|http|www|resume|cv|curriculum', line.lower()):
            continue
            
        if 1 <= len(line.split()) <= 5: 
            name_doc = nlp(line)
            for ent in name_doc.ents:
                if ent.label_ == "PERSON":
                    return ent.text
            
            if not re.search(r'[:/\\]|\d', line) and len(line) > 2:
                words = line.split()
                if all(word[0].isupper() for word in words if len(word) > 1):
                    return line
    
    for line in lines[:7]:
        match = re.search(r'^(?:name|full name|applicant)\s*[:-]\s*(.+)', line, re.IGNORECASE)
        if match:
            potential_name = match.group(1).strip()
            if 1 <= len(potential_name.split()) <= 5 and not re.search(r'[:/\\]|\d', potential_name):
                return potential_name
    
    return "Unknown"

def extract_sections(text):
    sections = {}
    current_section = "header"
    current_content = []
    
    lines = text.strip().split("\n")
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.endswith(":") or re.match(r'^[A-Z][a-zA-Z\s]+:?$', line):
            if current_content:
                sections[current_section] = "\n".join(current_content)
            current_section = line.rstrip(":").lower()
            current_content = []
        else:
            current_content.append(line)
    
    if current_content:
        sections[current_section] = "\n".join(current_content)
        
    return sections

def safe_nlp(text):
    current_pipeline = list(nlp.pipe_names)
    
    custom_components = ["extract_email", "extract_phone", "extract_education", 
                         "extract_work", "extract_skills"]
    
    with nlp.select_pipes(disable=custom_components):
        doc = nlp(text)
    
    for component_name in custom_components:
        if component_name in current_pipeline:
            component = nlp.get_pipe(component_name)
            doc = component(doc)
    
    return doc

def process_resume(resume_text):
    doc = safe_nlp(resume_text)
    sections = extract_sections(resume_text)
    candidate_name = extract_name(doc)
    emails = [ent.text for ent in doc.ents if ent.label_ == "EMAIL"]
    phones = [ent.text for ent in doc.ents if ent.label_ == "PHONE"]
    education = [ent.text for ent in doc.ents if ent.label_ == "EDUCATION"]
    work_experience = [ent.text for ent in doc.ents if ent.label_ == "WORK_EXPERIENCE"]
    skills = [ent.text for ent in doc.ents if ent.label_ == "SKILL"]
    parsed_resume = {
        "name": candidate_name,
        "contact": {
            "email": emails[0] if emails else None,
            "phone": phones[0] if phones else None
        },
        "education": education,
        "work_experience": work_experience,
        "skills": skills,
        "sections": sections
    }
    
    return parsed_resume
def score_resume(parsed_resume, job_description):
    job_doc = safe_nlp(job_description)
    job_skills = [ent.text.lower() for ent in job_doc.ents if ent.label_ == "SKILL"]
    skill_keywords = [
        "experience with", "knowledge of", "proficient in", "skilled in",
        "expertise in", "familiarity with", "background in", "understanding of"
    ]
    
    for keyword in skill_keywords:
        for match in re.finditer(r'{}(.*?)(?:\.|\n|;)'.format(keyword), job_description, re.IGNORECASE):
            skill_text = match.group(1).strip().lower()
            job_skills.append(skill_text)
    
    candidate_skills = [skill.lower() for skill in parsed_resume["skills"]]
    
    matching_skills = set()
    for job_skill in job_skills:
        for candidate_skill in candidate_skills:
            if job_skill in candidate_skill or candidate_skill in job_skill:
                matching_skills.add(job_skill)
                break
    
    skill_match_score = len(matching_skills) / len(job_skills) if job_skills else 0
    
    experience_score = min(len(parsed_resume["work_experience"]) / 3, 1.0)  # Normalize to max of 1.0
    education_score = 1.0 if parsed_resume["education"] else 0.0
    
    total_score = (skill_match_score * 0.6) + (experience_score * 0.3) + (education_score * 0.1)
    
    return {
        "total_score": round(total_score * 100, 2),
        "skill_match": round(skill_match_score * 100, 2),
        "experience_match": round(experience_score * 100, 2),
        "education_match": round(education_score * 100, 2),
        "matching_skills": list(matching_skills),
        "missing_skills": list(set(job_skills) - matching_skills)
    }

sample_job_description = """
Software Engineer
We're looking for a talented Software Engineer with experience in JavaScript, React, and Node.js.
Requirements:
- 2+ years of experience with JavaScript and React
- Experience with Node.js and backend development
- Knowledge of SQL databases
- Familiarity with Git and Agile methodologies
- BSc in Computer Science or related field
"""

if __name__ == "__main__":
    resume_text = """
    
    """

    try:
        parsed_resume = process_resume(resume_text)
        print("===== PARSED RESUME =====")
        print(f"Name: {parsed_resume['name']}")
        print(f"Email: {parsed_resume['contact']['email']}")
        print(f"Phone: {parsed_resume['contact']['phone']}")
        
        print("\nEducation:")
        for edu in parsed_resume['education']:
            print(f"- {edu}")
        
        print("\nWork Experience:")
        for exp in parsed_resume['work_experience']:
            print(f"- {exp}")
        
        print("\nSkills:")
        for skill in parsed_resume['skills']:
            print(f"- {skill}")
        
        score = score_resume(parsed_resume, sample_job_description)
        
        print("\n===== RESUME SCORE =====")
        print(f"Total Match: {score['total_score']}%")
        print(f"Skill Match: {score['skill_match']}%")
        print(f"Experience Match: {score['experience_match']}%")
        print(f"Education Match: {score['education_match']}%")
        
        print("\nMatching Skills:")
        for skill in score['matching_skills']:
            print(f"- {skill}")
        
        print("\nMissing Skills:")
        for skill in score['missing_skills']:
            print(f"- {skill}")
    except Exception as e:
        print(f"Error processing resume: {e}")