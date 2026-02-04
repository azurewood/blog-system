'use client'

import { useState } from 'react'
import MarkdownPreview from './MarkdownPreview'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [view, setView] = useState<'edit' | 'preview' | 'split'>('split')

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Content</span>
          <span className="text-xs text-gray-500">(Markdown supported)</span>
        </div>
        
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
          <button
            type="button"
            onClick={() => setView('edit')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              view === 'edit'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setView('split')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              view === 'split'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => setView('preview')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              view === 'preview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor Area - Fixed grid logic */}
      <div className={`grid ${view === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-0 min-h-[500px]`}>
        {/* Editor */}
        {(view === 'edit' || view === 'split') && (
          <div className={`${view === 'split' ? 'md:border-r border-gray-300' : ''}`}>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              style={{ minHeight: '500px' }}
            />
          </div>
        )}

        {/* Preview */}
        {(view === 'preview' || view === 'split') && (
          <div className="p-4 bg-white overflow-y-auto" style={{ minHeight: '500px', maxHeight: '800px' }}>
            {value ? (
              <MarkdownPreview content={value} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <p className="text-lg">Preview will appear here</p>
                  <p className="text-sm mt-2">Start typing to see your content</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Markdown Help */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2">
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer hover:text-gray-900 font-medium">
            Markdown Quick Reference
          </summary>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <strong>Headers:</strong>
              <code className="block mt-1"># H1</code>
              <code className="block">## H2</code>
              <code className="block">### H3</code>
            </div>
            <div>
              <strong>Emphasis:</strong>
              <code className="block mt-1">**bold**</code>
              <code className="block">*italic*</code>
              <code className="block">~~strike~~</code>
            </div>
            <div>
              <strong>Lists:</strong>
              <code className="block mt-1">- Item</code>
              <code className="block">1. Numbered</code>
              <code className="block">- [ ] Task</code>
            </div>
            <div>
              <strong>Other:</strong>
              <code className="block mt-1">[Link](url)</code>
              <code className="block">![Image](url)</code>
              <code className="block">`code`</code>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}