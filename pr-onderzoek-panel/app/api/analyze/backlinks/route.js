import { analyzeBacklinks } from '../../../../lib/backlink-analyzer'

export const runtime = 'nodejs'
export const maxDuration = 180 // 3 minutes

export async function POST() {
  try {
    // Analyze backlinks
    console.log('Starting backlink analysis...')
    const backlinks = await analyzeBacklinks()

    return Response.json({
      success: true,
      backlinks,
      count: backlinks.length,
      message: `Analyzed ${backlinks.length} backlinks`,
    })
  } catch (error) {
    console.error('Backlink analysis API error:', error)
    return Response.json(
      {
        success: false,
        message: 'Failed to analyze backlinks',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
