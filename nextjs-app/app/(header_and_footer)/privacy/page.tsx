export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <p className="mb-4">
        TrackifyJobs is committed to safeguarding your privacy. This Privacy
        Policy outlines the types of information we collect, how we use it, and
        the steps we take to protect it when you use our service.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        1. Information We Collect
      </h2>
      <p className="mb-4">
        We collect personal information you provide when creating an account,
        uploading your resume, generating rewritten resumes, or using platform
        features. This may include:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Name and contact details (such as email address)</li>
        <li>Original and rewritten resume content</li>
        <li>Job application history and related data</li>
        <li>Feedback, messages, or support requests</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        2. How We Use Your Information
      </h2>
      <p className="mb-4">
        Your information is used to provide and improve core functionality,
        including:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Saving and managing your job applications</li>
        <li>Generating and securely storing rewritten resumes</li>
        <li>Scoring and analyzing resumes</li>
        <li>Improving platform features through anonymized usage data</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        3. Data Storage and Security
      </h2>
      <p className="mb-4">
        All application data, including original and rewritten resumes, is
        securely stored using Supabase. Rewritten resumes are encrypted at rest
        and in transit. User authentication is handled through Firebase, and we
        implement industry-standard security measures to prevent unauthorized
        access, loss, or disclosure of your data.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        4. Sharing of Information
      </h2>
      <p className="mb-4">
        We do not sell or rent your personal data. We may share information only
        with trusted service providers (e.g., Supabase, Firebase, OpenAI) when
        necessary to operate the platform. These providers are contractually
        obligated to protect your data.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">5. Your Rights</h2>
      <p className="mb-4">
        You have the right to request deletion of your account and all
        associated data at any time. To make a request or ask questions about
        your data, contact us at support@trackifyjobs.com.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        6. Changes to This Policy
      </h2>
      <p className="mb-4">
        We may update this policy from time to time. Any material changes will
        be communicated via the site or email before taking effect.
      </p>

      <p className="text-sm text-gray-500 mt-12">
        Last updated: August 12, 2025
      </p>
    </main>
  );
}
