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
  skills?: string[];
  education?: string[];
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
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

/* ---------- UI primitives for consistency ---------- */

const Section = ({
  title,
  children,
  description,
  id,
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
  id?: string;
}) => (
  <section className="mb-6" aria-labelledby={id}>
    <h2 id={id} className="text-lg font-semibold text-gray-800 mb-1">
      {title}
    </h2>
    {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
    {children}
  </section>
);

const Placeholder = ({
  children = '[Missing]',
}: {
  children?: React.ReactNode;
}) => <span className="italic text-gray-400">{children}</span>;

const TableShell = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-hidden border border-gray-200 rounded">
    <table className="w-full text-sm text-left text-gray-800">{children}</table>
  </div>
);

const GridTable = ({
  columns,
  rows,
}: {
  columns: string[];
  rows: React.ReactNode[][];
}) => (
  <TableShell>
    <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
      <tr>
        {columns.map((c) => (
          <th key={c} className="px-3 py-2 font-medium">
            {c}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.length === 0 ? (
        <tr>
          <td className="px-3 py-3" colSpan={columns.length}>
            <Placeholder>[No data]</Placeholder>
          </td>
        </tr>
      ) : (
        rows.map((cells, i) => (
          <tr
            key={i}
            className="border-t border-gray-200 align-top even:bg-gray-50"
          >
            {cells.map((cell, j) => (
              <td key={j} className="px-3 py-2">
                {cell}
              </td>
            ))}
          </tr>
        ))
      )}
    </tbody>
  </TableShell>
);

const BulletList = ({ items }: { items?: string[] }) => {
  if (!Array.isArray(items) || items.length === 0)
    return <Placeholder>[No bullet points]</Placeholder>;
  return (
    <ul className="list-nonoe space-y-1 text-xs text-gray-700">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
};

const ChipList = ({ items }: { items?: string[] }) => {
  if (!Array.isArray(items) || items.length === 0)
    return <Placeholder>[None]</Placeholder>;
  return (
    <ul className="flex flex-wrap gap-2 text-sm">
      {items.map((s, i) => (
        <li
          key={i}
          className="px-2 py-1 rounded border border-gray-200 bg-gray-50 text-gray-700"
        >
          {s}
        </li>
      ))}
    </ul>
  );
};

/* ---------- Main component ---------- */

const ResumeSummary: React.FC<KeywordAnalysisProps> = ({ resumeData }) => {
  const { workExperience, projects, summary, skills, education, profile } =
    resumeData;

  return (
    <section className="text-sm text-gray-800 w-full">
      <div className="mb-6 max-w-3xl">
        <h1 className="text-xl font-semibold text-gray-900">Resume Parsing</h1>
        <p className="text-sm text-gray-700 mt-1">
          This section shows a structured breakdown of your resume as
          interpreted by our parsing system. It extracts key elements such as
          your professional summary, profile information, work experience,
          projects, skills, and education from the document you uploaded.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          The purpose of this view is to let you verify how your resume will
          appear to automated systems such as applicant tracking systems (ATS)
          and AI-powered recruiters. These systems often scan resumes without
          looking at design or layout, relying solely on the raw text and
          structure.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          As you review the parsed data, check for missing sections, incomplete
          entries, formatting issues, or misaligned information. Pay particular
          attention to job titles, company names, dates, and bullet points, as
          these are critical for keyword matching and ranking in ATS.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          If something appears incorrect or is not detected, consider adjusting
          your resume formatting. For example, simplify complex layouts, ensure
          headings are clear, and avoid embedding important text in images or
          graphics. You can then re-upload your updated resume to see if parsing
          improves.
        </p>
      </div>

      {/* Summary */}
      <Section
        title="Summary"
        id="summary"
        description="Your professional summary should be a brief, high-impact introduction at the top of your resume. 
Use it to highlight your most relevant skills, achievements, and career goals in 3–5 concise sentences. 
Tailor it to the specific job you’re applying for, focusing on the qualities and experience that align with the role. 
Avoid generic statements and overused buzzwords; instead, demonstrate value with specific expertise, accomplishments, or metrics when possible. 
This is also one of the best places to naturally integrate keywords and skills from the job description, improving your match score with applicant tracking systems (ATS) while keeping the text readable and authentic."
      >
        {summary?.trim() ? (
          <GridTable
            columns={['Description']}
            rows={[
              [
                <span className="text-sm text-gray-700 whitespace-pre-wrap">
                  {summary}
                </span>,
              ],
            ]}
          />
        ) : (
          <Placeholder>[Missing summary]</Placeholder>
        )}
      </Section>

      {/* Profile */}
      <Section
        title="Profile"
        id="profile"
        description="This section contains your core contact and personal information. 
Ensure that your name is formatted professionally and matches your official documents. 
Use a professional email address and include a phone number where you can be reliably reached. 
Links should direct to professional or relevant resources such as your LinkedIn profile, personal website, portfolio, or GitHub. 
Keep all information current and avoid including unnecessary personal details such as age, full address, or photos unless explicitly requested."
      >
        {profile ? (
          <GridTable
            columns={['Field', 'Value']}
            rows={[
              [
                'Name',
                profile.name?.trim() ? (
                  toTitleCase(profile.name)
                ) : (
                  <Placeholder>[Missing name]</Placeholder>
                ),
              ],
              [
                'Email',
                profile.email?.trim() ? (
                  profile.email
                ) : (
                  <Placeholder>[Missing email]</Placeholder>
                ),
              ],
              [
                'Phone',
                profile.phone?.trim() ? (
                  profile.phone
                ) : (
                  <Placeholder>[Missing phone]</Placeholder>
                ),
              ],
              ['Links', <LinkList links={profile.links} />],
            ]}
          />
        ) : (
          <Placeholder>[Missing profile]</Placeholder>
        )}
      </Section>

      {/* Experience */}
      <Section
        title="Experience"
        id="experience"
        description="This section should clearly outline your work history in reverse chronological order, starting with your most recent position. Include your job title, company, dates of employment, and concise bullet points describing your achievements and responsibilities. Focus on results and measurable impact rather than listing only duties. Use action verbs, keep each bullet point under two lines, and tailor your experience to highlight the skills and accomplishments most relevant to the role you're applying for."
      >
        {Array.isArray(workExperience) && workExperience.length > 0 ? (
          <GridTable
            columns={['Job Title', 'Company', 'Date', 'Bullet Points']}
            rows={workExperience.map((item) => [
              item.job_title?.trim() || (
                <Placeholder>[Missing job title]</Placeholder>
              ),
              item.company?.trim() || (
                <Placeholder>[Missing company]</Placeholder>
              ),
              item.date?.trim() || <Placeholder>[Missing date]</Placeholder>,
              <BulletList items={item.description} />,
            ])}
          />
        ) : (
          <Placeholder>[No experience data found]</Placeholder>
        )}
      </Section>

      {/* Projects */}
      <Section
        title="Projects"
        id="projects"
        description="Some roles, especially in software, engineering, marketing, and design, expect a dedicated projects section to showcase relevant work. In other fields, projects may be optional or better integrated into the experience section. Include projects that are relevant to the job you're applying for, highlight measurable results or impact, and keep descriptions concise. If possible, link to live demos, portfolios, or case studies so employers can see your work in action."
      >
        {Array.isArray(projects) && projects.length > 0 ? (
          <GridTable
            columns={['Title', 'Date', 'Bullet Points']}
            rows={projects.map((p) => [
              p.title?.trim() || <Placeholder>[Missing title]</Placeholder>,
              p.date?.trim() || <Placeholder>[Missing date]</Placeholder>,
              <BulletList items={p.description} />,
            ])}
          />
        ) : (
          <Placeholder>[No projects listed]</Placeholder>
        )}
      </Section>

      {/* Skills */}
      <Section title="Skills" id="skills">
        <ChipList items={skills} />
      </Section>

      {/* Education */}
      <Section title="Education" id="education">
        {Array.isArray(education) && education.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {education.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : (
          <Placeholder>[No education found]</Placeholder>
        )}
      </Section>
    </section>
  );
};

// Optional helper for reuse
const LinkList = ({ links }: { links?: string[] }) =>
  Array.isArray(links) && links.length > 0 ? (
    <ul className="list-none space-y-1">
      {links.map((link, i) => (
        <li key={i} className="text-blue-600 underline break-all">
          <a href={link} target="_blank" rel="noreferrer">
            {link}
          </a>
        </li>
      ))}
    </ul>
  ) : (
    <Placeholder>[No links provided]</Placeholder>
  );

export default ResumeSummary;
