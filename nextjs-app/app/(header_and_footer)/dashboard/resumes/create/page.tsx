'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from '@react-pdf/renderer';
import { useState, useEffect, useRef } from 'react';
import { pdfjs } from 'react-pdf';
import { useSearchParams } from 'next/navigation';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import Link from 'next/link';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 10,
  },
  header: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  contactInfo: {
    fontSize: 11,
    marginBottom: 2,
  },
  subHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  bulletPoint: {
    marginRight: 4,
    fontSize: 11,
  },
  bulletText: {
    fontSize: 11,
    flex: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  jobTitle: {
    fontWeight: 'bold',
  },
  jobCompany: {
    marginBottom: 2,
  },
});

function ResumeDocument({ data }) {
  const {
    name,
    email,
    phone,
    linkedin,
    github,
    summary,
    education,
    experience,
    projects,
    skills,
    customSections,
  } = data;

  console.log(data);

  return (
    <Document>
      <Page style={styles.page} wrap>
        <View style={styles.section}>
          <Text style={styles.header}>{name}</Text>
          <Text style={styles.contactInfo}>
            {phone} | {email}
          </Text>
          <Text style={styles.contactInfo}>
            {linkedin} | {github}
          </Text>
        </View>

        {summary && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Summary</Text>
            <Text hyphenationCallback={(word) => [word]}>{summary}</Text>
          </View>
        )}

        {education?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Education</Text>
            {education.map((edu, i) => (
              <View key={i}>
                <View style={styles.jobHeader}>
                  <Text>{edu.school}</Text>
                  <Text>{edu.date}</Text>
                </View>
                <Text style={styles.jobCompany}>{edu.degree}</Text>
              </View>
            ))}
          </View>
        )}

        {experience?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Experience</Text>
            {experience.map((exp, idx) => (
              <View key={idx}>
                <View style={styles.jobHeader}>
                  <Text>{exp.title}</Text>
                  <Text>{exp.date}</Text>
                </View>
                <Text style={styles.jobCompany}>{exp.company}</Text>
                {exp.bullets.map((line, i) => (
                  <View style={styles.bulletRow} key={i}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text
                      hyphenationCallback={(word) => [word]}
                      style={styles.bulletText}
                    >
                      {line}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {projects?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Projects</Text>
            {projects.map((proj, idx) => (
              <View key={idx}>
                <View style={styles.jobHeader}>
                  <Text>{proj.name}</Text>
                  <Text>{proj.date}</Text>
                </View>
                {proj.bullets.map((line, i) => (
                  <View style={styles.bulletRow} key={i}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text
                      hyphenationCallback={(word) => [word]}
                      style={styles.bulletText}
                    >
                      {line}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {skills && Object.keys(skills).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Skills</Text>
            {Object.entries(skills).map(([category, items], i) => (
              <View key={i} style={{ marginBottom: 2 }}>
                <Text hyphenationCallback={(word) => [word]}>
                  <Text style={{ fontWeight: 'bold' }}>{category}: </Text>
                  <Text>{items.join(', ')}</Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        {customSections?.map((section, index) => (
          <View style={styles.section} key={index}>
            <Text style={styles.subHeader}>{section.name}</Text>
            {section.bullets.map((line, i) => (
              <View style={styles.bulletRow} key={i}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>{line}</Text>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

const defaultForm = {
  name: '',
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  summary: '',
  education: [{ degree: '', school: '', date: '' }],
  experience: [],
  projects: [],
  skills: {
    Languages: ['JavaScript', 'Python'],
    Tools: ['Git', 'Docker'],
  },
};

function SkillsInput({
  category,
  items,
  onChange,
  onRemove,
}: {
  category: string;
  items: string[];
  onChange: (items: string[]) => void;
  onRemove: () => void;
}) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      onChange([...items, input.trim()]);
      setInput('');
    }
    if (e.key === 'Backspace' && !input && items.length) {
      e.preventDefault();
      onChange(items.slice(0, -1));
    }
  };

  return (
    <div className="rounded-md border p-3 bg-gray-50 space-y-2">
      <input
        className="w-full rounded-md border px-2 py-1 text-sm font-semibold"
        value={category}
        onChange={(e) => {}}
        placeholder="Category (e.g., Languages)"
        disabled
      />
      <div className="flex flex-wrap gap-2">
        {items.map((skill, i) => (
          <span
            key={i}
            className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1"
          >
            {skill}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-indigo-600 hover:text-indigo-800"
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[100px] border-none outline-none text-sm"
          placeholder="Type and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button
        onClick={onRemove}
        className="text-sm text-red-600 hover:underline"
        type="button"
      >
        Remove Category
      </button>
    </div>
  );
}

export default function ResumeBuilder() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState(defaultForm);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load from query param if present
  useEffect(() => {
    const raw = searchParams.get('custom_resume');
    if (raw) {
      try {
        const decoded = decompressFromEncodedURIComponent(raw);
        const parsed = JSON.parse(decoded);
        if (parsed.rewrites) setForm(parsed.rewrites);
      } catch (err) {
        console.error('Invalid custom_resume JSON:', err);
      }
    }
  }, [searchParams]);

  // Render PDF live to canvas
  useEffect(() => {
    let renderTask: any;

    const renderPdfToCanvas = async () => {
      const blob = await pdf(<ResumeDocument data={form} />).toBlob();
      const url = URL.createObjectURL(blob);

      try {
        const loadingTask = pdfjs.getDocument(url);
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(1);

        const viewport = page.getViewport({ scale: 1.25 });
        const hiddenCanvas = hiddenCanvasRef.current;
        if (!hiddenCanvas) return;
        const hiddenCtx = hiddenCanvas.getContext('2d');
        if (!hiddenCtx) return;

        hiddenCanvas.width = viewport.width;
        hiddenCanvas.height = viewport.height;

        if (renderTask) renderTask.cancel();
        renderTask = page.render({ canvasContext: hiddenCtx, viewport });
        await renderTask.promise;

        const visibleCanvas = canvasRef.current;
        const visibleCtx = visibleCanvas?.getContext('2d');
        if (visibleCanvas && visibleCtx) {
          visibleCanvas.width = viewport.width;
          visibleCanvas.height = viewport.height;
          visibleCtx.clearRect(0, 0, viewport.width, viewport.height);
          visibleCtx.drawImage(hiddenCanvas, 0, 0);
        }
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    const timeout = setTimeout(() => renderPdfToCanvas(), 50); // debounce
    return () => {
      clearTimeout(timeout);
      if (renderTask) renderTask.cancel();
    };
  }, [form]);

  return (
    <div className="flex flex-col h-screen ">
      {/* ==== TOP BAR ==== */}
      <header className="flex justify-between items-center  border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-800">
            Resume Builder
          </h1>
          <button className="text-sm text-gray-600 hover:underline">
            Auto Adjust
          </button>
          <button className="text-sm text-gray-600 hover:underline">
            Template
          </button>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium">
            Save
          </button>
          <button
            onClick={async () => {
              const blob = await pdf(<ResumeDocument data={form} />).toBlob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'resume.pdf';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
          >
            Download PDF
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ==== LEFT: FORM ==== */}
        <aside className="w-96 border-r  overflow-y-auto p-6">
          {/* Basic Info */}
          <section className="space-y-3 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Basic Info
            </h2>
            {(['name', 'email', 'phone', 'linkedin', 'github'] as const).map(
              (key) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                    {key}
                  </label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    value={form[key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                </div>
              )
            )}
          </section>

          {/* Summary */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Summary
            </h2>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={form.summary}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, summary: e.target.value }))
              }
            />
          </section>

          {/* Education */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Education
            </h2>
            {form.education.map((edu, i) => (
              <div key={i} className="rounded-md border p-3 bg-gray-50 mb-2">
                <input
                  className="w-full mb-2 rounded border px-2 py-1 text-sm"
                  value={edu.degree}
                  placeholder="Degree"
                  onChange={(e) => {
                    const copy = [...form.education];
                    copy[i].degree = e.target.value;
                    setForm((f) => ({ ...f, education: copy }));
                  }}
                />
                <input
                  className="w-full mb-2 rounded border px-2 py-1 text-sm"
                  value={edu.school}
                  placeholder="School"
                  onChange={(e) => {
                    const copy = [...form.education];
                    copy[i].school = e.target.value;
                    setForm((f) => ({ ...f, education: copy }));
                  }}
                />
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={edu.date}
                  placeholder="Date"
                  onChange={(e) => {
                    const copy = [...form.education];
                    copy[i].date = e.target.value;
                    setForm((f) => ({ ...f, education: copy }));
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  education: [
                    ...f.education,
                    { degree: '', school: '', date: '' },
                  ],
                }))
              }
              className="text-sm text-indigo-600 hover:underline"
            >
              + Add Education
            </button>
          </section>

          {/* Skills Section */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Skills
            </h2>
            {Object.entries(form.skills).map(([category, items], i) => (
              <SkillsInput
                key={i}
                category={category}
                items={items}
                onChange={(updated) =>
                  setForm((f) => ({
                    ...f,
                    skills: { ...f.skills, [category]: updated },
                  }))
                }
                onRemove={() =>
                  setForm((f) => {
                    const newSkills = { ...f.skills };
                    delete newSkills[category];
                    return { ...f, skills: newSkills };
                  })
                }
              />
            ))}

            <button
              type="button"
              onClick={() => {
                const newCategory = prompt('Enter new skill category:');
                if (!newCategory) return;
                if (form.skills[newCategory]) {
                  alert('Category already exists.');
                  return;
                }
                setForm((f) => ({
                  ...f,
                  skills: { ...f.skills, [newCategory]: [] },
                }));
              }}
              className="text-sm text-indigo-600 hover:underline mt-2"
            >
              + Add Skill Category
            </button>
          </section>

          {/* Experience */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Experience
            </h2>
            {form.experience.map((exp, i) => (
              <div key={i} className="rounded-md border p-3 bg-gray-50 mb-2">
                <input
                  className="w-full mb-2 rounded border px-2 py-1 text-sm"
                  value={exp.title}
                  placeholder="Title"
                  onChange={(e) => {
                    const copy = [...form.experience];
                    copy[i].title = e.target.value;
                    setForm((f) => ({ ...f, experience: copy }));
                  }}
                />
                <input
                  className="w-full mb-2 rounded border px-2 py-1 text-sm"
                  value={exp.company}
                  placeholder="Company"
                  onChange={(e) => {
                    const copy = [...form.experience];
                    copy[i].company = e.target.value;
                    setForm((f) => ({ ...f, experience: copy }));
                  }}
                />
                <textarea
                  className="w-full rounded border px-2 py-1 text-sm font-mono"
                  value={exp.bullets.join('\n')}
                  placeholder="Bullet points, one per line"
                  onChange={(e) => {
                    const copy = [...form.experience];
                    copy[i].bullets = e.target.value.split('\n');
                    setForm((f) => ({ ...f, experience: copy }));
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  experience: [
                    ...f.experience,
                    { title: '', company: '', bullets: [''] },
                  ],
                }))
              }
              className="text-sm text-indigo-600 hover:underline"
            >
              + Add Experience
            </button>
          </section>

          {/* Projects */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Projects
            </h2>
            {form.projects.map((proj, i) => (
              <div key={i} className="rounded-md border p-3 bg-gray-50 mb-2">
                <input
                  className="w-full mb-2 rounded border px-2 py-1 text-sm"
                  value={proj.name}
                  placeholder="Project Name"
                  onChange={(e) => {
                    const copy = [...form.projects];
                    copy[i].name = e.target.value;
                    setForm((f) => ({ ...f, projects: copy }));
                  }}
                />
                <textarea
                  className="w-full rounded border px-2 py-1 text-sm font-mono"
                  value={proj.bullets.join('\n')}
                  placeholder="Bullet points, one per line"
                  onChange={(e) => {
                    const copy = [...form.projects];
                    copy[i].bullets = e.target.value.split('\n');
                    setForm((f) => ({ ...f, projects: copy }));
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  projects: [...f.projects, { name: '', bullets: [''] }],
                }))
              }
              className="text-sm text-indigo-600 hover:underline"
            >
              + Add Project
            </button>
          </section>
        </aside>

        {/* ==== MIDDLE: PREVIEW ==== */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-scroll">
          <div className="shadow-xl mt-50 bg-gray-300">
            <canvas ref={canvasRef} className="w-[700px] h-auto" />
            <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
          </div>
        </div>

        {/* ==== RIGHT: KEYWORDS / AI ==== */}
        <aside className="w-80 border-l p-6 space-y-6">
          {/* AI Rewrite Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              AI Tailoring
            </h4>
            <p className="text-xs text-gray-500">
              Paste a job description and let our AI adjust your resume to match
              the job description the best we can.
            </p>

            <textarea
              placeholder="Paste the job description here..."
              className="w-full h-28 resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-2">
              <button className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 text-sm font-medium">
                Auto Adjust
              </button>
              <Link
                href="/dashboard/resumes/analyze"
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 text-sm font-medium text-center"
              >
                Analyze Instead
              </Link>
            </div>

            {/* Fit Score Teaser */}
            <Link
              href="/dashboard/resumes/analyze"
              className="block bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition"
            >
              <p className="text-sm font-medium text-gray-700">Fit Score</p>
              <div className="h-2 bg-gray-200 rounded mt-1">
                <div
                  className="h-2 bg-green-600 rounded"
                  style={{ width: '68%' }} // example
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                68/100 — Click for full analysis
              </p>
            </Link>
          </div>

          {/* Keyword Matches */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Keyword Matches
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              These are the skills we were able to automatically recognize in
              your resume. This is a lightweight preview. For full analysis and
              scoring, use{' '}
              <span className="font-medium text-indigo-600">
                Analyze Resume
              </span>
              .
            </p>

            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Python</span> <span className="text-green-600">✓</span>
              </li>
              <li className="flex justify-between">
                <span>Machine Learning</span>{' '}
                <span className="text-red-600">✗</span>
              </li>
            </ul>
          </div>

          {/* Score Teaser */}
          <Link href="/dashboard/resumes/analyze" className="block">
            <p className="text-sm font-medium text-gray-700">Format Score</p>
            <div className="h-2 bg-gray-200 rounded mt-1">
              <div
                className="h-2 bg-indigo-600 rounded"
                style={{ width: '85%' }} // example score
              ></div>
            </div>
          </Link>

          {/* Analyze CTA */}
          <Link
            href="/dashboard/resumes/analyze"
            className="w-full bg-gray-200 py-2 rounded hover:bg-gray-300 text-sm font-medium block text-center transition-colors"
          >
            Full Analysis
          </Link>
        </aside>
      </div>
    </div>
  );
}
