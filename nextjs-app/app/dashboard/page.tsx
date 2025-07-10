'use client';
import { ChangeEvent, useRef, useState } from 'react';
import { CircleArrowRight, Plus } from 'lucide-react';
import { parseResumeData } from '@/lib/parsing/main';
import PdfViewer from './PdfViewer';
import SmartButton from './SmartButton';
import clsx from 'clsx';
import ResumeSummary from './ResumeSummary';
import { pdfjs } from 'react-pdf';
import ResumeSuggestions, {
  ResumeSuggestionsHandle,
} from './ResumeSuggestions';
import ResumeScoring, { ResumeScoringHandle } from './ResumeScoring';
import ResumeRewriter from './ResumeRewriter';
import CoverLetterWriter from './CoverLetterWriter';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

export default function Main() {
  const [currentState, setCurrentState] = useState(0);
  const [resumeRawFile, setResumeRawFile] = useState<null | File>(null);
  const [resumeData, setResumeData] = useState<{
    workExperience: any[];
    projects?: any[];
  }>();
  const [resumeName, setResumeName] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [parseWarning, setParseWarning] = useState<null | string>(null);

  const handleUploadResume = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();

    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;

    const resumeData = await parseResumeData(pdfDoc);
    const pageCount = pdfDoc.numPages;

    if (pageCount > 1) {
      setParseWarning(
        'Note: This PDF has multiple pages, but parsing currently only processes the first page.'
      );
    } else {
      setParseWarning(null); // or clear it
    }

    setResumeData(resumeData);
    setResumeName(file.name);
    setResumeRawFile(file);
    setFileLink(URL.createObjectURL(file));
  };

  const resumeSuggestionsRef = useRef<ResumeSuggestionsHandle>(null);
  const resumeScoringRef = useRef<ResumeScoringHandle>(null);

  const analyzeAll = () => {
    resumeSuggestionsRef.current?.triggerSuggestions();
    resumeScoringRef.current?.triggerScoring();
  };

  return (
    <>
      <section
        className={clsx(
          'flex justify-center py-20 gap-15',
          currentState == 0 ? 'w-fit px-6' : 'w-full px-20',
          'mx-auto'
        )}
      >
        {resumeRawFile && (
          <div className="w-full max-w-xl">
            <PdfViewer file={fileLink} />
          </div>
        )}
        <div className="justify-center  w-fit">
          {currentState === 0 && (
            <>
              <div className="sticky top-30 flex flex-col items-center">
                <SelectResume
                  handleUploadResume={handleUploadResume}
                  resumeName={resumeName}
                />
                {resumeName && (
                  <SmartButton
                    label={`Analyze ${resumeName}`}
                    onClick={() => setCurrentState(1)}
                    isProUser={true}
                    color="purple"
                    icon={<CircleArrowRight strokeWidth={1.5} size={18} />}
                    className="mt-4"
                  />
                )}
              </div>
            </>
          )}

          {currentState === 1 && (
            <>
              <div className="flex flex-col gap-10 w-full max-w-3xl">
                {parseWarning && (
                  <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded">
                    {parseWarning}
                  </div>
                )}

                {resumeData && <ResumeSummary resumeData={resumeData} />}

                {!jobDescription && (
                  <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded">
                    To see full analysis, paste a job description below:
                  </div>
                )}

                <textarea
                  className="w-full h-40 border border-gray-300 rounded p-2 text-sm"
                  placeholder="Paste job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />

                {jobDescription && resumeRawFile && (
                  <>
                    <SmartButton
                      onClick={analyzeAll}
                      label={'Trigger'}
                      color="purple"
                      className="w-full flex justify-center"
                    />

                    <ResumeSuggestions
                      file={resumeRawFile}
                      jobDescription={jobDescription}
                      ref={resumeSuggestionsRef}
                    />
                    <ResumeScoring
                      file={resumeRawFile}
                      jobDescription={jobDescription}
                      ref={resumeScoringRef}
                    />
                    <ResumeRewriter
                      file={resumeRawFile}
                      jobDescription={jobDescription}
                    />
                    <CoverLetterWriter
                      file={resumeRawFile}
                      jobDescription={jobDescription}
                    />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

type SelectResumeProps = {
  handleUploadResume: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  resumeName: string;
};

function SelectResume({ handleUploadResume, resumeName }: SelectResumeProps) {
  return (
    <>
      <main className="flex flex-col items-center h-fit w-full px-8 ">
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
        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 max-w-md text-center">
          Files are securely sent to our server for processing and are not
          stored after analysis.
        </div>

        <SmartButton
          label={'Select From Saved'}
          color="zinc"
          requiresPro
          isProUser={false}
          className="mt-4"
        />
      </main>
    </>
  );
}
