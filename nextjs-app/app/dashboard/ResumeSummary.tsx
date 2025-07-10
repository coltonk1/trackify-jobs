import React from 'react';

type ExperienceItem = {
  job_title: string;
  company: string;
  date: string;
  description: string[];
};

type ProjectItem = {
  title: string;
  date: string;
  description: string[];
};

type ResumeData = {
  workExperience?: ExperienceItem[];
  projects?: ProjectItem[];
  summary?: string;
  skills?: string;
  education?: string;
  profile?: {
    name?: string;
    email?: string;
    phone?: string;
    links?: string[];
  };
};

type KeywordAnalysisProps = {
  resumeData: ResumeData;
};

function toTitleCase(str: string | undefined) {
  if (!str) return;
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

const ResumeSummary: React.FC<KeywordAnalysisProps> = ({ resumeData }) => {
  const { workExperience, projects, summary, skills, education, profile } =
    resumeData;

  return (
    <section className="text-sm text-gray-800 w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Resume Summary</h1>
        <p className="text-sm text-gray-700 mt-1">
          This section displays a parsed summary of your resume. It extracts and
          formats your content based on the uploaded file.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Use this view to verify that automated systems can interpret your
          resume structure accurately. If anything is missing or misaligned,
          adjust your formatting to improve compatibility with applicant
          tracking systems.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Professional Summary
        </h2>
        {summary?.trim() ? (
          <p className="text-sm text-gray-700">{summary}</p>
        ) : (
          <span className="italic text-gray-400">[Missing summary]</span>
        )}
      </div>

      {/* Profile */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Profile</h2>
        {profile ? (
          <table className="w-full text-sm text-left text-gray-800 border border-gray-200">
            <tbody>
              <tr className="border-t border-gray-200">
                <td className="px-3 py-2 font-medium">Name</td>
                <td className="px-3 py-2">
                  {toTitleCase(profile.name) || (
                    <span className="italic text-gray-400">[Missing name]</span>
                  )}
                </td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-3 py-2 font-medium">Email</td>
                <td className="px-3 py-2">
                  {profile.email || (
                    <span className="italic text-gray-400">
                      [Missing email]
                    </span>
                  )}
                </td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-3 py-2 font-medium">Phone</td>
                <td className="px-3 py-2">
                  {profile.phone || (
                    <span className="italic text-gray-400">
                      [Missing phone]
                    </span>
                  )}
                </td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-3 py-2 font-medium">Links</td>
                <td className="px-3 py-2">
                  {Array.isArray(profile.links) && profile.links.length > 0 ? (
                    <ul className="list-none list-inside space-y-1">
                      {profile.links.map((link, idx) => (
                        <li
                          key={idx}
                          className="text-blue-600 underline break-all"
                        >
                          {link}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="italic text-gray-400">
                      [No links provided]
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <span className="italic text-gray-400">[Missing profile]</span>
        )}
      </div>

      {/* Experience */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Experience</h2>
        {Array.isArray(workExperience) && workExperience.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-800 border border-gray-200">
            <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Job Title</th>
                <th className="px-3 py-2 font-medium">Company</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Bullet Points</th>
              </tr>
            </thead>
            <tbody>
              {workExperience.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-200 align-top even:bg-gray-100"
                >
                  <td className="px-3 py-2">
                    {item.job_title?.trim() || (
                      <span className="italic text-gray-400">
                        [Missing job title]
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {item.company?.trim() || (
                      <span className="italic text-gray-400">
                        [Missing company]
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {item.date?.trim() || (
                      <span className="italic text-gray-400">
                        [Missing date]
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {Array.isArray(item.description) &&
                    item.description.length > 0 ? (
                      <ul className="list-none list-inside space-y-1 text-xs text-gray-700">
                        {item.description.map((desc, idx) => (
                          <li key={idx}>{desc}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="italic text-gray-400">
                        [No bullet points]
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span className="italic text-gray-400">
            [No experience data found]
          </span>
        )}
      </div>

      {/* Projects */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Projects</h2>
        {Array.isArray(projects) && projects.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-800 border border-gray-200">
            <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Bullet Points</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-200 align-top even:bg-gray-100"
                >
                  <td className="px-3 py-2">
                    {item.title?.trim() || (
                      <span className="italic text-gray-400">
                        [Missing title]
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {item.date?.trim() || (
                      <span className="italic text-gray-400">
                        [Missing date]
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {Array.isArray(item.description) &&
                    item.description.length > 0 ? (
                      <ul className="list-none list-inside space-y-1 text-xs text-gray-700">
                        {item.description.map((desc, idx) => (
                          <li key={idx}>{desc}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="italic text-gray-400">
                        [No bullet points]
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span className="italic text-gray-400">[No projects listed]</span>
        )}
      </div>

      {/* Skills */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Skills</h2>
        {skills?.trim() ? (
          <p className="text-sm text-gray-700">{skills}</p>
        ) : (
          <span className="italic text-gray-400">[No skills found]</span>
        )}
      </div>

      {/* Education */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Education</h2>
        {education?.trim() ? (
          <p className="text-sm text-gray-700">{education}</p>
        ) : (
          <span className="italic text-gray-400">[No education found]</span>
        )}
      </div>
    </section>
  );
};

export default ResumeSummary;
