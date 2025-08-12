'use client';

// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import heroImage from '@/assets/image.png';
import Svg1 from '@/assets/heroleft1.svg';
import Svg2 from '@/assets/heroleft2.svg';
import SvgM1 from '@/assets/herom1.svg';
import SvgM2 from '@/assets/herom2.svg';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white text-gray-900">
      <HeroNew />
      <StatsStrip />
      <BenefitsCards />
      <FeatureAlternating />
      <Timeline />

      <TestimonialsScroll />
      <PrivacySplit />
      <PricingPreviewNew />
      <FAQAccordions />
      <FinalCTA />
    </main>
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

      <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 flex items-center gap-10 text-white z-20 relative">
        <div className="flex-7">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-white/30 mb-5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Early Access. Free today
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Organize your job search and move faster
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Build sharper resumes. Draft tailored cover letters. Track every
            application in one place.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-lg bg-white text-purple-700 font-semibold px-6 py-3 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Start Free
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center rounded-lg ring-1 ring-white/40 bg-white/10 text-white font-semibold px-6 py-3 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              See Features
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/85">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-emerald-400 rounded-full" /> No credit
              card needed
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-emerald-400 rounded-full" /> Unlimited
              access during Early Access
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-emerald-400 rounded-full" /> Export or
              delete data anytime
            </li>
          </ul>
        </div>

        <div className="relative h-[380px] md:h-[460px] flex items-center justify-center flex-5">
          <div className="relative z-10 mx-auto h-[68%] w-auto rounded-xl overflow-hidden">
            <Image
              src={heroImage}
              alt="App preview"
              className="h-full w-auto ring-1 ring-white/20 shadow-2xl"
            />
          </div>
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
   FEATURES  • alternating rows
   ========================= */
function FeatureAlternating() {
  const features = [
    {
      title: 'Resume parsing',
      desc: 'Upload your resume and get structured output for fast edits.',
      bullets: [
        'Structured JSON output',
        'Auto detected sections and dates',
        'Quick formatting fixes',
      ],
    },
    {
      title: 'ATS optimization',
      desc: 'Check alignment with postings and strengthen your wording.',
      bullets: [
        'Relevance checks',
        'Keyword suggestions with context',
        'Action verb and metric prompts',
      ],
    },
    {
      title: 'Cover letters',
      desc: 'Draft letters that match your resume and the role.',
      bullets: [
        'Company specific hooks',
        'Tone controls and length targets',
        'Instant regenerate',
      ],
    },
    {
      title: 'Application tracking',
      desc: 'Keep roles, contacts, and next steps in one view.',
      bullets: [
        'Stages for applied and interview and offer',
        'Notes and reminders',
        'Sort and filter by company and date',
      ],
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <h2 className="text-3xl font-bold text-center">
          Everything you need in one flow
        </h2>
        <div className="space-y-10">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            >
              <div
                className={`md:col-span-6 ${i % 2 === 1 ? 'md:order-2' : ''}`}
              >
                <div className="rounded-2xl border border-gray-200 p-6 bg-white">
                  <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    Feature
                  </span>
                  <h3 className="text-2xl font-semibold mt-2">{f.title}</h3>
                  <p className="mt-2 text-gray-600">{f.desc}</p>
                  <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {f.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <Link
                    href="/features"
                    className="inline-block mt-4 text-sm text-purple-700 hover:underline"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
              <div
                className={`md:col-span-6 ${i % 2 === 1 ? 'md:order-1' : ''}`}
              >
                {/* Reuse hero assets for abstract mockups */}
                <div className="relative h-64 rounded-2xl overflow-hidden ring-1 ring-purple-200/40 bg-gradient-to-br from-purple-50 to-white">
                  <Image
                    src={SvgM2}
                    alt=""
                    className="absolute inset-0 opacity-30"
                    aria-hidden
                  />
                  <Image
                    src={SvgM1}
                    alt=""
                    className="absolute left-16 top-6 h-[65%] opacity-60"
                    aria-hidden
                  />
                </div>
              </div>
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

/* =========================
   FINAL CTA  • clean gradient block
   ========================= */
function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-purple-700 to-purple-900 text-white text-center">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold">
          Get organized and move faster
        </h2>
        <p className="mt-3 text-white/90">
          Start today and keep unlimited access during Early Access. Upgrade
          later when plans go live.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-lg bg-white text-purple-700 font-semibold px-6 py-3 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Start Free
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center justify-center rounded-lg ring-1 ring-white/40 bg-white/10 text-white font-semibold px-6 py-3 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Learn More
          </Link>
        </div>
        <p className="mt-3 text-xs text-white/80">No credit card required</p>
      </div>
    </section>
  );
}
