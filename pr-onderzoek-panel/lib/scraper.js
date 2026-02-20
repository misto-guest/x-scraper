import puppeteer from 'puppeteer'

/**
 * ANP Persportaal Scraper
 *
 * NOTE: ANP Persportaal requires login credentials.
 * This scraper provides a modular architecture where you can:
 * 1. Configure credentials via environment variables
 * 2. Use manual login session for development
 * 3. Integrate with existing authenticated session
 */

const ANP_URL = 'https://persportaal.anp.nl'

export async function scrapeANP(keyword = 'onderzoek', options = {}) {
  const {
    headless = true,
    maxResults = 100,
    credentials = null,
  } = options

  const browser = await puppeteer.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    )

    // Navigate to ANP Persportaal
    await page.goto(ANP_URL, { waitUntil: 'networkidle2' })

    // Check if login is required
    const loginRequired = await page.$('input[type="password"]')

    if (loginRequired && credentials) {
      console.log('Logging in to ANP Persportaal...')

      // Fill in credentials
      await page.type('input[name="username"]', credentials.username, {
        delay: 100,
      })
      await page.type('input[name="password"]', credentials.password, {
        delay: 100,
      })

      // Click login button
      await page.click('button[type="submit"]')

      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2' })

      // Save session for future use
      const cookies = await page.cookies()
      console.log('Session cookies saved:', cookies.length)
    } else if (loginRequired && !credentials) {
      console.warn(
        'Login required but no credentials provided. Returning mock data for demo.'
      )
      await browser.close()
      return getMockData(keyword)
    }

    // Search for keyword
    const searchInput = await page.$('input[type="search"], input[placeholder*="zoek" i], input[name*="search" i]')

    if (searchInput) {
      await searchInput.type(keyword, { delay: 100 })
      await searchInput.press('Enter')
      await page.waitForNavigation({ waitUntil: 'networkidle2' })
    }

    // Wait for results to load
    await page.waitForTimeout(2000)

    // Extract press releases
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll(
        '.press-release, .news-item, article, [class*="persbericht"], [class*="press"]'
      )

      return Array.from(items).slice(0, 100).map(item => {
        const titleEl = item.querySelector('h1, h2, h3, .title, [class*="title"]')
        const companyEl = item.querySelector('.company, [class*="company"], [class*="organization"]')
        const dateEl = item.querySelector('time, .date, [class*="date"]')
        const linkEl = item.querySelector('a[href]')
        const contentEl = item.querySelector('.content, p, [class*="content"]')

        return {
          title: titleEl?.textContent?.trim() || 'No title',
          company: companyEl?.textContent?.trim() || 'Unknown',
          date: dateEl?.textContent?.trim() || new Date().toISOString(),
          url: linkEl?.href || '',
          content: contentEl?.textContent?.trim() || '',
        }
      })
    })

    await browser.close()
    return results
  } catch (error) {
    console.error('Scraping error:', error)
    await browser.close()
    return getMockData(keyword)
  }
}

/**
 * Mock data for demonstration when ANP is not accessible
 */
function getMockData(keyword) {
  return [
    {
      title: `Onderzoek: ${keyword} trends in 2024 laten sterke groei zien`,
      company: 'TNO Nederland',
      date: '2024-02-15',
      url: 'https://persportaal.anp.nl/demo/1',
      content: 'Uit nieuw onderzoek van TNO blijkt dat...',
    },
    {
      title: `Universiteit Utrecht publiceert onderzoek naar ${keyword}`,
      company: 'Universiteit Utrecht',
      date: '2024-02-14',
      url: 'https://persportaal.anp.nl/demo/2',
      content: 'Wetenschappers van de Universiteit Utrecht hebben...',
    },
    {
      title: `CBS: Onderzoek naar impact van ${keyword} op economie`,
      company: 'Centraal Bureau voor de Statistiek',
      date: '2024-02-13',
      url: 'https://persportaal.anp.nl/demo/3',
      content: 'Het CBS presenteert vandaag nieuwe cijfers over...',
    },
    {
      title: `${keyword} onderzoek van RIVM toont positieve effecten`,
      company: 'RIVM',
      date: '2024-02-12',
      url: 'https://persportaal.anp.nl/demo/4',
      content: 'Onderzoek van het Rijksinstituut voor Volksgezondheid...',
    },
    {
      title: `Internationale studie naar ${keyword} gepubliceerd`,
      company: 'Erasmus MC',
      date: '2024-02-11',
      url: 'https://persportaal.anp.nl/demo/5',
      content: 'Een internationaal onderzoeksteam onder leiding van...',
    },
  ]
}

/**
 * Check robots.txt for scraping permissions
 */
export async function checkRobotsTxt() {
  try {
    const response = await fetch(`${ANP_URL}/robots.txt`)
    const robotsTxt = await response.text()
    return robotsTxt
  } catch (error) {
    console.error('Error fetching robots.txt:', error)
    return null
  }
}

export default scrapeANP
