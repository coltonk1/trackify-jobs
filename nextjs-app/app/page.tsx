import Link from 'next/link';
import Blob from '../assets/Blob';
import Image from 'next/image';
import Svg1 from '@/assets/heroleft1.svg';
import Svg2 from '@/assets/heroleft2.svg';
import SvgM1 from '@/assets/herom1.svg';
import SvgM2 from '@/assets/herom2.svg';
import heroimage from '../assets/image.png';

const highlights = [
  {
    title: 'Organize Everything',
    description:
      'Keep all your job applications, resumes, and notes in one centralized dashboard.',
  },
  {
    title: 'Smarter Resumes',
    description:
      'Parse, score, and improve your resume to pass ATS filters and get interviews.',
  },
  {
    title: 'Built for Students & Grads',
    description:
      'Lightweight, intuitive, and made for first-time job seekers and internship hunters.',
  },
];

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full">
      <HeroSection />
      <HighlightsSection />
      <QuickLinksSection />
      <CTASection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-500 to-purple-700 text-white overflow-hidden">
      <Image src={Svg1} alt="bg" className="absolute left-0 bottom-0 -z-10" />
      <Image src={Svg2} alt="bg" className="absolute left-0 bottom-0 -z-20" />

      <div className="w-5/6 max-w-6xl flex flex-col-reverse md:flex-row items-center gap-16">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h1 className="text-5xl font-bold leading-tight">
            Your All-In-One Job Search Platform
          </h1>
          <p className="text-lg">
            Organize applications, generate resumes, and track your progress
            with ease.
          </p>
          <Link
            href="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-md"
          >
            Get Started
          </Link>
        </div>
        <div className="relative flex-1 h-[400px] md:h-[500px]">
          <Image src={SvgM2} alt="bg" className="absolute z-0 h-full w-auto" />
          <Image
            src={SvgM1}
            alt="bg"
            className="absolute z-10 h-[70%] w-auto left-10"
          />
          <Image
            src={heroimage}
            alt="hero"
            className="relative z-20 h-[60%] mx-auto"
          />
        </div>
      </div>
    </section>
  );
}

function HighlightsSection() {
  return (
    <section className="py-24 px-4 w-full bg-gray-50 text-center">
      <h2 className="text-3xl font-bold mb-12">Why TrackifyJobs?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {highlights.map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickLinksSection() {
  return (
    <section className="py-24 px-4 w-full bg-white text-center">
      <h2 className="text-3xl font-bold mb-12">
        Learn More About TrackifyJobs
      </h2>
      <div className="flex flex-col md:flex-row justify-center gap-8">
        <Link
          href="/features"
          className="border border-gray-300 px-8 py-6 rounded-lg shadow hover:shadow-md transition w-full max-w-xs"
        >
          <h3 className="text-xl font-semibold mb-2">Features</h3>
          <p className="text-gray-600">See what you can do with TrackifyJobs</p>
        </Link>
        <Link
          href="/pricing"
          className="border border-gray-300 px-8 py-6 rounded-lg shadow hover:shadow-md transition w-full max-w-xs"
        >
          <h3 className="text-xl font-semibold mb-2">Pricing</h3>
          <p className="text-gray-600">
            Free during beta. Future plans explained
          </p>
        </Link>
        <Link
          href="/faq"
          className="border border-gray-300 px-8 py-6 rounded-lg shadow hover:shadow-md transition w-full max-w-xs"
        >
          <h3 className="text-xl font-semibold mb-2">FAQs</h3>
          <p className="text-gray-600">Common questions, clearly answered</p>
        </Link>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-4 bg-purple-600 text-white text-center w-full">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Organized?</h2>
        <p className="mb-6 text-lg">
          Sign up now and take control of your job hunt with TrackifyJobs. It’s
          free while we’re in beta.
        </p>
        <Link
          href="/"
          className="inline-block bg-white text-purple-700 font-semibold px-6 py-3 rounded-md hover:bg-gray-100"
        >
          Start Now
        </Link>
      </div>
    </section>
  );
}
