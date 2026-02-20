import { ExternalLink, Copy, Trash2, BarChart3 } from 'lucide-react';
import { formatDate, formatNumber } from '../lib/utils';

interface Link {
  id: string;
  slug: string;
  title?: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  active: boolean;
}

const mockLinks: Link[] = [
  {
    id: '1',
    slug: 'summer-sale',
    title: 'Summer Sale Campaign',
    originalUrl: 'https://example.com/summer-sale-2024',
    clicks: 12543,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
  {
    id: '2',
    slug: 'product-launch',
    title: 'New Product Launch',
    originalUrl: 'https://example.com/new-product',
    clicks: 8234,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
  {
    id: '3',
    slug: 'referral-program',
    title: 'Referral Program',
    originalUrl: 'https://example.com/referrals',
    clicks: 5621,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
  {
    id: '4',
    slug: 'webinar-signup',
    title: 'Webinar Registration',
    originalUrl: 'https://example.com/webinar-signup',
    clicks: 3892,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    active: false,
  },
  {
    id: '5',
    slug: 'newsletter',
    title: 'Newsletter Signup',
    originalUrl: 'https://example.com/newsletter',
    clicks: 2145,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
];

export default function RecentLinks() {
  const copyToClipboard = (slug: string) => {
    const url = `https://supalinks.cc/${slug}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm fade-in">
      <div className="flex items-center justify-between border-b p-6">
        <div>
          <h2 className="text-xl font-semibold">Recent Links</h2>
          <p className="text-sm text-muted-foreground">
            Your most recently created links
          </p>
        </div>
        <a
          href="/links"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </a>
      </div>
      <div className="divide-y">
        {mockLinks.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{link.title || link.slug}</h3>
                {!link.active && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    Inactive
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <a
                  href={`https://supalinks.cc/${link.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  supalinks.cc/{link.slug}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span>•</span>
                <span>{formatNumber(link.clicks)} clicks</span>
                <span>•</span>
                <span>{formatDate(link.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(link.slug)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </button>
              <a
                href={`/analytics/${link.id}`}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="View analytics"
              >
                <BarChart3 className="h-4 w-4" />
              </a>
              <button
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                title="Delete link"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
