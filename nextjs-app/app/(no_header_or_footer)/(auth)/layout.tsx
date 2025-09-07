// app/auth/layout.tsx
import AuthBranding from '@/components/AuthBranding';
import Link from 'next/link';
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side: logo + form (children) */}
      <div className="flex flex-col justify-center px-8 lg:px-16 bg-white">
        <div className="max-w-md w-full mx-auto py-10">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <span className="text-xl font-bold text-gray-900">
              Trackify<span className="font-normal">Jobs</span>
            </span>
          </Link>

          {/* Render login or signup form */}
          {children}
        </div>
      </div>

      {/* Right side: shared branding */}
      <AuthBranding />
    </div>
  );
}
