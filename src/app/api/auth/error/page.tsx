'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  // Log the error for debugging
  useEffect(() => {
    console.log('Auth error detected:', error);
  }, [error]);

  // Different error messages based on error type
  const getErrorMessage = () => {
    switch(error) {
      case 'AccessDenied':
        return 'Your email address is not authorized to access this application.';
      case 'Verification':
        return 'The login link is no longer valid.';
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
      case 'OAuthAccountNotLinked':
        return 'There was a problem with your authentication provider.';
      case 'EmailSignin':
        return 'The e-mail could not be sent.';
      case 'CredentialsSignin':
        return 'The credentials you provided were invalid.';
      case 'SessionRequired':
        return 'You must be signed in to access this page.';
      default:
        return 'An unknown error occurred during authentication.';
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="rounded-lg bg-white p-8 shadow-md max-w-md">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Authentication Error</h1>
        
        <p className="mb-4">
          {getErrorMessage()}
        </p>
        
        <p className="text-sm text-gray-600 mb-6">
          Error code: {error || 'unknown'}
        </p>
        
        <div className="flex justify-between">
          <button
            onClick={() => window.location.href = '/api/auth/signin'}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}