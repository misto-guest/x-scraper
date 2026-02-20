import { generateInsights } from '../../../../lib/insights'

export const runtime = 'nodejs'
export const maxDuration = 60 // 1 minute for AI analysis

export async function POST() {
  try {
    console.log('Generating insights...')
    const insights = await generateInsights()

    return Response.json({
      success: true,
      insights,
      message: 'Insights generated successfully',
    })
  } catch (error) {
    console.error('Insights API error:', error)
    return Response.json(
      {
        success: false,
        message: 'Failed to generate insights',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
