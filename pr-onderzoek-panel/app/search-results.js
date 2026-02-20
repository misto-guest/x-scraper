'use client'

import { useState } from 'react'

export default function SearchResults({ setIsLoading, setProgress }) {
  const [searchResults, setSearchResults] = useState([])
  const [keyword, setKeyword] = useState('onderzoek')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    setIsLoading(true)
    setProgress(10)
    setHasSearched(true)

    try {
      // Call the scrape API
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      })

      setProgress(50)

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
        setProgress(100)
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
        setSearchResults([])
        setProgress(100)
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('Failed to search ANP Persportaal')
      setSearchResults([])
      setProgress(100)
    } finally {
      setTimeout(() => setIsLoading(false), 500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Search ANP Persportaal
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keyword (default: onderzoek)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Search & Extract
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          This will search the ANP Persportaal archive and extract all press releases
          containing your keyword.
        </p>
      </div>

      {/* Results Table */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({searchResults.length} press releases found)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-12 h-12 text-gray-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-lg font-medium">No results found</p>
                        <p className="text-sm mt-1">
                          Note: ANP Persportaal requires login credentials. Please
                          configure your credentials in the API settings.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  searchResults.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.company}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {result.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
