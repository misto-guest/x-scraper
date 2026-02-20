'use client'

import { useState } from 'react'

export default function Insights({ setIsLoading, setProgress }) {
  const [insights, setInsights] = useState(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadInsights = async () => {
    setIsLoading(true)
    setProgress(10)
    setHasLoaded(true)

    try {
      const response = await fetch('/api/analyze/insights')

      setProgress(50)

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights)
        setProgress(100)
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
        setInsights(null)
        setProgress(100)
      }
    } catch (error) {
      console.error('Error loading insights:', error)
      alert('Failed to load insights')
      setInsights(null)
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
          Insights & Analysis
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          AI-generated insights on why certain press releases perform better,
          including patterns in headlines, timing, and content structure.
        </p>
        <button
          onClick={loadInsights}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Generate Insights
        </button>
      </div>

      {/* Results */}
      {hasLoaded && (
        <div className="space-y-6">
          {!insights ? (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              No insights available yet. Run the analysis first.
            </div>
          ) : (
            <>
              {/* Why These Releases Performed Better */}
              {insights.whyPerformBetter && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🎯 Why Top Releases Performed Better
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {insights.whyPerformBetter.map((point, index) => (
                      <div key={index} className="mb-3">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {point.title}
                        </h4>
                        <p className="text-gray-600">{point.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patterns in Topic Selection */}
              {insights.topicPatterns && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📋 Patterns in Topic Selection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.topicPatterns.map((pattern, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {pattern.topic}
                          </h4>
                          <span className="text-sm text-blue-600 font-semibold">
                            {pattern.count} releases
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {pattern.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patterns in Headline Structure */}
              {insights.headlinePatterns && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📰 Patterns in Headline Structure
                  </h3>
                  <div className="space-y-3">
                    {insights.headlinePatterns.map((pattern, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-blue-600 font-bold">
                          {pattern.percentage}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {pattern.pattern}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {pattern.example}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patterns in Distribution Timing */}
              {insights.timingPatterns && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ⏰ Best Distribution Times
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insights.timingPatterns.map((timing, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 text-center"
                      >
                        <div className="text-2xl mb-2">{timing.icon}</div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {timing.label}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {timing.description}
                        </p>
                        <div className="mt-2 text-sm font-semibold text-green-600">
                          {timing.lift}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
