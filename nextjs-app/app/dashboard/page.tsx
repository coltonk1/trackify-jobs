'use client';

import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { parseResumeData } from '@/lib/parsing/main';

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

  const handleFileChange = async (event: any) => {
    const arrayBuffer = await event.target.files[0].arrayBuffer();
    const resumeData = await parseResumeData(arrayBuffer);
    setResumeData(resumeData);
    setPdfFile(URL.createObjectURL(event.target.files[0]));
    setPdfName(event.target.files[0].name);
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
            <ResumeTabs />

            <h1>Work Experience</h1>
            {resumeData?.workExperience?.map((item, index) => (
              <div
                key={index}
                className="mb-4 p-4 border border-gray-200 rounded"
              >
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <strong className="capitalize">{key}:</strong>{' '}
                    {String(value)}
                  </div>
                ))}
              </div>
            ))}
            <h1>Projects</h1>
            {resumeData?.projects?.map((item, index) => (
              <div
                key={index}
                className="mb-4 p-4 border-gray-200 border rounded"
              >
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <strong className="capitalize">{key}:</strong>{' '}
                    {String(value)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

function ResumeTabs() {
  const [activeTab, setActiveTab] = useState('keyword');

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 -mb-px font-medium transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-blue-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'keyword' && <div>keyword</div>}
        {activeTab === 'score' && <div>score</div>}
        {activeTab === 'suggestions' && <div>suggestions</div>}
      </div>
    </div>
  );
}

export default Main;
