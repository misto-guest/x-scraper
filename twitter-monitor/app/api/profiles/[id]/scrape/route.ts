import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { browserScraper } from '@/lib/browser-scraper';
import { relevanceAnalyzer } from '@/lib/analyzer';

// POST trigger scraping for a profile
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Create scrape log
    const log = await prisma.scrapeLog.create({
      data: {
        profileId: profile.id,
        tweetsFound: 0,
        tweetsSaved: 0,
      },
    });

    // Scrape tweets using browser scraper
    const tweets = await browserScraper.scrapeProfile(profile.username);

    let savedCount = 0;

    // Process and save tweets
    for (const tweet of tweets) {
      // Check if tweet already exists
      const existing = await prisma.tweet.findUnique({
        where: { tweetId: tweet.id },
      });

      if (existing) {
        continue;
      }

      // Analyze relevance
      const analysis = await relevanceAnalyzer.analyzeTweet(tweet.content, profile.id);

      // Save tweet
      await prisma.tweet.create({
        data: {
          tweetId: tweet.id,
          profileId: profile.id,
          content: tweet.content,
          author: tweet.author,
          url: tweet.url,
          publishedAt: tweet.publishedAt,
          likes: tweet.likes,
          retweets: tweet.retweets,
          replies: tweet.replies,
          views: tweet.views,
          relevanceScore: analysis.score,
          status: analysis.status,
          keywordMatches: JSON.stringify(analysis.matchedKeywords.map(m => m.keywordId)),
        },
      });

      savedCount++;
    }

    // Update log
    await prisma.scrapeLog.update({
      where: { id: log.id },
      data: {
        tweetsFound: tweets.length,
        tweetsSaved: savedCount,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      tweetsFound: tweets.length,
      tweetsSaved: savedCount,
      logId: log.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
