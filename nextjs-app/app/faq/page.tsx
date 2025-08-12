// app/faq/page.tsx
export default function FAQPage() {
  const ISSUE_URL = 'https://your-issue-link.com';
  const EMAIL = 'support@trackifyjobs.com';

  const faqs = [
    {
      q: 'Is TrackifyJobs free right now?',
      a: 'Yes. During Early Access, everyone has full, unlimited access to all features. We will announce pricing with clear notice before anything changes.',
    },
    {
      q: 'What features are included?',
      a: 'You can parse and optimize resumes, generate ATS scores, draft cover letters, and track job applications in one place.',
    },
    {
      q: 'Why is something not working?',
      a: 'We are in Early Access. Bugs can happen. Please report issues so we can fix them quickly.',
    },
    {
      q: 'How do I report a problem or request a feature?',
      a: `Use the feedback link or email us. We read every report.`,
    },
    {
      q: 'Will my data be saved?',
      a: 'Yes. Your data is stored securely and tied to your account. We use Firebase for authentication and storage.',
    },
    {
      q: 'Can I export or delete my data?',
      a: 'Yes. You can request an export or deletion at any time. We will confirm by email and complete the request promptly.',
    },
    {
      q: 'When will pricing start?',
      a: 'After we finish core work and stabilize reliability. We will share details well in advance. Free users will have a clear path forward.',
    },
    {
      q: 'Will there be limits later?',
      a: 'Likely yes for the Free plan. The Pro plan will remove usage caps. During Early Access, there are no limits.',
    },
  ];

  // JSON-LD for FAQ rich results
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 border border-gray-300 text-sm px-3 py-1 rounded-full text-gray-600 mb-4"
          aria-label="Early Access status"
        >
          <span
            className="inline-block w-2 h-2 rounded-full bg-emerald-500"
            aria-hidden
          />
          Early Access
        </div>

        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600">
          Quick answers about TrackifyJobs, pricing plans, and data handling.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <a
            href={ISSUE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 text-gray-700 text-sm px-4 py-2 hover:bg-gray-50"
          >
            Report an issue
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center rounded-md text-sm px-4 py-2 text-blue-700 hover:underline"
          >
            Email support
          </a>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4 w-full" role="list">
        {faqs.map(({ q, a }, idx) => (
          <details
            key={idx}
            className="group border border-gray-200 rounded-lg p-4 open:bg-gray-50"
            role="listitem"
          >
            <summary className="flex cursor-pointer select-none items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold pr-4">{q}</h2>
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
            <p className="text-gray-600 mt-3">
              {a === faqs[3].a ? (
                <>
                  Use the{' '}
                  <a
                    href={ISSUE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    feedback form
                  </a>{' '}
                  or email{' '}
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-blue-700 hover:underline"
                  >
                    {EMAIL}
                  </a>
                  . We read every report.
                </>
              ) : a === faqs[5].a ? (
                <>
                  Yes. You can request an export or deletion at any time. Email{' '}
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-blue-700 hover:underline"
                  >
                    {EMAIL}
                  </a>
                  . We will confirm by email and complete the request promptly.
                </>
              ) : (
                a
              )}
            </p>
          </details>
        ))}
      </div>

      {/* Links to related policies */}
      <div className="mt-10 text-sm text-gray-600 text-center">
        <p>
          See our{' '}
          <a href="/privacy" className="text-blue-700 hover:underline">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/terms" className="text-blue-700 hover:underline">
            Terms of Use
          </a>
          . You can also read the{' '}
          <a href="/pricing" className="text-blue-700 hover:underline">
            pricing preview
          </a>
          .
        </p>
        <p className="mt-2">Last updated on August 12, 2025.</p>
      </div>

      {/* SEO: FAQ schema */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}
