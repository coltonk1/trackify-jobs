'use client';
import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { CircleArrowRight, Plus } from 'lucide-react';
import clsx from 'clsx';
import { pdfjs } from 'react-pdf';
import PdfViewer from './PdfViewer';
import SmartButton from './SmartButton';
import ResumeSummary from './ResumeSummary';
import ResumeSuggestions, {
  ResumeSuggestionsHandle,
} from './ResumeSuggestions';
import ResumeScoring, { ResumeScoringHandle } from './ResumeScoring';
import ResumeRewriter from './ResumeRewriter';
import CoverLetterWriter from './CoverLetterWriter';
import { parseResumeData } from '@/lib/parsing/main';

// Move this to a one-time module in real code, but leaving here for parity.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

type ResumeState = {
  file: File | null;
  name: string;
  url: string; // object URL for PdfViewer
  data?: {
    workExperience: any[];
    projects?: any[];
  };
  parseWarning?: string | null;
};

enum Step {
  Select = 0,
  Analyze = 1,
}

export default function Main() {
  const [step, setStep] = useState<Step>(Step.Select);
  const [resume, setResume] = useState<ResumeState>({
    file: null,
    name: '',
    url: '',
    data: undefined,
    parseWarning: null,
  });
  const [jobDescription, setJobDescription] = useState('');

  const resumeSuggestionsRef = useRef<ResumeSuggestionsHandle>(null);
  const resumeScoringRef = useRef<ResumeScoringHandle>(null);

  const canAnalyze = useMemo(
    () => Boolean(jobDescription && resume.file),
    [jobDescription, resume.file]
  );

  const handleUploadResume = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Revoke old URL if any
      if (resume.url) URL.revokeObjectURL(resume.url);

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      const parsed = await parseResumeData(pdfDoc);
      const warning =
        pdfDoc.numPages > 1
          ? 'Note: This PDF has multiple pages, but parsing currently only processes the first page.'
          : null;

      setResume({
        file,
        name: file.name,
        url: URL.createObjectURL(file),
        data: parsed,
        parseWarning: warning,
      });

      // Keep user on Select step until they click Analyze
      setStep(Step.Select);
    },
    [resume.url]
  );

  const analyzeAll = useCallback(() => {
    resumeSuggestionsRef.current?.triggerSuggestions();
    resumeScoringRef.current?.triggerScoring();
  }, []);

  return (
    <section
      className={clsx(
        'flex justify-center py-20 gap-15 mx-auto',
        step === Step.Select ? 'w-fit px-6' : 'w-full px-20'
      )}
    >
      <div className="flex gap-20">
        {step === Step.Select ? (
          <div className="sticky top-30 flex flex-col items-center">
            <SelectResume
              handleUploadResume={handleUploadResume}
              resumeName={resume.name}
            />
            {resume.name && (
              <SmartButton
                label={`Analyze ${resume.name}`}
                onClick={() => setStep(Step.Analyze)}
                isProUser
                color="purple"
                icon={<CircleArrowRight strokeWidth={1.5} size={18} />}
                className="mt-4"
              />
            )}
          </div>
        ) : (
          <>
            <div className="w-full max-w-2xl">
              {resume.url && <PdfViewer file={resume.url} />}
            </div>

            <div>
              {resume.parseWarning && (
                <Banner tone="warn" className="mb-4">
                  {resume.parseWarning}
                </Banner>
              )}

              {resume.data && <ResumeSummary resumeData={resume.data} />}

              <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Job Description
                </h1>
                <p className="text-sm text-gray-700 mt-1 mb-2">
                  Paste the job posting or role description here. This will be
                  used to match your resume's skills, keywords, and experience
                  for targeted analysis.
                </p>

                {!jobDescription && (
                  <Banner tone="warn">
                    To see full analysis, paste a job description below.
                  </Banner>
                )}

                <textarea
                  className="w-full h-40 border border-gray-300 rounded p-2 text-sm outline-none"
                  placeholder="Paste job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />

                {canAnalyze && (
                  <SmartButton
                    onClick={analyzeAll}
                    label="Analyze"
                    color="purple"
                    className="w-full flex justify-center mt-4"
                  />
                )}
              </div>

              {canAnalyze && (
                <>
                  {resume.file && (
                    <>
                      <ResumeRewriter
                        file={resume.file}
                        jobDescription={jobDescription}
                      />
                      <CoverLetterWriter
                        file={resume.file}
                        jobDescription={jobDescription}
                      />
                      <ResumeScoring
                        file={resume.file}
                        jobDescription={jobDescription}
                        ref={resumeScoringRef}
                      />
                      <ResumeSuggestions
                        file={resume.file}
                        jobDescription={jobDescription}
                        ref={resumeSuggestionsRef}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function SelectResume({
  handleUploadResume,
  resumeName,
}: {
  handleUploadResume: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  resumeName: string;
}) {
  return (
    <main className="flex flex-col items-center h-fit w-full px-8">
      <div className="relative w-48 h-48 hover:opacity-80 transition-opacity rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer">
        <Plus className="w-12 h-12 text-gray-500" strokeWidth={1.5} />
        <input
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          type="file"
          accept=".pdf"
          onChange={handleUploadResume}
        />
      </div>

      <p className="mt-4 text-sm text-gray-600">
        {resumeName ? 'Upload different resume' : 'Upload resume'}
      </p>

      <Banner className="mt-4 ">
        Files are securely sent to our server for processing and are not stored
        after analysis.
      </Banner>

      <SmartButton
        label="Select From Saved"
        color="zinc"
        requiresPro
        isProUser={false}
        className="mt-4"
      />
    </main>
  );
}

function Banner({
  children,
  tone = 'info',
  className,
}: {
  children: React.ReactNode;
  tone?: 'info' | 'warn';
  className?: string;
}) {
  const styles =
    tone === 'warn'
      ? 'bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800'
      : 'bg-gray-50 border border-gray-200 text-gray-600';
  return (
    <div className={clsx('rounded p-3 text-sm', styles, className)}>
      {children}
    </div>
  );
}
