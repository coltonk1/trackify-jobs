'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Application {
  id: string;
  company: string;
  jobTitle: string;
  status: string;
  dateApplied?: string;
  dateClosing?: string;
  link: string;
  jobDescription: string;
  notes: string;
  resume?: string; // base64
  resumeName?: string;
  coverLetter?: string; // base64
  coverLetterName?: string;
}

export default function NewApplicationPage() {
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState('Applied');
  const [dateApplied, setDateApplied] = useState('');
  const [dateClosing, setDateClosing] = useState('');
  const [link, setLink] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [notes, setNotes] = useState('');

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const r = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let resumeBase64: string | undefined;
    let coverBase64: string | undefined;

    if (resumeFile) {
      resumeBase64 = await fileToBase64(resumeFile);
    }
    if (coverFile) {
      coverBase64 = await fileToBase64(coverFile);
    }

    const newApp: Application = {
      id: Date.now().toString(),
      company,
      jobTitle,
      status,
      dateApplied: dateApplied || undefined,
      dateClosing: dateClosing || undefined,
      link,
      jobDescription,
      notes,
      resume: resumeBase64,
      resumeName: resumeFile?.name,
      coverLetter: coverBase64,
      coverLetterName: coverFile?.name,
    };

    const existing = JSON.parse(localStorage.getItem('applications') || '[]');
    localStorage.setItem('applications', JSON.stringify([...existing, newApp]));

    // reset
    setCompany('');
    setJobTitle('');
    setStatus('Applied');
    setDateApplied('');
    setDateClosing('');
    setLink('');
    setJobDescription('');
    setNotes('');
    setResumeFile(null);
    setCoverFile(null);

    r.replace('/dashboard/applications');
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">New Application</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Job Title</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option>Need to Apply</option>
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Date Applied (optional)
          </label>
          <input
            type="date"
            value={dateApplied}
            onChange={(e) => setDateApplied(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Job Closing Date (optional)
          </label>
          <input
            type="date"
            value={dateClosing}
            onChange={(e) => setDateClosing(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Job Link</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://company.com/careers/job"
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full border rounded p-2"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Resume</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            className="w-full"
          />
          {resumeFile && (
            <p className="text-xs text-gray-600 mt-1">{resumeFile.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">
            Cover Letter (optional)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full"
          />
          {coverFile && (
            <p className="text-xs text-gray-600 mt-1">{coverFile.name}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Save Application
        </button>
      </form>
    </div>
  );
}
