export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <p className="mb-4">
        TrackifyJobs is committed to protecting your privacy. This Privacy
        Policy explains how we collect, use, and safeguard your information when
        you use our service.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        1. Information We Collect
      </h2>
      <p className="mb-4">
        We collect personal information you provide when creating an account,
        uploading your resume, or interacting with features of the platform.
        This may include your name, email, resume content, job application data,
        and any feedback or messages you submit.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        2. How We Use Your Information
      </h2>
      <p className="mb-4">
        Your data is used to provide core functionality, such as saving your
        applications, generating resumes, or scoring your resume. We may use
        anonymized usage patterns to improve features.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        3. Data Storage and Security
      </h2>
      <p className="mb-4">
        All application data is securely stored using Supabase, and user
        authentication is handled via Firebase. Data is encrypted during
        transit, and we take reasonable precautions to prevent data loss,
        unauthorized access, or disclosure.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        4. Sharing of Information
      </h2>
      <p className="mb-4">
        We do not sell or share your personal data with third parties. Data may
        be shared only with trusted service providers (e.g., Supabase, Firebase,
        OpenAI) to enable platform functionality.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">5. Your Rights</h2>
      <p className="mb-4">
        You can request deletion of your account and associated data at any
        time. If you have questions about your data or privacy, contact us at
        support@trackifyjobs.com.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        6. Changes to This Policy
      </h2>
      <p className="mb-4">
        We may update this policy as needed. Material changes will be
        communicated via the site or email.
      </p>

      <p className="text-sm text-gray-500 mt-12">Last updated: July 23, 2025</p>
    </main>
  );
}
