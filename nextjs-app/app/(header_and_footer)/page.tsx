'use client';

// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import heroImage from '@/assets/heroimage.png';
import Svg1 from '@/assets/heroleft1.svg';
import Svg2 from '@/assets/heroleft2.svg';
import SvgM1 from '@/assets/herom1.svg';
import SvgM2 from '@/assets/herom2.svg';
import Marquee from 'react-fast-marquee';
import { CheckCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white text-gray-900">
      <HeroNew />
      <UniversitiesMarquee />
      {/* <StatsStrip /> */}
      <FeaturesObjectionSection />
      <SocialProof />
      <FAQSection />
      {/* <BenefitsCards /> */}
      {/* <Timeline />
      <TestimonialsScroll />
      <PrivacySplit />
      <PricingPreviewNew />
      <FAQAccordions /> */}
      <FinalCTA />
      <FoundersNote />
    </main>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: 'Why wouldn’t I just use Google Sheets or Notion for free?',
      a: 'You can, but spreadsheets weren’t built for job hunting. TrackifyJobs gives you resume scoring, follow-up reminders, and one clear dashboard built specifically for landing interviews — without the setup or clutter.',
    },
    {
      q: 'Do I really need another tool to manage my job search?',
      a: 'Most trackers feel like extra work. TrackifyJobs replaces them by combining resumes, applications, and deadlines into one view. It’s faster than juggling tools and keeps you focused on actually applying.',
    },
    {
      q: 'I don’t have time to keep this updated.',
      a: 'That’s exactly why TrackifyJobs exists. You can add jobs from links in seconds, auto-categorize applications, and get instant resume feedback. Updating takes less time than opening your spreadsheet.',
    },
    {
      q: 'Does resume scoring even work?',
      a: 'Yes. TrackifyJobs uses ATS-style keyword checks and formatting analysis to highlight what recruiters actually see. It’s not a guarantee, but it’s a clear edge over sending un-optimized resumes blindly.',
    },
    {
      q: 'What happens when I’m done job hunting?',
      a: 'Cancel anytime. There are no contracts or lock-ins. Use it while you need it, stop when you don’t — and you’ll always have your data saved to come back to later.',
    },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="relative py-20 bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Real questions job seekers ask — answered honestly.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl bg-white border border-gray-200">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex justify-between items-center text-left px-6 py-4 focus:outline-none cursor-pointer"
              >
                <span className="font-semibold text-gray-900">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-gray-700">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const testimonials = [
    {
      quote:
        'I was drowning in tabs and spreadsheets before this. Now I know exactly where I am in every application.',
      name: 'CS Student',
      school: 'University of Georgia',
    },
    {
      quote:
        'It takes me seconds to add jobs instead of copy-pasting everything. TrackifyJobs saves me hours every week.',
      name: 'Software Engineering Student',
      school: 'Georgia Tech',
    },
    {
      quote:
        'The resume scoring showed me why I wasn’t getting interviews. I fixed it and finally started hearing back.',
      name: 'Business Analytics Major',
      school: 'University of Tennessee',
    },
  ];

  return (
    <section className="relative py-20 bg-white">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Students and grads are landing interviews faster
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Used by students from UGA, Georgia Tech, KSU, UTK, and more —
            TrackifyJobs helps organize the chaos and turn applications into
            interviews.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl border border-gray-300 p-8 flex flex-col"
            >
              <p className="text-gray-700 italic mb-6">“{t.quote}”</p>
              <p className="text-sm font-semibold text-gray-900">
                {t.name}{' '}
                <span className="font-normal text-gray-500">• {t.school}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================
   UNIVERSITIES • marquee credibility strip
   ========================= */
function UniversitiesMarquee() {
  const schools = [
    'University of Georgia',
    'Georgia Tech',
    'University of Tennessee, Knoxville',
    'Kennesaw State University',
  ];

  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 text-gray-500">
        <p className="text-center text-xs uppercase tracking-wide mb-2">
          Used by students from
        </p>
        <Marquee
          speed={20}
          autoFill
          gradient
          className="text-sm font-bold py-5 overflow-y-hidden"
        >
          <p className="ml-15 px-5 py-1 text-white/90 bg-[#BA0C2F] rounded-4xl shadow-md shadow-black/10">
            University of Georgia
          </p>
          <p className="ml-15 px-5 py-1 text-white/90 bg-[#FF8200] rounded-4xl shadow-md shadow-black/10">
            University of Tennessee
          </p>
          <p className="ml-15 px-5 py-1 text-black/70 bg-[#B3A369] rounded-4xl shadow-md shadow-black/10">
            Georgia Tech
          </p>
          <p className="ml-15 px-5 py-1 text-white/90 bg-[#000000] rounded-4xl shadow-md shadow-black/10">
            Kennessaw State University
          </p>
        </Marquee>
      </div>
    </section>
  );
}

