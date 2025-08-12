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

      // Step 1: Submit the job
      const formData = new FormData();
      formData.append('resume_file', file);
      formData.append('resume_text', resumeText);
      formData.append('job_description', jobDescription);

      const submitRes = await fetch('/api/llm/rewrite', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!submitRes.ok) throw new Error(await submitRes.text());
      const { job_id } = await submitRes.json();
      if (!job_id) throw new Error('No job_id returned');

      // Step 2: Poll the job status
      const pollInterval = 10000; // 10s
      let attempts = 0;
      let maxAttempts = 30; // ~3 minutes

      let resultData = null;
      while (attempts < maxAttempts) {
        const statusRes = await fetch(
          `/api/llm/query-job?job_id=${encodeURIComponent(job_id)}`,
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!statusRes.ok) {
          let statusText = await statusRes.text();
          console.log(statusText);
          await new Promise((res) => setTimeout(res, pollInterval));
          attempts++;
          continue;
        }
        const statusData = await statusRes.json();

        if (statusData.status === 'completed' && statusData.rewrites) {
          resultData = statusData.rewrites;
          break;
        }

        if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Resume rewrite failed');
        }

        await new Promise((res) => setTimeout(res, pollInterval));
        attempts++;
      }

      if (!resultData) throw new Error('Timed out waiting for rewrite job');

      // Step 3: Open resume editor
      const query = compressToEncodedURIComponent(JSON.stringify(resultData));
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
    <div className="mt-4 flex items-center justify-between gap-2 mb-3">
      <button
        onClick={fetchRewritten}
        disabled={loading}
        className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer flex gap-2 items-center"
      >
        {loading ? 'Rewriting…' : 'Rewrite Resume'}
        <img
          src={
            'https://media.nngroup.com/media/editor/2024/09/16/lyft_promotions_sparkles_icon.png'
          }
          alt="Uploaded resume preview"
          className="rounded aspect-square h-4 brightness-1000"
        />
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
