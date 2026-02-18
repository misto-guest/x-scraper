# Tweet Analyzer - Documentation

## Overview
The Tweet Analyzer is a powerful tool integrated into the admin panel that allows you to analyze tweets from X/Twitter with AI-powered insights.

## Features

### 1. Tweet Content Extraction
- Fetches tweet content using GhostFetch CLI
- Extracts author, text, date, and engagement metrics
- Works with both X.com and Twitter.com URLs

### 2. AI-Powered Analysis
- **Sentiment Analysis**: Detects positive, neutral, or negative sentiment (0-100 score)
- **Topic Extraction**: Identifies key topics and themes
- **Hashtag Detection**: Extracts all hashtags from the tweet
- **Suggested Actions**: Provides actionable response suggestions

### 3. Smart Actions
- **Save as Review**: Save the analysis directly to your reviews
- **Convert to Action**: Create an action item from the tweet
- **Copy Results**: Copy the full analysis report to clipboard

### 4. Professional Card Layout
- Clean, modern UI with gradient sentiment badges
- Mobile-responsive design
- Dark mode support
- Real-time loading states and animations

## How to Use

### Step 1: Navigate to Tweet Analyzer
1. Go to `/admin` in your browser
2. Click "🔍 Tweet Analyzer" in the sidebar

### Step 2: Enter Tweet URL
1. Copy any tweet URL from X.com or Twitter.com
2. Paste it into the input field
3. Click "🔍 Analyze Tweet" or press Enter

### Step 3: Review Results
The analyzer will display:
- **Tweet Preview**: Original tweet content with metrics
- **Sentiment Badge**: Color-coded sentiment indicator
- **Key Topics**: Relevant topics and themes
- **Hashtags**: All hashtags found in the tweet
- **Suggested Actions**: AI-recommended next steps

### Step 4: Take Action
- **Save as Review**: Creates a new review entry with full analysis
- **Convert to Action**: Opens the Action Converter with tweet content pre-filled
- **Copy Results**: Copies the entire report to clipboard
- **Analyze Another**: Clears the form for the next tweet

## Technical Details

### Files Created
- `src/pages/admin/analyze.astro` - Main analyzer page
- `src/pages/admin/api/analyze.ts` - API endpoint for tweet analysis
- `src/pages/admin/api/reviews.ts` - API endpoint for saving reviews

### Navigation Updates
Added "🔍 Tweet Analyzer" link to all admin pages:
- `/admin` (Dashboard)
- `/admin/reviews`
- `/admin/tweets`
- `/admin/action-converter`
- `/admin/export`

### GhostFetch Integration
The analyzer uses GhostFetch CLI to fetch tweet content:
```bash
pipx run --spec ghostfetch python -c "from ghostfetch import fetch_markdown; result = fetch_markdown(url)"
```

### AI Analysis
- Uses OpenAI's GPT-4o-mini for advanced analysis (if API key is configured)
- Falls back to basic keyword-based analysis if OpenAI is unavailable
- Configurable via `OPENAI_API_KEY` environment variable

## API Endpoints

### POST `/admin/api/analyze`
Analyzes a tweet from its URL.

**Request:**
```json
{
  "url": "https://x.com/username/status/1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "content": {
    "author": "@username",
    "text": "Tweet content here...",
    "date": "2/17/2026",
    "url": "https://x.com/username/status/1234567890",
    "metrics": {
      "likes": 1200,
      "retweets": 300,
      "replies": 50
    }
  },
  "analysis": {
    "sentiment": "positive",
    "sentimentScore": 75,
    "topics": ["Technology", "AI", "Innovation"],
    "hashtags": ["AI", "Tech"],
    "suggestedActions": [
      "Engage with a positive response",
      "Share if relevant to your audience"
    ]
  }
}
```

### POST `/admin/api/reviews`
Creates a new review entry.

**Request:**
```json
{
  "date": "2026-02-17",
  "notes": "Tweet analysis notes...",
  "actionItems": [
    { "text": "Action item 1", "completed": false }
  ]
}
```

## Error Handling

### Invalid URL Format
If the URL doesn't match the expected pattern (x.com or twitter.com status URL):
```
Error: Invalid tweet URL. Must be a valid X.com or Twitter.com status URL
```

### GhostFetch Errors
If GhostFetch fails to fetch the tweet:
```
Error: Failed to analyze tweet: Command failed: ...
```

### Rate Limiting
GhostFetch may take 10-30 seconds per analysis as it launches a browser instance.
Be patient with the loading state.

## Mobile Responsiveness
The analyzer is fully responsive and works on:
- Desktop screens (1280px+)
- Tablets (768px - 1279px)
- Mobile devices (< 768px)

## Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6 support

## Future Enhancements
Potential improvements for the Tweet Analyzer:
- Batch analysis of multiple tweets
- Export analysis history
- Custom sentiment thresholds
- Integration with more social platforms
- Real-time tweet monitoring
- Automated response suggestions based on historical data

## Troubleshooting

### Issue: Analysis takes too long
**Solution:** GhostFetch launches a browser instance for each request. This is normal and can take 10-30 seconds.

### Issue: Sentiment seems inaccurate
**Solution:** The basic sentiment analysis uses keyword matching. For better results, configure `OPENAI_API_KEY`.

### Issue: Can't save as review
**Solution:** Ensure you're logged in to the admin panel and the reviews API endpoint is accessible.

### Issue: GhostFetch fails
**Solution:** Make sure GhostFetch is installed: `pipx install ghostfetch`

## Support
For issues or questions, check the main project documentation or create an issue in the repository.
