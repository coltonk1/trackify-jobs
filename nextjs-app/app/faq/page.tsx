// app/faq/page.tsx
export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600">
          Got questions about TrackifyJobs? Here are some quick answers.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold">
            Is TrackifyJobs really free?
          </h2>
          <p className="text-gray-600 mt-2">
            Yes. While we’re still developing and testing features, the platform
            is completely free to use. Once it’s stable, we’ll roll out a simple
            pricing plan.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            What features does it include?
          </h2>
          <p className="text-gray-600 mt-2">
            You can parse and optimize resumes, generate ATS scores, create
            cover letters, and track your job applications — all in one place.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Why is something not working right?
          </h2>
          <p className="text-gray-600 mt-2">
            TrackifyJobs is in beta. That means bugs may happen. We're actively
            fixing issues and improving reliability. You can report any problems
            through the feedback form or email.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Will my data be saved?</h2>
          <p className="text-gray-600 mt-2">
            Yes. All your data is stored securely and tied to your account. We
            use Firebase to manage authentication and data storage.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">When will pricing start?</h2>
          <p className="text-gray-600 mt-2">
            We don’t have an exact date yet. Once the core features are polished
            and reliable, we’ll announce pricing well in advance.
          </p>
        </div>
      </div>
    </div>
  );
}
