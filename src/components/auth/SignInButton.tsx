'use client';

import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInButton() {
  const { data: session, status } = useSession();
  
  console.log("Auth Status:", status);
  console.log("Full Session Data:", session);

  const handleSignIn = async () => {
    try {
      await signIn('google', { 
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

const handleSignOut = async () => {
  console.log('Sign out button clicked');
  try {
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    });
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

  if (status === "loading") {
    return <button className="px-4 py-2 text-sm text-gray-500">Loading...</button>;
  }

  if (status === "authenticated" && session?.user?.email) {
    return (
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-700">{session.user.email}</p>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-4 py-2 text-sm text-sky-600 hover:text-sky-700 transition-colors"
    >
      Sign In
    </button>
  );
}