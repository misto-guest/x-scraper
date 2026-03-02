# Facebook Monetiser

**AI-Powered Facebook Page Automation Tool (MVP)**

An automated content generation and posting system for US-based Facebook pages with built-in risk detection, source traceability, and performance prediction.

## 🚀 Phase 1 Features (Current MVP)

### Database & Backend
- ✅ **10-table SQLite database** with proper indexes and foreign keys
- ✅ **REST API** for pages, sources, posts, and predictions
- ✅ **Risk flagging system** with political keyword detection
- ✅ **Content moderation** with automated approval workflow

### Content Generation
- ✅ **AI-powered caption generation** (template-based for MVP)
- ✅ **First comment suggestions** with CTAs
- ✅ **Image prompt generation** for visual content
- ✅ **Originality scoring** to avoid duplicate content

### Prediction & Analytics
- ✅ **Ad prediction service** (stub with heuristics)
- ✅ **CTR/CVR/CPA predictions** with confidence scoring
- ✅ **Feedback loop system** for learning

### Dashboard
- ✅ **Web-based UI** for managing pages, sources, and posts
- ✅ **Post approval queue** with risk indicators
- ✅ **Content creation interface** with AI assistance
- ✅ **Performance metrics view**

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Database:** SQLite (upgradable to Postgres)
- **Frontend:** HTML + Tailwind CSS + Vanilla JS
- **AI:** Template-based generation (OpenAI integration planned for Phase 2)

## 📋 Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

## 🔧 Installation

1. **Clone or navigate to the project:**
   ```bash
   cd facebook-monetiser
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the dashboard:**
   - Home page: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard

## 📁 Project Structure

```
facebook-monetiser/
├── backend/
│   ├── server.js              # Main Express server
│   ├── database/
│   │   ├── schema.sql         # Complete database schema
│   │   └── migrations/        # Database migrations
│   ├── api/
│   │   ├── pages.js           # Pages CRUD endpoints
│   │   ├── sources.js         # Sources & insights endpoints
│   │   ├── posts.js           # Posts & approval endpoints
│   │   ├── predictions.js     # Prediction endpoints
│   │   └── content-generator.js # Content generation endpoints
│   ├── services/
│   │   ├── content-generator.js  # AI content generation
│   │   ├── risk-scoring.js       # Risk detection & scoring
│   │   └── prediction-service.js # Performance prediction
│   └── mocks/
│       ├── apify.js           # Apify scraper mock
│       └── facebook-api.js    # Facebook API mock
├── frontend/
│   ├── index.html             # Landing page
│   ├── dashboard.html         # Main dashboard
│   └── static/
│       └── js/
│           └── dashboard.js   # Dashboard JavaScript
├── data/
│   └── facebook-monetiser.db  # SQLite database (auto-created)
├── package.json
├── README.md
└── SETUP.md
```

## 🗄️ Database Schema

The system uses **10 tables**:

1. **pages** - Facebook pages metadata (US-only enforcement)
2. **page_assets** - Websites, groups, ad accounts linked to pages
3. **sources** - Tweets, articles, case studies (full traceability)
4. **insights** - Learnings linked to sources
5. **competitors** - Tracked competitor pages
6. **scraped_content** - Mock Apify/Firecrawl data
7. **generated_posts** - AI drafts with approval workflow
8. **schedules** - Posting times (EST timezone)
9. **post_performance** - Feedback loop data
10. **automation_limits** - Human-override rules

## 🔌 API Endpoints

### Pages
- `GET /api/pages` - List all pages
- `GET /api/pages/:id` - Get page details
- `POST /api/pages` - Create new page
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page
- `POST /api/pages/:id/assets` - Add asset to page

### Sources & Insights
- `GET /api/sources` - List sources
- `GET /api/sources/:id` - Get source with insights
- `POST /api/sources` - Create source
- `POST /api/sources/:id/insights` - Add insight
- `DELETE /api/sources/:id` - Delete source
- `GET /api/sources/insights/top` - Get top insights

### Posts
- `GET /api/posts` - List posts (with filters)
- `GET /api/posts/:id` - Get post details
- `POST /api/posts` - Create post (auto-calculates risk)
- `PUT /api/posts/:id` - Update post
- `PUT /api/posts/:id/approval` - Approve/reject post
- `POST /api/posts/:id/post` - Mark as posted
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/queue/approval` - Get approval queue
- `GET /api/posts/queue/scheduled` - Get scheduled posts

