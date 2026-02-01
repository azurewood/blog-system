import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'My Blog',
  description: 'A modern blog built with Next.js and Rust',
  alternates: {
    types: {
      'application/rss+xml': 'http://localhost:3000/feed.xml',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="text-2xl font-display font-bold text-gray-900">
                  My Blog
                </Link>
                <div className="flex items-center gap-6">
                  <SearchBar />
                  <Link 
                    href="/" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Home
                  </Link>
                  <Link 
                    href="/about" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    About
                  </Link>
                  <a 
                    href="http://localhost:3000/feed.xml" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z"/>
                      <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1zM3 15a2 2 0 114 0 2 2 0 01-4 0z"/>
                    </svg>
                    RSS
                  </a>
                </div>
              </div>
            </nav>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {children}
          </main>

          <footer className="bg-gray-900 text-white mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <p className="text-gray-400">
                  © {new Date().getFullYear()} My Blog. Built with Next.js and Rust.
                </p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
