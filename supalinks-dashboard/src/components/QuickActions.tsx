import { Plus, Upload, BarChart3, Settings, Globe, FolderTree } from 'lucide-react';

const actions = [
  {
    title: 'Create New Link',
    description: 'Generate a new shortened link',
    icon: Plus,
    href: '/links/new',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Import Links',
    description: 'Bulk import from CSV or Firebase',
    icon: Upload,
    href: '/import',
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: 'View Analytics',
    description: 'See detailed performance data',
    icon: BarChart3,
    href: '/analytics',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    title: 'Manage Domains',
    description: 'Configure custom domains',
    icon: Globe,
    href: '/domains',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Campaigns',
    description: 'Organize links into campaigns',
    icon: FolderTree,
    href: '/campaigns',
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    title: 'Settings',
    description: 'Configure your account',
    icon: Settings,
    href: '/settings',
    color: 'bg-gray-500/10 text-gray-600',
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">
          Common tasks and shortcuts
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <a
            key={action.title}
            href={action.href}
            className="flex items-start gap-3 rounded-lg border p-4 transition-all hover:shadow-md hover:border-primary/50"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium">{action.title}</h3>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
