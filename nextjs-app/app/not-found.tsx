import Link from 'next/link';
import '@/app/globals.css';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[50rem] font-extrabold text-gray-100/40 select-none pointer-events-none">
          404
        </span>
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>

        <h2 className="mt-4 text-2xl font-semibold text-gray-900">
          Page not found
        </h2>

        <p className="mt-2 max-w-md text-gray-600">
          The page you’re looking for doesn’t exist, has been moved, or is
          temporarily unavailable.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/"
            aria-label="Return to homepage"
            className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            Go Home
          </Link>
          <Link
            href="/contact"
            aria-label="Contact support"
            className="rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
