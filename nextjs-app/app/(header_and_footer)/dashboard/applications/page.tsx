// app/dashboard/applications/page.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

type Application = {
  id: number;
  company: string;
  position: string;
  status: 'Need to Apply' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
  date: string; // ISO string YYYY-MM-DD
  notes?: string;
  jobDescription?: string;
  resume?: string;
  coverLetter?: string;
};

export default function ApplicationsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'company'>('date');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Dummy data – replace with DB fetch
  const applications: Application[] = [
    {
      id: 1,
      company: 'Google',
      position: 'Software Engineer',
      status: 'Interview',
      date: '2025-08-20',
      notes: 'Scheduled phone screen next week.',
      jobDescription: 'https://careers.google.com/jobs/123',
      resume: 'resume_v3.pdf',
      coverLetter: 'google_cover_letter.pdf',
    },
    {
      id: 2,
      company: 'Amazon',
      position: 'Backend Developer',
      status: 'Need to Apply',
      date: '2025-08-18',
      notes: 'Reminder for this weekend.',
      jobDescription: 'https://amazon.jobs/456',
    },
    {
      id: 3,
      company: 'Meta',
      position: 'Full-Stack Engineer',
      status: 'Rejected',
      date: '2025-08-15',
      notes: 'Reapply in 6 months.',
    },
    {
      id: 4,
      company: 'Microsoft',
      position: 'AI Research Intern',
      status: 'Offer',
      date: '2025-08-12',
    },
    {
      id: 5,
      company: 'Stripe',
      position: 'Backend Engineer',
      status: 'Applied',
      date: '2025-08-05',
    },
    {
      id: 6,
      company: 'Netflix',
      position: 'Data Engineer',
      status: 'Applied',
      date: '2025-07-28',
    },
  ];

  const selectedApp = applications.find((a) => a.id === selectedId);

  const handleRowClick = (id: number) => {
    setSelectedId(selectedId === id ? null : id);
  };

  // === Filtering ===
  let filteredApps = applications;
  if (filterStatus !== 'all') {
    filteredApps = filteredApps.filter((app) => app.status === filterStatus);
  }
  if (dateFrom) {
    filteredApps = filteredApps.filter(
      (app) => new Date(app.date) >= new Date(dateFrom)
    );
  }
  if (dateTo) {
    filteredApps = filteredApps.filter(
      (app) => new Date(app.date) <= new Date(dateTo)
    );
  }

  // === Sorting ===
  filteredApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'company') {
      return a.company.localeCompare(b.company);
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // === Chart data ===
  const chartDataStatus = useMemo(() => {
    const counts: Record<Application['status'], number> = {
      'Need to Apply': 0,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };
    filteredApps.forEach((app) => {
      counts[app.status]++;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [filteredApps]);

  const chartDataTimeline = useMemo(() => {
    const map: Record<string, number> = {};
    filteredApps.forEach((app) => {
      const d = app.date;
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredApps]);

  const statusColors: Record<Application['status'], string> = {
    'Need to Apply': '#9CA3AF', // gray
    Applied: '#3B82F6', // blue
    Interview: '#F59E0B', // yellow
    Offer: '#10B981', // green
    Rejected: '#EF4444', // red
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
        <Link
          href="/dashboard/applications/new"
          className="px-4 py-2 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
        >
          + Add Application
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Overview */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Overview
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataStatus}>
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count">
                  {chartDataStatus.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={statusColors[entry.status as Application['status']]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline Overview */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Applications Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366F1" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Controls: Sort + Filter */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Sort */}
        <div>
          <label className="mr-2 text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'company')}
            className="border border-gray-300 rounded-md text-sm px-2 py-1"
          >
            <option value="date">Date</option>
            <option value="company">Company</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="mr-2 text-sm font-medium text-gray-700">
            Status:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 py-1"
          >
            <option value="all">All</option>
            <option value="Need to Apply">Need to Apply</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="mr-2 text-sm font-medium text-gray-700">
            From:
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 py-1"
          />
        </div>
        <div>
          <label className="mr-2 text-sm font-medium text-gray-700">To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 py-1"
          />
        </div>
      </div>

      {/* Master–Detail Layout */}
      <div className="flex gap-6">
        {/* Applications Table */}
        <div className="flex-1 overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApps.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => handleRowClick(app.id)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedId === app.id ? 'bg-purple-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {app.company}
                  </td>
                  <td className="px-6 py-4">{app.position}</td>
                  <td className="px-6 py-4">
                    <span
                      className="px-2 py-1 text-xs rounded-full font-semibold"
                      style={{
                        backgroundColor:
                          statusColors[app.status] + '20' /* faded */,
                        color: statusColors[app.status],
                      }}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{app.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selectedApp && (
          <div className="w-96 bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedApp.company} – {selectedApp.position}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedApp.status === 'Need to Apply'
                ? 'Not submitted yet'
                : `Applied on ${selectedApp.date}`}
            </p>

            {/* Info */}
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Status:</span>{' '}
                {selectedApp.status}
              </div>
              {selectedApp.jobDescription && (
                <div>
                  <span className="font-medium text-gray-700">
                    Application Link:
                  </span>{' '}
                  <a
                    href={selectedApp.jobDescription}
                    target="_blank"
                    className="text-purple-600 hover:underline"
                  >
                    Open
                  </a>
                </div>
              )}
              {selectedApp.resume && (
                <div>
                  <span className="font-medium text-gray-700">Resume:</span>{' '}
                  {selectedApp.resume}
                </div>
              )}
              {selectedApp.coverLetter && (
                <div>
                  <span className="font-medium text-gray-700">
                    Cover Letter:
                  </span>{' '}
                  {selectedApp.coverLetter}
                </div>
              )}
              {selectedApp.notes && (
                <div>
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="mt-1 text-gray-600">{selectedApp.notes}</p>
                </div>
              )}
            </div>

            {/* Auto-Generated Todos */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                Suggested To-Dos
              </h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                {(() => {
                  const todos: string[] = [];
                  const today = new Date();
                  const appliedDate = new Date(selectedApp.date);
                  const daysSince = Math.floor(
                    (today.getTime() - appliedDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  if (selectedApp.status === 'Need to Apply') {
                    todos.push('Submit application soon.');
                  }
                  if (selectedApp.status === 'Applied') {
                    if (daysSince >= 7) {
                      todos.push(
                        'Follow up with recruiter (applied over a week ago).'
                      );
                    } else {
                      todos.push(
                        'Wait for response. Consider follow up after 7 days.'
                      );
                    }
                  }
                  if (selectedApp.status === 'Interview') {
                    if (daysSince <= 2) {
                      todos.push('Send thank-you email for interview.');
                    } else {
                      todos.push('Prepare for next interview round.');
                    }
                  }
                  if (selectedApp.status === 'Offer') {
                    todos.push('Review and respond to the offer.');
                  }
                  if (selectedApp.status === 'Rejected') {
                    todos.push(
                      'Log rejection reason. Consider applying again in 6 months.'
                    );
                  }

                  return todos.map((t, i) => <li key={i}>{t}</li>);
                })()}
              </ul>
            </div>

            {/* Panel Actions */}
            <div className="mt-6 flex justify-between">
              <button className="px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 text-sm">
                Edit
              </button>
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
