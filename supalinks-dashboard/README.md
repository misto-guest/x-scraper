# Supalinks 2.0 Dashboard

> Modern link management dashboard built with Astro.js 6.x and Tailwind CSS 4.x

## 🚀 Features

- **Link Management**: Create, edit, and manage shortened links with ease
- **Analytics Dashboard**: Track clicks, geographic distribution, and device breakdown
- **Custom Domains**: Configure and manage custom domains for branded links
- **Campaigns**: Organize links into marketing campaigns for better tracking
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Production Ready**: Optimized for SEO and performance

## 🛠️ Tech Stack

- **Framework**: Astro.js 6.x
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Custom components with React integration
- **Icons**: Lucide React
- **Language**: TypeScript

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🌐 Development

Open [http://localhost:4321](http://localhost:4321) to view the dashboard.

## 📁 Project Structure

```
supalinks-dashboard/
├── src/
│   ├── components/      # React components
│   ├── layouts/         # Astro layouts
│   ├── pages/           # Page routes
│   ├── lib/             # Utility functions
│   ├── styles/          # Global styles
│   └── types/           # TypeScript types
├── public/              # Static assets
└── package.json
```

## 🎨 Key Features by Page

### Dashboard (`/`)
- Overview stats (total links, clicks, visitors)
- Recent links list
- Quick actions panel

### Links (`/links`)
- Full link management interface
- Search and filter links
- Bulk actions support
- Pagination

### Analytics (`/analytics`)
- Clicks over time visualization
- Top performing links
- Geographic distribution
- Device breakdown

### Domains (`/domains`)
- Custom domain management
- DNS configuration guide
- Domain verification status

### Campaigns (`/campaigns`)
- Campaign organization
- Performance tracking
- Active/paused status

## 🚢 Deployment

This project can be deployed to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy --prod`
- **GitHub Pages**: Build and push to gh-pages branch
- **Cloudflare Pages**: Connect to Git repository

## 📝 Environment Variables

No environment variables required for basic functionality.

For production, you may want to add:
- `SITE_URL`: Your production domain
- `ANALYTICS_ID`: Analytics tracking (optional)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

Built as a modern alternative to Firebase Dynamic Links with a focus on simplicity and performance.
