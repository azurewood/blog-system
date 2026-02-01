'use client'

import { useState, useCallback } from 'react'

interface UploadedImage {
  id: string
  url: string
  filename: string
  status: 'uploading' | 'completed' | 'error'
  progress: number
  error?: string
}

interface ImageUploadEnhancedProps {
  onImagesUploaded: (urls: string[]) => void
  currentImages?: string[]
  maxFiles?: number
  showGallery?: boolean
}

export default function ImageUploadEnhanced({ 
  onImagesUploaded, 
  currentImages = [],
  maxFiles = 10,
  showGallery = true 
}: ImageUploadEnhancedProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const uploadFile = async (file: File): Promise<UploadedImage> => {
    const tempId = Math.random().toString(36)
    
    // Add to queue with uploading status
    const uploadingImage: UploadedImage = {
      id: tempId,
      url: '',
      filename: file.name,
      status: 'uploading',
      progress: 0,
    }
    
    setImages(prev => [...prev, uploadingImage])

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImages(prev => prev.map(img => 
          img.id === tempId && img.progress < 90
            ? { ...img, progress: img.progress + 10 }
            : img
        ))
      }, 100)

      // Read file as base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result?.toString().split(',')[1]
          if (result) resolve(result)
          else reject(new Error('Failed to read file'))
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })

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

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      const imageUrl = result.data.url

      // Update to completed
      const completedImage: UploadedImage = {
        id: result.data.id,
        url: imageUrl,
        filename: file.name,
        status: 'completed',
        progress: 100,
      }

      setImages(prev => prev.map(img => 
        img.id === tempId ? completedImage : img
      ))

      return completedImage

    } catch (error) {
      // Update to error
      setImages(prev => prev.map(img => 
        img.id === tempId 
          ? { ...img, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
          : img
      ))
      throw error
    }
  }

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Validate file types
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    if (validFiles.length + images.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Upload all files
    const uploadPromises = validFiles.map(file => uploadFile(file))
    
    try {
      const results = await Promise.all(uploadPromises)
      const urls = results.map(r => r.url)
      onImagesUploaded(urls)
    } catch (error) {
      console.error('Some uploads failed:', error)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const retryUpload = async (image: UploadedImage) => {
    // Re-upload would require storing the original file
    // For now, just remove and let user re-upload
    removeImage(image.id)
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              {isDragging ? 'Drop images here' : 'Drag & drop images'}
            </p>
            <p className="text-sm text-gray-500">
              or click to browse
            </p>
          </div>

          <label className="cursor-pointer">
            <span className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block">
              Choose Files
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          <p className="text-xs text-gray-500">
            JPG, PNG, GIF, WebP • Max 5MB each • Up to {maxFiles} files
          </p>
        </div>
      </div>

      {/* Upload Queue */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">
            Uploads ({images.filter(i => i.status === 'completed').length}/{images.length})
          </h3>
          
          <div className="space-y-2">
            {images.map((image) => (
              <div 
                key={image.id}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  {image.status === 'completed' && image.url ? (
                    <img 
                      src={image.url} 
                      alt={image.filename}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : image.status === 'uploading' ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  ) : (
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {image.filename}
                  </p>
                  
                  {image.status === 'uploading' && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${image.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploading... {image.progress}%
                      </p>
                    </div>
                  )}
                  
                  {image.status === 'completed' && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Uploaded successfully
                    </p>
                  )}
                  
                  {image.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">
                      ✗ {image.error || 'Upload failed'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {image.status === 'completed' && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(image.url)
                        alert('URL copied!')
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy URL"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}
                  
                  {image.status === 'error' && (
                    <button
                      onClick={() => retryUpload(image)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Retry
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeImage(image.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery of uploaded images */}
      {showGallery && images.filter(i => i.status === 'completed').length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Uploaded Images</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {images
              .filter(i => i.status === 'completed')
              .map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
