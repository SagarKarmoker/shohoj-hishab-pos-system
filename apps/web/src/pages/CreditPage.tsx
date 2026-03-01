import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { useShop } from '../contexts/ShopContext';
import { getCustomers, createCustomer, collectPayment, type Customer } from '../api/customer';
import { getTransactions, type TransactionWithCustomer } from '../api/transaction';

interface CreditPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
}

export function CreditPage({ isDark, onToggleTheme, onBackToDashboard }: CreditPageProps) {
  const { t } = useTranslation();
  const { currentShop } = useShop();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addForm, setAddForm] = useState({ name: '', phone: '' });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [historyTransactions, setHistoryTransactions] = useState<TransactionWithCustomer[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadCustomers = useCallback(async () => {
    if (!currentShop) return;
    setLoading(true);
    try {
      const data = await getCustomers(currentShop.id);
      setCustomers(data);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [currentShop]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone?.includes(searchQuery) ?? false),
  );

  const totalDue = customers.reduce((sum, c) => sum + c.dueBalance, 0);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShop || !addForm.name.trim()) return;
    setAddSubmitting(true);
    setAddError(null);
    try {
      const created = await createCustomer(currentShop.id, {
        name: addForm.name.trim(),
        phone: addForm.phone.trim() || undefined,
      });
      setCustomers((prev) => [created, ...prev]);
      setShowAddModal(false);
      setAddForm({ name: '', phone: '' });
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShop || !selectedCustomer || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      const updated = await collectPayment(currentShop.id, selectedCustomer.id, amount);
      setCustomers((prev) => prev.map((c) => (c.id === selectedCustomer.id ? updated : c)));
      setShowPaymentModal(false);
      setSelectedCustomer(null);
      setPaymentAmount('');
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to collect payment');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const openPaymentModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPaymentAmount(String(Math.min(100, customer.dueBalance)));
    setShowPaymentModal(true);
    setPaymentError(null);
  };

  useEffect(() => {
    if (!currentShop || !showHistoryModal || !selectedCustomer) return;
    setHistoryLoading(true);
    getTransactions(currentShop.id, { customerId: selectedCustomer.id })
      .then(setHistoryTransactions)
      .catch(() => setHistoryTransactions([]))
      .finally(() => setHistoryLoading(false));
  }, [currentShop, showHistoryModal, selectedCustomer?.id]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (!currentShop) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <Icon name="person_add" className="text-6xl mx-auto mb-4 opacity-50" />
          <p className="font-medium text-lg">{t('credit.noShop')}</p>
          <p className="text-sm mt-2">{t('credit.noShopHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBackToDashboard} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <Icon name="arrow_back" />
            </button>
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Icon name="person_add" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-none">{t('credit.title')}</h1>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('credit.manageDues')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onToggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              {isDark ? <Icon name="light_mode" className="text-slate-400" /> : <Icon name="dark_mode" className="text-slate-500" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Icon name="group" className="text-orange-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('credit.totalCustomers')}</p>
                <p className="text-2xl font-bold">{loading ? '...' : customers.length}</p>
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
                <p className="text-2xl font-bold text-red-600">{loading ? '...' : `৳${Math.round(totalDue).toLocaleString()}`}</p>
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
                <p className="text-2xl font-bold text-green-600">৳0</p>
              </div>
            </div>
          </div>
        </div>

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

        <div className="grid md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
          ) : (
            filteredCustomers.map((customer) => (
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
                    <p className="text-2xl font-bold text-red-600">৳{Math.round(customer.dueBalance)}</p>
                    <p className="text-xs text-slate-500">{t('credit.due')}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  {customer.transactions && customer.transactions.length > 0 ? (
                    <>
                      <p className="text-sm text-slate-500 mb-3">
                        {t('credit.lastTransaction')}: {formatDate(customer.transactions[0].createdAt)}
                      </p>
                      <div className="space-y-2 mb-4">
                        {customer.transactions.slice(0, 3).map((tx) => (
                          <div
                            key={tx.id}
                            className="flex justify-between items-center text-sm py-2 px-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Icon name="receipt" className="text-slate-500" />
                              <span className="text-slate-600 dark:text-slate-300">{tx.invoiceNumber}</span>
                            </div>
                            <span className="text-red-600">৳{Math.round(Number(tx.dueAmount))}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 mb-4">{t('credit.noTransactionsYet')}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openPaymentModal(customer)}
                      disabled={customer.dueBalance <= 0}
                      className="flex-1 py-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Icon name="payments" className="text-sm" />
                      {t('credit.collect')}
                    </button>
                    <button
                      onClick={() => { setSelectedCustomer(customer); setShowHistoryModal(true); }}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Icon name="history" className="text-sm" />
                      {t('credit.history')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && filteredCustomers.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Icon name="person_off" className="text-6xl mb-4 mx-auto opacity-30" />
            <p className="text-lg">{t('credit.noCustomers')}</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 cursor-pointer"
            >
              {t('credit.addCustomer')}
            </button>
          </div>
        )}
      </main>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-6">{t('credit.createCustomer')}</h2>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('credit.customerName')}</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('credit.phone')}</label>
                <input
                  type="tel"
                  value={addForm.phone}
                  onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              {addError && <p className="text-red-600 text-sm">{addError}</p>}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={addSubmitting} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium disabled:opacity-60">
                  {addSubmitting ? t('common.loading') : t('credit.createCustomer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-2">{t('credit.collectPayment')}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{selectedCustomer.name} - {t('credit.due')}: ৳{Math.round(selectedCustomer.dueBalance)}</p>
            <form onSubmit={handleCollectPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('credit.amount')}</label>
                <input
                  type="number"
                  min="0"
                  max={selectedCustomer.dueBalance}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              {paymentError && <p className="text-red-600 text-sm">{paymentError}</p>}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowPaymentModal(false); setSelectedCustomer(null); }} className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={paymentSubmitting || !paymentAmount || parseFloat(paymentAmount) <= 0} className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium disabled:opacity-60">
                  {paymentSubmitting ? t('common.loading') : t('credit.collect')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History modal */}
      {showHistoryModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col p-6">
            <h2 className="text-xl font-bold mb-4">{t('credit.history')} - {selectedCustomer.name}</h2>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-2 mb-4">
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                </div>
              ) : historyTransactions.length === 0 ? (
                <p className="text-slate-500 text-center py-6">{t('credit.noTransactionsYet')}</p>
              ) : (
                historyTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center py-3 px-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{tx.invoiceNumber}</p>
                      <p className="text-xs text-slate-500">{formatDate(tx.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 dark:text-slate-200">৳{Math.round(tx.totalAmount)}</p>
                      {tx.dueAmount > 0 && (
                        <p className="text-xs text-orange-600">{t('credit.due')}: ৳{Math.round(tx.dueAmount)}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => { setShowHistoryModal(false); setSelectedCustomer(null); }} className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg font-medium cursor-pointer">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
