export default function FeaturesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">What TrackifyJobs Can Do</h1>
        <p className="text-lg text-gray-600">
          A smarter way to manage your job search — from resume building to
          tracking every application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-gray-300 rounded-lg p-6 hover:shadow transition">
          <h2 className="text-xl font-semibold mb-2">Resume Parsing</h2>
          <p className="text-gray-600">
            Upload your resume and get a clean, structured breakdown of your
            data. Automatically extracts your work experience, skills,
            education, and more.
          </p>
        </div>

        <div className="border border-gray-300 rounded-lg p-6 hover:shadow transition">
          <h2 className="text-xl font-semibold mb-2">ATS Optimization</h2>
          <p className="text-gray-600">
            Get feedback on how your resume scores against applicant tracking
            systems. Make edits that increase your chances of getting noticed.
          </p>
        </div>

        <div className="border border-gray-300 rounded-lg p-6 hover:shadow transition">
          <h2 className="text-xl font-semibold mb-2">
            Cover Letter Generation
          </h2>
          <p className="text-gray-600">
            Use AI to create personalized, professional cover letters tailored
            to your resume and the job you’re applying for.
          </p>
        </div>

        <div className="border border-gray-300 rounded-lg p-6 hover:shadow transition">
          <h2 className="text-xl font-semibold mb-2">
            Job Application Tracking
          </h2>
          <p className="text-gray-600">
            Stay organized with a dashboard that lets you log, sort, and monitor
            the status of every job you apply to.
          </p>
        </div>

        <div className="border border-gray-300 rounded-lg p-6 hover:shadow transition">
          <h2 className="text-xl font-semibold mb-2">
            Multiple Resumes & Versions
          </h2>
          <p className="text-gray-600">
            Keep different resume versions for different industries or roles,
            all in one place.
          </p>
        </div>

        <div className="border border-gray-300 rounded-lg p-6 hover:shadow transition">
          <h2 className="text-xl font-semibold mb-2">
            Project + Experience Highlights
          </h2>
          <p className="text-gray-600">
            Showcase your most relevant work and side projects with flexible
            formatting and impact-driven descriptions.
          </p>
        </div>
      </div>

      <p className="mt-12 text-center text-sm text-gray-500">
        New features and improvements are released regularly. Let us know what
        you want to see next.
      </p>
    </div>
  );
}
