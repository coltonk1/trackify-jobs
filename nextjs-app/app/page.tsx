import Link from 'next/link';
import Blob from '../assets/Blob';
import Image from 'next/image';
import Svg1 from '@/assets/heroleft1.svg';
import Svg2 from '@/assets/heroleft2.svg';

import SvgM1 from '@/assets/herom1.svg';
import SvgM2 from '@/assets/herom2.svg';
import heroimage from '../assets/image.png';

const features = [
  ['Stay Organized', 'Track all your job applications in one place.'],
  [
    'Never Miss a Deadline',
    'Get reminders for applications, interviews, and follow-ups.',
  ],
  ['Check Your Resume', 'See how well your resume performs in ATS scans.'],
  [
    'Create Resumes Easily',
    'Generate clean, professional resumes with our built-in creator.',
  ],
  [
    'Upgrade for More',
    'Go Pro for unlimited tracking, cloud sync, and in-depth insights.',
  ],
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section
      className="h-screen mt-[-66px] w-screen overflow-hidden text-white relative z-0"
      style={{
        background: 'radial-gradient(#B863DE 40%, #9242D7)',
        backgroundPositionX: '15vw',
      }}
    >
      <Image src={Svg1} alt="bg" className="absolute left-0 bottom-0 -z-10" />
      <Image src={Svg2} alt="bg" className="absolute left-0 bottom-0 -z-20" />
      <div className="h-full flex mx-auto items-center w-5/6 gap-x-32">
        <div className="flex-1 flex flex-col gap-16">
          <div className="flex flex-col gap-4">
            <h1 className="font-bold text-6xl">
              Stay Organized in Your Job Search
            </h1>
            <p>
              Track applications, store resumes, and get insights into your job
              prospects.
            </p>
          </div>

          <Link
            href="/"
            className="px-8 py-2 bg-orange-500 rounded-md text-white block w-fit font-medium"
          >
            <span>Get Started</span>
          </Link>
        </div>
        <div className="flex h-full items-center justify-center flex-1">
          <Image
            className="absolute z-10 h-[110vh] w-fit translate-y-[5vh]"
            src={SvgM2}
            alt="bg"
            height={1000}
            width={1000}
          />
          <Image
            className="absolute z-10 h-[70vh] w-fit"
            src={SvgM1}
            alt="bg"
            height={1000}
            width={1000}
          />

          <Image
            src={heroimage}
            width={700}
            height={700}
            alt={''}
            className="absolute z-10 h-[45vh] w-fit"
          />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-32 relative w-full" id="features">
      <div className="h-[10px]">
        <div className="h-full text-[#6F42C1] absolute -top-0 -translate-y-1/2 -left-0 -translate-x-1/2 -z-10 scale-50">
          <Blob />
        </div>

        <div className="h-full text-[#6F42C1] absolute -top-0 -translate-y-1/2 -left-0 -translate-x-1/2 -z-10 rotate-10 scale-60 opacity-25">
          <Blob />
        </div>

        <div className="h-full text-[#6F42C1] absolute -top-0 -translate-y-1/2 -left-0 -translate-x-1/2 -z-10 rotate-20 scale-70 opacity-25">
          <Blob />
        </div>
      </div>

      <div className="h-[10px]">
        <div className="z-10 h-full text-[#6F42C1] absolute -bottom-0 translate-y-1/2 -right-0 translate-x-1/2 scale-50">
          <Blob />
        </div>

        <div className="z-10 h-full text-[#6F42C1] absolute -bottom-0 translate-y-1/2 -right-0 translate-x-1/2 rotate-10 scale-60 opacity-25">
          <Blob />
        </div>

        <div className="z-10 h-full text-[#6F42C1] absolute -bottom-0 translate-y-1/2 -right-0 translate-x-1/2 rotate-20 scale-70 opacity-25">
          <Blob />
        </div>
      </div>
      <div className="max-w-4xl mx-auto z-20 relative bg-[#fff9] p-8 rounded-4xl backdrop-blur-md">
        <h2 className="font-bold text-4xl mb-4">Key Features</h2>
        <p className="mb-24 text-justify">
          TrackifyJobs makes it easy to organize your job search. Keep track of
          your applications, store your resume, and access everything from any
          device. With simple tools to help you stay on top of deadlines and
          progress, you can focus on finding the right job for you.
        </p>
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-16">
          {features.map((feature, index) => {
            return (
              <div key={index} className="p-4">
                <p className="opacity-80">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="font-bold mb-4 text-xl">{feature[0]}</h3>
                <p>{feature[1]}</p>
              </div>
            );
          })}
        </div>
        <Link
          href="/"
          className="px-8 py-2 bg-orange-500 rounded-md text-white block w-fit mx-auto mt-24"
        >
          <span>Get Started</span>
        </Link>
      </div>
    </section>
  );
}

function PricingSection({}) {
  return (
    <section
      className="h-screen w-full bg-gradient-to-b from-[#ededed] to-[#b3a2d3] relative py-32"
      id="pricing"
    >
      <div className='absolute left-0 top-0 bg-[url("../assets/bg-square.png")] bg-[length:0.75%] w-full h-full z-0'></div>

      <div className="z-10 relative mx-auto max-w-4xl">
        <h2 className="font-bold text-4xl mb-4 text-center">Pricing</h2>
      </div>
    </section>
  );
}
