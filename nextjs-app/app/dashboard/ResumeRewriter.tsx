import { readFile } from '@/lib/parsing/main';
import { getAuth } from 'firebase/auth';
import { compressToEncodedURIComponent } from 'lz-string';
import { useState } from 'react';

export default function ResumeRewriter({
  file,
  jobDescription,
}: {
  file: File;
  jobDescription: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRewritten = async () => {
    if (!jobDescription) {
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

  //   const updateBullet = (
  //     section: 'experience' | 'projects' | 'customSections',
  //     index: number,
  //     bulletIndex: number,
  //     value: string
  //   ) => {
  //     if (!resume) return;
  //     const updated = { ...resume };
  //     (updated[section] as any)[index].bullets[bulletIndex] = value;
  //     setResume(updated);
  //   };

  return (
    <div className="p-4 border rounded shadow bg-white mt-4">
      <button
        onClick={fetchRewritten}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Rewriting...' : 'Rewrite Resume'}
      </button>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      {/* {resume && (
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
          })} */}

      {/* <button
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
          </button> */}

      {/* <div className="mt-6">
            <h3 className="text-md font-bold mb-2">Raw JSON Preview</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded max-h-96 overflow-auto">
              {JSON.stringify(resume, null, 2)}
            </pre>
          </div>
        </div> */}
      {/* )} */}
    </div>
  );
}
