'use client'

import { useState } from 'react'

export default function TopPerformers({ setIsLoading, setProgress }) {
  const [topPerformers, setTopPerformers] = useState([])
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadTopPerformers = async () => {
    setIsLoading(true)
    setProgress(10)
    setHasLoaded(true)

    try {
      const response = await fetch('/api/analyze/performers')

      setProgress(50)

      if (response.ok) {
        const data = await response.json()
        setTopPerformers(data.performers || [])
        setProgress(100)
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
        setTopPerformers([])
        setProgress(100)
      }
    } catch (error) {
      console.error('Error loading performers:', error)
      alert('Failed to load top performers')
      setTopPerformers([])
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
          Top Performing Press Releases
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Press releases ranked by unique domains, SEO impact, and visibility
          score.
        </p>
        <button
          onClick={loadTopPerformers}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Load Top Performers
        </button>
      </div>

      {/* Results */}
      {hasLoaded && (
        <div className="space-y-4">
          {topPerformers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              No top performers data available yet.
            </div>
          ) : (
            topPerformers.map((performer, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : index === 1
                            ? 'bg-gray-100 text-gray-800'
                            : index === 2
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {performer.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        {performer.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {performer.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {performer.uniqueDomains}
                      </div>
                      <div className="text-xs text-gray-500">
                        Unique Domains
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {performer.seoImpact}
                      </div>
                      <div className="text-xs text-gray-500">
                        SEO Impact
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {performer.visibilityScore}
                      </div>
                      <div className="text-xs text-gray-500">
                        Visibility
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Points */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Key Success Factors:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {performer.factors.map((factor, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
