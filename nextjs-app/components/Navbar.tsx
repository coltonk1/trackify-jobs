import Link from 'next/link';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-white/10 shadow-sm">
      <div className="container px-4 md:px-6 flex items-center justify-between py-3">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-6 text-black">
          <Link href="/" className="text-2xl font-bold">
            TrackifyJobs
          </Link>
          <ul className="hidden md:flex gap-6">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="hover:text-orange-300 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Auth Buttons */}
        <div className="flex gap-2">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-black hover:text-orange-400"
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="outline"
              className="border-black text-black hover:bg-orange-500"
            >
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
