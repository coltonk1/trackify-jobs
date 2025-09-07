// app/dashboard/page.tsx
'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back 👋</h2>
        <p className="mt-1 text-gray-600">
          Here’s a quick overview of your job search progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Applications</p>
          <p className="mt-2 text-3xl font-bold text-purple-700">12</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Interviews</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">3</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Offers</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">1</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Rejections</p>
          <p className="mt-2 text-3xl font-bold text-red-600">5</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/applications/new"
            className="px-4 py-2 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
          >
            Add Application
          </Link>
          <Link
            href="/dashboard/resumes"
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
          >
            Manage Resumes
          </Link>
          <Link
            href="/dashboard/files"
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
          >
            Files
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <ul className="divide-y divide-gray-200">
          <li className="py-3">
            <span className="font-medium text-gray-800">Google</span> – Applied
            for Software Engineer role
            <span className="text-sm text-gray-500 ml-2">2 days ago</span>
          </li>
          <li className="py-3">
            <span className="font-medium text-gray-800">Amazon</span> – Phone
            interview scheduled
            <span className="text-sm text-gray-500 ml-2">1 day ago</span>
          </li>
          <li className="py-3">
            <span className="font-medium text-gray-800">Meta</span> – Resume
            rescored: 85/100
            <span className="text-sm text-gray-500 ml-2">3 hours ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
