'use client';

import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { parseResumeData, readFile } from '@/lib/parsing/main';
import { getAuth } from 'firebase/auth';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

function PdfViewer({ file }: { file: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="relative" ref={containerRef}>
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        className="rounded-lg overflow-hidden"
      >
        <Page
          pageNumber={1}
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      </Document>
    </div>
  );
}

const tabs = [
  { id: 'keyword', label: 'Keyword Parser' },
  { id: 'score', label: 'Resume Score' },
  { id: 'suggestions', label: 'Suggestions' },
  { id: 'rewrite', label: 'Rewrite' },
];

const Main = () => {
  const [pdfFile, setPdfFile] = useState(null as string | null);
  const [pdfName, setPdfName] = useState('' as string | null);
  const [resumeData, setResumeData] = useState<{
    workExperience: any[];
    projects?: any[];
  }>();
  const [rawFile, setRawFile] = useState<File | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const resumeData = await parseResumeData(arrayBuffer);

    setResumeData(resumeData);
    setPdfFile(URL.createObjectURL(file));
    setPdfName(file.name);
    setRawFile(file);
  };

  return (
    <>
      <Head>
        <title>Resume Insights</title>
        <meta
          name="description"
          content="A brief description of your page's content."
        />
      </Head>
      <div className="flex-1 flex relative">
        <section className="ml-0 w-60 bg-blue-500 "></section>
        <section className="xl:max-w-5xl w-full mx-auto lg:max-w-3xl flex gap-x-10 ">
          <div className="flex-3 h-fit py-5">
            <div className="bg-gray-100 w-full h-full rounded-2xl p-5">
              <div className="flex flex-col items-start">
                <label
                  htmlFor="pdfUpload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
                >
                  Upload PDF
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v16c0 1.1.9 2 2 2h12a2 2 0 002-2V8l-6-6H6a2 2 0 00-2 2z"
                    />
                  </svg>
                </label>

                <input
                  id="pdfUpload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
              </div>
              {<p>{pdfName}</p>}
              {pdfFile && <PdfViewer file={pdfFile} />}
            </div>
          </div>

          <div className="flex-2 ">
            <ResumeTabs resumeData={resumeData} rawFile={rawFile} />
          </div>
        </section>
      </div>
    </>
  );
};

