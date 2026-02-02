'use client'

import { useState, useEffect } from 'react'

interface Analytics {
  total_images: number
  total_size_mb: number
  by_variant: {
    variant: string
    count: number
    total_size_mb: number
  }[]
  largest_images: {
    id: string
    filename: string
    size_mb: number
  }[]
  recent_uploads: {
    id: string
    filename: string
    created_at: number
    variants_count: number
  }[]
}

export default function ImageAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(`${API_URL}/api/images/analytics`)
      const data = await response.json()
      setAnalytics(data.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg" />
        <div className="h-32 bg-gray-200 rounded-lg" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load analytics
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Images</p>
              <p className="text-3xl font-bold mt-2">{analytics.total_images}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Storage</p>
              <p className="text-3xl font-bold mt-2">{analytics.total_size_mb.toFixed(1)} MB</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg Size</p>
              <p className="text-3xl font-bold mt-2">
                {analytics.total_images > 0
                  ? (analytics.total_size_mb / analytics.total_images).toFixed(1)
                  : 0} MB
              </p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Storage by Variant */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage by Variant</h3>
        <div className="space-y-3">
          {analytics.by_variant.map((variant) => (
            <div key={variant.variant} className="flex items-center">
              <div className="w-32 text-sm font-medium text-gray-700 capitalize">
                {variant.variant}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(variant.total_size_mb / analytics.total_size_mb) * 100}%`
                      }}
                    />
                  </div>
                  <div className="w-24 text-right text-sm text-gray-600">
                    {variant.total_size_mb.toFixed(1)} MB
                  </div>
                  <div className="w-16 text-right text-sm text-gray-500">
                    {variant.count} files
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Largest Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Largest Images</h3>
          <div className="space-y-2">
            {analytics.largest_images.length === 0 ? (
              <p className="text-gray-500 text-sm">No images yet</p>
            ) : (
              analytics.largest_images.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {image.size_mb.toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
                      window.open(`${API_URL}/api/images/${image.id}`, '_blank')
                    }}
                    className="ml-4 text-blue-600 hover:text-blue-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h3>
          <div className="space-y-2">
            {analytics.recent_uploads.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent uploads</p>
            ) : (
              analytics.recent_uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {upload.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(upload.created_at * 1000).toLocaleDateString()} • {upload.variants_count} variants
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
                      navigator.clipboard.writeText(`${API_URL}/api/images/${upload.id}`)
                      alert('URL copied!')
                    }}
                    className="ml-4 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {analytics.orphaned_images.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">
              ⚠️ Orphaned Images ({analytics.orphaned_images.length})
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
              These images aren't used in any posts
            </p>
            <div className="space-y-2">
              {analytics.orphaned_images.slice(0, 10).map(img => (
                <div key={img.id} className="flex justify-between items-center bg-white p-3 rounded">
                  <span className="text-sm">{img.filename}</span>
                  <span className="text-sm text-gray-500">
                    {(img.size_bytes / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
            {analytics.orphaned_images.length > 10 && (
              <p className="text-sm text-gray-500 mt-2">
                + {analytics.orphaned_images.length - 10} more
              </p>
            )}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Analytics
        </button>
      </div>
    </div>
  )
}
