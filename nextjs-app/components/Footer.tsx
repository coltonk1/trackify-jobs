import Link from 'next/link';

/* Footer */
export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-lg bg-purple-600" aria-hidden />
            <span className="font-semibold">TrackifyJobs</span>
          </div>
          <p className="text-gray-600">
            Build stronger materials. Apply with confidence. Keep everything in
            one place.
          </p>
        </div>
        <div>
          <p className="font-semibold mb-2">Product</p>
          <ul className="space-y-1 text-gray-600">
            <li>
              <Link href="/features" className="hover:text-gray-900">
                Features
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-gray-900">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-gray-900">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Company</p>
          <ul className="space-y-1 text-gray-600">
            <li>
              <Link href="/privacy" className="hover:text-gray-900">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-gray-900">
                Terms
              </Link>
            </li>
            <li>
              <Link
                href={'/a'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900"
              >
                Report an issue
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Contact</p>
          <ul className="space-y-1 text-gray-600">
            <li>
              <Link
                href="mailto:support@trackifyjobs.com"
                className="hover:text-gray-900"
              >
                support@trackifyjobs.com
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="px-4 pb-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} TrackifyJobs. All rights reserved.
      </div>
    </footer>
  );
}
