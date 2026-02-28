import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';

interface AccountsPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
}

type TransactionType = 'sale' | 'purchase' | 'expense' | 'credit' | 'payment';

interface Transaction {
  id: string;
  date: string;
  time: string;
  type: TransactionType;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'card';
  category?: string;
}

const sampleTransactions: Transaction[] = [
  { id: 'S-1025', date: '2024-01-15', time: '10:30 AM', type: 'sale', description: 'বিক্রি #১০২৫', amount: 450, paymentMethod: 'cash' },
  { id: 'P-001', date: '2024-01-15', time: '09:45 AM', type: 'payment', description: 'বাকি আদায় (করিম)', amount: 1200, paymentMethod: 'bkash' },
  { id: 'S-1024', date: '2024-01-15', time: '09:30 AM', type: 'sale', description: 'বিক্রি #১০২৪', amount: 320, paymentMethod: 'cash' },
  { id: 'E-001', date: '2024-01-15', time: '08:50 AM', type: 'expense', description: 'দোকান খরচ (চা-নাস্তা)', amount: 50, paymentMethod: 'cash', category: 'খরচ' },
  { id: 'S-1023', date: '2024-01-14', time: '05:15 PM', type: 'sale', description: 'বিক্রি #১০২৩', amount: 890, paymentMethod: 'bkash' },
  { id: 'S-1022', date: '2024-01-14', time: '04:30 PM', type: 'sale', description: 'বিক্রি #১০২২', amount: 120, paymentMethod: 'cash' },
  { id: 'C-001', date: '2024-01-14', time: '03:00 PM', type: 'credit', description: 'বাকি বিক্রি (রহিম)', amount: 500, paymentMethod: 'cash' },
  { id: 'P-002', date: '2024-01-14', time: '02:30 PM', type: 'purchase', description: 'স্টক ক্রয় (তীর তেল)', amount: 5000, paymentMethod: 'cash' },
  { id: 'E-002', date: '2024-01-14', time: '12:00 PM', type: 'expense', description: 'বিদ্যুৎ বিল', amount: 1200, paymentMethod: 'bkash', category: 'বিল' },
  { id: 'S-1021', date: '2024-01-14', time: '11:30 AM', type: 'sale', description: 'বিক্রি #১০২১', amount: 650, paymentMethod: 'cash' },
];

const typeConfig: Record<TransactionType, { label: string; icon: string; color: string; bgColor: string }> = {
  sale: { label: 'বিক্রি', icon: 'shopping_cart', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  purchase: { label: 'ক্রয়', icon: 'shopping_bag', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  expense: { label: 'খরচ', icon: 'trending_down', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  credit: { label: 'বাকি', icon: 'account_balance', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  payment: { label: 'আদায়', icon: 'payments', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
};

export function AccountsPage({ isDark, onToggleTheme, onBackToDashboard }: AccountsPageProps) {
  const { t } = useTranslation();
  const [transactions] = useState<Transaction[]>(sampleTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'sale' || t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense' || t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredit = filteredTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToDashboard}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Icon name="arrow_back" />
            </button>
            <div className="w-10 h-10 bg-slate-700 dark:bg-slate-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-slate-500/20">
              <Icon name="receipt_long" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-none">{t('accounts.title')}</h1>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('accounts.allTransactions')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isDark ? <Icon name="light_mode" className="text-slate-400" /> : <Icon name="dark_mode" className="text-slate-500" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Icon name="arrow_upward" className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('accounts.totalIncome')}</p>
                <p className="text-2xl font-bold text-green-600">৳{totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Icon name="arrow_downward" className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('accounts.totalExpense')}</p>
                <p className="text-2xl font-bold text-red-600">৳{totalExpense.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Icon name="account_balance" className="text-orange-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('accounts.totalCredit')}</p>
                <p className="text-2xl font-bold text-orange-600">৳{totalCredit.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Icon name="account_balance_wallet" className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('accounts.netBalance')}</p>
                <p className="text-2xl font-bold text-blue-600">৳{(totalIncome - totalExpense).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                  dateRange === range
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {t(`accounts.${range}`)}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('accounts.searchTransactions')}
              className="w-full pl-12 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-800'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t('accounts.allTypes')}
          </button>
          {(Object.keys(typeConfig) as TransactionType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                filterType === type
                  ? `${typeConfig[type].bgColor} ${typeConfig[type].color}`
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon name={typeConfig[type].icon} className="text-sm" />
              {typeConfig[type].label}
            </button>
          ))}
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">{t('accounts.id')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">{t('accounts.type')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">{t('accounts.description')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">{t('accounts.payment')}</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">{t('accounts.amount')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">{t('accounts.time')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredTransactions.map((transaction) => {
                  const config = typeConfig[transaction.type];
                  return (
                    <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{transaction.id}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${config.bgColor} ${config.color}`}>
                          <Icon name={config.icon} className="text-sm" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{transaction.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {transaction.paymentMethod === 'bkash' ? (
                            <span className="text-[#e2136e] font-bold text-sm">bKash</span>
                          ) : transaction.paymentMethod === 'nagad' ? (
                            <span className="text-[#f7931e] font-bold text-sm">Nagad</span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm">
                              <Icon name="payments" className="text-sm" />
                              নগদ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${
                          transaction.type === 'expense' || transaction.type === 'purchase' || transaction.type === 'credit'
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}>
                          {transaction.type === 'expense' || transaction.type === 'purchase' || transaction.type === 'credit' ? '-' : '+'}
                          ৳{transaction.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <div>{transaction.date}</div>
                        <div className="text-xs">{transaction.time}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Icon name="receipt_long" className="text-6xl mb-4 mx-auto opacity-30" />
              <p className="text-lg">{t('accounts.noTransactions')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
