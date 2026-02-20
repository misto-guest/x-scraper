/**
 * Mock insights data
 * In production, this would use AI/LLM to analyze patterns
 */

function getMockInsights() {
  return {
    whyPerformBetter: [
      {
        title: 'Data-Driven Headlines Win',
        description:
          'Press releases with specific numbers, percentages, or statistics in the headline generate 2.3x more coverage than those without. Example: "67% of Dutch consumers choose sustainable" outperforms "Dutch consumers prefer sustainable options".',
      },
      {
        title: 'Timing Matters: Tuesday-Wednesday Sweet Spot',
        description:
          'Releases published on Tuesday or Wednesday mornings between 9-11 AM see 47% higher pickup rates. Weekend releases perform worst with 68% less coverage.',
      },
      {
        title: 'Expert Quotes Increase Credibility',
        description:
          'Press releases featuring quotes from recognized experts, professors, or industry leaders get 1.8x more editorial coverage. Journalists value authoritative voices.',
      },
      {
        title: 'Survey Size Matters',
        description:
          'Mentioning survey size (e.g., "based on 1,000 respondents") increases credibility by 35%. Large sample sizes (1,000+) outperform "honderden" (hundreds) by 22%.',
      },
      {
        title: 'Visual Elements Boost Sharing',
        description:
          'Press releases that include infographics, charts, or images see 89% more social media shares. Visual content makes data digestable.',
      },
    ],

    topicPatterns: [
      {
        topic: 'Sustainability & Climate',
        count: 34,
        description:
          'Environmental topics consistently perform well across Dutch media, especially with concrete data.',
      },
      {
        topic: 'Digital Transformation & AI',
        count: 28,
        description:
          'Technology topics, particularly AI and digital innovation, see high engagement from tech and business press.',
      },
      {
        topic: 'Economic Indicators',
        count: 25,
        description:
          'Official statistics and economic data get strong pickup from financial news outlets.',
      },
      {
        topic: 'Health & Well-being',
        count: 22,
        description:
          'Public health research generates consistent interest, especially with practical implications.',
      },
      {
        topic: 'Work & Employment',
        count: 19,
        description:
          'Remote work, salary trends, and employment data resonate with working professionals.',
      },
    ],

    headlinePatterns: [
      {
        pattern: 'Number + Percentage + Topic',
        percentage: '42%',
        example: '"Onderzoek: 67% van Nederlanders kiest voor duurzaam"',
      },
      {
        pattern: 'University/Institution + Breakthrough + Topic',
        percentage: '28%',
        example: '"Utrecht University researchers develop revolutionary AI method"',
      },
      {
        pattern: 'Organization + Action + Data Point',
        percentage: '21%',
        example: '"CBS: Dutch economy grows by 2.3% in Q4"',
      },
      {
        pattern: 'Question-Based Headline',
        percentage: '9%',
        example: '"Is remote work here to stay? New study reveals truth"',
      },
    ],

    timingPatterns: [
      {
        label: 'Tuesday 10:00 AM',
        icon: '📅',
        description: 'Optimal for maximum media pickup',
        lift: '+47% coverage',
      },
      {
        label: 'Wednesday 9:00 AM',
        icon: '⏰',
        description: 'Strong alternative to Tuesday',
        lift: '+39% coverage',
      },
      {
        label: 'Thursday 11:00 AM',
        icon: '📆',
        description: 'Good for feature-focused releases',
        lift: '+28% coverage',
      },
    ],
  }
}

/**
 * Generate insights from press release data
 * In production, this would:
 * 1. Use LLM to analyze patterns
 * 2. Apply NLP for topic clustering
 * 3. Calculate statistical significance
 * 4. Generate natural language insights
 */
export async function generateInsights() {
  console.log('Generating insights from press release data...')

  // For demo, return mock insights
  // In production, analyze actual database and generate AI insights
  return getMockInsights()
}

export default generateInsights
