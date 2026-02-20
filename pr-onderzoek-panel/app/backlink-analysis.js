'use client'

import { useState } from 'react'

export default function BacklinkAnalysis({ setIsLoading, setProgress }) {
  const [backlinks, setBacklinks] = useState([])
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  const handleAnalyze = async () => {
    setIsLoading(true)
    setProgress(10)
    setHasAnalyzed(true)

    try {
      const response = await fetch('/api/analyze/backlinks', {
        method: 'POST',
      })

      setProgress(50)

      if (response.ok) {
        const data = await response.json()
        setBacklinks(data.backlinks || [])
        setProgress(100)
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
        setBacklinks([])
        setProgress(100)
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Failed to analyze backlinks')
      setBacklinks([])
      setProgress(100)
    } finally {
      setTimeout(() => setIsLoading(false), 500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Backlink Analysis
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Analyze which third-party websites republished or referenced the press
          releases, including domain authority and social metrics.
        </p>
        <button
          onClick={handleAnalyze}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Run Backlink Analysis
        </button>
      </div>

      {/* Results */}
      {hasAnalyzed && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Backlink Results ({backlinks.length} references found)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Press Release
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Republishing Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain Authority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Context
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anchor Text
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Social Shares
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backlinks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No backlink data available. Run the analysis first.
                    </td>
                  </tr>
                ) : (
                  backlinks.map((backlink, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {backlink.pressRelease}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={backlink.siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {backlink.siteName}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            backlink.da >= 60
                              ? 'bg-green-100 text-green-800'
                              : backlink.da >= 40
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          DA {backlink.da}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {backlink.context}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {backlink.anchorText}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {backlink.socialShares || 0}
                        </div>
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
