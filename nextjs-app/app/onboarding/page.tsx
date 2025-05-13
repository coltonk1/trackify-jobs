'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const OnboardingPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = auth.currentUser;
    if (!user) {
      setError('No user found.');
      return;
    }

    try {
      await updateProfile(user, { displayName: name });
      router.push('/dashboard');
    } catch (err: any) {
      setError('Failed to update profile.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Complete Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
