import './globals.css'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import SessionProvider from '@/components/auth/SessionProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { getServerSession } from 'next-auth'
import { options } from '@/app/api/auth/[...nextauth]/options'

export const metadata: Metadata = {
  title: 'Rental Dashboard',
  description: 'Rental property analytics dashboard'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(options)

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <SessionProvider session={session}>
          <ProtectedRoute>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </ProtectedRoute>
        </SessionProvider>
      </body>
    </html>
  )
}