'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import Link from 'next/link'
import { Post } from '@/types'

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      return
    }

    const searchPosts = async () => {
      setIsLoading(true)
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const response = await fetch(
          `${API_URL}/api/search?q=${encodeURIComponent(debouncedQuery)}`
        )
        const data = await response.json()
        setResults(data.data || [])
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    searchPosts()
  }, [debouncedQuery])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Search</span>
        <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-white rounded border border-gray-300">
          ⌘K
        </kbd>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed inset-x-4 top-20 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts..."
                className="flex-1 text-lg outline-none"
                autoFocus
              />
              {isLoading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
              )}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query.length < 2 ? (
              <div className="p-8 text-center text-gray-500">
                Type at least 2 characters to search
              </div>
            ) : results.length === 0 && !isLoading ? (
              <div className="p-8 text-center text-gray-500">
                No results found for "{query}"
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {results.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.views} views</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
            <span>Press ESC to close</span>
            <span>⌘K to open</span>
          </div>
        </div>
      </div>
    </>
  )
}
