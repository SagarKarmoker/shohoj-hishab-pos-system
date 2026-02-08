import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';

interface CreditPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  totalDue: number;
  lastTransaction: string;
  transactions: CreditTransaction[];
}

interface CreditTransaction {
  id: number;
  date: string;
  amount: number;
  type: 'credit' | 'payment';
  description: string;
}

const initialCustomers: Customer[] = [
  {
    id: 1,
    name: 'করিম মিয়া',
    phone: '01712345678',
    totalDue: 2500,
    lastTransaction: '2024-01-15',
    transactions: [
      { id: 1, date: '2024-01-10', amount: 3000, type: 'credit', description: 'মাল ক্রয়' },
      { id: 2, date: '2024-01-15', amount: 500, type: 'payment', description: 'আংশিক পরিশোধ' },
    ]
  },
  {
    id: 2,
    name: 'রহিম শেখ',
    phone: '01812345679',
    totalDue: 1200,
    lastTransaction: '2024-01-14',
    transactions: [
      { id: 3, date: '2024-01-12', amount: 1500, type: 'credit', description: 'মাসের বাকি' },
      { id: 4, date: '2024-01-14', amount: 300, type: 'payment', description: 'নগদ জমা' },
    ]
  },
  {
    id: 3,
    name: 'আলী আহমেদ',
    phone: '01912345680',
    totalDue: 4500,
    lastTransaction: '2024-01-13',
    transactions: [
      { id: 5, date: '2024-01-05', amount: 5000, type: 'credit', description: 'বড় অর্ডার' },
      { id: 6, date: '2024-01-13', amount: 500, type: 'payment', description: 'আংশিক পরিশোধ' },
    ]
  },
  {
    id: 4,
    name: 'মিনু বেগম',
    phone: '01612345681',
    totalDue: 800,
    lastTransaction: '2024-01-10',
    transactions: [
      { id: 7, date: '2024-01-08', amount: 1000, type: 'credit', description: 'দৈনিক বাকি' },
      { id: 8, date: '2024-01-10', amount: 200, type: 'payment', description: 'পরিশোধ' },
    ]
  },
];

export function CreditPage({ isDark, onToggleTheme, onBackToDashboard }: CreditPageProps) {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setSelectedCustomer] = useState<Customer | null>(null);
  const [, setShowAddModal] = useState(false);
  const [, setShowPaymentModal] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const totalDue = customers.reduce((sum, c) => sum + c.totalDue, 0);

  const handleAddPayment = (customerId: number, amount: number) => {
    setCustomers(customers.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          totalDue: Math.max(0, c.totalDue - amount),
          lastTransaction: new Date().toISOString().split('T')[0],
          transactions: [
            ...c.transactions,
            {
              id: Date.now(),
              date: new Date().toISOString().split('T')[0],
              amount,
              type: 'payment',
              description: 'বাকি আদায়'
            }
          ]
        };
      }
      return c;
    }));
  };

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
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Icon name="person_add" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-none">{t('credit.title')}</h1>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('credit.manageDues')}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Icon name="group" className="text-orange-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('credit.totalCustomers')}</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Icon name="account_balance" className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('credit.totalDue')}</p>
                <p className="text-2xl font-bold text-red-600">৳{totalDue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Icon name="payments" className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('credit.collectedThisMonth')}</p>
                <p className="text-2xl font-bold text-green-600">৳৪,৫০০</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('credit.searchCustomer')}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20"
          >
            <Icon name="add" />
            {t('credit.addCustomer')}
          </button>
        </div>

        {/* Customers Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <Icon name="person" className="text-slate-500 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{customer.name}</h3>
                    <p className="text-sm text-slate-500">{customer.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">৳{customer.totalDue}</p>
                  <p className="text-xs text-slate-500">{t('credit.due')}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-sm text-slate-500 mb-3">
                  {t('credit.lastTransaction')}: {customer.lastTransaction}
                </p>
                
                {/* Recent Transactions */}
                <div className="space-y-2 mb-4">
                  {customer.transactions.slice(-2).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-center text-sm py-2 px-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          name={transaction.type === 'credit' ? 'arrow_upward' : 'arrow_downward'}
                          className={transaction.type === 'credit' ? 'text-red-500' : 'text-green-500'}
                        />
                        <span className="text-slate-600 dark:text-slate-300">{transaction.description}</span>
                      </div>
                      <span className={transaction.type === 'credit' ? 'text-red-600' : 'text-green-600'}>
                        {transaction.type === 'credit' ? '+' : '-'}৳{transaction.amount}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowPaymentModal(true);
                      handleAddPayment(customer.id, 100);
                    }}
                    className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Icon name="payments" className="text-sm" />
                    {t('credit.collect')}
                  </button>
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Icon name="history" className="text-sm" />
                    {t('credit.history')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Icon name="person_off" className="text-6xl mb-4 mx-auto opacity-30" />
            <p className="text-lg">{t('credit.noCustomers')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
