'use client'

import { useState } from 'react'
import SearchResults from './search-results'
import BacklinkAnalysis from './backlink-analysis'
import TopPerformers from './top-performers'
import Insights from './insights'
import StrategyGenerator from './strategy-generator'

export default function Home() {
  const [activeTab, setActiveTab] = useState('search')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const tabs = [
    { id: 'search', label: 'Search Results', icon: '🔍' },
    { id: 'backlink', label: 'Backlink Analysis', icon: '🔗' },
    { id: 'performers', label: 'Top Performers', icon: '⭐' },
    { id: 'insights', label: 'Insights', icon: '📊' },
    { id: 'strategy', label: 'Strategy Generator', icon: '💡' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PR Onderzoek Panel
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                ANP Persportaal Research Analysis & Strategy Generator
              </p>
            </div>
            {isLoading && (
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Processing...</div>
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  transition-colors duration-200
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'search' && (
          <SearchResults
            setIsLoading={setIsLoading}
            setProgress={setProgress}
          />
        )}
        {activeTab === 'backlink' && (
          <BacklinkAnalysis
            setIsLoading={setIsLoading}
            setProgress={setProgress}
          />
        )}
        {activeTab === 'performers' && (
          <TopPerformers
            setIsLoading={setIsLoading}
            setProgress={setProgress}
          />
        )}
        {activeTab === 'insights' && (
          <Insights
            setIsLoading={setIsLoading}
            setProgress={setProgress}
          />
        )}
        {activeTab === 'strategy' && (
          <StrategyGenerator
            setIsLoading={setIsLoading}
            setProgress={setProgress}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>PR Onderzoek Panel v1.0</div>
            <div>
              <button
                onClick={() => {
                  // Export to CSV functionality
                  alert('Export functionality to be implemented')
                }}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Export to CSV
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
