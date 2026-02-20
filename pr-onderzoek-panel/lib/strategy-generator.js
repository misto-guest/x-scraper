/**
 * Strategy Generator
 * Generates PR strategies based on project descriptions
 * In production, this would use OpenAI or Claude API
 */

function generateMockStrategy(description) {
  // Extract key terms from description
  const terms = description.toLowerCase()

  // Generate dynamic strategy based on keywords
  let angles = []
  let headlines = []
  let dataAngle = ''
  let journalistHook = ''
  let outreach = []
  let timing = {}
  let seoStrategy = []

  // Detect research type
  if (terms.includes('survey') || terms.includes('enquête')) {
    angles = [
      {
        title: 'The "Dutch Perspective" Angle',
        description:
          'Frame the survey results as uniquely Dutch, highlighting how Dutch opinions/behaviors compare to international trends.',
      },
      {
        title: 'The "Surprising Statistic" Angle',
        description:
          'Lead with the most counterintuitive finding. What would make people say "really?" Focus on unexpected patterns.',
      },
      {
        title: 'The "Trend Reversal" Angle',
        description:
          'If your data shows changing behaviors, frame it as a shift in Dutch society. What are people doing differently now vs 5 years ago?',
      },
      {
        title: 'The "Generational Divide" Angle',
        description:
          'If you have demographic breakdowns, highlight stark differences between age groups. Gen Z vs Boomers always generates coverage.',
      },
    ]

    headlines = [
      `"Onderzoek: [X]% van Nederlanders [verrassende gewoonte]"`,
      `"Enquête bij [N] respondenten: [key statistic]"`,
      `"Waarom [percentage] van de Nederlanders [actie] – wat dat betekent"`,
      `"Onderzoek toont aan: [expected result] is (niet) waar"`,
      `"Van [oud gedrag] naar [nieuw gedrag]: Nederland verandert"`,
    ]

    dataAngle = `Lead with your most surprising percentage (e.g., "67% van de Nederlanders werkt liever thuis"). Follow with sample size ("Gebaseerd op een enquête onder 1.000 Nederlandse werknemers"). Include margin of error and demographic breakdown if available.`

    journalistHook = `"Dit is de eerste keer dat we [verrassende bevinding] zien op nationale schaal. De cijfers laten een duidelijke verschuiving zien in hoe Nederlanders [onderwerp] denken."`

    outreach = [
      'Send personalized pitches to news editors at NU.nl, NOS, and AD',
      'Target business editors with statistics that affect companies',
      'Pitch to specialized journalists based on your topic (tech, health, finance)',
      'Include embargoed access to full data for interested journalists',
      'Offer expert interviews with your lead researcher',
      'Provide ready-to-use infographics and data visualizations',
    ]

    timing = {
      bestDay: 'Dinsdag',
      dayReason: 'Highest media pickup rate, especially for data-driven stories',
      bestTime: '10:00 uur',
      timeReason: 'After morning news meetings, journalists are looking for content',
    }

    seoStrategy = [
      {
        keyword: 'onderzoek [onderwerp]',
        usage: 'Include in headline and first paragraph',
      },
      {
        keyword: '[percentage] van de nederlanders',
        usage: 'Use specific percentage in headline for search relevance',
      },
      {
        keyword: '[jaar] [trend]',
        usage: 'Add year to capture current search interest',
      },
      {
        keyword: '[statistiek] nederland',
        usage: 'Include in meta description and URL slug',
      },
    ]
  } else if (terms.includes('experiment') || terms.includes('study')) {
    angles = [
      {
        title: 'The "Breakthrough" Angle',
        description:
          'Frame your research as solving a long-standing problem or answering an important question.',
      },
      {
        title: 'The "Practical Application" Angle',
        description:
          'Focus on how your findings can be applied in real-world situations. What does this mean for average people?',
      },
      {
        title: 'The "Global Relevance" Angle',
        description:
          'Connect your local research to global trends or challenges. Why does this matter beyond Netherlands?',
      },
    ]

    headlines = [
      `"Doorbraak in [onderwerp]: [universiteit] onderzoek gepubliceerd"`,
      `"Nieuwe studie van [instelling] toont: [key finding]"`,
      `"Onderzoek: hoe [verandering] de toekomst van [sector] bepaalt"`,
      `"Wetenschappers vinden oplossing voor [probleem]"`,
    ]

    dataAngle = `Emphasize methodology ("gecontroleerde studie met [N] deelnemers") and measurable outcomes. Include statistical significance if applicable.`

    journalistHook = `"Dit onderzoek verandert hoe we [onderwerp] begrijpen. We hebben voor het eerst bewijs dat [key finding]."`

    // ... rest similar to survey
    outreach = [
      'Target science journalists and specialized editors',
      'Offer expert interviews with lead researchers',
      'Provide clear layman explanations of complex findings',
      'Include visual abstracts and diagrams',
      'Highlight international collaboration if applicable',
    ]

    timing = {
      bestDay: 'Woensdag',
      dayReason: 'Science coverage peaks mid-week',
      bestTime: '09:00 uur',
      timeReason: 'Science sections often plan content in morning',
    }

    seoStrategy = [
      {
        keyword: 'onderzoek [universiteit]',
        usage: 'Include institution name for credibility',
      },
      {
        keyword: '[onderwerp] studie',
        usage: 'Use in headline and first paragraph',
      },
      {
        keyword: 'wetenschappelijke doorbraak',
        usage: 'Include if truly groundbreaking',
      },
    ]
  } else {
    // Generic strategy
    angles = [
      {
        title: 'The "New Insight" Angle',
        description:
          'Frame your research as revealing something previously unknown or misunderstood.',
      },
      {
        title: 'The "Human Interest" Angle',
        description:
          'Connect your data to real people and stories. How does this affect daily life?',
      },
    ]

    headlines = [
      `"Nieuw onderzoek: [key finding]"`,
      `"Onderzoek toont aan: [conclusie]"`,
    ]

    dataAngle = 'Present your most significant finding with supporting evidence.'

    journalistHook = `"Dit onderzoek werpt nieuw licht op [onderwerp]."`,

    outreach = ['Target relevant journalists', 'Offer expert interviews'],

    timing = {
      bestDay: 'Dinsdag',
      dayReason: 'Generally strong media day',
      bestTime: '10:00 uur',
      timeReason: 'Standard optimal time',
    }

    seoStrategy = [
      {
        keyword: 'onderzoek [onderwerp]',
        usage: 'Primary keyword',
      },
    ]
  }

  return {
    angles,
    headlines,
    dataAngle,
    journalistHook,
    outreach,
    timing,
    seoStrategy,
  }
}

/**
 * Generate PR strategy based on project description
 * In production, this would:
 * 1. Send description to LLM (OpenAI/Claude)
 * 2. Analyze key themes and data points
 * 3. Generate personalized strategy
 * 4. Return structured recommendations
 */
export async function generateStrategy(description) {
  console.log('Generating PR strategy for:', description)

  // For demo, return mock strategy
  // In production:
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4",
  //   messages: [{ role: "system", content: strategyPrompt }, { role: "user", content: description }],
  //   response_format: { type: "json_object" }
  // })

  return generateMockStrategy(description)
}

export default generateStrategy
