'use client';

import { AuthProvider } from '../lib/authContext';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
