'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { auth } from '@/lib/firebase';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type User = {
  id: string;
  stripeCustomerId: string;
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
  plan?: string;
  isDelinquent?: boolean;
};

export default function SubscriptionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Simulate server-side fetch on first load
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const res = await fetch('/api/stripe/current-user', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({ email: user.email }),
      });

      if (!res.ok) return;

      const userData = await res.json();
      console.log(userData);
      setUser(userData);
    };

    fetchUser();
  }, []);

  const createCheckoutSession = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      setLoading(true);
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      });

      const { url }: { url: string } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      setLoading(true);
      const res = await fetch('/api/stripe/create-customer-portal-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      });

      const { url }: { url: string } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-6 text-center">Loading user...</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Your Subscription</h2>
      <p className="mb-6">
        {user.plan !== 'Free'
          ? 'Manage your existing subscription.'
          : 'Subscribe to unlock premium features.'}
      </p>
      <button
        onClick={
          user.plan !== 'Free' ? openCustomerPortal : createCheckoutSession
        }
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading
          ? 'Loading...'
          : user.plan !== 'Free'
          ? 'Manage Subscription'
          : 'Subscribe Now'}
      </button>
    </div>
  );
}
