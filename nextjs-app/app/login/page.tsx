'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, getIdToken, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { signInWithGoogle } from '@/lib/authServices';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = getAuth().currentUser;
      const token = await user?.getIdToken();

      if (user) {
        const idToken = await getIdToken(user, true);
        try {
          await fetch('/api/init-user', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
        } catch (err) {
          console.error('Failed to initialize user:', err);
        }
      }

      if (token) {
        await fetch('/api/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
          credentials: 'include',
        });
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();

      const user = getAuth().currentUser;
      const token = await user?.getIdToken();

      if (user) {
        const idToken = await getIdToken(user, true);
        try {
          await fetch('/api/init-user', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
        } catch (err) {
          console.error('Failed to initialize user:', err);
        }
      }

      if (token) {
        await fetch('/api/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
          credentials: 'include',
        });
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError('Google login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition ${
              loading && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">or</div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-4 flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-5 h-5"
          />
          <span className="text-gray-700 font-medium">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
