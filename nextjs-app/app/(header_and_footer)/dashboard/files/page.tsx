// app/dashboard/files/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, FileSignature, File } from 'lucide-react';

type StoredFile = {
  id: number;
  name: string;
  type: 'resume' | 'coverletter' | 'pdf';
  createdWithTrackify?: boolean;
  uploadedAt: string;
  previewUrl?: string;
};

export default function FilesPage() {
  const [search, setSearch] = useState('');

  const files: StoredFile[] = [
    {
      id: 1,
      name: 'Software Engineer Resume',
      type: 'resume',
      createdWithTrackify: true,
      uploadedAt: '2025-08-15',
      previewUrl: '/previews/resume1.png',
    },
    {
      id: 2,
      name: 'Backend Developer Cover Letter',
      type: 'coverletter',
      createdWithTrackify: false,
      uploadedAt: '2025-08-10',
      previewUrl: '/previews/cover1.png',
    },
    {
      id: 3,
      name: 'Custom Resume (PDF Upload)',
      type: 'resume',
      createdWithTrackify: false,
      uploadedAt: '2025-07-25',
      previewUrl: '/previews/pdf1.png',
    },
    {
      id: 4,
      name: 'General Notes',
      type: 'pdf',
      createdWithTrackify: false,
      uploadedAt: '2025-07-12',
      previewUrl: '/previews/pdf2.png',
    },
  ];

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (type: StoredFile['type']) => {
    if (type === 'resume') return <FileText className="w-5 h-5" />;
    if (type === 'coverletter') return <FileSignature className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Stored Files</h2>
        <button className="px-4 py-2 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition">
          + Upload PDF
        </button>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      {/* Grid of Portrait Previews */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((file) => (
          <div
            key={file.id}
            className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition overflow-hidden flex flex-col"
          >
            {/* Portrait Preview (fixed aspect ratio) */}
            <div className="relative w-full pb-[133%] bg-gray-50">
              {file.previewUrl ? (
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  {getIcon(file.type)}
                  <span className="text-xs mt-1">No Preview</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3 flex-1 flex flex-col">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                {file.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {file.type.charAt(0).toUpperCase() + file.type.slice(1)} •{' '}
                {file.uploadedAt}
              </p>

              {/* Actions */}
              <div className="mt-auto flex gap-3 pt-3">
                {file.createdWithTrackify ? (
                  <Link
                    href={`/dashboard/resumes/create?id=${file.id}`}
                    className="text-purple-600 hover:underline text-sm"
                  >
                    Edit
                  </Link>
                ) : (
                  <a
                    href={file.previewUrl || '#'}
                    target="_blank"
                    className="text-purple-600 hover:underline text-sm"
                  >
                    View
                  </a>
                )}
                <button className="text-red-500 hover:text-red-700 text-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-500 italic">
            No files found
          </p>
        )}
      </div>
    </div>
  );
}
