import { getAuth } from 'firebase/auth';
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from 'react';

export type ResumeScoringHandle = {
  triggerScoring: () => void;
};

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
    primary: { item: string; score: number }[];
    secondary: { item: string; score: number }[];
  };
  resume_skills: string[];
  resume_soft_skills: {
    primary: { item: string; score: number }[];
    secondary: { item: string; score: number }[];
  };
  matched_skills: any[];
};

type Props = {
  file: File;
  jobDescription: string;
};

const ResumeScoring: ForwardRefRenderFunction<ResumeScoringHandle, Props> = (
  { file, jobDescription },
  ref
) => {
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!jobDescription) return;

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
    formData.append('job_description', jobDescription);

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

  useImperativeHandle(ref, () => ({
    triggerScoring: handleSubmit,
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <label className="block mb-2 font-medium">Job Description</label>

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
};

export default forwardRef(ResumeScoring);
