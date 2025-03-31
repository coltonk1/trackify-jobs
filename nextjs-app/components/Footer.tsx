import Link from 'next/link';

// components/Footer.tsx
const Footer = () => {
  return (
    <footer className="mt-auto bg-[#6F42C1] p-8 text-white">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 md:mb-0">
            <p>
              &copy; {new Date().getFullYear()} ExampleSite. All rights
              reserved.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/" className="hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-gray-300">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-gray-300">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
