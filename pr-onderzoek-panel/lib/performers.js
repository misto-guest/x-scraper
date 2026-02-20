/**
 * Generate mock top performers data
 * In production, this would calculate from actual backlink data
 */

function getMockTopPerformers() {
  return [
    {
      title: 'Onderzoek: Remote work trends in 2024 laten sterke groei zien',
      company: 'TNO Nederland',
      date: '2024-02-15',
      uniqueDomains: 47,
      seoImpact: 8920,
      visibilityScore: 94.5,
      factors: [
        'Strong data visualizations',
        'Timing: Tuesday 10:00 AM',
        'Compelling headline with numbers',
        'Expert quotes included',
        'Survey size prominently featured',
      ],
    },
    {
      title: 'Universiteit Utrecht publiceert doorbraak in AI-onderzoek',
      company: 'Universiteit Utrecht',
      date: '2024-02-14',
      uniqueDomains: 62,
      seoImpact: 12450,
      visibilityScore: 97.2,
      factors: [
        'News hook: AI breakthrough',
        'Multiple expert quotes',
        'Emotional trigger: national pride',
        'Clear practical applications',
        'Published on Wednesday morning',
      ],
    },
    {
      title: 'CBS: Nederlandse economie groeit met 2,3% in Q4',
      company: 'Centraal Bureau voor de Statistiek',
      date: '2024-02-13',
      uniqueDomains: 89,
      seoImpact: 18700,
      visibilityScore: 98.8,
      factors: [
        'Official government data',
        'Concrete percentage in headline',
        'Timely economic news',
        'Comparison with previous quarter',
        'Infographics included',
      ],
    },
    {
      title: 'Onderzoek: 67% van Nederlanders kiest voor duurzaam',
      company: 'Rabobank',
      date: '2024-02-12',
      uniqueDomains: 35,
      seoImpact: 6800,
      visibilityScore: 88.3,
      factors: [
        'Percentage in headline',
        'Emotional topic: sustainability',
        'Visuals: charts and graphs',
        'Local relevance',
        'Actionable insights',
      ],
    },
    {
      title: 'RIVM: Luchtkwaliteit verbetert in grote steden',
      company: 'RIVM',
      date: '2024-02-11',
      uniqueDomains: 41,
      seoImpact: 7900,
      visibilityScore: 91.7,
      factors: [
        'Public health relevance',
        'Before/after comparison',
        'Regional breakdown',
        'Expert commentary',
        'Interactive maps',
      ],
    },
  ]
}

/**
 * Calculate visibility score
 * Composite metric based on:
 * - Unique domains (40%)
 * - SEO impact (30%)
 * - Social shares (20%)
 * - Authority of linking sites (10%)
 */
export function calculateVisibilityScore(metrics) {
  const weights = {
    uniqueDomains: 0.4,
    seoImpact: 0.3,
    socialShares: 0.2,
    domainAuthority: 0.1,
  }

  // Normalize metrics (0-100 scale)
  const normalized = {
    uniqueDomains: Math.min(metrics.uniqueDomains / 100, 1) * 100,
    seoImpact: Math.min(metrics.seoImpact / 20000, 1) * 100,
    socialShares: Math.min(metrics.socialShares / 1000, 1) * 100,
    domainAuthority: metrics.avgDomainAuthority,
  }

  const score = Object.entries(weights).reduce((acc, [key, weight]) => {
    return acc + normalized[key] * weight
  }, 0)

  return Math.round(score * 10) / 10
}

/**
 * Get top performing press releases
 */
export async function getTopPerformers(limit = 10) {
  console.log('Fetching top performers...')

  // For demo, return mock data
  // In production, calculate from database
  return getMockTopPerformers().slice(0, limit)
}

export default getTopPerformers
