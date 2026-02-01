'use client'

import { useState } from 'react'

interface BatchOperationsProps {
  selectedImages: string[]
  onDelete: (ids: string[]) => Promise<void>
  onClearSelection: () => void
}

export default function BatchOperations({ 
  selectedImages, 
  onDelete, 
  onClearSelection 
}: BatchOperationsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleBatchDelete = async () => {
    if (!confirm(`Delete ${selectedImages.length} images? This cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(selectedImages)
      onClearSelection()
    } catch (error) {
      alert('Failed to delete some images')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyUrls = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const urls = selectedImages.map(id => `${API_URL}/api/images/${id}`).join('\n')
    navigator.clipboard.writeText(urls)
    alert(`Copied ${selectedImages.length} URLs to clipboard`)
  }

  if (selectedImages.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">
          {selectedImages.length} selected
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyUrls}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📋 Copy URLs
          </button>

          <button
            onClick={handleBatchDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : '🗑️ Delete'}
          </button>

          <button
            onClick={onClearSelection}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
