import { useRef, useState } from 'react';

import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

export default function PdfViewer({ file }: { file: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="relative" ref={containerRef}>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="">
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            className="mb-4 border-1 border-gray-300 rounded-sm overflow-hidden"
          />
        ))}
      </Document>
    </div>
  );
}
