// app/features/page.tsx
export default function FeaturesPage() {
  const APP_URL = '/app';
  const ISSUE_URL = 'https://your-issue-link.com';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 border border-gray-300 text-sm px-3 py-1 rounded-full text-gray-600 mb-4"
          aria-label="Early Access status"
        >
          <span
            className="inline-block w-2 h-2 rounded-full bg-emerald-500"
            aria-hidden
          />
          Early Access
        </div>

        <h1 className="text-4xl font-bold mb-4">What TrackifyJobs Can Do</h1>
        <p className="text-lg text-gray-600">
          Manage every step of your job search in one place. Build stronger
          materials, apply with confidence, and stay organized from first draft
          to offer.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <a
            href={APP_URL}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
          >
            Start Free
          </a>
          <a
            href={ISSUE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 text-gray-700 text-sm px-4 py-2 hover:bg-gray-50"
          >
            Suggest a Feature
          </a>
        </div>
      </div>

      {/* Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500">Outcome</p>
          <p className="font-semibold">Sharper resumes</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500">Outcome</p>
          <p className="font-semibold">Faster applications</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500">Outcome</p>
          <p className="font-semibold">Better tracking</p>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resume Parsing */}
        <div className="border border-gray-300 rounded-lg p-6 hover:shadow transition">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold">Resume Parsing</h2>
          </div>
          <p className="text-gray-600">
            Upload your resume and get a clean, structured breakdown of your
            content. The parser extracts experience, skills, education, and more
            for fast edits.
          </p>
          <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Structured JSON output</li>
            <li>Auto detected sections and dates</li>
            <li>Quick fixes for common formatting issues</li>
          </ul>
        </div>

        {/* ATS Optimization */}
        <div className="border border-gray-300 rounded-lg p-6 hover:shadow transition">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold">ATS Optimization</h2>
          </div>
          <p className="text-gray-600">
            See how your resume aligns with job descriptions and common
            screening rules. Get specific edits that improve clarity and keyword
            coverage.
          </p>
          <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Relevance and readability checks</li>
            <li>Keyword suggestions with context</li>
            <li>Action verb and metric prompts</li>
          </ul>
        </div>

        {/* Cover Letters */}
        <div className="border border-gray-300 rounded-lg p-6 hover:shadow transition">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold">Cover Letter Generation</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
              AI
            </span>
          </div>
          <p className="text-gray-600">
            Draft tailored letters that reflect your experience and the role.
            Edit in place and keep multiple versions for different companies.
          </p>
          <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Company specific hooks</li>
            <li>Tone controls and length targets</li>
            <li>Instant regenerate with your notes</li>
          </ul>
        </div>

        {/* Tracking */}
        <div className="border border-gray-300 rounded-lg p-6 hover:shadow transition">
          <h2 className="text-xl font-semibold mb-2">
            Job Application Tracking
          </h2>
          <p className="text-gray-600">
            Keep every role, status, and contact in a single dashboard. Sort by
            stage and follow up on time.
          </p>
          <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Stages like applied, interview, offer</li>
            <li>Notes, reminders, and links</li>
            <li>Sort and filter by company and date</li>
          </ul>
        </div>

        {/* Multiple resumes */}
        <div className="border border-gray-300 rounded-lg p-6 hover:shadow transition">
          <h2 className="text-xl font-semibold mb-2">
            Multiple Resumes and Versions
          </h2>
          <p className="text-gray-600">
            Create focused versions for different roles. Keep everything in one
            place and switch fast when you apply.
          </p>
          <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Role specific profiles</li>
            <li>One click duplication</li>
            <li>Change history on key edits</li>
          </ul>
        </div>

        {/* Highlights */}
        <div className="border border-gray-300 rounded-lg p-6 hover:shadow transition">
          <h2 className="text-xl font-semibold mb-2">
            Project and Experience Highlights
          </h2>
          <p className="text-gray-600">
            Present the work that proves your value. Use impact driven bullets
            and concise context.
          </p>
          <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Metric templates and examples</li>
            <li>Tech stack tags</li>
            <li>Portfolio and GitHub links</li>
          </ul>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-4xl mb-2" aria-hidden>
              1
            </p>
            <p className="font-medium">Import your resume or start fresh</p>
            <p className="text-sm text-gray-600 mt-2">
              Parse and clean in minutes. No manual formatting required.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-4xl mb-2" aria-hidden>
              2
            </p>
            <p className="font-medium">Optimize for a role</p>
            <p className="text-sm text-gray-600 mt-2">
              Match the language in the job posting and add measurable impact.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-4xl mb-2" aria-hidden>
              3
            </p>
            <p className="font-medium">Apply and track in one place</p>
            <p className="text-sm text-gray-600 mt-2">
              Keep statuses current and never miss a follow up.
            </p>
          </div>
        </div>
      </div>

      {/* Power users and Security */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">For Power Users</h2>
          <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Bulk edits on skills and titles</li>
            <li>Reusable achievement snippets</li>
            <li>Templates for roles and industries</li>
            <li>Export to PDF and Word</li>
          </ul>
        </div>
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Privacy and Security</h2>
          <p className="text-gray-600">
            Your data is tied to your account and stored securely. We use
            Firebase for authentication and storage. You can request an export
            or deletion at any time.
          </p>
          <div className="mt-3 text-sm">
            <a href="/privacy" className="text-blue-700 hover:underline">
              Privacy policy
            </a>
            <span className="mx-2 text-gray-400">•</span>
            <a href="/terms" className="text-blue-700 hover:underline">
              Terms of use
            </a>
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <p className="mt-12 text-center text-sm text-gray-500">
        New features and improvements ship regularly. Tell us what you want next
        and we will prioritize high impact items first.
      </p>

      <div className="mt-6 flex justify-center">
        <a
          href={APP_URL}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
        >
          Try it free during Early Access
        </a>
      </div>
    </div>
  );
}
