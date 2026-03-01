import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { getShopDashboard, type DashboardData } from '../api/shop';

function formatAmount(amount: number): string {
  return '৳ ' + amount.toLocaleString('bn-BD');
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

interface DashboardPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onNavigateToPOS: () => void;
  onNavigateToStock: () => void;
  onNavigateToCredit: () => void;
  onNavigateToAccounts: () => void;
  onNavigateToSettings: () => void;
  onNavigateToAdmin: () => void;
}

export function DashboardPage({
  isDark,
  onToggleTheme,
  onLogout,
  onNavigateToPOS,
  onNavigateToStock,
  onNavigateToCredit,
  onNavigateToAccounts,
  onNavigateToSettings,
  onNavigateToAdmin,
}: DashboardPageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentShop, shops, isLoading: shopsLoading, loadShops, createShopAndSet } = useShop();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [createShopName, setCreateShopName] = useState('');
  const [createShopAddress, setCreateShopAddress] = useState('');
  const [createShopPhone, setCreateShopPhone] = useState('');
  const [createShopSubmitting, setCreateShopSubmitting] = useState(false);
  const [createShopError, setCreateShopError] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const fetchDashboard = useCallback(async () => {
    if (!currentShop) return;
    setDashboardLoading(true);
    try {
      const data = await getShopDashboard(currentShop.id);
      setDashboardData(data);
    } catch {
      setDashboardData(null);
    } finally {
      setDashboardLoading(false);
    }
  }, [currentShop]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createShopName.trim()) return;
    setCreateShopSubmitting(true);
    setCreateShopError(null);
    try {
      await createShopAndSet(createShopName.trim(), createShopAddress.trim() || undefined, createShopPhone.trim() || undefined);
    } catch (err: unknown) {
      setCreateShopError(err instanceof Error ? err.message : 'Failed to create shop');
    } finally {
      setCreateShopSubmitting(false);
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || t('dashboard.userName');
  const todayDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (shopsLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Icon name="progress_activity" className="animate-spin text-4xl text-primary" />
          <span className="text-slate-600 dark:text-slate-400">{t('dashboard.loading')}</span>
        </div>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 relative">
          <button
            onClick={onLogout}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
            title="Logout"
          >
            <Icon name="logout" />
          </button>
          <h2 className="text-xl font-bold mb-2">{t('dashboard.createShop')}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{t('dashboard.createShopSubtitle')}</p>
          <form onSubmit={handleCreateShop} className="space-y-4">
            {createShopError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg">
                {createShopError}
              </div>
            )}
            <input
              type="text"
              value={createShopName}
              onChange={(e) => setCreateShopName(e.target.value)}
              placeholder={t('dashboard.shopNamePlaceholder')}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              required
            />
            <input
              type="text"
              value={createShopAddress}
              onChange={(e) => setCreateShopAddress(e.target.value)}
              placeholder={t('dashboard.addressPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={createShopPhone}
              onChange={(e) => setCreateShopPhone(e.target.value)}
              placeholder={t('dashboard.phonePlaceholder')}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={createShopSubmitting}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
            >
              {createShopSubmitting ? t('common.loading') : t('dashboard.createButton')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Icon name="storefront" className="text-white text-2xl" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-800 dark:text-white">
              {t('nav.brand')}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 font-medium">
            <span className="text-slate-500 dark:text-slate-400">{t('nav.dashboard')}</span>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {currentShop?.name ?? t('dashboard.shopName')}
              </span>
              <span className="text-xs text-slate-500">{currentShop?.address ?? t('dashboard.shopLocation')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Icon name="light_mode" className="text-slate-400" />
              ) : (
                <Icon name="dark_mode" className="text-slate-500" />
              )}
            </button>
            <button
              onClick={onNavigateToSettings}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('dashboard.viewDetails')}
            >
              <Icon name="settings" className="text-slate-500" />
            </button>
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <button
                onClick={onNavigateToAdmin}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('admin.title', 'Admin Panel')}
              >
                <Icon name="admin_panel_settings" className="text-slate-500" />
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  <Icon name="person" className="text-primary text-lg" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
                  {displayName}
                </span>
                <Icon name="expand_more" className="text-slate-500 text-lg" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        onLogout()
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 cursor-pointer"
                    >
                      <Icon name="logout" className="text-lg" />
                      {t('common.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {t('dashboard.welcome')}, {displayName} 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <Icon name="calendar_today" className="text-slate-500 text-sm" />
            <span className="text-sm font-medium">{todayDate}</span>
          </div>
        </header>

        {/* Quick Actions */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="bolt" className="text-primary" />
            {t('dashboard.quickActions')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={onNavigateToPOS}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-lg shadow-green-600/20 transition-all active:scale-95 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="add_shopping_cart" className="text-2xl" />
              </div>
              <span className="font-bold text-lg">{t('dashboard.newSale')}</span>
            </button>
            <button
              onClick={onNavigateToStock}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-primary hover:bg-primary-hover text-white rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 cursor-pointer group">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="inventory_2" className="text-2xl" />
              </div>
              <span className="font-bold text-lg">{t('dashboard.addStock')}</span>
            </button>
            <button
              onClick={onNavigateToCredit}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer group">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="person_add" className="text-2xl" />
              </div>
              <span className="font-bold text-lg">{t('dashboard.addCredit')}</span>
            </button>
            <button
              onClick={onNavigateToAccounts}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 hover:text-green-600 text-slate-600 dark:text-slate-300 rounded-2xl transition-all active:scale-95 cursor-pointer group">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-green-50 dark:group-hover:bg-green-900/30 transition-colors">
                <Icon name="receipt_long" className="text-2xl" />
              </div>
              <span className="font-bold text-lg">{t('dashboard.allAccounts')}</span>
            </button>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Summary */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Icon name="analytics" className="text-green-600" />
                  {t('dashboard.todaySummary')}
                </h2>
                <button
                  onClick={onNavigateToAccounts}
                  className="text-sm text-green-600 font-medium hover:underline cursor-pointer"
                >
                  {t('dashboard.viewDetails')}
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                      {t('dashboard.totalSales')}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                      {dashboardLoading ? '...' : formatAmount(dashboardData?.todaySummary?.totalSales ?? 0)}
                    </h3>
                    <div className="mt-2 flex items-center text-xs text-green-600 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg w-fit">
                      <Icon name="trending_up" className="text-sm mr-1" />
                      <span>{dashboardData?.todaySummary?.transactionCount ?? 0} {t('dashboard.transactions')}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                      {t('dashboard.cashCollected')}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                      {dashboardLoading ? '...' : formatAmount(dashboardData?.todaySummary?.cashCollected ?? 0)}
                    </h3>
                    <div className="mt-2 text-xs text-slate-500">{t('dashboard.excludingCredit')}</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                      {t('dashboard.creditCollected')}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                      {dashboardLoading ? '...' : formatAmount(dashboardData?.todaySummary?.creditCollected ?? 0)}
                    </h3>
                    <div className="mt-2 flex items-center text-xs text-orange-600 font-bold bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-lg w-fit">
                      <span>{dashboardData?.todaySummary?.transactionCount ?? 0} {t('dashboard.transactions')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Low Stock Alert */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-red-500">
                  <Icon name="warning" />
                  {t('dashboard.lowStockAlert')}
                </h2>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/30 overflow-hidden shadow-sm">
                {dashboardLoading ? (
                  <div className="p-8 text-center text-slate-500">{t('dashboard.loading')}</div>
                ) : (dashboardData?.lowStock?.length ?? 0) === 0 ? (
                  <div className="p-8 text-center text-slate-500">{t('dashboard.noLowStock')}</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {dashboardData?.lowStock?.map((p) => (
                      <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs">
                            {p.stock} {p.unit}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{p.name}</h4>
                            <p className="text-xs text-slate-500">{p.category ?? '-'}</p>
                          </div>
                        </div>
                        <button
                          onClick={onNavigateToStock}
                          className="text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors cursor-pointer"
                        >
                          {t('dashboard.orderNow')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Recent Transactions Sidebar */}
          <div className="lg:col-span-1">
            <section className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Icon name="history" className="text-slate-500" />
                  {t('dashboard.recentTransactions')}
                </h2>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex-grow overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">{t('dashboard.todayList')}</span>
                    <span className="text-slate-400">Total: {dashboardData?.recentTransactions?.length ?? 0}</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
                  {dashboardLoading ? (
                    <div className="p-8 text-center text-slate-500">{t('dashboard.loading')}</div>
                  ) : (dashboardData?.recentTransactions?.length ?? 0) === 0 ? (
                    <div className="p-8 text-center text-slate-500">{t('dashboard.noTransactions')}</div>
                  ) : (
                    dashboardData?.recentTransactions?.map((tx) => (
                      <TransactionItem
                        key={tx.id}
                        title={tx.customer ? `${tx.invoiceNumber} (${tx.customer.name})` : tx.invoiceNumber}
                        amount={formatAmount(tx.totalAmount)}
                        type={tx.paymentMethod === 'bkash' ? 'bkash' : 'cash'}
                        time={formatTime(tx.createdAt)}
                      />
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                  <button
                    onClick={onNavigateToAccounts}
                    className="text-sm font-bold text-primary hover:text-orange-700 transition-colors w-full cursor-pointer"
                  >
                    {t('dashboard.viewMore')}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-12 py-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-slate-500">{t('nav.brand')}</span>
            <span className="text-xs text-slate-400">{t('footer.copyright')}</span>
          </div>
          <div className="flex gap-6">
            <a href="mailto:support@shohojhishab.com" className="text-sm text-slate-500 hover:text-green-600 transition-colors">
              {t('footer.help')}
            </a>
            <Link to="/privacy" className="text-sm text-slate-500 hover:text-green-600 transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="text-sm text-slate-500 hover:text-green-600 transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface TransactionItemProps {
  title: string;
  amount: string;
  type: 'cash' | 'bkash';
  time: string;
  isExpense?: boolean;
}

function TransactionItem({ title, amount, type, time, isExpense }: TransactionItemProps) {
  return (
    <div className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group ${isExpense ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
      <div className="flex justify-between items-start mb-1">
        <h4 className={`font-bold text-slate-800 dark:text-slate-200 group-hover:text-green-600 transition-colors ${isExpense ? 'group-hover:text-red-600' : ''}`}>
          {title}
        </h4>
        <span className={`font-bold ${isExpense ? 'text-red-500' : 'text-green-600'}`}>
          {isExpense ? '- ' : '+ '}{amount}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          {type === 'bkash' ? (
            <span className="w-4 h-4 rounded bg-[#e2136e] flex items-center justify-center text-[8px] text-white font-bold">b</span>
          ) : (
            <Icon name="payments" className="text-[16px]" />
          )}
          <span>{type === 'bkash' ? 'বিকাশ' : 'নগদ'}</span>
        </div>
        <span className="text-xs">{time}</span>
      </div>
    </div>
  );
}
