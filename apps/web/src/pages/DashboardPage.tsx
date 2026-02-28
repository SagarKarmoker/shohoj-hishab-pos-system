import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';

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

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Icon name="storefront" className="text-white text-xl" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              {t('nav.brand')}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {t('dashboard.shopName')}
              </span>
              <span className="text-xs text-slate-500">{t('dashboard.shopLocation')}</span>
            </div>
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? (
                <Icon name="light_mode" className="text-slate-400" />
              ) : (
                <Icon name="dark_mode" className="text-slate-500" />
              )}
            </button>
            <button
              onClick={onNavigateToSettings}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Icon name="settings" className="text-slate-500" />
            </button>
            <button
              onClick={onNavigateToAdmin}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('admin.title', 'Admin Panel')}
            >
              <Icon name="admin_panel_settings" className="text-slate-500" />
            </button>
            <button
              onClick={onLogout}
              className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden hover:bg-slate-300 transition-colors cursor-pointer"
            >
              <Icon name="person" className="text-slate-500" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {t('dashboard.welcome')}, {t('dashboard.userName')} 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <Icon name="calendar_today" className="text-slate-500 text-sm" />
            <span className="text-sm font-medium">24 Oct, 2023</span>
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
                  <Icon name="monitoring" className="text-green-600" />
                  {t('dashboard.todaySummary')}
                </h2>
                <a href="#" className="text-sm text-green-600 font-medium hover:underline">
                  {t('dashboard.viewDetails')}
                </a>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                      {t('dashboard.totalSales')}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">৳ ১২,৪৮০</h3>
                    <div className="mt-2 flex items-center text-xs text-green-600 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg w-fit">
                      <Icon name="trending_up" className="text-sm mr-1" />
                      <span>১২% {t('dashboard.increase')}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                      {t('dashboard.cashCollected')}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">৳ ৮,৩৫০</h3>
                    <div className="mt-2 text-xs text-slate-500">{t('dashboard.excludingCredit')}</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                      {t('dashboard.creditCollected')}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">৳ ৪,১৩০</h3>
                    <div className="mt-2 flex items-center text-xs text-orange-600 font-bold bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-lg w-fit">
                      <span>৫ {t('dashboard.customers')}</span>
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
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs">
                        ৩টি
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">
                          তীর সয়াবিন তেল (৫ লিটার)
                        </h4>
                        <p className="text-xs text-slate-500">মুদি সামগ্রী</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors cursor-pointer">
                      {t('dashboard.orderNow')}
                    </button>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs">
                        ৫টি
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">
                          প্রাণ চানাচুর (২০০ গ্রাম)
                        </h4>
                        <p className="text-xs text-slate-500">স্ন্যাকস</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors cursor-pointer">
                      {t('dashboard.orderNow')}
                    </button>
                  </div>
                </div>
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
                    <span className="text-slate-400">Total: 14</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
                  <TransactionItem
                    title="বিক্রি #১০২৪"
                    amount="৳ ৪৫০"
                    type="cash"
                    time="10:30 AM"
                  />
                  <TransactionItem
                    title="বাকি আদায় (করিম)"
                    amount="৳ ১,২০০"
                    type="bkash"
                    time="09:45 AM"
                  />
                  <TransactionItem
                    title="বিক্রি #১০২৩"
                    amount="৳ ১২০"
                    type="cash"
                    time="09:15 AM"
                  />
                  <TransactionItem
                    title="দোকান খরচ (চা-নাস্তা)"
                    amount="৳ ৫০"
                    type="cash"
                    time="08:50 AM"
                    isExpense
                  />
                  <TransactionItem
                    title="বিক্রি #১০২২"
                    amount="৳ ৮৫০"
                    type="bkash"
                    time="08:30 AM"
                  />
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                  <button className="text-sm font-bold text-primary hover:text-orange-700 transition-colors w-full cursor-pointer">
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
            <span className="text-xs text-slate-400">© ২০২৬ {t('footer.copyright')}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-green-600 transition-colors">
              {t('footer.help')}
            </a>
            <a href="#" className="text-sm text-slate-500 hover:text-green-600 transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#" className="text-sm text-slate-500 hover:text-green-600 transition-colors">
              {t('footer.terms')}
            </a>
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
