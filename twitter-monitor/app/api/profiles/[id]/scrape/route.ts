import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { browserScraper } from '@/lib/browser-scraper';
import { relevanceAnalyzer } from '@/lib/analyzer';

// Scraping timeout (60 seconds)
const SCRAPE_TIMEOUT = 60000;

// POST trigger scraping for a profile
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  let logId: string | null = null;

  try {
    const { id } = await params;

    // Fetch profile
    const profile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if profile is enabled
    if (!profile.enabled) {
      return NextResponse.json(
        { error: 'Profile is disabled. Enable it first.' },
        { status: 400 }
      );
    }

    // Create scrape log
    const log = await prisma.scrapeLog.create({
      data: {
        profileId: profile.id,
        tweetsFound: 0,
        tweetsSaved: 0,
      },
    });
    logId = log.id;

    // Scrape tweets with timeout
    const tweets = await Promise.race([
      browserScraper.scrapeProfile(profile.username),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Scraping timeout')), SCRAPE_TIMEOUT)
      ),
    ]);

    if (!Array.isArray(tweets)) {
      throw new Error('Invalid scraper response: expected array of tweets');
    }

    let savedCount = 0;
    const errors: string[] = [];

    // Process and save tweets
    for (const tweet of tweets) {
      try {
        // Validate tweet data
        if (!tweet.id || !tweet.content) {
          console.warn('Skipping invalid tweet:', tweet);
          continue;
        }

        // Check if tweet already exists (use upsert for race condition safety)
        const existing = await prisma.tweet.findUnique({
          where: { tweetId: tweet.id },
        });

        if (existing) {
          continue;
        }

        // Analyze relevance
        const analysis = await relevanceAnalyzer.analyzeTweet(tweet.content, profile.id);

        // Save tweet with transaction
        await prisma.tweet.create({
          data: {
            tweetId: tweet.id,
            profileId: profile.id,
            content: tweet.content,
            author: tweet.author || profile.username,
            url: tweet.url || `https://x.com/${profile.username}/status/${tweet.id}`,
            publishedAt: tweet.publishedAt || new Date(),
            likes: tweet.likes || 0,
            retweets: tweet.retweets || 0,
            replies: tweet.replies || 0,
            views: tweet.views || 0,
            relevanceScore: analysis.score,
            status: analysis.status,
            keywordMatches: JSON.stringify(analysis.matchedKeywords.map(m => m.keywordId)),
          },
        });

        savedCount++;
      } catch (error: any) {
        const errorMsg = `Failed to save tweet ${tweet.id}: ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // Update log
    const duration = Date.now() - startTime;
    await prisma.scrapeLog.update({
      where: { id: log.id },
      data: {
        tweetsFound: tweets.length,
        tweetsSaved: savedCount,
        completedAt: new Date(),
        errors: errors.length > 0 ? errors.join('; ') : null,
      },
    });

    return NextResponse.json({
      success: true,
      tweetsFound: tweets.length,
      tweetsSaved: savedCount,
      errors: errors.length,
      duration: `${duration}ms`,
      logId: log.id,
    });
  } catch (error: any) {
    console.error('[POST /api/profiles/[id]/scrape] Error:', error);

    // Update log with error if we have a log ID
    if (logId) {
      try {
        await prisma.scrapeLog.update({
          where: { id: logId },
          data: {
            completedAt: new Date(),
            errors: error.message,
          },
        });
      } catch (logError) {
        console.error('Failed to update scrape log:', logError);
      }
    }

    return NextResponse.json(
      {
        error: 'Scraping failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
