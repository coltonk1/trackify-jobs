// components/Navbar.tsx
import Link from 'next/link';

interface LinkType {
  href: string;
  label: string;
}

const Navbar = () => {
  const links: LinkType[] = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <nav className="bg-[#fff] p-4 text-black border-b-2 border-[#501c6e36] sticky top-0 z-100">
      <div className="container mx-auto flex items-center justify-between gap-8">
        <Link href="/" className="text-2xl font-bold">
          TrackifyJobs
        </Link>
        <ul className="flex ml-0 mr-auto">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>
                <span className="transition duration-300 hover:text-gray-400 px-4 py-2">
                  {link.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <ul className="flex space-x-4">
          <li>
            <Link href={'/login'}>
              <span className="transition duration-300 px-4 py-2 text-orange-500 hover:bg-orange-500 hover:text-white rounded-md">
                Log in
              </span>
            </Link>
          </li>
          <li>
            <Link href={'/signup'}>
              <span className="transition duration-300 border-2 border-orange-500 text-orange-500 px-4 py-2 rounded-md hover:bg-orange-500 hover:text-white">
                Sign up
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
