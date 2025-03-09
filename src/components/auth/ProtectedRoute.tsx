'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// List of allowed email addresses
const allowedEmails = [
  'waol76@gmail.com',
  'catua81@gmail.com',
  'leonardoberti011@gmail.com',
  'bertimario17@gmail.com',
  // Add more authorized emails as needed
];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      // Check if user's email is in the allowed list
      const userEmail = session?.user?.email;
      const isAuthorized = userEmail ? allowedEmails.includes(userEmail) : false;
      
      if (!isAuthorized) {
        setShowAccessDenied(true);
      }
    } else if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, session, router]);

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>;
  }

  if (showAccessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="mb-4">
            Your email address ({session?.user?.email}) is not authorized to access this application.
          </p>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return null;
}