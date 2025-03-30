import PyPDF2
from google import genai
from google.genai import types
import os
import json

# Configure API
client = genai.Client(
        api_key="API_KEY",
    )
model = "gemini-2.0-flash"

def analyze_resume_with_gemini(text):
    prompt = f"""
    You are an AI assistant. Analyze the following resume and extract the following information in JSON format with these fields:
    - "Name": (String) Full name of the candidate
    - "Email": (String) Email address in the format 'example@example.com'
    - "Phone": (String) Phone number in the format '1234567890'
    - "Summary": (String or null) A brief summary or profile of the candidate, or null if not available
    - "Projects": (Array of Objects) List of projects, each with the following fields:
        - "title": (String) Title of the project
        - "link": (String) URL link to the project (if available)
        - "date": (String) Date of the project (e.g., 'February 2025')
        - "description": (String) Brief description of the project
        - "technologies": (Array of Strings) List of technologies used in the project
    - "Education": (Array of Objects) List of education entries, each with the following fields:
        - "degree": (String) Degree obtained (e.g., 'Bachelor of Science')
        - "field": (String) Field of study (e.g., 'Computer Science')
        - "institution": (String) Name of the institution
        - "graduation_date": (String) Graduation date (e.g., 'December 2025')
        - "gpa": (Number or null) GPA if available, or null if not
    - "Skills": (Array of Strings) List of skills mentioned in the resume, include common abbreviations or variations of the skills (e.g., 'JavaScript' and 'JS', 'ReactJS' and 'React', etc.)
    - "Work Experience": (Array of Objects) List of work experiences, each with the following fields:
        - "job_title": (String) Title of the job position
        - "company": (String) Name of the company
        - "from": (String) Start date of employment (e.g., 'January 2022')
        - "to": (String or null) End date of employment, or null if currently employed
        - "description": (String) Description of job responsibilities and achievements

    Resume:
    {text}

    Return the output strictly in the following JSON format:
    {{
        'Name': "Name",
        "Email": "Email",
        "Phone": "Phone",
        "Summary": "Summary or null",
        "Projects": [
            {{
                "title": "Project Title",
                "link": "URL",
                "date": "Date",
                "description": "Project Description",
                "technologies": ["Technology 1", "Technology 2"]
            }},
            ...
        ],
        "Education": [
            {{
                "degree": "Degree",
                "field": "Field",
                "institution": "Institution",
                "graduation_date": "Graduation Date",
                "gpa": GPA or null
            }},
            ...
        ],
        "Skills": ["Skill 1", "Skill 2", "JS", "React", "Node.js", ...],
        "Work Experience": [
            {{
                "job_title": "Job Title",
                "company": "Company",
                "from": "Start Date",
                "to": "End Date or null",
                "description": "Job Description"
            }},
            ...
        ]
    }}

    Please make sure the JSON output is in the exact format described above, with no additional explanations or commentary. The skills list should contain both full names and abbreviations/variations (e.g., 'JavaScript' and 'JS', 'React' and 'ReactJS', etc.).
    """

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
            ],
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        response_mime_type="application/json",
    )

    full_response = ""
    
    try:
        for chunk in client.models.generate_content_stream(
            model=model, 
            contents=contents,
            config=generate_content_config,
        ):
            full_response += chunk.text
        
        result = json.loads(full_response)
        return result

    except Exception as e:
        print(f"Error during API call: {e}")
        return {"error": str(e)}


def extract_text_from_pdf(pdf_path):
    """Extract text from PDF files"""
    text = ""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num in range(len(pdf_reader.pages)):
            text += pdf_reader.pages[page_num].extract_text()
    return text

def parse_resume(file_path):
    """Extract resume text and analyze using AI."""
    text = extract_text_from_pdf(file_path)
    if not text:
        return {"error": "Unable to extract text"}

    result = analyze_resume_with_gemini(text) 
    return result


output = parse_resume("testresume.pdf")
print(json.dumps(output, indent=4))