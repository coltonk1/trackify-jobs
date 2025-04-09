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
    <nav
      id="navbar"
      className="p-4 text-white sticky top-0 z-100 backdrop-blur-lg"
      style={{ boxShadow: '0 0 15px #7583' }}
    >
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
              <span className="transition duration-300 px-4 py-2 text-white hover:bg-orange-500 hover:text-white rounded-md">
                Log in
              </span>
            </Link>
          </li>
          <li>
            <Link href={'/signup'}>
              <span className="transition duration-300 border-2 border-white text-white px-4 py-2 rounded-md hover:bg-orange-500 hover:text-white">
                Sign up
              </span>
            </Link>
          </li>
        </ul>
      </div>
      <div className="bg-gradient-to-r from-transparent via-[#fff3] to-transparent w-full h-[2px] absolute bottom-0"></div>
    </nav>
  );
};

export default Navbar;
