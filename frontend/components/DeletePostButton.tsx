'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeletePostButtonProps {
  postId: string
  postTitle: string
  onDeleted?: () => void
  variant?: 'icon' | 'text' | 'button'
  className?: string
}

export default function DeletePostButton({
  postId,
  postTitle,
  onDeleted,
  variant = 'text',
  className = ''
}: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Not authenticated')
        router.push('/login')
        return
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Handle empty response
      const text = await response.text()
      let data

      if (text) {
        try {
          data = JSON.parse(text)
        } catch (e) {
          console.warn('Response is not JSON:', text)
          data = { success: true }
        }
      } else {
        data = { success: true }
      }

      if (data.success || response.status === 200) {
        // Success!
        if (onDeleted) {
          onDeleted()
        } else {
          router.refresh()
        }

        setShowConfirm(false)
      } else {
        throw new Error(data.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post: ' + error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClick = () => {
    setShowConfirm(true)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  // Render different variants
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={isDeleting}
          className={`text-red-600 hover:text-red-900 disabled:opacity-50 ${className}`}
          title="Delete post"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {showConfirm && (
          <ConfirmDialog
            title="Delete Post"
            message={`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={handleCancel}
            isLoading={isDeleting}
          />
        )}
      </>
    )
  }

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={isDeleting}
          className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors ${className}`}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>

        {showConfirm && (
          <ConfirmDialog
            title="Delete Post"
            message={`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={handleCancel}
            isLoading={isDeleting}
          />
        )}
      </>
    )
  }

  // Default: text variant
  return (
    <>
      <button
        onClick={handleClick}
        disabled={isDeleting}
        className={`text-red-600 hover:text-red-900 font-medium disabled:opacity-50 ${className}`}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>

      {showConfirm && (
        <ConfirmDialog
          title="Delete Post"
          message={`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={handleCancel}
          isLoading={isDeleting}
        />
      )}
    </>
  )
}

// Confirmation Dialog Component
function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading
}: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}