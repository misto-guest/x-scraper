'use client'

import { useState } from 'react'

export default function StrategyGenerator({ setIsLoading, setProgress }) {
  const [projectDescription, setProjectDescription] = useState('')
  const [strategy, setStrategy] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateStrategy = async () => {
    if (!projectDescription.trim()) {
      alert('Please enter a project description')
      return
    }

    setIsGenerating(true)
    setIsLoading(true)
    setProgress(10)

    try {
      const response = await fetch('/api/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: projectDescription }),
      })

      setProgress(50)

      if (response.ok) {
        const data = await response.json()
        setStrategy(data.strategy)
        setProgress(100)
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
        setStrategy(null)
        setProgress(100)
      }
    } catch (error) {
      console.error('Strategy generation error:', error)
      alert('Failed to generate strategy')
      setStrategy(null)
      setProgress(100)
    } finally {
      setIsGenerating(false)
      setTimeout(() => setIsLoading(false), 500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Strategy Generator
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Describe your research project or campaign, and we'll generate a
          comprehensive PR strategy based on top-performing press release
          patterns.
        </p>
        <textarea
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder="Example: We're conducting a survey of 1,000 Dutch consumers about remote work preferences and productivity in 2024..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Be specific about your research topic, target audience, and key
            findings for best results.
          </span>
          <button
            onClick={generateStrategy}
            disabled={isGenerating || !projectDescription.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Strategy'}
          </button>
        </div>
      </div>

      {/* Results */}
      {strategy && (
        <div className="space-y-6">
          {/* Press Release Angles */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📣 Suggested Press Release Angles
            </h3>
            <div className="space-y-3">
              {strategy.angles.map((angle, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {angle.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {angle.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Headline Examples */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📰 Headline Examples
            </h3>
            <div className="space-y-2">
              {strategy.headlines.map((headline, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-blue-600 font-semibold">
                    {index + 1}.
                  </span>
                  <span className="text-gray-900">{headline}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data & Statistics Angle */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Recommended Data/Statistics Angle
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p>{strategy.dataAngle}</p>
            </div>
          </div>

          {/* Journalist Hook */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎣 Suggested Journalist Hook
            </h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-gray-900">{strategy.journalistHook}</p>
            </div>
          </div>

          {/* Outreach Strategy */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📧 Outreach Strategy
            </h3>
            <div className="space-y-3">
              {strategy.outreach.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribution Timing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⏰ Recommended Distribution Timing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Best Day
                </h4>
                <p className="text-2xl font-bold text-blue-600 mb-1">
                  {strategy.timing.bestDay}
                </p>
                <p className="text-sm text-gray-600">
                  {strategy.timing.dayReason}
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Best Time
                </h4>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {strategy.timing.bestTime}
                </p>
                <p className="text-sm text-gray-600">
                  {strategy.timing.timeReason}
                </p>
              </div>
            </div>
          </div>

          {/* SEO Keyword Strategy */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔍 SEO Keyword Positioning Strategy
            </h3>
            <div className="space-y-3">
              {strategy.seoStrategy.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-purple-600 font-semibold">
                    {item.keyword}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {item.usage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
