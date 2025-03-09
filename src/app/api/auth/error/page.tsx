'use client';

import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const email = searchParams.get('email');
  
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
      <h1 style={{ color: 'red' }}>Access Denied</h1>
      <p>The email address {email || 'used'} is not authorized to access this application.</p>
      <p>Error: {error}</p>
      <button 
        onClick={() => window.location.href = '/'}
        style={{ padding: '8px 16px', background: 'blue', color: 'white', border: 'none', borderRadius: '4px', marginTop: '20px' }}
      >
        Back to Home
      </button>
    </div>
  );
}