/* =========================
   HERO  • diagonal layers
   ========================= */
function HeroNew() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-purple-700 to-purple-900">
      {/* Background layers */}
      <div className="absolute inset-0 z-1">
        <Image
          src={Svg1}
          alt=""
          className="absolute left-0 bottom-0 opacity-40"
          aria-hidden
        />
        <Image
          src={Svg2}
          alt=""
          className="absolute left-0 bottom-0 opacity-30"
          aria-hidden
        />
      </div>

      <div className="mx-auto pl-30 md:py-15 flex items-center gap-30 justify-around text-white z-20 relative">
        <div className="w-full flex-1">
          <div className="w-full max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-white/30 mb-5 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Early Access. Free today
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              The all-in-one job search dashboard that kills the messy
              spreadsheet
            </h1>
            <p className="mt-4 text-lg text-white/90">
              Resumes, cover letters, and applications flow into one clear
              dashboard in minutes, so you can stay organized and land
              interviews faster.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-lg bg-white text-purple-700 font-semibold px-7 py-3 shadow-md hover:brightness-80 transition-normal duration-200"
              >
                Start Free
              </Link>

              <Link
                href="/features"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white text-white bg-white/20 font-semibold px-7 py-3 hover:brightness-80 transition-normal duration-200"
              >
                See Features
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/85">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-400 rounded-full" /> No
                credit card needed
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-400 rounded-full" />{' '}
                Unlimited access during Early Access
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-400 rounded-full" /> Export
                or delete data anytime
              </li>
            </ul>
          </div>
        </div>
        <div className="flex-1 relative w-full">
          <div className="relative z-10 w-full mx-auto h-[68%] mr-0 rounded-xl overflow-hidden">
            <Image
              src={heroImage}
              alt="App preview"
              className="w-full ring-1 ring-white/20 shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesObjectionSection() {
  const features = [
    {
      title: 'Ditch the Spreadsheet Chaos',
      objection: '“I already track my jobs in a messy Google Sheet.”',
      description:
        'Spreadsheets weren’t built for resumes, deadlines, or interviews. TrackifyJobs gives you one clear dashboard with statuses, resume scoring, and reminders — no tabs, no formulas.',
      icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
    },
    {
      title: 'Stop Copy-Pasting Everything',
      objection: '“It takes too long to update trackers.”',
      description:
        'Manual data entry kills momentum. With TrackifyJobs, you can add jobs from links in seconds, auto-categorize applications, and keep notes + follow-ups inline without the busywork.',
      icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
    },
    {
      title: 'Actually Get More Interviews',
      objection: '“Does this really help me get hired?”',
      description:
        'Every resume is scored with instant suggestions. Follow-ups are tracked so you never ghost a recruiter. You see what’s working and what’s not — applications don’t just pile up, they turn into interviews.',
      icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
    },
  ];

  return (
    <section className="relative py-20 bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            More than a spreadsheet — built for how people actually get hired
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Job seekers told us the same things over and over: spreadsheets are
            messy, trackers are overpriced, and nothing actually helps you land
            interviews. We listened — and built the fixes in from the start.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-300 p-8 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                {feature.icon}
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="italic text-gray-500 mb-3">{feature.objection}</p>
              <p className="text-gray-700 flex-1">{feature.description}</p>

              {/* placeholder for UI screenshot / image */}
              <div className="mt-6 h-40 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                UI Screenshot Here
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <a
            href="/features"
            className="inline-flex items-center justify-center rounded-lg bg-purple-600 text-white font-semibold px-8 py-4 shadow-md hover:bg-purple-700 hover:shadow-lg transition"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}

/* =========================
   STATS  • simple credibility
   ========================= */
