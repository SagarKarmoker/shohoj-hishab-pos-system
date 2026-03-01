import { Icon } from '../Icon';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
}

const colorClasses = {
  primary: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    icon: 'text-orange-500',
    border: 'border-orange-500/20',
  },
  success: {
    bg: 'bg-green-500/10 dark:bg-green-500/20',
    icon: 'text-green-500',
    border: 'border-green-500/20',
  },
  warning: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    icon: 'text-yellow-500',
    border: 'border-yellow-500/20',
  },
  danger: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    icon: 'text-red-500',
    border: 'border-red-500/20',
  },
  info: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    icon: 'text-blue-500',
    border: 'border-blue-500/20',
  },
};

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color,
  loading = false,
}: StatsCardProps) {
  const colors = colorClasses[color];

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `৳${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `৳${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3 w-full">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800/50 rounded-2xl p-6 border ${colors.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              <span
                className={`font-medium ${
                  change >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                <Icon
                  name={change >= 0 ? 'trending_up' : 'trending_down'}
                  className="w-4 h-4 inline mr-0.5"
                />
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-slate-400 dark:text-slate-500">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon name={icon} className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
}
