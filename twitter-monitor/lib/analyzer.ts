import { prisma } from './prisma';

export interface KeywordMatch {
  keywordId: string;
  word: string;
  category: string;
  isNegative: boolean;
}

export interface RelevanceResult {
  score: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  matchedKeywords: KeywordMatch[];
  reason: string;
}

export class RelevanceAnalyzer {
  /**
   * Analyze tweet relevance based on keywords
   * Fixed to avoid N+1 query issues
   */
  async analyzeTweet(tweetContent: string, profileId: string): Promise<RelevanceResult> {
    // Fetch both profile-specific and global keywords in a single optimized query
    const allKeywords = await prisma.keyword.findMany({
      where: {
        OR: [
          { profileKeywords: { some: { profileId } } },
          { profileKeywords: { none: {} } }, // Global keywords
        ],
      },
      select: {
        id: true,
        word: true,
        category: true,
        isNegative: true,
      },
    });

    const matchedKeywords: KeywordMatch[] = [];
    const content = tweetContent.toLowerCase();

    // Check each keyword against tweet content
    for (const keyword of allKeywords) {
      if (content.includes(keyword.word.toLowerCase())) {
        matchedKeywords.push({
          keywordId: keyword.id,
          word: keyword.word,
          category: keyword.category || 'uncategorized',
          isNegative: keyword.isNegative,
        });
      }
    }

    // Calculate relevance score
    const score = this.calculateScore(matchedKeywords);
    const status = this.determineStatus(matchedKeywords, score);
    const reason = this.generateReason(matchedKeywords, status);

    return {
      score,
      status,
      matchedKeywords,
      reason,
    };
  }

  /**
   * Calculate relevance score based on keyword matches
   */
  private calculateScore(matches: KeywordMatch[]): number {
    let score = 0;
    const uniqueCategories = new Set<string>();

    for (const match of matches) {
      if (match.isNegative) {
        // Negative keywords heavily penalize
        score -= 50;
      } else {
        // Positive keywords add to score
        score += 10;
        uniqueCategories.add(match.category);
      }
    }

    // Bonus for diverse categories
    score += uniqueCategories.size * 5;

    // Normalize to 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Determine tweet status based on matches and score
   */
  private determineStatus(matches: KeywordMatch[], score: number): 'APPROVED' | 'PENDING' | 'REJECTED' {
    // Check for negative keywords
    const hasNegativeMatches = matches.some(m => m.isNegative);
    if (hasNegativeMatches) {
      return 'REJECTED';
    }

    // Auto-approve if score is high enough
    if (score >= 70) {
      return 'APPROVED';
    }

    // Auto-reject if score is very low
    if (score < 20) {
      return 'REJECTED';
    }

    // Otherwise, mark as pending for review
    return 'PENDING';
  }

  /**
   * Generate human-readable reason for status
   */
  private generateReason(matches: KeywordMatch[], status: string): string {
    if (status === 'REJECTED') {
      const negativeKeywords = matches.filter(m => m.isNegative);
      if (negativeKeywords.length > 0) {
        return `Contains negative keywords: ${negativeKeywords.map(k => k.word).join(', ')}`;
      }
      return `Low relevance score (${matches.length} keyword matches)`;
    }

    if (status === 'APPROVED') {
      const categories = [...new Set(matches.map(m => m.category))];
      return `High relevance: matches ${matches.length} keywords in ${categories.length} categories`;
    }

    return `Medium relevance: ${matches.length} keyword matches - needs review`;
  }

  /**
   * Get suggestions for improving relevance
   */
  async getKeywordSuggestions(tweets: string[]): Promise<string[]> {
    // Extract frequently occurring phrases (simple implementation)
    const words = tweets.join(' ').toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();

    for (const word of words) {
      if (word.length > 3) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    }

    // Return top 10 most common words
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }
}

export const relevanceAnalyzer = new RelevanceAnalyzer();
