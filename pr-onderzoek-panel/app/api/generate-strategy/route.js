import { generateStrategy } from '../../../lib/strategy-generator'

export const runtime = 'nodejs'
export const maxDuration = 60 // 1 minute for AI generation

export async function POST(request) {
  try {
    const { description } = await request.json()

    if (!description || description.trim().length < 10) {
      return Response.json(
        {
          success: false,
          message: 'Please provide a more detailed project description (min 10 characters)',
        },
        { status: 400 }
      )
    }

    console.log('Generating PR strategy for project...')
    const strategy = await generateStrategy(description)

    return Response.json({
      success: true,
      strategy,
      message: 'Strategy generated successfully',
    })
  } catch (error) {
    console.error('Strategy generation API error:', error)
    return Response.json(
      {
        success: false,
        message: 'Failed to generate strategy',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
