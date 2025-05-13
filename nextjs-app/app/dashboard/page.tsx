'use client';

import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { parseResumeData, readFile } from '@/lib/parsing/main';
import { getAuth } from 'firebase/auth';

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

function ResumeScoring({ file }: { file: File }) {
  const [jobDesc, setJobDesc] = useState('');
  const [score, setScore] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const formData = new FormData();

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

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
      console.log(data);
      setScore(data.similarity ?? 'No score returned');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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

      {score && <p className="mt-4 font-semibold">Score: {score}</p>}
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}
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
      const res = await fetch('/api/suggestions', {
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
      let raw = data.suggestions;
      if (typeof raw === 'string') {
        // Remove ```json or ``` and surrounding backticks
        raw = raw
          .trim()
          .replace(/^```(?:json)?/, '') // remove starting ``` or ```json
          .replace(/```$/, '') // remove ending ```
          .trim();
      }
      try {
        const parsed = JSON.parse(raw);
        setSuggestions(parsed as StructuredSuggestions);
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
      </div>
    </div>
  );
}

export default Main;
