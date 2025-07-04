'use client';

import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import {
  Document as DisplayDocument,
  Page as DisplayPage,
  pdfjs,
} from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { parseResumeData, readFile } from '@/lib/parsing/main';
import { getAuth } from 'firebase/auth';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  BlobProvider,
} from '@react-pdf/renderer';

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
      <DisplayDocument
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        className="rounded-lg overflow-hidden"
      >
        {Array.from(new Array(numPages), (_, index) => (
          <DisplayPage
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            className="mb-4"
          />
        ))}
      </DisplayDocument>
    </div>
  );
}

const tabs = [
  { id: 'keyword', label: 'Keyword Parser' },
  { id: 'score', label: 'Resume Score' },
  { id: 'suggestions', label: 'Suggestions' },
  { id: 'rewrite', label: 'Rewrite' },
  { id: 'cover-letter', label: 'Cover Letter' },
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        Work Experience
      </h1>

      {resumeData?.workExperience?.map((item, index) => (
        <div key={index} className="mb-6 p-6 border border-gray-200 bg-white">
          <div className="flex gap-5 flex-col md:flex-row md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                {item['job_title']}
              </h2>
              <p className="text-sm text-gray-600">{item['company']}</p>
            </div>
            <p className="text-sm text-gray-500 mt-2 md:mt-0 flex-1 min-w-25">
              {item['date']}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="font-medium text-gray-700 mb-1">
              Key Contributions:
            </h3>
            <ul className="list-none list-disc list-inside space-y-1 text-gray-700 text-sm">
              {item['description'].map((desc, idx) => (
                <li key={idx}>{desc}</li>
              ))}
            </ul>
          </div>
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

            const score = mid.value; // Assume 0 to 1 scale, e.g. 0.774

            // Linear interpolation from green (120) → yellow (60) → red (0)
            let hue;
            hue = 3 * score - 120;
            if (hue > 120) hue = 120;
            if (hue < 0) hue = 0;

            hue = Math.round(hue);
            const color = `hsl(${hue}, 80%, 40%)`;

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
                <p className="mt-4 text-center text-sm">
                  <span className="font-semibold text-gray-700">
                    Resume Score:
                  </span>{' '}
                  <span className="font-bold" style={{ color }}>
                    {score.toFixed(2)}%
                  </span>
                </p>
                <table className="table-auto border-collapse border border-gray-300 text-sm w-full mt-4 text-gray-700">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Score Range
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Label
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        85–100
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        🟢 Exceptional
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        75–84.9
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        🟢 Excellent
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        65–74.9
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        🟡 Moderate-Good
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        55–64.9
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        🟠 Weak
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        &lt; 55
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        🔴 Poor
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })()}
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Matched Skills</h3>
            <p className="text-sm text-gray-700">
              {scoreData.matched_skills.length}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Matched Skills</h3>
            <div className="space-y-2 bg-gray-50 rounded-md p-3">
              {scoreData.matched_skills &&
              scoreData.matched_skills.length > 0 ? (
                [...scoreData.matched_skills]
                  .sort((a, b) => b.similarity - a.similarity) // Sort descending
                  .map(({ job_skill, closest_resume_skill, similarity }, i) => {
                    // Map similarity [0, 100] → hue [0 (red) to 210 (blue)]
                    const hue = Math.round((similarity / 100) * 210); // 0 = red, 210 = blue
                    const color = `hsl(${hue}, 80%, 40%)`; // vivid color
                    return (
                      <div
                        key={`matched-${i}`}
                        className="flex justify-between items-center border border-gray-200 rounded px-3 py-2 shadow-sm bg-white"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            <span className="text-gray-500">Job Skill:</span>{' '}
                            {job_skill}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="text-gray-500">Matched with:</span>{' '}
                            {closest_resume_skill}
                          </p>
                        </div>
                        <div
                          className="text-sm font-semibold text-right"
                          style={{ color }}
                        >
                          {similarity.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-sm text-gray-500">—</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Resume Skills</h3>
            <div className="flex flex-wrap gap-2 bg-gray-50 rounded-md p-3">
              {scoreData.resume_skills.length > 0 ? (
                scoreData.resume_skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Job Description Skills
            </h3>
            <div className="flex flex-wrap gap-2 bg-gray-50 rounded-md p-3">
              {scoreData.job_skills.length > 0 ? (
                scoreData.job_skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Resume Soft Skills
            </h3>
            <div className="space-y-2 bg-gray-50 rounded-md p-3">
              <div className="text-sm font-medium text-gray-600">Primary</div>
              <div className="flex flex-wrap gap-2">
                {scoreData.resume_soft_skills.primary.length > 0 ? (
                  scoreData.resume_soft_skills.primary.map(({ item }, i) => (
                    <span
                      key={`res-soft-primary-${i}`}
                      className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-600">Secondary</div>
              <div className="flex flex-wrap gap-2">
                {scoreData.resume_soft_skills.secondary.length > 0 ? (
                  scoreData.resume_soft_skills.secondary.map(({ item }, i) => (
                    <span
                      key={`res-soft-secondary-${i}`}
                      className="bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Job Soft Skills
            </h3>
            <div className="space-y-2 bg-gray-50 rounded-md p-3">
              <div className="text-sm font-medium text-gray-600">Primary</div>
              <div className="flex flex-wrap gap-2">
                {scoreData.job_soft_skills.primary.length > 0 ? (
                  scoreData.job_soft_skills.primary.map(({ item }, i) => (
                    <span
                      key={`job-soft-primary-${i}`}
                      className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-600">Secondary</div>
              <div className="flex flex-wrap gap-2">
                {scoreData.job_soft_skills.secondary.length > 0 ? (
                  scoreData.job_soft_skills.secondary.map(({ item }, i) => (
                    <span
                      key={`job-soft-secondary-${i}`}
                      className="bg-yellow-50 text-yellow-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </div>
            </div>
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
      const resumeText = await readFile(arrayBuffer);

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();

      const formData = new FormData();
      formData.append('resume_file', file); // this is the raw File object
      formData.append('resume_text', resumeText); // extracted text
      formData.append('job_description', jobDescription); // string

      const res = await fetch('/api/llm/rewrite', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      console.log(data);
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

function CoverLetterWriter({ file }: { file: File }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      setError('Job description required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();

      const arrayBuffer = await file.arrayBuffer();
      const resumeText = await readFile(arrayBuffer);

      const res = await fetch('/api/llm/cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      console.log(data);
      setCoverLetter(data.cover_letter.cover_letter || '');
    } catch (err: any) {
      setError(err.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const pdfStyles = StyleSheet.create({
    body: {
      padding: 40,
      fontSize: 12,
      fontFamily: 'Times-Roman',
      lineHeight: 1.6,
    },
    section: {
      marginBottom: 10,
    },
    text: {
      marginBottom: 6,
    },
  });

  const CoverLetterPDF = () => (
    <Document>
      <Page size="A4" style={pdfStyles.body}>
        <View style={pdfStyles.section}>
          {coverLetter.split('\n').map((line, i) => (
            <Text key={i} style={pdfStyles.text}>
              {line}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );

  const [jobDescription, setJobDescription] = useState('');

  return (
    <div className="p-4 border rounded shadow bg-white mt-4">
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
        onClick={generateCoverLetter}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Cover Letter'}
      </button>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      {coverLetter && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Generated Cover Letter</h2>
          <textarea
            className="w-full h-64 p-3 border border-gray-300 rounded text-sm font-mono"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />

          <div className="mt-4">
            <BlobProvider document={<CoverLetterPDF />}>
              {({ url, loading: pdfLoading }) =>
                pdfLoading ? (
                  <p>Preparing PDF...</p>
                ) : (
                  <a
                    href={url as string}
                    download="cover-letter.pdf"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Download as PDF
                  </a>
                )
              }
            </BlobProvider>
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
        {activeTab === 'cover-letter' && <CoverLetterWriter file={rawFile} />}
      </div>
    </div>
  );
}

export default Main;
