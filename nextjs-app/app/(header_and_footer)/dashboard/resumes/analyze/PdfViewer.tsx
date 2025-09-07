import { useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

export default function PdfViewer({ file }: { file: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="sticky top-20">
      {/* Fullscreen Button */}
      <button
        onClick={toggleFullScreen}
        className="absolute top-2 left-2 z-50 bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700"
      >
        Fullscreen
      </button>

      {/* PDF Container */}
      <div
        ref={viewerRef}
        className="w-full h-[85vh] overflow-y-auto shadow-md flex justify-center bg-gray-100 p-5"
      >
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          {Array.from({ length: numPages || 0 }, (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={Math.min(window.innerWidth * 0.5, 800)} // max ~50% screen or 800px
              renderAnnotationLayer={false}
              renderTextLayer={false}
              className="mb-4 border-gray-200 border-b-2"
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
