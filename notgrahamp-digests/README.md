# @notgrahamp Daily Digests - Admin Panel

## Overview

This project displays daily tweet digests from @notgrahamp with a professional admin panel for content management.

## Features

### Public Features
- **Daily Digest Viewer**: Browse daily tweet digests in a clean, responsive interface
- **Dark Mode Support**: Automatic dark mode based on system preferences
- **Mobile-Friendly**: Fully responsive design using Tailwind CSS

### Admin Panel Features

#### 🔐 Authentication
- Password-protected admin panel
- Environment-based configuration
- Secure cookie-based sessions

#### 📝 Review Management
- **Create**: Add new reviews with date, notes, and action items
- **Read**: View all reviews in a sortable table
- **Update**: Edit reviews and mark action items as complete
- **Delete**: Remove reviews with confirmation
- **Search**: Filter reviews by date or content

#### 🐦 Tweet Management
- Mark tweets as "reviewed" or "archived"
- Add custom tags/labels to tweets
- Bulk operations for multiple tweets
- Search and filter functionality
- Direct integration with daily digests

#### 🤖 Action Item Converter
- AI-powered conversion of tweet content into actionable items
- Uses OpenAI API (gpt-4o-mini) for intelligent parsing
- Edit before saving
- Categorization and effort estimation
- Tracks source tweets

#### 📤 Data Export
- Export reviews as Markdown
- Export reviews as CSV
- View all action items
- Database information and backup recommendations

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Clone and install dependencies:**
   ```bash
   cd notgrahamp-digests
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your variables:
   ```env
   # Admin Panel Password (required)
   ADMIN_PASSWORD=your-secure-password-here
   
   # OpenAI API Key (for action converter)
   OPENAI_API_KEY=your-openai-api-key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   The site will be available at `http://localhost:4321`

4. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

## Usage

### Accessing the Admin Panel

1. Navigate to `/admin` on your deployed site
2. Enter your admin password (set via `ADMIN_PASSWORD`)
3. You'll be redirected to the dashboard

### Creating a Review

1. Go to **Reviews** in the sidebar
2. Click **+ Create Review**
3. Fill in:
   - **Date**: Select the review date
   - **Notes**: Add your review notes
   - **Action Items**: List action items (one per line)
4. Click **Create Review**

### Managing Tweets

1. Go to **Tweets** in the sidebar
2. Use the **Search** and **Filter** options to find tweets
3. Available actions:
   - **Review**: Mark as reviewed
   - **Archive**: Archive the tweet
   - **Convert**: Convert to action item
   - **Bulk**: Select multiple and apply bulk actions

### Converting Tweets to Action Items

1. Go to **Tweets** page
2. Click **Convert** on any tweet
3. Or go to **Action Converter** and:
   - Paste tweet content manually
   - Click **Convert with AI**
   - Review/edit the generated action item
   - Click **Save Action Item**

### Exporting Data

1. Go to **Export Data** in the sidebar
2. Choose format:
   - **Markdown**: Best for documentation
   - **CSV**: Best for spreadsheets
3. Click the export button to download

## Data Storage

All admin data is stored in `/data/admin-data.json`:

```json
{
  "reviews": [],
  "tweets": {},
  "actionItems": [],
  "settings": {
    "lastUpdated": null
  }
}
```

**Note**: This is a file-based database. For production use with high traffic, consider migrating to a proper database (SQLite, PostgreSQL, etc.).

## Deployment

### Railway Deployment

The project is configured for Railway deployment:

1. **Set environment variables in Railway:**
   - `ADMIN_PASSWORD`: Your secure admin password
   - `OPENAI_API_KEY`: Optional, for action converter

2. **Deploy:**
   ```bash
   ./update-deploy.sh
   ```

3. **Access your site:**
   - Main site: `https://your-app.railway.app/`
   - Admin panel: `https://your-app.railway.app/admin`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | Yes | Password for admin panel access |
| `OPENAI_API_KEY` | No | OpenAI API key for action converter |

## Project Structure

```
notgrahamp-digests/
├── src/
│   ├── layouts/
│   │   └── Layout.astro          # Main layout
│   ├── lib/
│   │   └── admin-utils.ts        # Admin data utilities
│   ├── pages/
│   │   ├── index.astro           # Public digest viewer
│   │   └── admin/
│   │       ├── index.astro       # Admin dashboard
│   │       ├── login.astro       # Login page
│   │       ├── reviews.astro     # Review management
│   │       ├── tweets.astro      # Tweet management
│   │       ├── action-converter.astro  # AI converter
│   │       └── export.astro      # Data export
│   └── types/
│       └── admin.ts              # TypeScript types
├── data/
│   ├── admin-data.json           # Admin database
│   ├── notgrahamp-daily-digest/  # Daily digest files
│   └── notgrahamp-state.json     # Monitor state
└── public/
    └── styles/
        └── global.css            # Global styles
```

## Tech Stack

- **Framework**: Astro.js 5.x
- **Styling**: Tailwind CSS 4.x
- **Language**: TypeScript
- **AI**: OpenAI API (gpt-4o-mini)
- **Deployment**: Railway

## Security Notes

1. **Change the default password** immediately after deployment
2. **Use strong passwords** (minimum 12 characters, mixed case, numbers, symbols)
3. **Keep your OpenAI API key secure** - never commit it to version control
4. **HTTPS only** in production - the admin panel uses secure cookies
5. **Regular backups** - Export data regularly using the export feature

## Troubleshooting

### Admin panel redirects to login
- Check that `ADMIN_PASSWORD` is set in your environment
- Clear your browser cookies and try logging in again

### Action converter not working
- Verify `OPENAI_API_KEY` is set and valid
- Check your OpenAI API quota/billing
- See browser console for error messages

### Data not persisting
- Check file permissions on `/data/admin-data.json`
- Verify the data file exists and is writable
- Check server logs for errors

## Development

### Running locally
```bash
npm run dev
```

### Building
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## License

This is a private project for internal use.

## Support

For issues or questions, contact the development team.
