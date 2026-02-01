'use client'

import { useState, useEffect } from 'react'
import ImageUploadEnhanced from '@/components/ImageUploadEnhanced'
import BatchOperations from '@/components/BatchOperations'
import ImageAnalytics from '@/components/ImageAnalytics'
import SearchFilters, { FilterOptions } from '@/components/SearchFilters'

interface ImageInfo {
  id: string
  filename: string
  url: string
  size: number
  created_at: string
}

export default function ImageGalleryPage() {
  const [images, setImages] = useState<ImageInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'date',
    sortOrder: 'desc',
    dateRange: 'all',
  })
  const [activeTab, setActiveTab] = useState<'gallery' | 'analytics'>('gallery')

  useEffect(() => {
    // In a real implementation, we'd fetch from an API endpoint
    // For now, we'll just show uploaded images
    setIsLoading(false)
  }, [])

  const handleImagesUploaded = (urls: string[]) => {
    // Extract IDs from URLs and add to gallery
    const newImages: ImageInfo[] = urls.map(url => {
      const id = url.split('/').pop() || ''
      return {
        id,
        filename: `image-${Date.now()}.jpg`,
        url,
        size: Math.random() * 5 * 1024 * 1024, // Random size for demo
        created_at: new Date().toISOString(),
      }
    })
    setImages([...newImages, ...images])
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('Image URL copied to clipboard!')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(`${API_URL}/api/images/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setImages(images.filter(img => img.id !== id))
        setSelectedImages(selectedImages.filter(imgId => imgId !== id))
      } else {
        alert('Failed to delete image')
      }
    } catch (error) {
      alert('Error deleting image')
    }
  }

  const handleBatchDelete = async (ids: string[]) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    
    const deletePromises = ids.map(id =>
      fetch(`${API_URL}/api/images/${id}`, { method: 'DELETE' })
    )

    await Promise.all(deletePromises)
    setImages(images.filter(img => !ids.includes(img.id)))
  }

  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev =>
      prev.includes(id)
        ? prev.filter(imgId => imgId !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedImages(filteredImages.map(img => img.id))
  }

  const clearSelection = () => {
    setSelectedImages([])
  }

  // Apply search and filters
  const filteredImages = images.filter(img => {
    // Search filter
    if (searchQuery && !img.filename.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const imgDate = new Date(img.created_at).getTime()
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000

      if (filters.dateRange === 'today' && imgDate < now - dayMs) return false
      if (filters.dateRange === 'week' && imgDate < now - 7 * dayMs) return false
      if (filters.dateRange === 'month' && imgDate < now - 30 * dayMs) return false
    }

    // Size filter
    if (filters.sizeMin !== undefined && img.size < filters.sizeMin) return false
    if (filters.sizeMax !== undefined && img.size > filters.sizeMax) return false

    return true
  }).sort((a, b) => {
    // Sorting
    let comparison = 0
    
    if (filters.sortBy === 'date') {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (filters.sortBy === 'size') {
      comparison = a.size - b.size
    } else if (filters.sortBy === 'name') {
      comparison = a.filename.localeCompare(b.filename)
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Management</h1>
        <p className="text-gray-600">Upload, organize, and analyze your blog images</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'gallery'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🖼️ Gallery
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Analytics
          </button>
        </nav>
      </div>

      {activeTab === 'analytics' ? (
        <ImageAnalytics />
      ) : (
        <>
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Images</h2>
            <ImageUploadEnhanced 
              onImagesUploaded={handleImagesUploaded}
              maxFiles={20}
              showGallery={false}
            />
          </div>

          {/* Search and Filters */}
          <SearchFilters
            onSearch={setSearchQuery}
            onFilterChange={setFilters}
          />

          {/* Results Summary */}
          {images.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredImages.length} of {images.length} images
              </p>
              
              <div className="flex items-center gap-2">
                {selectedImages.length > 0 ? (
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear selection
                  </button>
                ) : (
                  <button
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Select all
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchQuery || filters.dateRange !== 'all' ? 'No images match your filters' : 'No images'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || filters.dateRange !== 'all' ? 'Try adjusting your search or filters' : 'Upload your first image above'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                      selectedImages.includes(image.id) ? 'ring-4 ring-blue-500' : ''
                    }`}
                    onClick={() => toggleImageSelection(image.id)}
                  >
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Selection Checkbox */}
                    <div className="absolute top-2 left-2">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedImages.includes(image.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300 opacity-0 group-hover:opacity-100'
                      }`}>
                        {selectedImages.includes(image.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedImage(image.url)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full hover:bg-gray-100 transition-all"
                        title="Preview"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyUrl(image.url)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full hover:bg-gray-100 transition-all"
                        title="Copy URL"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(image.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{image.filename}</p>
                      <p className="text-gray-300 text-xs">{(image.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Batch Operations */}
          <BatchOperations
            selectedImages={selectedImages}
            onDelete={handleBatchDelete}
            onClearSelection={clearSelection}
          />

          {/* Image Preview Modal */}
          {selectedImage && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-75 z-50"
                onClick={() => setSelectedImage(null)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative max-w-4xl max-h-full">
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-12 right-0 p-2 bg-white rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-w-full max-h-[80vh] rounded-lg"
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

