'use client'
import React, { Suspense, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import GoogleSheetsImporter from '@/components/GoogleSheetsImporter'
import RawDataTable from '@/components/RawDataTable'

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
    <div className="text-black w-full max-w-none p-4">
      <h1 className="text-xl font-bold mb-4">Raw Data</h1>
      <div className="mb-4">
        <GoogleSheetsImporter />
      </div>
      <RawDataTable />
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