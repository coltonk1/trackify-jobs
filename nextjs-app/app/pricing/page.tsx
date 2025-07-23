export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-block border border-gray-300 text-sm px-3 py-1 rounded-full text-gray-600 mb-4">
          Beta Access
        </div>
        <h1 className="text-4xl font-bold mb-4">
          TrackifyJobs is Free Right Now
        </h1>
        <p className="text-lg text-gray-600">
          We’re actively improving resume parsing, ATS scoring, and job
          tracking. While features are still being refined, you can use the
          platform completely free.
        </p>
      </div>

      <div className="border border-dashed border-gray-300 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Current Plan</h2>
        <div className="flex justify-between items-center flex-wrap gap-6">
          <div>
            <p className="text-lg font-medium">Free Access</p>
            <p className="text-sm text-gray-500 mt-1">
              Full access to all features. Expect occasional bugs while we
              finish polishing.
            </p>
          </div>
          <button
            disabled
            className="bg-gray-200 text-gray-500 text-sm px-4 py-2 rounded cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-gray-500">
        Once things are stable, we’ll introduce simple pricing to support
        further development. You’ll always be notified in advance.
      </p>
    </div>
  );
}
