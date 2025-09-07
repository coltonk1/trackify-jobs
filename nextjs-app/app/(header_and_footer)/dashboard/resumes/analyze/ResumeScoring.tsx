import { getAuth } from 'firebase/auth';
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from 'react';

/* ---------- Shared UI bits for consistency ---------- */
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
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
  id?: string;
}) => (
  <section className="mb-6" aria-labelledby={id}>
    <h2 id={id} className="text-lg font-semibold text-gray-800 mb-1">
      {title}
    </h2>
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
  tone?: 'default' | 'red' | 'yellow' | 'blue' | 'green' | 'purple';
  children: React.ReactNode;
}) => {
  const border: Record<string, string> = {
    default: 'border-gray-200',
    red: 'border-red-200',
    yellow: 'border-yellow-200',
    blue: 'border-blue-200',
    green: 'border-green-200',
    purple: 'border-purple-200',
  };
  const heading: Record<string, string> = {
    default: 'text-gray-800',
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    blue: 'text-blue-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
  };
  return (
    <div className={`rounded border ${border[tone]} bg-white shadow-sm`}>
      <div className="px-3 py-2 border-b border-gray-100">
        <h3 className={`text-sm font-semibold ${heading[tone]}`}>{title}</h3>
      </div>
      <div className="px-3 py-3">{children}</div>
    </div>
  );
};

const BulletList = ({ items }: { items?: string[] }) => {
  if (!Array.isArray(items) || items.length === 0)
    return <Placeholder>[No items]</Placeholder>;
  return (
    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
};

const ChipList = ({
  items,
  tone = 'gray',
}: {
  items?: string[];
  tone?: 'gray' | 'blue' | 'green' | 'purple' | 'yellow';
}) => {
  if (!Array.isArray(items) || items.length === 0)
    return <Placeholder>[None]</Placeholder>;

  const bg: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((s, i) => (
        <span
          key={i}
          className={`${bg[tone]} text-xs font-medium px-1.5 py-0.5 rounded-full`}
        >
          {s}
        </span>
      ))}
    </div>
  );
};

/* ---------- Types ---------- */
export type ResumeScoringHandle = { triggerScoring: () => void };

type SkillScore = { item: string; score: number };
type SoftSkillGroup = { primary: SkillScore[]; secondary: SkillScore[] };

type ScoreData = {
  ai_score: number; // 0–1 or 0–100
  similarity: number; // 0–1 or 0–100
  average_similarity: number; // 0–1 or 0–100
  average_skill_similarity: number; // 0–1 or 0–100
  max_similarity: number; // 0–1 or 0–100
  max_skill_similarity: number; // 0–1 or 0–100
  job_chunks_evaluated: number;
  job_skills: string[];
  job_soft_skills: SoftSkillGroup;
  resume_skills: string[];
  resume_soft_skills: SoftSkillGroup;
  matched_skills: Array<{
    job_skill: string;
    closest_resume_skill: string;
    similarity: number; // 0–1 or 0–100
  }>;
};

type Props = {
  file: File;
  jobDescription: string;
};

/* ---------- Helpers ---------- */
const pct = (v: number) => {
  // Accept 0–1 or 0–100 and return 0–100
  if (v == null || Number.isNaN(v)) return 0;
  return v <= 1 ? v * 100 : v;
};

const clamp = (v: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, v));

