'use client'
import React, { Suspense, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import RentalDashboard from '@/components/RentalDashboard' // or RawDataTable for raw-data page

function PageContent() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = '/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href)
    },
  })

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div className="text-black">
      <RentalDashboard />
    </div>
  )

}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  )
}