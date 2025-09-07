'use client';
import { useAuth } from '@/lib/authContext';
import { auth } from '@/lib/firebase'; // make sure this imports your initialized firebase app
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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
          <UserMenu user={user} handleLogout={handleLogout} />
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

function UserMenu({
  user,
  handleLogout,
}: {
  user: any;
  handleLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <li ref={menuRef} className="relative">
      {/* User Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 bg-white/25 border-white border-2 rounded-full font-bold flex items-center justify-center cursor-pointer"
      >
        {user.email.slice(0, 1).toUpperCase()}
      </button>

      {/* Dropdown */}
      {open && (
        <ul className="absolute left-[50%] translate-x-[-50%] mt-2 w-44 bg-white text-gray-800 border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Settings */}
          <li>
            <a
              href="/settings"
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 transition"
            >
              Settings
            </a>
          </li>

          {/* Checkout */}
          <li>
            <a
              href="/checkout"
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 transition"
            >
              Checkout
            </a>
          </li>

          {/* Divider */}
          <li className="border-t border-gray-200 my-1"></li>

          {/* Logout - standout */}
          <li>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-600 font-semibold hover:bg-red-50 transition cursor-pointer"
            >
              Logout
            </button>
          </li>
        </ul>
      )}
    </li>
  );
}