/* ---------- Component ---------- */
const ResumeScoring: ForwardRefRenderFunction<ResumeScoringHandle, Props> = (
  { file, jobDescription },
  ref
) => {
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const handleSubmit = async () => {
    if (!jobDescription) return;

    setLoading(true);
    setError(null);
    setHasRun(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_description', jobDescription);

      const idToken = await user.getIdToken();
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${idToken}` },
        signal: AbortSignal.timeout(60 * 1000),
      });

      if (!res.ok) throw new Error((await res.text()) || 'Server error');

      const data = await res.json();
      console.log(data);
      setScoreData(data as ScoreData);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setScoreData(null);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ triggerScoring: handleSubmit }));

  function countSkills(skills) {
    return Object.values(
      skills.reduce((acc, s) => {
        const name = typeof s === 'string' ? s : s.name;
        if (!acc[name]) {
          acc[name] = { name, count: 0 };
        }
        acc[name].count += 1;
        return acc;
      }, {})
    ).sort((a, b) => {
      if (b.count === a.count) {
        return a.name.localeCompare(b.name); // alphabetical if counts are equal
      }
      return b.count - a.count; // higher count first
    });
  }

  const scores = [
    scoreData?.average_hard_skill_similarity ?? 0,
    scoreData?.max_similarity ?? 0,
    scoreData?.ai_score ?? 0,
  ];

  const score = scores.sort((a, b) => a - b)[1];

  // Color from red to green based on score

  function getColorOfScore(score) {
    const hue = clamp((score / 100) * 120); // 0 red to 120 green
    const scoreColor = `hsl(${Math.round(hue)}, 80%, 40%)`;
    return scoreColor;
  }

  return (
    <Section
      title="Match Score"
      id="match-score"
      description="This analysis compares your resume to the job description. It estimates overall similarity, highlights matched skills, and shows gaps that can improve your odds. Use it to prioritize edits before applying."
    >
      {loading && (
        <div className="mb-3 text-sm text-gray-600">
          Analyzing. This may take a moment.
        </div>
      )}
      {error && <div className="mb-3 text-sm text-red-600">Error. {error}</div>}
      {!loading && !error && !hasRun && (
        <div className="mb-3 text-sm text-gray-600">
          Click Analyze to generate your match score and recommendations.
        </div>
      )}

      {scoreData && (
        <div className="grid grid-cols-1 gap-4">
          {/* Score panel */}
          <Panel title="Score Overview" tone="default">
            <div className="space-y-3">
              {/* Bar */}
              <div className="relative h-3 bg-gray-100 rounded">
                <div
                  className="absolute left-0 top-0 h-3 rounded"
                  style={{
                    width: `${clamp(score)}%`,
                    backgroundColor: getColorOfScore(score),
                  }}
                />
                {[
                  scoreData?.average_hard_skill_similarity,
                  scoreData?.max_similarity,
                  scoreData?.ai_score,
                ]
                  .filter((value) => clamp(value ?? 0) !== clamp(score))
                  .map((s) => clamp(s ?? 0))
                  .map((value, idx) => (
                    <div
                      key={idx}
                      className="absolute top-0 h-3 w-0.5 bg-black/50"
                      style={{ left: `${value}%` }}
                      // title={`${
                      //   ['Avg Hard Skill Match', 'Similarity', 'AI Score'][idx]
                      // }: ${value.toFixed(1)}%`}
                    />
                  ))}
              </div>

              <p className="text-xs text-gray-500">
                Two dark markers show the range of uncertainty between different
                scoring methods.
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Overall Match</span>{' '}
                  <span
                    className="font-semibold"
                    style={{ color: getColorOfScore(score) }}
                  >
                    {clamp(score).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-700">
                <div className="rounded border border-gray-200 px-2 py-1">
                  85–100 Exceptional
                </div>
                <div className="rounded border border-gray-200 px-2 py-1">
                  75–84.9 Excellent
                </div>
                <div className="rounded border border-gray-200 px-2 py-1">
                  65–74.9 Moderate to Good
                </div>
                <div className="rounded border border-gray-200 px-2 py-1">
                  55–64.9 Weak
                </div>
                <div className="rounded border border-gray-200 px-2 py-1">
                  &lt; 55 Poor
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Matched Skills" tone="default">
            {scoreData.matched_hard_skills &&
            scoreData.matched_hard_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {[...scoreData.matched_hard_skills]
                  .sort((a, b) => pct(b.similarity) - pct(a.similarity))
                  .map(({ job_skill, closest_resume_skill, similarity }, i) => {
                    const s = clamp(pct(similarity));
                    const color = `${getColorOfScore(s)}`;
                    return (
                      <span
                        key={`matched-${i}`}
                        className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-0.5 text-xs"
                      >
                        <span className="text-gray-700 font-medium">
                          {job_skill.name}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className="text-gray-600">
                          {closest_resume_skill.name}
                        </span>
                        <span className="font-semibold" style={{ color }}>
                          {s.toFixed(1)}%
                        </span>
                      </span>
                    );
                  })}
              </div>
            ) : (
              <Placeholder>[No matched skills]</Placeholder>
            )}
          </Panel>

          <Panel title="Resume Skills" tone="purple">
            <ChipList
              items={countSkills(scoreData.resume_hard_skills).map(
                (s) => `${s.name} (${s.count})`
              )}
              tone="purple"
            />
          </Panel>

          <Panel title="Job Description Skills" tone="purple">
            <ChipList
              items={countSkills(scoreData.job_hard_skills).map(
                (s) => `${s.name} (${s.count})`
              )}
              tone="purple"
            />
          </Panel>

          <Panel title="Job Soft Skills" tone="blue">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Primary</div>
              <ChipList
                items={countSkills(scoreData.job_soft_skills).map(
                  (s) => `${s.name} (${s.count})`
                )}
                tone="blue"
              />
            </div>
          </Panel>

          <Panel title="Job Soft Skills" tone="blue">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Primary</div>
              <ChipList
                items={countSkills(scoreData.job_soft_skills).map(
                  (s) => `${s.name} (${s.count})`
                )}
                tone="blue"
              />
            </div>
          </Panel>
        </div>
      )}
    </Section>
  );
};

export default forwardRef(ResumeScoring);
