import { readFile } from '@/lib/parsing/main';
import { getAuth } from 'firebase/auth';
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from 'react';

/* Shared UI bits for consistency */
const Placeholder = ({
  children = '[None]',
}: {
  children?: React.ReactNode;
}) => <span className="italic text-gray-400">{children}</span>;

const Section = ({
  title,
  children,
  description,
  id,
  imageSrc,
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
  id?: string;
  imageSrc?: string;
}) => (
  <section className="mb-6" aria-labelledby={id}>
    <div className="flex gap-2 items-center">
      <h2 id={id} className="text-lg font-semibold text-gray-800 mb-1">
        {title}
      </h2>
      {imageSrc && (
        <img
          src={imageSrc}
          alt="Uploaded resume preview"
          className="rounded aspect-square h-5"
        />
      )}
    </div>
    {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
    {children}
  </section>
);

const Panel = ({
  title,
  tone = 'default',
  children,
}: {
  title: string;
  tone?: 'default' | 'red' | 'yellow' | 'blue' | 'green';
  children: React.ReactNode;
}) => {
  const toneClasses: Record<string, string> = {
    default: 'border-gray-200',
    red: 'border-red-200',
    yellow: 'border-yellow-200',
    blue: 'border-blue-200',
    green: 'border-green-200',
  };
  const headingTone: Record<string, string> = {
    default: 'text-gray-800',
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    blue: 'text-blue-700',
    green: 'text-green-700',
  };
  return (
    <div className={`rounded border ${toneClasses[tone]} bg-white shadow-sm`}>
      <div className="px-3 py-2 border-b border-gray-100">
        <h3 className={`text-sm font-semibold ${headingTone[tone]}`}>
          {title}
        </h3>
      </div>
      <div className="px-3 py-3">{children}</div>
    </div>
  );
};

const BulletList = ({ items }: { items?: string[] }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <Placeholder>[No items]</Placeholder>;
  }
  return (
    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
};

/* Types */
type StructuredSuggestions = {
  missing_skills?: string[];
  keyword_gaps?: string[];
  experience_alignment?: string[];
  general_advice?: string[];
};

export type ResumeSuggestionsHandle = {
  triggerSuggestions: () => void;
};

type Props = {
  file: File;
  jobDescription: string;
};

/* Component */
const ResumeSuggestions: ForwardRefRenderFunction<
  ResumeSuggestionsHandle,
  Props
> = ({ file, jobDescription }, ref) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<StructuredSuggestions | null>(
    null
  );
  const [hasRun, setHasRun] = useState(false);

  const handleGetSuggestions = async () => {
    if (!file || !jobDescription?.trim()) return;

    setLoading(true);
    setError(null);
    setSuggestions(null);
    setHasRun(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const resumeText = await readFile(arrayBuffer);

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
      setSuggestions(data.recommendations as StructuredSuggestions);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    triggerSuggestions: handleGetSuggestions,
  }));

  return (
    <Section
      title="Suggested Improvements"
      imageSrc="https://media.nngroup.com/media/editor/2024/09/16/lyft_promotions_sparkles_icon.png"
      id="suggested-improvements"
      description="These AI-powered recommendations compare your resume to the job description. They identify missing skills, close keyword gaps, align your experience bullets, and suggest general improvements before you submit."
    >
      {/* Status line */}
      {loading && (
        <div className="mb-3 text-sm text-gray-600">
          Analyzing. This may take a moment.
        </div>
      )}
      {error && <div className="mb-3 text-sm text-red-600">Error. {error}</div>}
      {!loading && !error && !hasRun && (
        <div className="mb-3 text-sm text-gray-600">
          Click Analyze to generate suggestions.
        </div>
      )}

      {/* Panels */}
      <div className="grid grid-cols-1 gap-4">
        <Panel title="Missing Skills" tone="red">
          {suggestions?.missing_skills &&
          suggestions.missing_skills.length > 0 ? (
            <BulletList items={suggestions.missing_skills} />
          ) : suggestions ? (
            <Placeholder>[No missing skills detected]</Placeholder>
          ) : (
            <Placeholder>[No data yet]</Placeholder>
          )}
        </Panel>

        <Panel title="Keyword Gaps" tone="yellow">
          {suggestions?.keyword_gaps && suggestions.keyword_gaps.length > 0 ? (
            <BulletList items={suggestions.keyword_gaps} />
          ) : suggestions ? (
            <Placeholder>[No keyword gaps detected]</Placeholder>
          ) : (
            <Placeholder>[No data yet]</Placeholder>
          )}
        </Panel>

        <Panel title="Experience Alignment" tone="blue">
          {suggestions?.experience_alignment &&
          suggestions.experience_alignment.length > 0 ? (
            <BulletList items={suggestions.experience_alignment} />
          ) : suggestions ? (
            <Placeholder>[No experience alignment issues]</Placeholder>
          ) : (
            <Placeholder>[No data yet]</Placeholder>
          )}
        </Panel>

        <Panel title="General Advice" tone="green">
          {suggestions?.general_advice &&
          suggestions.general_advice.length > 0 ? (
            <BulletList items={suggestions.general_advice} />
          ) : suggestions ? (
            <Placeholder>[No general advice at this time]</Placeholder>
          ) : (
            <Placeholder>[No data yet]</Placeholder>
          )}
        </Panel>
      </div>
    </Section>
  );
};

export default forwardRef(ResumeSuggestions);
