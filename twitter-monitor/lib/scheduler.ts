import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { twitterScraper } from '@/lib/scraper';
import { relevanceAnalyzer } from '@/lib/analyzer';

/**
 * Daily tweet scraping job
 * Runs every day at 9:00 AM
 */
export class ScrapingScheduler {
  start() {
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Starting daily scraping job...');
      await this.scrapeAllProfiles();
    });

    // Also run on startup for testing
    // setTimeout(() => this.scrapeAllProfiles(), 5000);
  }

  async scrapeAllProfiles() {
    try {
      const profiles = await prisma.profile.findMany({
        where: { enabled: true },
      });

      console.log(`Found ${profiles.length} profiles to scrape`);

      for (const profile of profiles) {
        try {
          console.log(`Scraping @${profile.username}...`);

          // Check if GhostFetch is running
          const serverRunning = await twitterScraper.isServerRunning();
          if (!serverRunning) {
            console.error('GhostFetch server is not running');
            continue;
          }

          // Scrape tweets
          const tweets = await twitterScraper.scrapeProfile(profile.username);

          // Create scrape log
          const log = await prisma.scrapeLog.create({
            data: {
              profileId: profile.id,
              tweetsFound: tweets.length,
              tweetsSaved: 0,
            },
          });

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
              tweetsSaved: savedCount,
              completedAt: new Date(),
            },
          });

          console.log(`Saved ${savedCount} new tweets from @${profile.username}`);
        } catch (error: any) {
          console.error(`Error scraping @${profile.username}:`, error.message);
        }
      }

      console.log('Daily scraping job completed');
    } catch (error: any) {
      console.error('Error in scraping job:', error);
    }
  }
}

export const scrapingScheduler = new ScrapingScheduler();
