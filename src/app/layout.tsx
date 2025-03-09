import './globals.css'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import SessionProvider from '@/components/auth/SessionProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export const metadata: Metadata = {
  title: 'Rental Dashboard',
  description: 'Rental property analytics dashboard'
}

async function getSession() {
  try {
    const response = await fetch(`http://localhost:3000/api/auth/session`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Failed to fetch session:', response.status)
      return null
    }

    const session = await response.json()
    return session
  } catch (error) {
    console.error('Failed to fetch session:', error)
    return null
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

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