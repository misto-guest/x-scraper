# PR Onderzoek Panel - Testing Guide

## Server Status ✅

The development server is running at: **http://localhost:3000**

## Quick Test Checklist

### 1. Basic Functionality
- [ ] Open http://localhost:3000 in browser
- [ ] Verify all 5 tabs are visible:
  - [ ] Search Results
  - [ ] Backlink Analysis
  - [ ] Top Performers
  - [ ] Insights
  - [ ] Strategy Generator

### 2. Tab 1: Search Results
- [ ] Click "Search & Extract" button
- [ ] Verify mock data appears (5 press releases)
- [ ] Check table displays: Title, Company, Date, URL
- [ ] Verify loading indicator works

### 3. Tab 2: Backlink Analysis
- [ ] Click "Run Backlink Analysis" button
- [ ] Verify 8 backlink results appear
- [ ] Check Domain Authority badges (color-coded)
- [ ] Verify all columns: Site, DA, Context, Anchor, Social Shares

### 4. Tab 3: Top Performers
- [ ] Click "Load Top Performers" button
- [ ] Verify 5 performers displayed
- [ ] Check ranking system (#1 gold, #2 silver, #3 bronze)
- [ ] Verify metrics: Unique Domains, SEO Impact, Visibility Score
- [ ] Check success factors tags

### 5. Tab 4: Insights
- [ ] Click "Generate Insights" button
- [ ] Verify 4 insight sections appear:
  - [ ] Why Top Releases Performed Better
  - [ ] Patterns in Topic Selection
  - [ ] Patterns in Headline Structure
  - [ ] Best Distribution Times
- [ ] Check statistics and percentages

### 6. Tab 5: Strategy Generator
- [ ] Enter test description: "Survey of 1,000 Dutch consumers about remote work"
- [ ] Click "Generate Strategy" button
- [ ] Verify all sections appear:
  - [ ] 5 suggested angles
  - [ ] 5 headline examples
  - [ ] Data/statistics angle
  - [ ] Journalist hook
  - [ ] Outreach strategy (checklist)
  - [ ] Timing recommendations
  - [ ] SEO keyword strategy

## Manual Testing Commands

### Test API Endpoints

```bash
# Test scraping endpoint
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"keyword":"onderzoek"}'

# Test backlink analysis
curl -X POST http://localhost:3000/api/analyze/backlinks

# Test top performers
curl -X POST http://localhost:3000/api/analyze/performers

# Test insights
curl -X POST http://localhost:3000/api/analyze/insights

# Test strategy generator
curl -X POST http://localhost:3000/api/generate-strategy \
  -H "Content-Type: application/json" \
  -d '{"description":"Survey of 1,000 Dutch consumers about remote work"}'
```

## Expected Results

### Scrape Endpoint Response
```json
{
  "success": true,
  "results": [...],
  "count": 5,
  "message": "Successfully scraped 5 press releases"
}
```

### Backlink Endpoint Response
```json
{
  "success": true,
  "backlinks": [...],
  "count": 8,
  "message": "Analyzed 8 backlinks"
}
```

### Top Performers Endpoint Response
```json
{
  "success": true,
  "performers": [...],
  "count": 5,
  "message": "Loaded 5 top performers"
}
```

### Insights Endpoint Response
```json
{
  "success": true,
  "insights": {
    "whyPerformBetter": [...],
    "topicPatterns": [...],
    "headlinePatterns": [...],
    "timingPatterns": [...]
  },
  "message": "Insights generated successfully"
}
```

### Strategy Endpoint Response
```json
{
  "success": true,
  "strategy": {
    "angles": [...],
    "headlines": [...],
    "dataAngle": "...",
    "journalistHook": "...",
    "outreach": [...],
    "timing": {...},
    "seoStrategy": [...]
  },
  "message": "Strategy generated successfully"
}
```

## Browser DevTools Check

### Console
- [ ] No JavaScript errors
- [ ] No warnings (except maybe React deprecation notices)
- [ ] All API calls return 200 OK

### Network Tab
- [ ] All API endpoints respond successfully
- [ ] Response times are reasonable (<2s for mock data)
- [ ] No failed requests

### Accessibility
- [ ] Tab navigation works
- [ ] Forms are accessible
- [ ] Color contrast is sufficient
- [ ] Loading states are announced

## Responsive Testing

### Desktop (1920x1080)
- [ ] All content fits properly
- [ ] Tables scroll horizontally if needed
- [ ] Layout is balanced

### Tablet (768x1024)
- [ ] Navigation adapts
- [ ] Tables are scrollable
- [ ] Content is readable

### Mobile (375x667)
- [ ] Tabs stack or scroll
- [ ] Tables are horizontally scrollable
- [ ] Text is readable without zooming

## Known Limitations (Demo Mode)

1. **Mock Data**: Without ANP credentials, all data is mock/simulated
2. **No Real Scraping**: Puppeteer won't access real ANP Persportaal
3. **Simplified Analysis**: Backlink analysis uses mock data
4. **Template Strategy**: Strategy generator uses rules, not AI

## For Production Testing

1. **Get ANP Credentials**: Register at https://persportaal.anp.nl
2. **Add OpenAI API**: For real AI-powered insights
   ```bash
   npm install openai
   ```
3. **Add Ahrefs API**: For accurate backlink data
4. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   # Add your API keys
   ```

## Performance Benchmarks

Expected response times (demo mode):
- Scrape API: ~100ms (mock data)
- Backlink API: ~50ms (mock data)
- Performers API: ~50ms (mock data)
- Insights API: ~50ms (mock data)
- Strategy API: ~100ms (template generation)

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill existing server
ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Errors
```bash
# Recreate database
rm -rf data/
mkdir -p data
npm run dev
```

### Build Errors
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## Test Results Template

```
Test Date: [DATE]
Tester: [NAME]
Browser: [Chrome/Firefox/Safari]
OS: [Mac/Windows/Linux]

✅ Basic Functionality
✅ Search Results Tab
✅ Backlink Analysis Tab
✅ Top Performers Tab
✅ Insights Tab
✅ Strategy Generator Tab
✅ API Endpoints
✅ Responsive Design
✅ Accessibility
✅ Performance

Notes:
- Any issues found
- Suggestions for improvement
```

## Sign-Off

Ready for deployment: [ ] YES / [ ] NO

Notes: ___________________________
