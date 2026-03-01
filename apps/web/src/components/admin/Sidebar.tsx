import { useTranslation } from 'react-i18next';
import { Icon } from '../Icon';

export type AdminTab = 'dashboard' | 'users' | 'plans' | 'sales' | 'settings';

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
    { id: 'settings', label: t('admin.settings', 'Settings'), icon: 'settings' },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Collapse Toggle */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Icon
              name={isCollapsed ? 'chevron_right' : 'chevron_left'}
              className="text-slate-500"
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-primary text-white shadow-lg shadow-orange-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-400 dark:text-slate-500">
              <p className="font-medium text-slate-600 dark:text-slate-400">
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </p>
              <p className="mt-1">v1.0.0</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
