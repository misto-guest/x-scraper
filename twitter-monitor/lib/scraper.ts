import axios from 'axios';
import { simpleScraper } from './simple-scraper';

const GHOSTFETCH_URL = process.env.GHOSTFETCH_URL || 'http://localhost:8000';

export interface ScrapedTweet {
  id: string;
  content: string;
  author: string;
  url: string;
  publishedAt: Date;
  likes: number;
  retweets: number;
  replies: number;
  views: number;
}

export class TwitterScraper {
  /**
   * Fetch tweets from a Twitter/X profile
   */
  async scrapeProfile(username: string): Promise<ScrapedTweet[]> {
    // Try GhostFetch first, fall back to simple scraper
    try {
      const serverRunning = await this.isServerRunning();
      if (serverRunning) {
        return await this.scrapeWithGhostFetch(username);
      }
    } catch (error) {
      console.warn('GhostFetch unavailable, using simple scraper:', error);
    }

    // Fall back to simple scraper
    console.log('Using simple scraper for', username);
    return await simpleScraper.scrapeProfile(username);
  }

  private async scrapeWithGhostFetch(username: string): Promise<ScrapedTweet[]> {
    try {
      const profileUrl = `https://x.com/${username}`;
      const response = await axios.get(`${GHOSTFETCH_URL}/fetch/sync?url=${encodeURIComponent(profileUrl)}`, {
        timeout: 60000,
      });

      if (response.data.status !== 'success') {
        throw new Error(`GhostFetch error: ${response.data.error}`);
      }

      return this.parseTweetsFromHTML(response.data.markdown, username);
    } catch (error: any) {
      console.error('GhostFetch scraping error:', error.message);
      throw error;
    }
  }

  /**
   * Parse tweets from the fetched HTML/Markdown
   */
  private parseTweetsFromHTML(markdown: string, username: string): ScrapedTweet[] {
    const tweets: ScrapedTweet[] = [];
    
    // This is a simplified parser - in production, you'd want more robust parsing
    // The actual HTML structure from GhostFetch will vary
    const lines = markdown.split('\n');
    let currentTweet: Partial<ScrapedTweet> | null = null;

    for (const line of lines) {
      // Detect tweet patterns (this needs to be adjusted based on actual GhostFetch output)
      if (line.includes('/status/') || line.match(/\d{1,2}h/) || line.match(/\d{1,2}m/)) {
        if (currentTweet?.content) {
          tweets.push(this.finalizeTweet(currentTweet, username));
        }
        
        // Extract tweet ID if present
        const match = line.match(/status\/(\d+)/);
        currentTweet = {
          id: match?.[1] || this.generateTweetId(),
          url: match ? `https://x.com/${username}/status/${match[1]}` : '',
          content: '',
          author: username,
          publishedAt: new Date(),
          likes: 0,
          retweets: 0,
          replies: 0,
          views: 0,
        };
      } else if (currentTweet && line.trim()) {
        currentTweet.content = (currentTweet.content || '') + line + '\n';
      }
    }

    // Add the last tweet
    if (currentTweet?.content) {
      tweets.push(this.finalizeTweet(currentTweet, username));
    }

    return tweets;
  }

  private finalizeTweet(tweet: Partial<ScrapedTweet>, username: string): ScrapedTweet {
    return {
      id: tweet.id || this.generateTweetId(),
      content: tweet.content?.trim() || '',
      author: tweet.author || username,
      url: tweet.url || '',
      publishedAt: tweet.publishedAt || new Date(),
      likes: tweet.likes || 0,
      retweets: tweet.retweets || 0,
      replies: tweet.replies || 0,
      views: tweet.views || 0,
    };
  }

  private generateTweetId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Check if GhostFetch server is running
   */
  async isServerRunning(): Promise<boolean> {
    try {
      await axios.get(GHOSTFETCH_URL, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}

export const twitterScraper = new TwitterScraper();