### Content Generation
- `POST /api/content/caption` - Generate caption
- `POST /api/content/comment` - Generate first comment
- `POST /api/content/image-prompt` - Generate image prompt
- `POST /api/content/complete` - Generate complete post
- `POST /api/content/check-originality` - Check originality
- `GET /api/content/suggestions` - Get content suggestions
- `POST /api/content/analyze` - Analyze content risk

### Predictions
- `GET /api/predictions/post/:postId` - Get prediction for post
- `POST /api/predictions/post/:postId/predict` - Create prediction
- `GET /api/predictions` - List all predictions
- `GET /api/predictions/post/:postId/accuracy` - Compare prediction vs actual
- `GET /api/predictions/stats/accuracy` - Get accuracy stats
- `GET /api/predictions/flags/contradictions` - Get prediction errors

## ⚠️ Risk Detection System

The system automatically detects risky content:

- **Political keywords** - Election, politician, government, etc.
- **Sensitive topics** - Religion, race, controversy, etc.
- **Non-US context** - Brexit, EU, non-US currencies
- **Spam indicators** - "Buy now", "Click here", etc.

**Risk Score:** 0-1 scale
- `< 0.3`: Low risk (auto-approve)
- `0.3 - 0.6`: Medium risk (manual review recommended)
- `> 0.6`: High risk (manual approval required)

## 🇺🇸 US-Only Enforcement

Hard-coded validation ensures only US-based pages are accepted:

- Country field defaults to "US"
- Any non-US country value is rejected
- All database records enforce country = 'US'

## 📊 Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3000/api/health

# Create a page
curl -X POST http://localhost:3000/api/pages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Page",
    "page_id": "test123",
    "category": "Business",
    "followers_count": 5000
  }'

# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "page_id": 1,
    "content_type": "image",
    "caption": "Test post caption here"
  }'

# Analyze content risk
curl -X POST http://localhost:3000/api/content/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "This is a test caption"
  }'
```

### Using Postman

1. Import the API endpoints
2. Set base URL to `http://localhost:3000`
3. Test each endpoint with sample data

## 🎯 Dashboard Features

### Pages Tab
- View all managed Facebook pages
- Add new pages (US-only)
- See follower counts, assets, and post counts
- Delete pages

### Sources & Insights Tab
- Add content sources (tweets, articles, case studies)
- Extract insights from sources
- Track source effectiveness
- Full traceability from source to post

### Posts Tab
- View all generated posts
- Filter by approval status
- Approve/reject posts
- View risk scores and originality scores
- Delete posts

### Create Post Tab
- Create new posts with AI assistance
- Generate captions automatically
- Generate first comments with CTAs
- Generate image prompts
- Analyze content risk before posting
- Schedule posts for future

### Predictions Tab
- View performance predictions
- See confidence scores
- Compare predicted vs actual performance

## 🐛 Known Limitations (MVP)

### Mock Services
- **Apify scraper** - Returns mock data
- **Facebook Graph API** - Returns mock responses
- **OpenAI integration** - Uses template-based generation

### What's Coming in Phase 2
- Real Apify/Firecrawl integration
- Real Facebook Graph API integration
- OpenAI GPT-4 for content generation
- Enhanced ML-based predictions
- Multi-language support

## 🔒 Security Features

- **Content moderation** with automated risk detection
- **Approval workflow** for high-risk content
- **Source traceability** for all generated content
- **US-only enforcement** for compliance
- **Human override** capabilities

## 🚀 Next Steps (Phase 2)

1. **Real External Integrations**
   - Replace Apify mock with real scraper
   - Integrate Facebook Graph API
   - Add OpenAI GPT-4 for content generation

2. **Enhanced AI**
   - Fine-tune content generation
   - Improve prediction accuracy
   - Add competitor analysis

3. **Scaling**
   - Migrate SQLite to Postgres
   - Add authentication system
   - Support multiple operators

## 📝 License

MIT

## 👥 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for US-based Facebook page growth**
