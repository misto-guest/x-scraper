import { scrapeANP } from '../../../lib/scraper'
import initDatabase from '../../../lib/database'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

export async function POST(request) {
  try {
    const { keyword = 'onderzoek' } = await request.json()

    // Initialize database
    const db = initDatabase()

    // Check for credentials in environment
    const credentials =
      process.env.ANP_USERNAME && process.env.ANP_PASSWORD
        ? {
            username: process.env.ANP_USERNAME,
            password: process.env.ANP_PASSWORD,
          }
        : null

    // Scrape ANP Persportaal
    console.log(`Starting ANP scrape for keyword: ${keyword}`)
    const results = await scrapeANP(keyword, {
      headless: true,
      maxResults: 100,
      credentials,
    })

    // Store results in database
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO press_releases (title, company, date, url, content)
      VALUES (?, ?, ?, ?, ?)
    `)

    const insertMany = db.transaction((pressReleases) => {
      for (const pr of pressReleases) {
        stmt.run(pr.title, pr.company, pr.date, pr.url, pr.content)
      }
    })

    insertMany(results)

    return Response.json({
      success: true,
      results,
      count: results.length,
      message: `Successfully scraped ${results.length} press releases`,
    })
  } catch (error) {
    console.error('Scrape API error:', error)
    return Response.json(
      {
        success: false,
        message: 'Failed to scrape ANP Persportaal',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
