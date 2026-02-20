import { getTopPerformers } from '../../../../lib/performers'

export const runtime = 'nodejs'

export async function POST() {
  try {
    console.log('Loading top performers...')
    const performers = await getTopPerformers(10)

    return Response.json({
      success: true,
      performers,
      count: performers.length,
      message: `Loaded ${performers.length} top performers`,
    })
  } catch (error) {
    console.error('Top performers API error:', error)
    return Response.json(
      {
        success: false,
        message: 'Failed to load top performers',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
