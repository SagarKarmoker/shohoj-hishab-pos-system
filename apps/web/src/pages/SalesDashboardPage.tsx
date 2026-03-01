import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Icon, StatsCard, LineChart } from '../components';
import { CustomersList } from '../components/sales/CustomersList';
import { AddCustomerForm } from '../components/sales/AddCustomerForm';
import { CustomerDetailModal } from '../components/sales/CustomerDetailModal';
import { useAuth } from '../contexts/AuthContext';
import {
  getSalesDashboardStats,
  getSalesPerformance,
  type SalesDashboardStats,
  type SalesPerformanceData,
  type Customer,
} from '../api/sales';

interface SalesDashboardPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

type SalesTab = 'dashboard' | 'customers' | 'add-customer' | 'earnings';

export function SalesDashboardPage({ isDark, onToggleTheme, onLogout }: SalesDashboardPageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SalesTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Data state
  const [stats, setStats] = useState<SalesDashboardStats | null>(null);
  const [performance, setPerformance] = useState<SalesPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Customer detail modal state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, performanceData] = await Promise.all([
        getSalesDashboardStats(),
        getSalesPerformance(30),
      ]);
      setStats(statsData);
      setPerformance(performanceData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const navItems: { id: SalesTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: t('sales.dashboard', 'Dashboard'), icon: 'dashboard' },
    { id: 'customers', label: t('sales.myCustomers', 'My Customers'), icon: 'group' },
    { id: 'add-customer', label: t('sales.addCustomer', 'Add Customer'), icon: 'person_add' },
    { id: 'earnings', label: t('sales.earnings', 'Earnings'), icon: 'payments' },
  ];

  // Dashboard View
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          {t('sales.welcome', 'Welcome back, {{name}}!', { name: user?.displayName || 'Sales Partner' })}
        </h2>
        <p className="text-orange-100">
          {t('sales.welcomeSubtitle', 'Here is your performance summary for this month.')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title={t('sales.totalSales', 'Total Sales')}
          value={`৳${(stats?.totalSales || 0).toLocaleString()}`}
          icon="trending_up"
          color="primary"
          loading={loading}
        />
        <StatsCard
          title={t('sales.monthlySales', 'This Month')}
          value={`৳${(stats?.monthlySales || 0).toLocaleString()}`}
          change={performance?.monthlyComparison.change}
          changeLabel={t('sales.vsLastMonth', 'vs last month')}
          icon="calendar_month"
          color="success"
          loading={loading}
        />
        <StatsCard
          title={t('sales.commissionEarned', 'Commission Earned')}
          value={`৳${(stats?.commissionEarned || 0).toLocaleString()}`}
          icon="payments"
          color="warning"
          loading={loading}
        />
        <StatsCard
          title={t('sales.customersCreated', 'Customers')}
          value={stats?.customersCreated || 0}
          icon="group"
          color="info"
          loading={loading}
        />
        <StatsCard
          title={t('sales.activeCustomers', 'Active Customers')}
          value={stats?.activeCustomers || 0}
          icon="check_circle"
          color="success"
          loading={loading}
        />
        <StatsCard
          title={t('sales.pendingCommission', 'Pending Commission')}
          value={`৳${(stats?.pendingCommission || 0).toLocaleString()}`}
          icon="schedule"
          color="danger"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={performance?.dailySales.map(d => ({ label: d.date, value: d.sales })) || []}
          title={t('sales.salesTrend', 'Sales Trend (30 Days)')}
          color="#f97316"
          loading={loading}
          yAxisFormatter={(v) => `৳${v >= 1000 ? (v/1000).toFixed(0) + 'K' : v}`}
        />
        <LineChart
          data={performance?.dailySales.map(d => ({ label: d.date, value: d.commission })) || []}
          title={t('sales.commissionTrend', 'Commission Trend (30 Days)')}
          color="#10b981"
          loading={loading}
          yAxisFormatter={(v) => `৳${v >= 1000 ? (v/1000).toFixed(0) + 'K' : v}`}
        />
      </div>

      {/* Recent Sales */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {t('sales.recentSales', 'Recent Sales')}
        </h3>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded"></div>
            ))}
          </div>
        ) : stats?.recentSales.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Icon name="receipt_long" className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('sales.noSalesYet', 'No sales yet. Start by adding your first customer!')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats?.recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                    <Icon name="shopping_cart" className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {sale.customerName || 'Unknown Customer'}
                    </p>
                    <p className="text-sm text-slate-500">{sale.planName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    ৳{sale.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">
                    +৳{sale.commission.toLocaleString()} {t('sales.commission', 'commission')}
                  </p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(sale.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('add-customer')}
          className="flex items-center gap-4 p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-lg transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
            <Icon name="person_add" className="text-orange-600 dark:text-orange-400 text-xl" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
              {t('sales.addNewCustomer', 'Add New Customer')}
            </h4>
            <p className="text-sm text-slate-500">
              {t('sales.addCustomerDesc', 'Create a new shop owner account')}
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className="flex items-center gap-4 p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-lg transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <Icon name="group" className="text-blue-600 dark:text-blue-400 text-xl" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
              {t('sales.viewCustomers', 'View My Customers')}
            </h4>
            <p className="text-sm text-slate-500">
              {t('sales.viewCustomersDesc', 'See all customers you have created')}
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  // Placeholder views for other tabs
  const renderPlaceholder = (title: string, message: string) => (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
      <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mx-auto mb-4">
        <Icon name="construction" className="text-orange-600 dark:text-orange-400 text-2xl" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-500">{message}</p>
      <button
        onClick={() => setActiveTab('dashboard')}
        className="mt-6 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all"
      >
        {t('common.backToDashboard', 'Back to Dashboard')}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Collapse Toggle */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Icon
                name={sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
                className="text-slate-500"
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-primary text-white shadow-lg shadow-orange-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-400 dark:text-slate-500">
                <p className="font-medium text-slate-600 dark:text-slate-400">
                  {t('sales.salesPartner', 'Sales Partner')}
                </p>
                <p className="mt-1">v1.0.0</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {activeTab === 'dashboard' && t('sales.dashboard', 'Dashboard')}
              {activeTab === 'customers' && t('sales.myCustomers', 'My Customers')}
              {activeTab === 'add-customer' && t('sales.addCustomer', 'Add Customer')}
              {activeTab === 'earnings' && t('sales.earnings', 'Earnings')}
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <Icon name={isDark ? 'light_mode' : 'dark_mode'} className="text-slate-500" />
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              >
                {t('common.logout', 'Logout')}
              </button>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-3 flex items-center justify-between">
            <span className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 dark:hover:text-red-400">
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'customers' && (
            <CustomersList
              onViewCustomer={(customer) => {
                setSelectedCustomer(customer);
                setShowCustomerDetail(true);
              }}
              onAddCustomer={() => setActiveTab('add-customer')}
            />
          )}
          {activeTab === 'add-customer' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                  {t('sales.addNewCustomer', 'Add New Customer')}
                </h2>
                <AddCustomerForm
                  onSuccess={() => {
                    setActiveTab('customers');
                    fetchDashboardData();
                  }}
                  onCancel={() => setActiveTab('customers')}
                />
              </div>
            </div>
          )}
          {activeTab === 'earnings' && renderPlaceholder(
            t('sales.earningsComingSoon', 'Earnings Details'),
            t('sales.earningsComingSoonDesc', 'This feature is coming in Phase 3. You will be able to view detailed earnings and request withdrawals here.')
          )}
        </main>
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={showCustomerDetail}
        onClose={() => {
          setShowCustomerDetail(false);
          setSelectedCustomer(null);
        }}
      />
    </div>
  );
}
