'use client';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Briefcase,
  Clock,
  FileText,
  PencilRuler,
  ArrowUpCircle,
  Check,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';

import Blob from '../assets/Blob';
import Svg1 from '@/assets/heroleft1.svg';
import Svg2 from '@/assets/heroleft2.svg';
import SvgM1 from '@/assets/herom1.svg';
import SvgM2 from '@/assets/herom2.svg';
import heroimage from '../assets/image.png';
export const MotionDiv = motion.div;

const pricingFeatures = [
  { feature: 'Job Tracking', free: '10 jobs', pro: 'Unlimited' },
  { feature: 'Reminders', free: true, pro: true },
  { feature: 'Cloud Sync', free: false, pro: true },
  { feature: 'Resume Scan', free: 'Basic', pro: 'Advanced' },
  { feature: 'Resume Builder', free: false, pro: true },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section
      className="h-[calc(100vh-100px)] my-6 w-[calc(100vw-40px)] mx-5 px-10 text-white relative z-0 rounded-3xl overflow-hidden shadow-lg"
      style={{
        background: 'radial-gradient(#B863DE 40%, #9242D7)',
        backgroundPositionX: '15vw',
      }}
    >
      <Image src={Svg1} alt="bg" className="absolute left-0 bottom-0 -z-10" />
      <Image src={Svg2} alt="bg" className="absolute left-0 bottom-0 -z-20" />

      <div className="h-full flex mx-auto items-center w-5/6 gap-x-32">
        <div className="flex-1 flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h1 className="font-bold text-6xl leading-tight">
              Stay Organized in Your Job Search
            </h1>
            <p>
              Track applications, store resumes, and get insights into your job
              prospects.
            </p>
          </div>

          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white w-fit">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="flex h-full items-center justify-center flex-1">
          <Image
            src={SvgM2}
            alt="bg"
            className="absolute z-10 h-[110vh] w-auto translate-y-[5vh]"
          />
          <Image
            src={SvgM1}
            alt="bg"
            className="absolute z-10 h-[70vh] w-auto"
          />
          <Image
            src={heroimage}
            alt=""
            className="absolute z-10 h-[45vh] w-auto"
          />
        </div>
      </div>
    </section>
  );
}

const enhancedFeatures = [
  {
    icon: <Briefcase className="w-6 h-6 text-purple-600" />,
    title: 'Stay Organized',
    desc: 'Track every job you apply to with one clean dashboard.',
  },
  {
    icon: <Clock className="w-6 h-6 text-purple-600" />,
    title: 'Never Miss a Deadline',
    desc: 'Set alerts for interviews, follow-ups, and deadlines.',
  },
  {
    icon: <FileText className="w-6 h-6 text-purple-600" />,
    title: 'Check Your Resume',
    desc: 'Instantly scan your resume and get real-time ATS feedback.',
  },
  {
    icon: <PencilRuler className="w-6 h-6 text-purple-600" />,
    title: 'Create Resumes Easily',
    desc: 'Design clean, professional resumes in minutes.',
  },
  {
    icon: <ArrowUpCircle className="w-6 h-6 text-purple-600" />,
    title: 'Upgrade for More',
    desc: 'Unlock cloud sync, pro scans, and unlimited job tracking.',
  },
];

function FeaturesSection() {
  return (
    <section
      className="relative w-full py-32 overflow-hidden mx-auto"
      id="features"
    >
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-black">
        <h2 className="text-4xl font-bold text-center mb-20 text-[#6F42C1]">
          What You’ll Get
        </h2>

        <div className="grid md:grid-cols-2 gap-y-20 gap-x-16 relative">
          {enhancedFeatures.map((f, idx) => (
            <MotionDiv
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-md transition hover:scale-[1.02]`}
            >
              <div className="flex flex-col items-start gap-4">
                <div className="p-3 bg-[#f0e8fb] rounded-full">{f.icon}</div>
                <h3 className="text-xl font-semibold text-black">{f.title}</h3>
                <p className="text-sm text-black/70">{f.desc}</p>
              </div>
            </MotionDiv>
          ))}
        </div>

        <div className="mt-24 text-center">
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-base">
              Start Using TrackifyJobs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="border-t border-[#B863DE]/20 py-32 w-full" id="pricing">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="bg-white/80 rounded-3xl p-12 backdrop-blur-md border border-black/10 shadow-md">
          <h2 className="text-4xl font-bold text-center text-black mb-12">
            Compare Plans
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left">
              <thead>
                <tr className="text-gray-700">
                  <th className="w-1/3 py-4 px-4 text-base font-semibold text-black">
                    Features
                  </th>
                  <th className="text-center py-4 px-6 font-semibold bg-white/60 rounded-t-xl">
                    Free
                  </th>
                  <th className="text-center py-4 px-6 font-semibold bg-orange-100/80 rounded-t-xl border-l border-orange-300">
                    Pro{' '}
                    <span className="text-orange-500 font-normal">($8/mo)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pricingFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/50 transition">
                    <td className="py-3 px-4 font-medium text-black/90">
                      {row.feature}
                    </td>
                    <td className="text-center py-3 px-6">
                      {renderValue(row.free)}
                    </td>
                    <td className="text-center py-3 px-6">
                      {renderValue(row.pro)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-300">
                  <td></td>
                  <td className="text-center py-6">
                    <Button className="w-28 bg-gray-300 hover:bg-gray-400 text-black">
                      Start Free
                    </Button>
                  </td>
                  <td className="text-center py-6">
                    <Button className="w-28 bg-orange-500 hover:bg-orange-600 text-white">
                      Go Pro
                    </Button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderValue(value: any) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="text-green-500 w-5 h-5" />
    ) : (
      <X className="text-red-400 w-5 h-5" />
    );
  }
  return <span>{value}</span>;
}

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Sign Up',
      description:
        'Create your free account in seconds. No credit card required.',
    },
    {
      number: '02',
      title: 'Add Jobs',
      description: 'Track applications manually or with auto-import tools.',
    },
    {
      number: '03',
      title: 'Stay Ahead',
      description: 'Set reminders, scan resumes, and get smart suggestions.',
    },
  ];

  return (
    <section
      className="bg-gray-50 py-28 w-full border-t border-[#B863DE]/20"
      id="how-it-works"
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-16 text-center text-black">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center bg-white/80 rounded-xl p-8 shadow-md w-full transition hover:shadow-xl"
            >
              <div className="bg-orange-500 text-white w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-black/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
