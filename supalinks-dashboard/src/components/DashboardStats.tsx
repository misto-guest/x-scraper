import { Link2, TrendingUp, Users, Activity } from 'lucide-react';

const stats = [
  {
    title: 'Total Links',
    value: '2,453',
    change: '+12.5%',
    trend: 'up',
    icon: Link2,
  },
  {
    title: 'Total Clicks',
    value: '156.2K',
    change: '+23.1%',
    trend: 'up',
    icon: TrendingUp,
  },
  {
    title: 'Unique Visitors',
    value: '89.5K',
    change: '+18.7%',
    trend: 'up',
    icon: Users,
  },
  {
    title: 'Active Links',
    value: '1,892',
    change: '-2.4%',
    trend: 'down',
    icon: Activity,
  },
];

export default function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 fade-in">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              {stat.trend === 'up' ? (
                <span className="text-green-600">↑</span>
              ) : (
                <span className="text-red-600">↓</span>
              )}
              <span
                className={
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }
              >
                {stat.change}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
