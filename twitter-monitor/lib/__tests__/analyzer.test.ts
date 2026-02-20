/**
 * Unit tests for RelevanceAnalyzer
 * Run with: npm test
 */

import { RelevanceAnalyzer } from '../analyzer';

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    keyword: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '../prisma';

describe('RelevanceAnalyzer', () => {
  let analyzer: RelevanceAnalyzer;

  beforeEach(() => {
    analyzer = new RelevanceAnalyzer();
    jest.clearAllMocks();
  });

  describe('analyzeTweet', () => {
    it('should return APPROVED for high relevance score', async () => {
      // Mock keywords
      (prisma.keyword.findMany as jest.Mock).mockResolvedValue([
        { id: '1', word: 'SEO', category: 'marketing', isNegative: false },
        { id: '2', word: 'backlinks', category: 'marketing', isNegative: false },
        { id: '3', word: 'Google', category: 'tech', isNegative: false },
        { id: '4', word: 'ranking', category: 'marketing', isNegative: false },
      ]);

      const result = await analyzer.analyzeTweet(
        'SEO tip: Focus on creating high-quality backlinks from authoritative domains. Google ranking matters!',
        'profile-123'
      );

      expect(result.status).toBe('APPROVED');
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.matchedKeywords).toHaveLength(4);
    });

    it('should return REJECTED for negative keywords', async () => {
      (prisma.keyword.findMany as jest.Mock).mockResolvedValue([
        { id: '1', word: 'crypto', category: 'spam', isNegative: true },
      ]);

      const result = await analyzer.analyzeTweet(
        'Check out this amazing crypto opportunity!',
        'profile-123'
      );

      expect(result.status).toBe('REJECTED');
      expect(result.reason).toContain('negative keywords');
    });

    it('should return REJECTED for low relevance score', async () => {
      (prisma.keyword.findMany as jest.Mock).mockResolvedValue([
        { id: '1', word: 'SEO', category: 'marketing', isNegative: false },
      ]);

      const result = await analyzer.analyzeTweet(
        'Just a random tweet',
        'profile-123'
      );

      expect(result.status).toBe('REJECTED');
      expect(result.score).toBeLessThan(20);
    });

    it('should return PENDING for medium relevance score', async () => {
      (prisma.keyword.findMany as jest.Mock).mockResolvedValue([
        { id: '1', word: 'SEO', category: 'marketing', isNegative: false },
        { id: '2', word: 'marketing', category: 'marketing', isNegative: false },
        { id: '3', word: 'tips', category: 'general', isNegative: false },
      ]);

      const result = await analyzer.analyzeTweet(
        'Here are some SEO and marketing tips for your business',
        'profile-123'
      );

      expect(result.status).toBe('PENDING');
      expect(result.score).toBeGreaterThanOrEqual(20);
      expect(result.score).toBeLessThan(70);
    });

    it('should handle case-insensitive matching', async () => {
      (prisma.keyword.findMany as jest.Mock).mockResolvedValue([
        { id: '1', word: 'SEO', category: 'marketing', isNegative: false },
      ]);

      const result = await analyzer.analyzeTweet(
        'seo tips in lowercase',
        'profile-123'
      );

      expect(result.matchedKeywords).toHaveLength(1);
      expect(result.matchedKeywords[0].word).toBe('SEO');
    });

    it('should handle empty keyword list', async () => {
      (prisma.keyword.findMany as jest.Mock).mockResolvedValue([]);

      const result = await analyzer.analyzeTweet(
        'Any tweet content',
        'profile-123'
      );

      expect(result.score).toBe(0);
      expect(result.status).toBe('REJECTED');
    });
  });

  describe('calculateScore', () => {
    it('should calculate score correctly for positive keywords', async () => {
      (prisma.keyword.findMany as jest.Mock).mockResolvedValue([
        { id: '1', word: 'SEO', category: 'marketing', isNegative: false },
        { id: '2', word: 'backlinks', category: 'marketing', isNegative: false },
      ]);

      const result = await analyzer.analyzeTweet('SEO and backlinks', 'profile-123');

      // 2 positive keywords = 20 points
      // 1 unique category = 5 bonus points
      // Total = 25 points
      expect(result.score).toBe(25);
    });

    it('should penalize negative keywords heavily', async () => {
      (prisma.keyword.findMany as jest.Mock).mockResolvedValue([
        { id: '1', word: 'crypto', category: 'spam', isNegative: true },
      ]);

      const result = await analyzer.analyzeTweet('crypto scam', 'profile-123');

      expect(result.score).toBeLessThan(0);
    });

    it('should give bonus for diverse categories', async () => {
      (prisma.keyword.findMany as jest.Mock).mockResolvedValue([
        { id: '1', word: 'SEO', category: 'marketing', isNegative: false },
        { id: '2', word: 'Google', category: 'tech', isNegative: false },
        { id: '3', word: 'GMB', category: 'local', isNegative: false },
      ]);

      const result = await analyzer.analyzeTweet(
        'SEO, Google, and GMB tips',
        'profile-123'
      );

      // 3 positive keywords = 30 points
      // 3 unique categories = 15 bonus points
      // Total = 45 points
      expect(result.score).toBe(45);
    });
  });

  describe('determineStatus', () => {
    it('should auto-approve high scores', async () => {
      (prisma.keyword.findMany as jest.Mock).mockResolvedValue(
        Array.from({ length: 8 }, (_, i) => ({
          id: String(i),
          word: `keyword${i}`,
          category: `cat${i % 3}`,
          isNegative: false,
        }))
      );

      const result = await analyzer.analyzeTweet(
        'keyword0 keyword1 keyword2 keyword3 keyword4 keyword5 keyword6 keyword7',
        'profile-123'
      );

      expect(result.status).toBe('APPROVED');
    });
  });
});
