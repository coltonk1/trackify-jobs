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
    marginBottom: 12,
  },
  header: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  contactInfo: {
    fontSize: 10,
    marginBottom: 2,
  },
  subHeader: {
    fontSize: 13,
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

        <View style={styles.section}>
          <Text style={styles.subHeader}>Summary</Text>
          <Text>{summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Education</Text>
          <Text>{education}</Text>
        </View>

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
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

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
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Skills</Text>
          <Text>{skills}</Text>
        </View>

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
  name: 'First Last',
  email: 'email@example.com',
  phone: '123-456-7890',
  linkedin: 'linkedin.com/in/yourprofile',
  github: 'github.com/yourhandle',
  summary:
    'Aspiring software engineer with hands-on experience in full-stack development, API integration, and collaborative project delivery. Skilled in modern web technologies and driven to build scalable, maintainable applications.',
  education: 'B.S. in Computer Science, Example University, 2025',
  experience: [
    {
      title: 'Software Developer Intern',
      company: 'Example Company',
      date: 'May 2024 – Aug 2024',
      bullets: [
        'Developed web-based tools using a modern JavaScript framework and integrated backend services',
        'Collaborated with a team to launch internal tools that reduced manual processes by 30%',
        'Wrote unit and integration tests to improve code reliability and maintainability',
      ],
    },
    {
      title: 'Tech Support Assistant',
      company: 'Campus IT Services',
      date: 'Jan 2023 – May 2024',
      bullets: [
        'Handled technical support requests and resolved hardware/software issues for students and staff',
        'Documented troubleshooting procedures and trained new support staff',
        'Assisted in deploying updates across lab computers using scripting tools',
      ],
    },
  ],
  projects: [
    {
      name: 'Project One',
      date: '2024',
      bullets: [
        'Built a full-stack application for managing tasks using a modern web framework and REST APIs',
        'Implemented authentication and data persistence with a cloud-based backend',
        'Deployed the project using CI/CD and containerization tools',
      ],
    },
    {
      name: 'Project Two',
      date: '2023',
      bullets: [
        'Created an interactive frontend for visualizing user metrics using charting libraries',
        'Connected frontend to a backend service to fetch and cache data efficiently',
        'Focused on responsive design and performance optimization',
      ],
    },
  ],
  skills: 'JavaScript, Python, React, Node.js, SQL, Git, Docker, REST APIs',
};

export default function ResumeBuilder() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState(defaultForm);
  const canvasRef = useRef<HTMLCanvasElement>(null); // visible
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null); // offscreen
  const [sectionOrder, setSectionOrder] = useState([
    'summary',
    'education',
    'experience',
    'projects',
    'skills',
    'customSections',
  ]);

  useEffect(() => {
    const raw = searchParams.get('custom_resume');
    if (raw) {
      try {
        const decoded = decompressFromEncodedURIComponent(raw);
        const parsed = JSON.parse(decoded);
        console.log(parsed);
        setForm(parsed);
      } catch (err) {
        console.error('Invalid custom_resume JSON:', err);
      }
    }
  }, [searchParams]);

  // Render PDF to canvas on form update
  useEffect(() => {
    const renderPdfToCanvas = async () => {
      const blob = await pdf(<ResumeDocument data={form} />).toBlob();
      const url = URL.createObjectURL(blob);

      try {
        const loadingTask = pdfjs.getDocument(url);
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(1);

        const viewport = page.getViewport({ scale: 1.5 });
        const hiddenCanvas = hiddenCanvasRef.current;
        if (!hiddenCanvas) return;
        const hiddenCtx = hiddenCanvas.getContext('2d');
        if (!hiddenCtx) return;

        hiddenCanvas.width = viewport.width;
        hiddenCanvas.height = viewport.height;

        await page.render({ canvasContext: hiddenCtx, viewport }).promise;

        // After rendering, copy hidden canvas to visible one
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

    renderPdfToCanvas();
  }, [form]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Resume Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        {/* ==== LEFT PANEL: FORM ==== */}
        <div className="space-y-4">
          {/* Basic Info */}
          {[
            'name',
            'email',
            'phone',
            'linkedin',
            'github',
            'education',
            'skills',
          ].map((key) => (
            <div key={key}>
              <label className="block mb-1 font-medium capitalize">{key}</label>
              <input
                className="border p-2 w-full"
                value={form[key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            </div>
          ))}

          {/* Summary */}
          <div>
            <label className="block mb-1 font-medium">Summary</label>
            <textarea
              className="border p-2 w-full"
              value={form.summary}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, summary: e.target.value }))
              }
            />
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-lg font-semibold">Experience</h2>
            {form.experience.map((exp, i) => (
              <div key={i} className="border p-2 mb-2 space-y-2">
                <input
                  className="w-full border p-1"
                  value={exp.title}
                  placeholder="Title"
                  onChange={(e) => {
                    const copy = [...form.experience];
                    copy[i].title = e.target.value;
                    setForm((f) => ({ ...f, experience: copy }));
                  }}
                />
                <input
                  className="w-full border p-1"
                  value={exp.company}
                  placeholder="Company"
                  onChange={(e) => {
                    const copy = [...form.experience];
                    copy[i].company = e.target.value;
                    setForm((f) => ({ ...f, experience: copy }));
                  }}
                />
                <input
                  className="w-full border p-1"
                  value={exp.date}
                  placeholder="Date"
                  onChange={(e) => {
                    const copy = [...form.experience];
                    copy[i].date = e.target.value;
                    setForm((f) => ({ ...f, experience: copy }));
                  }}
                />
                <textarea
                  className="w-full border p-1 font-mono"
                  value={exp.bullets.join('\n')}
                  placeholder="Bullet points, one per line"
                  onChange={(e) => {
                    const copy = [...form.experience];
                    copy[i].bullets = e.target.value.split('\n');
                    setForm((f) => ({ ...f, experience: copy }));
                  }}
                />
                <button
                  onClick={() => {
                    const filtered = form.experience.filter((_, j) => j !== i);
                    setForm((f) => ({ ...f, experience: filtered }));
                  }}
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  experience: [
                    ...f.experience,
                    { title: '', company: '', date: '', bullets: [''] },
                  ],
                }))
              }
              className="text-sm text-blue-600"
            >
              Add Experience
            </button>
          </div>

          {/* Projects */}
          <div>
            <h2 className="text-lg font-semibold">Projects</h2>
            {form.projects.map((proj, i) => (
              <div key={i} className="border p-2 mb-2 space-y-2">
                <input
                  className="w-full border p-1"
                  value={proj.name}
                  placeholder="Project Name"
                  onChange={(e) => {
                    const copy = [...form.projects];
                    copy[i].name = e.target.value;
                    setForm((f) => ({ ...f, projects: copy }));
                  }}
                />
                <input
                  className="w-full border p-1"
                  value={proj.date}
                  placeholder="Date"
                  onChange={(e) => {
                    const copy = [...form.projects];
                    copy[i].date = e.target.value;
                    setForm((f) => ({ ...f, projects: copy }));
                  }}
                />
                <textarea
                  className="w-full border p-1 font-mono"
                  value={proj.bullets.join('\n')}
                  placeholder="Bullet points, one per line"
                  onChange={(e) => {
                    const copy = [...form.projects];
                    copy[i].bullets = e.target.value.split('\n');
                    setForm((f) => ({ ...f, projects: copy }));
                  }}
                />
                <button
                  onClick={() => {
                    const filtered = form.projects.filter((_, j) => j !== i);
                    setForm((f) => ({ ...f, projects: filtered }));
                  }}
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  projects: [
                    ...f.projects,
                    { name: '', date: '', bullets: [''] },
                  ],
                }))
              }
              className="text-sm text-blue-600"
            >
              Add Project
            </button>
          </div>

          {/* Custom Sections */}
          {/* <div>
            <h2 className="text-lg font-semibold">Custom Sections</h2>
            {(form.customSections || []).map((sec, i) => (
              <div key={i} className="border p-2 mb-2 space-y-2">
                <input
                  className="w-full border p-1"
                  value={sec.name}
                  placeholder="Section Name (e.g. Awards)"
                  onChange={(e) => {
                    const copy = [...form.customSections];
                    copy[i].name = e.target.value;
                    setForm((f) => ({ ...f, customSections: copy }));
                  }}
                />
                <textarea
                  className="w-full border p-1 font-mono"
                  value={sec.bullets.join('\n')}
                  placeholder="Bullet points, one per line"
                  onChange={(e) => {
                    const copy = [...form.customSections];
                    copy[i].bullets = e.target.value.split('\n');
                    setForm((f) => ({ ...f, customSections: copy }));
                  }}
                />
                <button
                  onClick={() => {
                    const filtered = form.customSections.filter(
                      (_, j) => j !== i
                    );
                    setForm((f) => ({ ...f, customSections: filtered }));
                  }}
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  customSections: [
                    ...(f.customSections || []),
                    { name: '', bullets: [''] },
                  ],
                }))
              }
              className="text-sm text-blue-600"
            >
              Add Custom Section
            </button>
          </div> */}

          {/* Section Order */}
          {/* <div>
            <h2 className="text-lg font-semibold">Section Order</h2>
            {sectionOrder.map((sec, i) => (
              <div key={sec} className="flex items-center gap-2 mb-1">
                <span className="capitalize">{sec}</span>
                <button
                  onClick={() => {
                    if (i === 0) return;
                    const copy = [...sectionOrder];
                    [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
                    setSectionOrder(copy);
                  }}
                >
                  ↑
                </button>
                <button
                  onClick={() => {
                    if (i === sectionOrder.length - 1) return;
                    const copy = [...sectionOrder];
                    [copy[i + 1], copy[i]] = [copy[i], copy[i + 1]];
                    setSectionOrder(copy);
                  }}
                >
                  ↓
                </button>
              </div>
            ))}
          </div>*/}
        </div>

        {/* ==== RIGHT PANEL: LIVE PREVIEW ==== */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Live Preview</h2>
          <div className="border shadow-md p-2 bg-white">
            <canvas ref={canvasRef} className="w-full h-auto" />
            <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
          </div>
        </div>
      </div>

      {/* ==== DOWNLOAD BUTTON ==== */}
      <button
        onClick={async () => {
          const blob = await pdf(<ResumeDocument data={form} />).toBlob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'resume.pdf';
          a.click();
          URL.revokeObjectURL(url);
          console.log(form);
        }}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Download Resume
      </button>
    </div>
  );
}