function StatsStrip() {
  const stats = [
    { k: '2x', v: 'more replies after resume fixes' },
    { k: '15 min', v: 'from import to tailored resume' },
    { k: '1 place', v: 'for resumes and tracking' },
  ];
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div
            key={s.v}
            className="rounded-xl border border-gray-200 p-6 text-center"
          >
            <p className="text-3xl font-extrabold text-purple-700">{s.k}</p>
            <p className="text-sm text-gray-600 mt-1">{s.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================
   BENEFITS  • icon cards
   ========================= */
function BenefitsCards() {
  const items = [
    {
      title: 'Sharper resumes',
      desc: 'Make your impact clear with metrics and strong verbs.',
    },
    {
      title: 'Faster applications',
      desc: 'Reuse focused versions and ship more quality apps.',
    },
    {
      title: 'Better tracking',
      desc: 'See status and next steps without spreadsheets.',
    },
  ];
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">
          Why people pick TrackifyJobs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl bg-white p-6 border border-gray-200 hover:shadow-md transition"
            >
              <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-700 grid place-items-center font-bold">
                {b.title.slice(0, 1)}
              </div>
              <h3 className="mt-3 text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-gray-600">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================
   TIMELINE  • simple vertical steps
   ========================= */
function Timeline() {
  const steps = [
    {
      t: 'Import your resume or start fresh',
      d: 'Parse and clean in minutes.',
    },
    {
      t: 'Optimize for a role',
      d: 'Match the language and add measurable impact.',
    },
    { t: 'Apply and track', d: 'Keep statuses current and follow up on time.' },
  ];
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">How it works</h2>
        <ol className="relative border-s-2 border-purple-200 pl-6 space-y-8">
          {steps.map((s, i) => (
            <li key={s.t} className="relative">
              <span className="absolute -left-[22px] top-1.5 h-4 w-4 rounded-full bg-purple-600 ring-4 ring-purple-200" />
              <p className="font-semibold">
                {i + 1}. {s.t}
              </p>
              <p className="text-sm text-gray-600 mt-1">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* =========================
   LOGOS  • subtle marquee
   ========================= */
function LogosMarquee() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-xs text-gray-500 mb-6">
          Used by students and grads at
        </p>
        <div className="overflow-hidden">
          <div className="flex gap-10 animate-[marquee_30s_linear_infinite] opacity-70">
            {[
              'University of Georgia',
              'University of Georgia',
              'University of Georgia',
              'University of Georgia',
              'University of Georgia',
              'University of Georgia',
              'University of Georgia',
            ].map((value, i) => (
              <div
                key={i}
                className="h-6 w-fit bg-gray-200 rounded"
                aria-label="Logo"
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}

/* =========================
   TESTIMONIALS  • scroll snap
   ========================= */
function TestimonialsScroll() {
  const quotes = [
    {
      q: 'My resume finally read like me. Replies increased.',
      a: 'CS student, internship offer',
    },
    {
      q: 'Tracking kept me on schedule. I felt in control.',
      a: 'New grad, software role',
    },
    { q: 'Cover letters took minutes. Quality went up.', a: 'Bootcamp grad' },
  ];
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">
          People are getting results
        </h2>
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
          {quotes.map((c, i) => (
            <figure
              key={i}
              className="snap-center min-w-[300px] md:min-w-[360px] rounded-2xl border border-gray-200 p-6 bg-white"
            >
              <blockquote className="text-gray-800">“{c.q}”</blockquote>
              <figcaption className="mt-3 text-sm text-gray-600">
                {c.a}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================
   PRIVACY  • split with checklist
   ========================= */
function PrivacySplit() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold">Privacy and security</h3>
          <p className="mt-2 text-gray-600">
            Your data is stored securely and tied to your account. We use
            Firebase for authentication and storage. You can request an export
            or deletion at any time.
          </p>
          <div className="mt-3 text-sm">
            <Link href="/privacy" className="text-purple-700 hover:underline">
              Privacy policy
            </Link>
            <span className="mx-2 text-gray-400">•</span>
            <Link href="/terms" className="text-purple-700 hover:underline">
              Terms of use
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold">For power users</h3>
          <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Bulk edits on skills and titles</li>
            <li>Reusable achievement snippets</li>
            <li>Role templates for fast tailoring</li>
            <li>Export to PDF and Word</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* =========================
   PRICING PREVIEW  • two cards with highlight
   ========================= */
function PricingPreviewNew() {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Pricing preview</h2>
          <p className="text-gray-600 mt-2">
            Plans are not in effect. This section is a preview of what pricing
            may look like after stability improvements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="rounded-2xl border border-gray-200 p-6 hover:shadow-sm">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">Free</h3>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
                Preview
              </span>
            </div>
            <p className="mt-2 text-gray-600">
              Access to all features with usage limits once pricing launches.
              During Early Access you have unlimited access.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>All core features</li>
              <li>Community support</li>
              <li>Reasonable usage limits later</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">Coming soon</p>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-purple-300 p-6 bg-purple-50/40 hover:shadow-sm">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-purple-800">Pro</h3>
              <span className="text-xs bg-white text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                Preview
              </span>
            </div>
            <p className="mt-2 text-gray-700">
              Unlimited everything with priority support. Best for heavy use.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-800 space-y-1">
              <li>Unlimited parsing and scoring</li>
              <li>Unlimited tracking</li>
              <li>Priority support</li>
            </ul>
            <p className="mt-4 text-sm text-gray-600">Coming soon</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================
   FAQ  • accordions
   ========================= */
function FAQAccordions() {
  const faqs = [
    {
      q: 'Is it free right now',
      a: 'Yes. Everyone has unlimited access during Early Access. We will announce pricing with clear notice before anything changes.',
    },
    {
      q: 'Do I keep my data',
      a: 'Yes. Your data stays tied to your account. You can export or delete at any time.',
    },
    {
      q: 'Do I need a credit card',
      a: 'No. Early Access does not require payment.',
    },
  ];
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">
          Questions people ask
        </h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-gray-200 p-4 bg-white open:bg-gray-50"
            >
              <summary className="flex cursor-pointer select-none items-center justify-between">
                <h3 className="text-base md:text-lg font-semibold pr-4">
                  {f.q}?
                </h3>
                <span
                  className="ml-2 text-gray-500 text-sm group-open:hidden"
                  aria-hidden
                >
                  +
                </span>
                <span
                  className="ml-2 text-gray-500 text-sm hidden group-open:inline"
                  aria-hidden
                >
                  −
                </span>
              </summary>
              <p className="text-gray-600 mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative py-20 bg-purple-700 text-white">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
          Stop fighting spreadsheets. Start landing interviews.
        </h2>
        <p className="mt-4 text-lg text-purple-100 max-w-2xl mx-auto">
          TrackifyJobs organizes your applications, scores your resumes, and
          keeps your job search moving — so you can focus on getting hired, not
          on managing tabs.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/app"
            className="inline-flex items-center justify-center rounded-lg bg-white text-purple-700 font-semibold px-8 py-4 shadow-md hover:bg-gray-100 hover:shadow-lg transition"
          >
            Start Free
          </a>
          <a
            href="/features"
            className="inline-flex items-center justify-center rounded-lg border border-white text-white font-semibold px-8 py-4 hover:bg-white hover:text-purple-700 transition"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

function FoundersNote() {
  return (
    <section className="relative py-20 bg-white">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
          A Note From Our Team
        </h2>

        <div className="text-lg text-gray-700 space-y-6">
          {/* 1/ Put yourself in their shoes */}
          <p>
            We know what it feels like to be buried in a job search — a dozen
            tabs open, half-filled spreadsheets, and the sinking feeling that
            something important just slipped through the cracks.
          </p>

          {/* 2/ Explain their problem */}
          <p>
            The problem is simple but brutal: spreadsheets weren’t built for job
            hunting. They don’t remind you to follow up. They don’t tell you why
            your resume isn’t getting callbacks. And the tools that claim to
            help? They’re often overpriced or clunky.
          </p>

          {/* 3/ Take ownership */}
          <p>
            That’s why we built TrackifyJobs. We wanted a tool that was fast,
            clear, and actually made a difference in landing interviews. No
            fluff. No bloat. Just the essentials that help job seekers win.
          </p>

          {/* 4/ Show the happy ending */}
          <p>
            Today, TrackifyJobs is helping students and grads organize the chaos
            of job hunting into one clean dashboard. The result? Less time
            juggling tabs, more time focusing on the opportunities that matter —
            and a faster path to “you’re hired.”
          </p>
        </div>

        <div className="mt-10">
          <p className="text-sm font-semibold text-gray-900">
            — The TrackifyJobs Team
          </p>
          <p className="text-sm text-gray-500">
            Built by job seekers, for job seekers
          </p>
        </div>
      </div>
    </section>
  );
}
