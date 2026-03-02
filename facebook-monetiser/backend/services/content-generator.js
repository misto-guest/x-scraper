/**
 * Content Generator Service
 * AI-powered content generation for social media posts
 * MVP: Mock implementation with template-based generation
 * TODO: Integrate OpenAI GPT-4 in Phase 2
 */

class ContentGenerator {
  constructor() {
    this.captionTemplates = {
      image: [
        "The secret to {topic}? It's simpler than you think. 🎯 Here's what works:",
        "Most people get {topic} wrong. Here's the truth:",
        "Stop overcomplicating {topic}. Focus on this instead:",
        "{topic} mastered in 3 simple steps:",
        "The {topic} strategy that actually delivers results:"
      ],
      reel: [
        "Watch till the end for the {topic} hack that changed everything 🔥",
        "This {topic} mistake is costing you results:",
        "POV: You finally understood {topic}",
        "The {topic} truth nobody tells you:",
        "3 {topic} tips I wish I knew earlier:"
      ],
      text: [
        "Let's talk about {topic}.\n\nHere's what most people miss:\n\n• Point 1\n• Point 2\n• Point 3\n\nWhat's your experience?",
        "Hot take on {topic}:\n\nThe conventional advice is wrong. Here's why:",
        "{topic} breakdown:\n\n1. The problem\n2. The solution\n3. The result\n\nSave this for later.",
        "Unpopular opinion: {topic} is easier when you:",
        "The complete guide to {topic} 🧵"
      ]
    };

    this.commentTemplates = [
      "👇 What's your take on this?",
      "Drop a comment if this resonates!",
      "Save this for later! 💾",
      "Follow for more {topic} tips",
      "Tag someone who needs to see this!",
      "What would you add to this list?",
      "Double tap if you agree ❤️"
    ];

    this.imagePromptTemplates = {
      professional: [
        "Professional photo showing {topic} concept, clean white background, high quality, modern business aesthetic",
        "Infographic style image about {topic}, minimalist design, blue and white color scheme",
        "Modern business illustration depicting {topic}, clean lines, professional lighting"
      ],
      casual: [
        "Relatable photo about {topic}, warm lighting, friendly atmosphere, lifestyle aesthetic",
        "Candid style image showing {topic}, natural colors, authentic feel",
        "Fun and engaging visual about {topic}, bright colors, modern social media style"
      ],
      bold: [
        "Bold eye-catching image about {topic}, high contrast, dramatic lighting, attention-grabbing",
        "Vibrant photo featuring {topic}, saturated colors, dynamic composition, standout visual",
        "Powerful visual statement about {topic}, strong typography, impactful design"
      ]
    };

    this.recentCaptions = new Map(); // Track for originality checking
  }

  /**
   * Generate caption from context
   */
  async generateCaption(context, options = {}) {
    const {
      content_type = 'image',
      tone = 'professional',
      target_audience = 'general'
    } = options;

    // Extract topic from context
    const topic = this._extractTopic(context);

    // Get template based on content type
    const templates = this.captionTemplates[content_type] || this.captionTemplates.image;
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Generate caption
    let caption = template.replace(/{topic}/g, topic || 'this');

    // Add context-specific content
    if (context.content_text) {
      const keyPoint = this._extractKeyPoint(context.content_text);
      caption += `\n\n${keyPoint}`;
    }

    if (context.insight_text) {
      caption += `\n\n💡 ${context.insight_text}`;
    }

    return caption;
  }

  /**
   * Generate first comment
   */
  async generateFirstComment(caption, options = {}) {
    const { include_cta = true } = options;

    if (!include_cta) {
      return null;
    }

    const template = this.commentTemplates[Math.floor(Math.random() * this.commentTemplates.length)];

    // Extract topic from caption if possible
    const topic = this._extractTopicFromCaption(caption);
    return template.replace(/{topic}/g, topic || 'this');
  }

  /**
   * Generate image prompt
   */
  async generateImagePrompt(caption, options = {}) {
    const {
      style = 'professional',
      mood = 'neutral',
      content_type = 'image'
    } = options;

    const templates = this.imagePromptTemplates[style] || this.imagePromptTemplates.professional;
    const template = templates[Math.floor(Math.random() * templates.length)];

    const topic = this._extractTopicFromCaption(caption);
    return template.replace(/{topic}/g, topic || 'the concept');
  }

  /**
   * Calculate originality score
   */
  calculateOriginalityScore(caption) {
    if (!caption) {
      return 0;
    }

    // Simple heuristic: check similarity with recent captions
    const words = caption.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);

    // Basic metrics
    const uniqueWordRatio = uniqueWords.size / words.length;
    const lengthScore = Math.min(words.length / 50, 1); // Longer tends to be more unique

    // Check against recent captions (in production, use more sophisticated similarity)
    let similarityScore = 0;
    for (const [recentCaption] of this.recentCaptions) {
      const recentWords = recentCaption.toLowerCase().split(/\s+/);
      const intersection = words.filter(w => recentWords.includes(w));
      const jaccard = intersection.length / (uniqueWords.size + recentWords.length - intersection.length);
      similarityScore = Math.max(similarityScore, jaccard);
    }

    // Store this caption for future comparison
    this.recentCaptions.set(caption, Date.now());

    // Clean old captions (keep last 100)
    if (this.recentCaptions.size > 100) {
      const oldest = Array.from(this.recentCaptions.entries()).sort((a, b) => a[1] - b[1])[0];
      this.recentCaptions.delete(oldest[0]);
    }

    // Calculate final score
    const originality = (uniqueWordRatio * 0.4) + (lengthScore * 0.3) + ((1 - similarityScore) * 0.3);

    return Math.max(0, Math.min(1, originality));
  }

  /**
   * Extract topic from context
   */
  _extractTopic(context) {
    if (!context) {
      return 'success';
    }

    // Try to extract from title
    if (context.title) {
      const words = context.title.split(' ');
      return words.slice(0, 3).join(' '); // First 3 words
    }

    // Try to extract from insight
    if (context.insight_text) {
      const words = context.insight_text.split(' ');
      return words.slice(0, 3).join(' ');
    }

    // Try to extract from content
    if (context.content_text) {
      const sentences = context.content_text.split('.');
      return sentences[0].split(' ').slice(0, 3).join(' ');
    }

    // Fallback
    return context.category || 'this topic';
  }

  /**
   * Extract key point from content
   */
  _extractKeyPoint(content) {
    if (!content) {
      return '';
    }

    // Get first sentence, truncate if too long
    const firstSentence = content.split('.')[0];
    return firstSentence.length > 150 ? firstSentence.substring(0, 147) + '...' : firstSentence;
  }

  /**
   * Extract topic from caption
   */
  _extractTopicFromCaption(caption) {
    if (!caption) {
      return null;
    }

    // Simple extraction: find significant words (4+ characters)
    const words = caption.match(/\b[a-zA-Z]{4,}\b/g) || [];
    const stopWords = ['this', 'that', 'with', 'from', 'have', 'been', 'they', 'their', 'what', 'when', 'your', 'will'];

    const significantWords = words.filter(w => !stopWords.includes(w.toLowerCase()));

    if (significantWords.length > 0) {
      return significantWords.slice(0, 2).join(' ');
    }

    return null;
  }
}

module.exports = new ContentGenerator();