function KeywordAnalysis({ resumeData }) {
  console.log(resumeData);
  return (
    <>
      <h1>Work Experience</h1>
      {resumeData?.workExperience?.map((item, index) => (
        <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
          {Object.entries(item).map(([key, value]) => (
            <div key={key} className="mb-1">
              <strong className="capitalize">{key}:</strong> {String(value)}
            </div>
          ))}
        </div>
      ))}
      <h1>Projects</h1>
      {resumeData?.projects?.map((item, index) => (
        <div key={index} className="mb-4 p-4 border-gray-200 border rounded">
          {Object.entries(item).map(([key, value]) => (
            <div key={key} className="mb-1">
              <strong className="capitalize">{key}:</strong> {String(value)}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
type ScoreData = {
  ai_score: number;
  similarity: number;
  average_similarity: number;
  average_skill_similarity: number;
  max_similarity: number;
  max_skill_similarity: number;
  job_chunks_evaluated: number;
  job_skills: string[];
  job_soft_skills: {
    primary: string[];
    secondary: string[];
  };
  resume_skills: string[];
  resume_soft_skills: {
    primary: string[];
    secondary: string[];
  };
  matched_skills: any[]; // Replace with exact type if needed
};
function ResumeScoring({ file }: { file: File }) {
  const [jobDesc, setJobDesc] = useState('');
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDesc);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Server error');
      }

      const data = await res.json();
      setScoreData(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <label className="block mb-2 font-medium">Job Description</label>
      <textarea
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
        rows={5}
        placeholder="Paste the job description here..."
      />

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        disabled={loading || !jobDesc}
      >
        {loading ? 'Analyzing...' : 'Submit'}
      </button>

      {error && <p className="mt-4 text-red-500">Error: {error}</p>}

      {scoreData && (
        <div className="mt-6 space-y-2 text-sm">
          {(() => {
            const values = [
              { label: 'AI Score', value: scoreData.ai_score },
              { label: 'Similarity', value: scoreData.similarity },
              {
                label: 'Average Skill Match',
                value: scoreData.average_skill_similarity,
              },
            ].sort((a, b) => a.value - b.value);

            const min = values[0];
            const mid = values[1];
            const max = values[2];

            return (
              <div className="mt-6 text-sm">
                <h2 className="font-semibold text-lg mb-2">Score Breakdown</h2>
                <div className="relative h-4 bg-purple-100 rounded w-full">
                  {/* shaded range */}
                  <div
                    className="absolute h-full bg-purple-300"
                    style={{
                      left: `${min.value}%`,
                      width: `${max.value - min.value}%`,
                    }}
                  />
                  {/* markers */}
                  {[min, mid, max].map((point, idx) => {
                    const colors = [
                      'bg-[#0000]',
                      'bg-purple-800',
                      'bg-[#0000]',
                    ];
                    return (
                      <div
                        key={point.label}
                        className={`absolute top-0 h-4 w-0.5 ${colors[idx]}`}
                        style={{ left: `${point.value}%` }}
                        title={`${point.label}: ${point.value.toFixed(2)}%`}
                      />
                    );
                  })}
                </div>
                <p className="mt-2 text-center text-gray-700">
                  <strong>Resume Score:</strong> {mid.value.toFixed(2)}%
                </p>
              </div>
            );
          })()}
          <p>
            <strong>Matched Skills:</strong> {scoreData.matched_skills.length}
          </p>

          <div>
            <strong>Resume Skills:</strong>
            <p className="text-gray-700">
              {scoreData.resume_skills.join(', ')}
            </p>
          </div>

          <div>
            <strong>Job Skills:</strong>
            <p className="text-gray-700">{scoreData.job_skills.join(', ')}</p>
          </div>

          <div>
            <strong>Resume Soft Skills:</strong>
            <p className="text-gray-700">
              Primary: {scoreData.resume_soft_skills.primary.join(', ') || '—'}
            </p>
            <p className="text-gray-700">
              Secondary:{' '}
              {scoreData.resume_soft_skills.secondary.join(', ') || '—'}
            </p>
          </div>

          <div>
            <strong>Job Soft Skills:</strong>
            <p className="text-gray-700">
              Primary: {scoreData.job_soft_skills.primary.join(', ') || '—'}
            </p>
            <p className="text-gray-700">
              Secondary: {scoreData.job_soft_skills.secondary.join(', ') || '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumeSuggestions({ file }) {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type StructuredSuggestions = {
    missing_skills?: string[];
    keyword_gaps?: string[];
    experience_alignment?: string[];
    general_advice?: string[];
  };

  const [suggestions, setSuggestions] = useState<StructuredSuggestions | null>(
    null
  );

  const handleGetSuggestions = async () => {
    if (!file || !jobDescription.trim()) return;

    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const resumeText = await readFile(arrayBuffer); // your custom function

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const idToken = await user.getIdToken();
      const res = await fetch('/api/llm/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      let recommendations = data.recommendations;
      try {
        setSuggestions(recommendations as StructuredSuggestions);
      } catch {
        setSuggestions(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded shadow bg-white">
      <label className="block mb-2 font-medium text-gray-700">
        Paste Job Description:
      </label>
      <textarea
        className="w-full h-40 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Enter job description here..."
      />

      <button
        onClick={handleGetSuggestions}
        disabled={loading || !file || !jobDescription.trim()}
        className="mt-3 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Get Suggestions'}
      </button>

      {error && <p className="text-red-500 mt-2">Error: {error}</p>}

      {suggestions && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Suggested Improvements</h3>

          {suggestions.missing_skills?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-semibold text-red-600 mb-1">
                Missing Skills
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-800">
                {suggestions.missing_skills.map((skill, idx) => (
                  <li key={`ms-${idx}`}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.keyword_gaps?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-semibold text-yellow-600 mb-1">
                Keyword Gaps
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-800">
                {suggestions.keyword_gaps.map((keyword, idx) => (
                  <li key={`kg-${idx}`}>{keyword}</li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.experience_alignment?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-semibold text-blue-600 mb-1">
                Experience Alignment
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-800">
                {suggestions.experience_alignment.map((note, idx) => (
                  <li key={`ea-${idx}`}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.general_advice?.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-green-600 mb-1">
                General Advice
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-800">
                {suggestions.general_advice.map((tip, idx) => (
                  <li key={`ga-${idx}`}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type RewrittenResume = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
  education: string;
  skills: string;
  experience: {
    title: string;
    company: string;
    date: string;
    bullets: string[];
  }[];
  projects: { name: string; date: string; bullets: string[] }[];
  customSections?: { name: string; bullets: string[] }[];
};

function ResumeRewriter({ file }: { file: File }) {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState<RewrittenResume | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRewritten = async () => {
    if (!jobDescription.trim()) {
      setError('Job description is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const resumeText = await readFile(arrayBuffer); // your PDF-to-text extractor

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();

      const res = await fetch('/api/llm/rewrite', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const resumeData = data.rewrites;
      const query = compressToEncodedURIComponent(JSON.stringify(resumeData));
      window.open(`/create-resume?custom_resume=${query}`, '_blank');
    } catch (err: any) {
      setError(err.message || 'Failed to rewrite resume');
    } finally {
      setLoading(false);
    }
  };

  const updateBullet = (
    section: 'experience' | 'projects' | 'customSections',
    index: number,
    bulletIndex: number,
    value: string
  ) => {
    if (!resume) return;
    const updated = { ...resume };
    (updated[section] as any)[index].bullets[bulletIndex] = value;
    setResume(updated);
  };

  return (
    <div className="p-4 border rounded shadow bg-white mt-4">
      <label className="block font-medium mb-1">Paste Job Description:</label>
      <textarea
        className="w-full h-32 p-2 border border-gray-300 rounded resize-none mb-3"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste job description here..."
      />

      <button
        onClick={fetchRewritten}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Rewriting...' : 'Rewrite Resume'}
      </button>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      {resume && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Rewritten Resume</h2>

          {['experience', 'projects', 'customSections'].map((section) => {
            const entries = (resume as any)[section];
            if (!entries?.length) return null;

            return (
              <div key={section} className="mb-6">
                <h3 className="text-md font-bold capitalize mb-2">{section}</h3>
                {entries.map((entry: any, idx: number) => (
                  <div
                    key={idx}
                    className="mb-4 pl-4 border-l-2 border-gray-300"
                  >
                    <div className="text-sm text-gray-700 mb-1 font-medium">
                      {entry.title || entry.name} @{' '}
                      {entry.company || entry.date}
                    </div>
                    {entry.bullets.map((bullet: string, i: number) => (
                      <textarea
                        key={i}
                        className="w-full border p-2 rounded text-sm mb-2"
                        value={bullet}
                        onChange={(e) =>
                          updateBullet(section as any, idx, i, e.target.value)
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            );
          })}

          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(resume, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'rewritten-resume.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download as JSON
          </button>

          <div className="mt-6">
            <h3 className="text-md font-bold mb-2">Raw JSON Preview</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded max-h-96 overflow-auto">
              {JSON.stringify(resume, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumeTabs({ resumeData, rawFile }) {
  const [activeTab, setActiveTab] = useState('keyword');

  return (
    <div className="w-full">
      <div className="flex space-x-6 border-b border-gray-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 text-sm font-semibold transition-colors duration-200 border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="">
        {activeTab === 'keyword' && <KeywordAnalysis resumeData={resumeData} />}
        {activeTab === 'score' && rawFile && <ResumeScoring file={rawFile} />}
        {activeTab === 'suggestions' && <ResumeSuggestions file={rawFile} />}
        {activeTab === 'rewrite' && <ResumeRewriter file={rawFile} />}
      </div>
    </div>
  );
}

export default Main;
