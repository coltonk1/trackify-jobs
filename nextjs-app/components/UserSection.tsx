'use client';
import { useAuth } from '@/lib/authContext';
import { auth } from '@/lib/firebase'; // make sure this imports your initialized firebase app
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserSection() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Optionally, also sign out from Firebase client-side to fully clear auth state
      await signOut(auth);

      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // important to include cookies
      });

      console.log('User logged out (cookie cleared)');

      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {user ? (
        <>
          <li className="flex items-center">
            <Link href="/dashboard">
              <span className="transition duration-300 px-4 py-2 text-white hover:bg-orange-500 hover:text-white rounded-md">
                Dashboard
              </span>
            </Link>
          </li>
          <li className="flex items-center">
            <button
              onClick={handleLogout}
              className="transition duration-300 border-2 border-white text-white px-4 py-2 rounded-md hover:bg-orange-500 hover:text-white"
            >
              Logout
            </button>
          </li>
        </>
      ) : (
        <>
          <li className="flex items-center">
            <Link href="/login">
              <span className="transition duration-300 px-4 py-2 text-white hover:bg-orange-500 hover:text-white rounded-md">
                Log in
              </span>
            </Link>
          </li>
          <li className="flex items-center">
            <Link href="/signup">
              <span className="transition duration-300 border-2 border-white text-white px-4 py-2 rounded-md hover:bg-orange-500 hover:text-white">
                Sign up
              </span>
            </Link>
          </li>
        </>
      )}
    </>
  );
}
