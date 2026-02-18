import type { APIContext } from 'astro';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  calculateRelevance,
  detectOpenClawCategory,
  findMatchingProject,
  getProject,
  getProjects,
  getOpenClawCategories
} from '../../../lib/admin-utils';

const execAsync = promisify(exec);

interface TweetAnalysis {
  success: boolean;
  content?: {
    author: string;
    text: string;
    date: string;
    url: string;
    metrics?: {
      likes?: number;
      retweets?: number;
      replies?: number;
    };
  };
  analysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    sentimentScore: number;
    topics: string[];
    hashtags: string[];
    suggestedActions: string[];
  };
  categorization?: {
    analysisType: 'openclaw' | 'project';
    category?: string;
    projectId?: string;
    projectName?: string;
    relevanceScore: number;
    threshold?: number;
    summary: string;
    suggestedActions: string[];
    priority: 'high' | 'medium' | 'low';
    estimatedEffort: string;
    matchedKeywords: string[];
  };
  error?: string;
}

export async function POST(context: APIContext) {
  const body = await context.request.json();
  const { url, analysisType = 'auto', projectId, categoryId } = body;

  if (!url) {
    return new Response(
      JSON.stringify({ error: 'Tweet URL is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate URL
  const urlPattern = /^https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/status\/[0-9]+/;
  if (!urlPattern.test(url)) {
    return new Response(
      JSON.stringify({ error: 'Invalid tweet URL. Must be a valid X.com or Twitter.com status URL' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Fetch tweet content using GhostFetch
    const ghostfetchCmd = `pipx run --spec ghostfetch python -c "from ghostfetch import fetch_markdown; import sys; result = fetch_markdown('${url}'); print(result)"`;

    const { stdout, stderr } = await execAsync(ghostfetchCmd, {
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024 * 2 // 2MB buffer
    });

    if (stderr && stderr.includes('ERROR')) {
      throw new Error(stderr);
    }

    const markdownContent = stdout.trim();

    // Parse the tweet content from markdown
    const parsed = parseTweetContent(markdownContent, url);

    // Analyze the tweet (using OpenAI if available, otherwise do basic analysis)
    const analysis = await analyzeTweet(parsed);

    // Categorize the tweet
    const categorization = await categorizeTweet(parsed.text, analysisType, projectId, categoryId);

    const result: TweetAnalysis = {
      success: true,
      content: parsed,
      analysis,
      categorization
    };

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error analyzing tweet:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to analyze tweet: ' + (error.message || 'Unknown error')
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function parseTweetContent(markdown: string, url: string): any {
  // Extract author from patterns like "@username" or "Username (@username)"
  const authorMatch = markdown.match(/@([a-zA-Z0-9_]+)/);
  const author = authorMatch ? authorMatch[0] : 'Unknown';

  // Try to extract metrics (likes, retweets, etc.) if present in the markdown
  const likesMatch = markdown.match(/(\d+[KkMm]?)\s*(likes?|❤️)/i);
  const retweetsMatch = markdown.match(/(\d+[KkMm]?)\s*(retweets?|🔄|♻️)/i);
  const repliesMatch = markdown.match(/(\d+[KkMm]?)\s*(replies?|💬)/i);

  const metrics = {
    likes: likesMatch ? parseMetric(likesMatch[1]) : undefined,
    retweets: retweetsMatch ? parseMetric(retweetsMatch[1]) : undefined,
    replies: repliesMatch ? parseMetric(repliesMatch[1]) : undefined,
  };

  // Extract the main text content (remove common UI elements)
  let text = markdown
    .replace(/^@\w+\s*/, '') // Remove leading @mentions
    .replace(/\b\d+[KkMm]?\s*(likes?|retweets?|replies?)\b/gi, '') // Remove metrics
    .replace(/\b(❤️|🔄|♻️|💬)\b/g, '') // Remove metric emojis
    .replace(/\d{1,2}:\d{2}\s*(AM|PM|am|pm)\s*·\s*\d{1,2}\/\d{1,2}\/\d{2,4}/g, '') // Remove timestamps
    .replace(/\d+\/\d+\/\d{4}/g, '') // Remove dates
    .trim();

  // If text is too long or empty, use a reasonable portion
  if (text.length > 500) {
    text = text.substring(0, 500) + '...';
  }

  // Try to extract date from markdown
  const dateMatch = markdown.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
  const date = dateMatch ? dateMatch[0] : new Date().toLocaleDateString();

  return {
    author,
    text: text || 'Unable to extract tweet text',
    date,
    url,
    metrics: (metrics.likes || metrics.retweets || metrics.replies) ? metrics : undefined
  };
}

function parseMetric(metric: string): number {
  const multipliers: { [key: string]: number } = {
    'k': 1000,
    'K': 1000,
    'm': 1000000,
    'M': 1000000,
  };

  const suffix = metric.slice(-1);
  const base = parseFloat(metric);

  if (multipliers[suffix]) {
    return base * multipliers[suffix];
  }
  return base;
}

async function categorizeTweet(
  text: string,
  analysisType: string,
  projectId?: string,
  categoryId?: string
): Promise<any> {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  let categorization: any = {
    analysisType: analysisType === 'auto' ? 'openclaw' : analysisType,
    relevanceScore: 0,
    summary: '',
    suggestedActions: [],
    priority: 'medium' as 'high' | 'medium' | 'low',
    estimatedEffort: 'Unknown',
    matchedKeywords: []
  };

  // Determine the type
  if (analysisType === 'auto') {
    // Auto-detect: check projects first, then OpenClaw categories
    const projectMatch = findMatchingProject(text);
    if (projectMatch) {
      categorization.analysisType = 'project';
      categorization.projectId = projectMatch.project.id;
      categorization.projectName = projectMatch.project.name;
      categorization.relevanceScore = projectMatch.score;
      categorization.threshold = projectMatch.project.relevanceThreshold;
      categorization.matchedKeywords = projectMatch.project.keywords.filter(kw =>
        text.toLowerCase().includes(kw.toLowerCase())
      );
      categorization.suggestedActions = [projectMatch.project.actionTemplate.replace('{tweetUrl}', 'see tweet')];
    } else {
      const categoryMatch = detectOpenClawCategory(text);
      if (categoryMatch) {
        categorization.analysisType = 'openclaw';
        categorization.category = categoryMatch.name;
        categorization.relevanceScore = calculateRelevance(text, categoryMatch.keywords);
        categorization.matchedKeywords = categoryMatch.keywords.filter(kw =>
          text.toLowerCase().includes(kw.toLowerCase())
        );
        categorization.suggestedActions = [categoryMatch.actionTemplate.replace('{tweetUrl}', 'see tweet')];
      } else {
        categorization.summary = 'No specific category or project matched. General tweet analysis.';
        categorization.suggestedActions = ['Review for general relevance'];
        return categorization;
      }
    }
  } else if (analysisType === 'project' && projectId) {
    const project = getProject(projectId);
    if (project) {
      categorization.analysisType = 'project';
      categorization.projectId = project.id;
      categorization.projectName = project.name;
      categorization.relevanceScore = calculateRelevance(text, project.keywords);
      categorization.threshold = project.relevanceThreshold;
      categorization.matchedKeywords = project.keywords.filter(kw =>
        text.toLowerCase().includes(kw.toLowerCase())
      );
      categorization.suggestedActions = [project.actionTemplate.replace('{tweetUrl}', 'see tweet')];
    }
  } else if (analysisType === 'openclaw') {
    const categories = getOpenClawCategories();
    let targetCategory = categoryId
      ? categories.find(c => c.id === categoryId)
      : detectOpenClawCategory(text);

    if (targetCategory) {
      categorization.analysisType = 'openclaw';
      categorization.category = targetCategory.name;
      categorization.relevanceScore = calculateRelevance(text, targetCategory.keywords);
      categorization.matchedKeywords = targetCategory.keywords.filter(kw =>
        text.toLowerCase().includes(kw.toLowerCase())
      );
      categorization.suggestedActions = [targetCategory.actionTemplate.replace('{tweetUrl}', 'see tweet')];
    }
  }

  // Determine priority based on relevance
  if (categorization.relevanceScore >= 80) {
    categorization.priority = 'high';
  } else if (categorization.relevanceScore >= 50) {
    categorization.priority = 'medium';
  } else {
    categorization.priority = 'low';
  }

  // Estimate effort based on category/content
  if (categorization.relevanceScore >= 80) {
    categorization.estimatedEffort = '2-4 hours';
  } else if (categorization.relevanceScore >= 50) {
    categorization.estimatedEffort = '1-2 hours';
  } else {
    categorization.estimatedEffort = '30-60 minutes';
  }

  // Generate AI summary if OpenAI is available
  if (apiKey) {
    try {
      const summary = await generateAISummary(text, categorization);
      categorization.summary = summary;
    } catch (error) {
      categorization.summary = generateBasicSummary(text, categorization);
    }
  } else {
    categorization.summary = generateBasicSummary(text, categorization);
  }

  return categorization;
}

async function generateAISummary(text: string, categorization: any): Promise<string> {
  const apiKey = import.meta.env.OPENAI_API_KEY;

  const context = categorization.analysisType === 'project'
    ? `This tweet matches project "${categorization.projectName}" with ${categorization.relevanceScore}% relevance.`
    : `This tweet matches OpenClaw category "${categorization.category}" with ${categorization.relevanceScore}% relevance.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a technical analyst. Provide concise 1-2 sentence summaries of tweets for action tracking.'
        },
        {
          role: 'user',
          content: `${context}\n\nTweet: "${text}"\n\nProvide a brief summary (1-2 sentences) of what this tweet is about and what action might be needed.`
        }
      ],
      temperature: 0.5,
      max_tokens: 150
    })
  });

  if (response.ok) {
    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  throw new Error('AI summary generation failed');
}

function generateBasicSummary(text: string, categorization: any): string {
  const type = categorization.analysisType === 'project' ? categorization.projectName : categorization.category;
  return `This tweet relates to ${type} with ${categorization.relevanceScore}% relevance. It contains keywords: ${categorization.matchedKeywords.join(', ')}.`;
}

async function analyzeTweet(tweet: any): Promise<any> {
  const apiKey = import.meta.env.OPENAI_API_KEY;

  // If OpenAI is available, use it for advanced analysis
  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a social media analyst. Analyze tweets and provide sentiment, topics, and suggested actions. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: `Analyze this tweet and provide:
1. Sentiment (positive/neutral/negative)
2. Sentiment score (0-100, where 50 is neutral)
3. Key topics or themes (array of 3-5 strings)
4. Hashtags mentioned (array, extract without # symbol)
5. Suggested action items (array of 2-4 actionable responses)

Tweet by ${tweet.author}:
"${tweet.text}"

Response as JSON:
{
  "sentiment": "positive|neutral|negative",
  "sentimentScore": 50,
  "topics": ["topic1", "topic2", "topic3"],
  "hashtags": ["tag1", "tag2"],
  "suggestedActions": ["action1", "action2", "action3"]
}`
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.choices[0].message.content;

        try {
          // Try to parse directly
          return JSON.parse(generatedText);
        } catch {
          // Try to extract JSON from markdown code blocks
          const jsonMatch = generatedText.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||
            generatedText.match(/(\{[\s\S]*\})/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
          }
        }
      }
    } catch (error) {
      console.error('OpenAI analysis failed, falling back to basic analysis:', error);
    }
  }

  // Fallback to basic analysis
  return basicAnalysis(tweet);
}

function basicAnalysis(tweet: any): any {
  const text = tweet.text.toLowerCase();

  // Simple sentiment analysis
  const positiveWords = ['good', 'great', 'awesome', 'love', 'excellent', 'amazing', 'best', 'happy', 'thanks', 'thank you', 'excited', 'thrilled'];
  const negativeWords = ['bad', 'terrible', 'hate', 'worst', 'awful', 'poor', 'sad', 'angry', 'disappointed', 'frustrated', 'annoyed'];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => { if (text.includes(word)) positiveCount++; });
  negativeWords.forEach(word => { if (text.includes(word)) negativeCount++; });

  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  let sentimentScore = 50;

  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    sentimentScore = 50 + (positiveCount * 10);
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    sentimentScore = 50 - (negativeCount * 10);
  }

  // Extract hashtags
  const hashtagMatches = tweet.text.match(/#(\w+)/g) || [];
  const hashtags = hashtagMatches.map(tag => tag.substring(1));

  // Extract topics (simple keyword extraction)
  const topics: string[] = [];
  const techKeywords = ['ai', 'api', 'code', 'development', 'software', 'app', 'web', 'data', 'cloud', 'security', 'python', 'javascript', 'react', 'node'];
  const businessKeywords = ['startup', 'business', 'revenue', 'growth', 'marketing', 'sales', 'customer', 'product'];

  techKeywords.forEach(keyword => {
    if (text.includes(keyword) && !topics.includes(keyword)) topics.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
  });

  businessKeywords.forEach(keyword => {
    if (text.includes(keyword) && !topics.includes(keyword)) topics.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
  });

  if (topics.length === 0) {
    topics.push('General');
  }

  // Suggested actions
  const suggestedActions: string[] = [];
  if (sentiment === 'positive') {
    suggestedActions.push('Consider engaging with a positive response');
    suggestedActions.push('Share if relevant to your audience');
  } else if (sentiment === 'negative') {
    suggestedActions.push('Review the concern carefully');
    suggestedActions.push('Consider responding with empathy');
  } else {
    suggestedActions.push('Evaluate relevance to your work');
    suggestedActions.push('Save for reference if useful');
  }

  if (hashtags.length > 0) {
    suggestedActions.push(`Research trending hashtags: ${hashtags.slice(0, 2).join(', ')}`);
  }

  return {
    sentiment,
    sentimentScore: Math.max(0, Math.min(100, sentimentScore)),
    topics: topics.slice(0, 5),
    hashtags,
    suggestedActions: suggestedActions.slice(0, 4)
  };
}
