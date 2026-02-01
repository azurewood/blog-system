'use client'

import { useState } from 'react'

interface SearchFiltersProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: FilterOptions) => void
}

export interface FilterOptions {
  sortBy: 'date' | 'size' | 'name'
  sortOrder: 'asc' | 'desc'
  sizeMin?: number
  sizeMax?: number
  dateRange?: 'today' | 'week' | 'month' | 'all'
}

export default function SearchFilters({ onSearch, onFilterChange }: SearchFiltersProps) {
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'date',
    sortOrder: 'desc',
    dateRange: 'all',
  })

  const handleSearchChange = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search images by filename..."
          />
          {query && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-4 py-2 border rounded-lg transition-colors ${
            isExpanded
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="size">Size</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilter('sortOrder', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => updateFilter('dateRange', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Size Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size
            </label>
            <select
              onChange={(e) => {
                const value = e.target.value
                if (value === 'all') {
                  updateFilter('sizeMin', undefined)
                  updateFilter('sizeMax', undefined)
                } else if (value === 'small') {
                  updateFilter('sizeMin', 0)
                  updateFilter('sizeMax', 1024 * 1024) // < 1MB
                } else if (value === 'medium') {
                  updateFilter('sizeMin', 1024 * 1024)
                  updateFilter('sizeMax', 5 * 1024 * 1024) // 1-5MB
                } else if (value === 'large') {
                  updateFilter('sizeMin', 5 * 1024 * 1024)
                  updateFilter('sizeMax', undefined) // > 5MB
                }
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sizes</option>
              <option value="small">Small (&lt; 1MB)</option>
              <option value="medium">Medium (1-5MB)</option>
              <option value="large">Large (&gt; 5MB)</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(query || filters.dateRange !== 'all' || filters.sizeMin || filters.sizeMax) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          
          {query && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{query}"
              <button
                onClick={() => handleSearchChange('')}
                className="ml-2 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}

          {filters.dateRange !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {filters.dateRange === 'today' && 'Today'}
              {filters.dateRange === 'week' && 'This Week'}
              {filters.dateRange === 'month' && 'This Month'}
              <button
                onClick={() => updateFilter('dateRange', 'all')}
                className="ml-2 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}

          {(filters.sizeMin || filters.sizeMax) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Size filtered
              <button
                onClick={() => {
                  updateFilter('sizeMin', undefined)
                  updateFilter('sizeMax', undefined)
                }}
                className="ml-2 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}

          <button
            onClick={() => {
              handleSearchChange('')
              setFilters({
                sortBy: 'date',
                sortOrder: 'desc',
                dateRange: 'all',
              })
              onFilterChange({
                sortBy: 'date',
                sortOrder: 'desc',
                dateRange: 'all',
              })
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
