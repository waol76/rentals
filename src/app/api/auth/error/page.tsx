'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Authentication Error
        </h1>
        
        {error === 'AccessDenied' ? (
          <div>
            <p className="mb-4">
              Your email address is not authorized to access this application.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Please contact the administrator if you believe you should have access.
            </p>
          </div>
        ) : (
          <p className="mb-4">
            An error occurred during authentication: {error || 'Unknown error'}
          </p>
        )}

        <Link 
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
