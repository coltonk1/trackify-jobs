'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navSections = [
    {
      title: 'General',
      items: [
        { href: '/dashboard', label: 'Overview' },
        { href: '/dashboard/applications', label: 'Applications' },
        { href: '/dashboard/applications/new', label: 'Applications' },
        { href: '/dashboard/files', label: 'Files' },
      ],
    },
    {
      title: 'Resumes',
      items: [
        { href: '/dashboard/resumes', label: 'History' },
        { href: '/dashboard/resumes/create', label: 'Create' },
        { href: '/dashboard/resumes/analyze', label: 'Analyze' },
      ],
    },
    {
      title: 'Account',
      items: [
        { href: '/dashboard/settings', label: 'Settings' },
        { href: '/dashboard/payments', label: 'Payments' },
        { href: '/dashboard/billing', label: 'Billing' },
      ],
    },
  ];

  return (
    <div className="flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <nav className="flex-1 px-3 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                        active
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
