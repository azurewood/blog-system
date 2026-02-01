'use client'

import { useState } from 'react'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  currentImage?: string
}

export default function ImageUpload({ onImageUploaded, currentImage }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Read file as base64
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64Data = event.target?.result?.toString().split(',')[1]
        
        if (!base64Data) {
          setError('Failed to read file')
          setIsUploading(false)
          return
        }

        // Upload to API
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const response = await fetch(`${API_URL}/api/upload/image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            content_type: file.type,
            data: base64Data,
          }),
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()
        const imageUrl = result.data.url

        setPreviewUrl(imageUrl)
        onImageUploaded(imageUrl)
        setIsUploading(false)
      }

      reader.onerror = () => {
        setError('Failed to read file')
        setIsUploading(false)
      }

      reader.readAsDataURL(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Featured Image
      </label>

      {/* Preview */}
      {previewUrl && (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={() => {
              setPreviewUrl(null)
              onImageUploaded('')
            }}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div>
        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{isUploading ? 'Uploading...' : previewUrl ? 'Change Image' : 'Upload Image'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB.
        Images are stored in Turso database and served via edge functions.
      </p>
    </div>
  )
}
