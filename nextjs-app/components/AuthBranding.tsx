'use client';

import { useEffect, useState } from 'react';

const testimonials = [
  {
    name: 'Sophia Martinez',
    role: 'Software Intern @ Google',
    quote:
      'Trackify has kept me organized and confident during my job hunt. It’s like a career coach in my pocket.',
  },
  {
    name: 'David Kim',
    role: 'CS Grad @ UGA, Incoming @ Microsoft',
    quote:
      'I used to track applications in messy spreadsheets. Trackify made everything simple and stress-free.',
  },
  {
    name: 'Aisha Patel',
    role: 'Data Science Intern @ Amazon',
    quote:
      'The reminders and dashboard kept me ahead of deadlines. Trackify gave me back hours each week.',
  },
];

export default function AuthBranding() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % testimonials.length);
        setFade(true);
      }, 500);
    }, 6000);

    return () => clearInterval(timer);
  }, [paused]);

  const t = testimonials[index];

  return (
    <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-indigo-700 via-indigo-900 to-indigo-900/50 bg-black text-white px-12 shadow-inner-left">
      <div className="max-w-md">
        <h2 className="text-3xl font-bold mb-4">What Students Say</h2>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className={`flex flex-col gap-3 transition-all duration-500 transform ${
            fade ? 'opacity-100' : 'opacity-0'
          } hover:scale-105`}
        >
          <p className="text-indigo-100 mb-6 italic">“{t.quote}”</p>

          <div>
            <p className="font-semibold">{t.name}</p>
            <p className="text-sm text-indigo-200">{t.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
