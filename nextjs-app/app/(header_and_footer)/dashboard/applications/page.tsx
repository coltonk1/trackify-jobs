'use client';

import { useState, useEffect, useMemo } from 'react';
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
  id: string;
  company: string;
  jobTitle: string;
  status: 'Need to Apply' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
  dateApplied?: string;
  dateClosing?: string;
  link?: string;
  jobDescription?: string;
  notes?: string;
  resumeName?: string;
  coverLetterName?: string;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'company'>('date');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('applications');
    if (stored) {
      try {
        setApplications(JSON.parse(stored));
      } catch {
        setApplications([]);
      }
    }
  }, []);

  const saveToStorage = (apps: Application[]) => {
    localStorage.setItem('applications', JSON.stringify(apps));
    setApplications(apps);
  };

  const selectedApp = applications.find((a) => a.id === selectedId);

  const handleRowClick = (id: string) => {
    setSelectedId(selectedId === id ? null : id);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    const updated = applications.filter((app) => app.id !== id);
    saveToStorage(updated);
    setSelectedId(null);
  };

  // === Filtering ===
  let filteredApps = applications;
  if (filterStatus !== 'all') {
    filteredApps = filteredApps.filter((app) => app.status === filterStatus);
  }
  if (dateFrom) {
    filteredApps = filteredApps.filter(
      (app) =>
        app.dateApplied && new Date(app.dateApplied) >= new Date(dateFrom)
    );
  }
  if (dateTo) {
    filteredApps = filteredApps.filter(
      (app) => app.dateApplied && new Date(app.dateApplied) <= new Date(dateTo)
    );
  }

  // === Sorting ===
  filteredApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'company') {
      return a.company.localeCompare(b.company);
    }
    return (
      new Date(b.dateApplied || 0).getTime() -
      new Date(a.dateApplied || 0).getTime()
    );
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
      const d = app.dateApplied;
      if (d) {
        map[d] = (map[d] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredApps]);

  const statusColors: Record<Application['status'], string> = {
    'Need to Apply': '#9CA3AF',
    Applied: '#3B82F6',
    Interview: '#F59E0B',
    Offer: '#10B981',
    Rejected: '#EF4444',
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

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
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

      {/* Master–Detail */}
      <div className="flex gap-6">
        <div className="flex-1 overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Job Title</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Applied</th>
                <th className="px-6 py-3">Closing</th>
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
                  <td className="px-6 py-4">{app.jobTitle}</td>
                  <td className="px-6 py-4">
                    <span
                      className="px-2 py-1 text-xs rounded-full font-semibold"
                      style={{
                        backgroundColor: statusColors[app.status] + '20',
                        color: statusColors[app.status],
                      }}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {app.dateApplied || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {app.dateClosing || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selectedApp && (
          <div className="w-96 bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedApp.company} – {selectedApp.jobTitle}
            </h3>
            {selectedApp.dateApplied && (
              <p className="text-sm text-gray-500 mb-2">
                Applied on {selectedApp.dateApplied}
              </p>
            )}
            {selectedApp.dateClosing && (
              <p className="text-sm text-gray-500 mb-2">
                Closing {selectedApp.dateClosing}
              </p>
            )}

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Status:</span>{' '}
                {selectedApp.status}
              </div>
              {selectedApp.link && (
                <div>
                  <span className="font-medium text-gray-700">Job Link:</span>{' '}
                  <a
                    href={selectedApp.link}
                    target="_blank"
                    className="text-purple-600 hover:underline"
                  >
                    Open
                  </a>
                </div>
              )}
              {selectedApp.jobDescription && (
                <div>
                  <span className="font-medium text-gray-700">
                    Description:
                  </span>
                  <p className="mt-1 text-gray-600">
                    {selectedApp.jobDescription}
                  </p>
                </div>
              )}
              {selectedApp.resumeName && (
                <div>
                  <span className="font-medium text-gray-700">Resume:</span>{' '}
                  {selectedApp.resumeName}
                </div>
              )}
              {selectedApp.coverLetterName && (
                <div>
                  <span className="font-medium text-gray-700">
                    Cover Letter:
                  </span>{' '}
                  {selectedApp.coverLetterName}
                </div>
              )}
              {selectedApp.notes && (
                <div>
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="mt-1 text-gray-600">{selectedApp.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-between">
              <button className="px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 text-sm">
                Edit
              </button>
              <button
                onClick={() => handleDelete(selectedApp.id)}
                className="px-3 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
