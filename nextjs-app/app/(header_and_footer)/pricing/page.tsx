export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
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

        <h1 className="text-4xl font-bold mb-4">
          TrackifyJobs is Free Right Now
        </h1>

        <p className="text-lg text-gray-600">
          We are actively improving resume parsing, ATS scoring, and job
          tracking. While features are being refined, the platform is free to
          use with unlimited access.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
          >
            Start Using TrackifyJobs
          </a>
          <a
            href="https://your-issue-link.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 text-gray-700 text-sm px-4 py-2 hover:bg-gray-50"
          >
            Report an Issue
          </a>
        </div>
      </div>

      {/* Plans Preview */}
      <div className="border border-dashed border-gray-300 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-2">Plans</h2>
        <p className="text-sm text-gray-500 mb-4" role="note">
          These plans are not in effect. This section is a preview of what
          pricing may look like after we finish core work and stabilize the
          product.
        </p>

        {/* Free Plan */}
        <div className="flex justify-between items-start flex-wrap gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-medium">Free</p>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                Preview
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Access to all features with usage limits once pricing launches.
              Today you have unlimited access during Early Access.
            </p>
            <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>All core features</li>
              <li>Community support</li>
              <li>Usage caps after pricing goes live</li>
            </ul>
          </div>
          <span
            className="bg-gray-200 text-gray-500 text-sm px-4 py-2 rounded select-none"
            aria-disabled="true"
          >
            Coming Soon
          </span>
        </div>

        {/* Pro Plan */}
        <div className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-medium">Pro</p>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                Preview
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Unlimited everything. No usage caps. Priority support and faster
              processing.
            </p>
            <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Unlimited parsing and scoring</li>
              <li>Unlimited job tracking</li>
              <li>Priority support</li>
            </ul>
          </div>
          <span
            className="bg-gray-200 text-gray-500 text-sm px-4 py-2 rounded select-none"
            aria-disabled="true"
          >
            Coming Soon
          </span>
        </div>
      </div>

      {/* Disclosure */}
      <p className="mt-10 text-center text-sm text-gray-500">
        Every account currently has full, unlimited access while we continue
        improving the platform. Pricing will be announced with clear notice
        before any changes take effect.
      </p>
    </div>
  );
}
