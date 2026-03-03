import { useTranslation } from 'react-i18next';
import { Icon } from '../Icon';

export type AdminTab = 'dashboard' | 'users' | 'plans' | 'sales' | 'revenue' | 'audit-logs' | 'announcements' | 'settings';

interface SidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isSuperAdmin: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: AdminTab;
  label: string;
  icon: string;
  superAdminOnly?: boolean;
}

export function Sidebar({
  activeTab,
  onTabChange,
  isSuperAdmin,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: t('admin.dashboard', 'Dashboard'), icon: 'dashboard' },
    { id: 'users', label: t('admin.users', 'Users'), icon: 'group' },
    { id: 'plans', label: t('admin.plans', 'Plans'), icon: 'card_membership' },
    { id: 'sales', label: t('admin.sales', 'Sales'), icon: 'trending_up' },
    { id: 'revenue', label: t('admin.revenue', 'Revenue'), icon: 'payments', superAdminOnly: true },
    { id: 'audit-logs', label: t('admin.auditLogs', 'Audit Logs'), icon: 'history', superAdminOnly: true },
    { id: 'announcements', label: t('admin.announcements', 'Announcements'), icon: 'campaign', superAdminOnly: true },
    { id: 'settings', label: t('admin.settings', 'Settings'), icon: 'settings' },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex-shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <img 
              src="/favicon.svg" 
              alt="Logo" 
              className="w-8 h-8 flex-shrink-0"
            />
            {!isCollapsed && (
              <span className="font-bold text-primary text-lg whitespace-nowrap">Shohoj Hishab</span>
            )}
          </div>
          {onToggleCollapse && !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Icon
                name="chevron_left"
                className="w-4 h-4 text-slate-500"
              />
            </button>
          )}
        </div>

        {/* Collapse button when collapsed */}
        {onToggleCollapse && isCollapsed && (
          <div className="p-2 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={onToggleCollapse}
              className="w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex justify-center"
            >
              <Icon
                name="chevron_right"
                className="w-4 h-4 text-slate-500"
              />
            </button>
          </div>
        )}

        {/* Footer when collapsed */}
        {onToggleCollapse && isCollapsed && (
          <div className="mt-auto p-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">S</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-primary text-white shadow-lg shadow-orange-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium text-sm truncate">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="h-16 px-4 border-t border-slate-200 dark:border-slate-800 flex items-center">
            <div className="text-xs text-slate-400 dark:text-slate-500">
              <p className="font-medium text-slate-600 dark:text-slate-400">
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </p>
              <p className="mt-0.5">v1.0.0</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
