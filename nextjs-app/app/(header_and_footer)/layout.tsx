import type { Metadata } from 'next';
// import { Geist, Geist_Mono } from "next/font/google";
import '@/app/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthWrapper from '@/components/AuthWrapper';

// const geistSans = Geist({
//     variable: "--font-geist-sans",
//     subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//     variable: "--font-geist-mono",
//     subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: 'App Title',
  description: 'App descriptino',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased min-h-screen flex flex-col overflow-x-hidden`}
      >
        <AuthWrapper>
          <div className="bg-yellow-100 text-yellow-800 text-center p-2 text-sm">
            Currently in <strong>Early Access</strong>. For any issues, please{' '}
            <a
              href="/a"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:text-yellow-900"
            >
              report them here
            </a>
            .
          </div>
          <Navbar />
          {children}
          <Footer />
        </AuthWrapper>
      </body>
    </html>
  );
}
