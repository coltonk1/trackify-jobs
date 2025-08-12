import { readFile } from '@/lib/parsing/main';
import { getAuth } from 'firebase/auth';
import { useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  BlobProvider,
} from '@react-pdf/renderer';

export default function CoverLetterWriter({
  file,
  jobDescription,
}: {
  file: File;
  jobDescription: string;
}) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCoverLetter = async () => {
    if (!jobDescription) {
      setError('Job description required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();

      const arrayBuffer = await file.arrayBuffer();
      const resumeText = await readFile(arrayBuffer);

      const res = await fetch('/api/llm/cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      console.log(data);
      setCoverLetter(data.cover_letter.cover_letter || '');
    } catch (err: any) {
      setError(err.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const pdfStyles = StyleSheet.create({
    body: {
      padding: 40,
      fontSize: 12,
      fontFamily: 'Times-Roman',
      lineHeight: 1.6,
    },
    section: {
      marginBottom: 10,
    },
    text: {
      marginBottom: 6,
    },
  });

  const CoverLetterPDF = () => (
    <Document>
      <Page size="A4" style={pdfStyles.body}>
        <View style={pdfStyles.section}>
          {coverLetter.split('\n').map((line, i) => (
            <Text key={i} style={pdfStyles.text}>
              {line}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );

  return (
    <div className="">
      <div className="mt-4 flex items-center justify-between gap-2 mb-3">
        <button
          onClick={generateCoverLetter}
          disabled={loading}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer flex gap-2 items-center"
        >
          {loading ? 'Generating…' : 'Generate Cover Letter'}
          <img
            src={
              'https://media.nngroup.com/media/editor/2024/09/16/lyft_promotions_sparkles_icon.png'
            }
            alt="Uploaded resume preview"
            className="rounded aspect-square h-4 brightness-1000"
          />
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {coverLetter && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Generated Cover Letter</h2>
          <textarea
            className="w-full h-64 p-3 border border-gray-300 rounded text-sm font-mono outline-none"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />

          <div className="mt-4 mb-4">
            <BlobProvider document={<CoverLetterPDF />}>
              {({ url, loading: pdfLoading }) =>
                pdfLoading ? (
                  <p>Preparing PDF...</p>
                ) : (
                  <a
                    href={url as string}
                    download="cover-letter.pdf"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Download as PDF
                  </a>
                )
              }
            </BlobProvider>
          </div>
        </div>
      )}
    </div>
  );
}
