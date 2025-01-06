'use client'
import React, { Suspense } from 'react';
import GoogleSheetsImporter from '@/components/GoogleSheetsImporter';
import RawDataTable from '@/components/RawDataTable';

function RawDataContent() {
  return (
    <div className="text-black w-full max-w-none p-4">
      <GoogleSheetsImporter />
      <RawDataTable />
    </div>
  );
}

export default function RawDataPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RawDataContent />
    </Suspense>
  );
}