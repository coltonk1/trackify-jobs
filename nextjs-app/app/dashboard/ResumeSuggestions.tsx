import { readFile } from '@/lib/parsing/main';
import { getAuth } from 'firebase/auth';
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from 'react';

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

const ResumeSuggestions: ForwardRefRenderFunction<
  ResumeSuggestionsHandle,
  Props
> = ({ file, jobDescription }, ref) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<StructuredSuggestions | null>(
    null
  );

  const handleGetSuggestions = async () => {
    if (!file || !jobDescription?.trim()) return;

    setLoading(true);
    setError(null);
    setSuggestions(null);

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

  if (!suggestions) return;
  if (
    !suggestions.missing_skills ||
    !suggestions.keyword_gaps ||
    !suggestions.experience_alignment ||
    !suggestions.general_advice
  )
    return;

  return (
    <div className="mt-4 p-4 border rounded shadow bg-white">
      {error && <p className="text-red-500 mt-2">Error: {error}</p>}

      {suggestions && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Suggested Improvements</h3>

          {suggestions.missing_skills.length > 0 && (
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

          {suggestions.keyword_gaps.length > 0 && (
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

          {suggestions.experience_alignment.length > 0 && (
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
};

export default forwardRef(ResumeSuggestions);
