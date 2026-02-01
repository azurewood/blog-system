'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Blog Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                👤 {user.email}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <Link 
                href="/admin" 
                className="block px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                📊 Dashboard
              </Link>
              <Link 
                href="/admin/posts" 
                className="block px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                📝 Posts
              </Link>
              <Link 
                href="/admin/posts/new" 
                className="block px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                ➕ New Post
              </Link>
              <Link 
                href="/admin/images" 
                className="block px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                🖼️ Images
              </Link>
              <div className="pt-4 mt-4 border-t border-gray-700">
                <Link 
                  href="/" 
                  className="block px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                >
                  🏠 View Site
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
