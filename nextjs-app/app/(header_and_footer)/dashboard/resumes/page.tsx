// app/dashboard/resumes/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

type Resume = {
  id: number;
  name: string;
  lastUpdated: string;
  formattingScore: number;
  jobScores: { jobTitle: string; company: string; score: number }[];
};

export default function ResumesPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Dummy data – replace with DB fetch
  const resumes: Resume[] = [
    {
      id: 1,
      name: 'Software Engineer Resume',
      lastUpdated: '2025-08-15',
      formattingScore: 88,
      jobScores: [
        { jobTitle: 'Software Engineer', company: 'Google', score: 85 },
        { jobTitle: 'Backend Developer', company: 'Amazon', score: 78 },
      ],
    },
    {
      id: 2,
      name: 'Data Science Resume',
      lastUpdated: '2025-07-30',
      formattingScore: 73,
      jobScores: [
        { jobTitle: 'Data Scientist', company: 'Meta', score: 70 },
        { jobTitle: 'ML Engineer', company: 'Stripe', score: 75 },
      ],
    },
  ];

  const selectedResume = resumes.find((r) => r.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Resumes</h2>
        <div className="flex gap-3">
          <Link
            href="/dashboard/resumes/create"
            className="px-4 py-2 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
          >
            + Create Resume
          </Link>
          <Link
            href="/dashboard/resumes/analyze"
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
          >
            Analyze Resume
          </Link>
        </div>
      </div>

      {/* Master–Detail Layout */}
      <div className="flex gap-6">
        {/* Table of Resumes */}
        <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Last Updated</th>
                <th className="px-6 py-3">Formatting Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {resumes.map((resume) => (
                <tr
                  key={resume.id}
                  onClick={() =>
                    setSelectedId(selectedId === resume.id ? null : resume.id)
                  }
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedId === resume.id ? 'bg-purple-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {resume.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {resume.lastUpdated}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        resume.formattingScore >= 80
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {resume.formattingScore}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selectedResume && (
          <div className="w-96 bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedResume.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Last updated {selectedResume.lastUpdated}
            </p>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">
                  Formatting Score:
                </span>{' '}
                <span>{selectedResume.formattingScore}/100</span>
              </div>

              <div>
                <span className="font-medium text-gray-700">
                  Job Description Matches:
                </span>
                <ul className="mt-2 space-y-2">
                  {selectedResume.jobScores.map((job, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center border p-2 rounded-md"
                    >
                      <span>
                        {job.jobTitle} @ {job.company}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          job.score >= 80
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {job.score}/100
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Panel Actions */}
            <div className="mt-6 flex justify-between">
              <Link
                href={`/dashboard/resumes/create?id=${selectedResume.id}`}
                className="px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 text-sm"
              >
                Edit
              </Link>
              <button className="px-3 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 text-sm">
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
