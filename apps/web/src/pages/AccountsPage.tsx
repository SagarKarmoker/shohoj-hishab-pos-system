import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { Icon } from '../components/Icon';
import { useShop } from '../contexts/ShopContext';
import { getTransactions, getTransactionById, type TransactionWithCustomer } from '../api/transaction';
import { jsPDF } from 'jspdf';
import { generateInvoicePDF as createInvoicePDF } from '../utils/pdfInvoice';

interface AccountsPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
}

type DisplayType = 'sale' | 'credit';

const typeConfig: Record<DisplayType, { labelKey: string; icon: string; color: string; bgColor: string }> = {
  sale: { labelKey: 'accounts.sale', icon: 'shopping_cart', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  credit: { labelKey: 'accounts.credit', icon: 'account_balance', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
};

function getDateRange(range: 'today' | 'week' | 'month' | 'all'): { dateFrom?: string; dateTo?: string } {
  if (range === 'all') return {};
  
  const now = new Date();
  const dateTo = now.toISOString().slice(0, 10);
  let dateFrom: string;
  if (range === 'today') {
    dateFrom = dateTo;
  } else if (range === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    dateFrom = d.toISOString().slice(0, 10);
  } else {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    dateFrom = d.toISOString().slice(0, 10);
  }
  return { dateFrom, dateTo };
}

export function AccountsPage({ isDark, onToggleTheme, onBackToDashboard }: AccountsPageProps) {
  const { t } = useTranslation();
  const { currentShop } = useShop();
  const [transactions, setTransactions] = useState<TransactionWithCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<DisplayType | 'all'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const loadTransactions = useCallback(async () => {
    if (!currentShop) return;
    setLoading(true);
    try {
      const { dateFrom, dateTo } = getDateRange(dateRange);
      if (dateRange === 'all') {
        const data = await getTransactions(currentShop.id, { all: true });
        setTransactions(data);
      } else {
        const data = await getTransactions(currentShop.id, { dateFrom, dateTo });
        setTransactions(data);
      }
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [currentShop, dateRange]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const getDisplayType = (tx: TransactionWithCustomer): DisplayType =>
    tx.customer && tx.dueAmount > 0 ? 'credit' : 'sale';

  const filteredTransactions = transactions.filter((tx) => {
    const displayType = getDisplayType(tx);
    const matchesSearch =
      tx.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = filterType === 'all' || displayType === filterType;
    return matchesSearch && matchesType;
  });

  const totalIncome = filteredTransactions.reduce((sum, tx) => sum + tx.paidAmount, 0);
  const totalCredit = filteredTransactions.reduce((sum, tx) => sum + tx.dueAmount, 0);
  const totalExpense = 0;
  const netBalance = totalIncome - totalExpense;

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
  };

  const getPaymentLabel = (method: string) => {
    if (method === 'bkash') return 'bKash';
    if (method === 'nagad') return 'Nagad';
    return t('accounts.cash');
  };

  const downloadTransactionsPDF = () => {
    if (filteredTransactions.length === 0 || !currentShop) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Shohoj Hishab - Transaction Report', 148, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(currentShop.name, 148, 22, { align: 'center' });

    const dateRangeText = `${getDateRange(dateRange).dateFrom} to ${getDateRange(dateRange).dateTo}`;
    doc.text(`Date Range: ${dateRangeText}`, 148, 28, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const headers = ['Date', 'Invoice', 'Customer', 'Type', 'Payment', 'Total', 'Paid', 'Due'];
    const colWidths = [25, 30, 40, 20, 25, 30, 30, 25];
    let startX = 14;
    let startY = 38;

    doc.setFillColor(249, 115, 22);
    doc.rect(14, startY - 5, 268, 8, 'F');
    doc.setTextColor(255, 255, 255);
    headers.forEach((header, i) => {
      doc.text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + colWidths[i] / 2, startY, { align: 'center' });
    });

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    startY += 8;

    filteredTransactions.forEach((tx, index) => {
      if (startY > 180) {
        doc.addPage();
        startY = 20;
      }

      const row = [
        new Date(tx.createdAt).toLocaleDateString('en-GB'),
        tx.invoiceNumber.substring(0, 10),
        tx.customer?.name || '-',
        tx.dueAmount > 0 ? 'Credit' : 'Sale',
        getPaymentLabel(tx.paymentMethod),
        `৳${tx.totalAmount.toFixed(0)}`,
        `৳${tx.paidAmount.toFixed(0)}`,
        `৳${tx.dueAmount.toFixed(0)}`,
      ];

      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(14, startY - 4, 268, 7, 'F');
      }

      row.forEach((cell, i) => {
        doc.text(cell, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + colWidths[i] / 2, startY, { align: 'center' });
      });

      startY += 7;
    });

    startY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(249, 115, 22);
    doc.rect(14, startY - 4, 268, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Total', 40, startY);
    doc.text(`৳${totalIncome.toFixed(0)}`, 175, startY, { align: 'center' });
    doc.text(`৳${totalCredit.toFixed(0)}`, 205, startY, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 148, 190, { align: 'center' });
    doc.text('Powered by Shohoj Hishab', 148, 195, { align: 'center' });

    const fileName = `transactions-${getDateRange(dateRange).dateFrom}-to-${getDateRange(dateRange).dateTo}.pdf`;
    doc.save(fileName);
  };

  const downloadInvoicePDF = async (tx: TransactionWithCustomer) => {
    if (!currentShop) return;
    try {
      const detail = await getTransactionById(currentShop.id, tx.id);
      console.log('Transaction detail:', detail);
      
      const isBangla = i18n.language === 'bn';
      
      await createInvoicePDF(
        {
          invoiceNumber: detail.invoiceNumber,
          createdAt: detail.createdAt,
          shop: {
            name: detail.shop?.name || 'Shop',
            address: detail.shop?.address || undefined,
            phone: detail.shop?.phone || undefined,
          },
          customer: detail.customer
            ? {
                name: detail.customer.name,
                phone: detail.customer.phone || undefined,
              }
            : undefined,
          items:
            detail.items?.map((item) => ({
              name: item.product?.name || 'Item',
              quantity: item.quantity,
              totalPrice: Number(item.totalPrice),
            })) || [],
          totalAmount: Number(detail.totalAmount),
          discount: detail.discount ? Number(detail.discount) : undefined,
          paidAmount: detail.paidAmount ? Number(detail.paidAmount) : undefined,
          dueAmount: detail.dueAmount ? Number(detail.dueAmount) : undefined,
        },
        { isBangla }
      );
    } catch (err) {
      console.error('Failed to download invoice:', err);
    }
  };

  if (!currentShop) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <Icon name="receipt_long" className="text-6xl mx-auto mb-4 opacity-50" />
          <p className="font-medium text-lg">{t('accounts.noShop')}</p>
          <p className="text-sm mt-2">{t('accounts.noShopHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md h-16 flex-none">
        <div className="h-full px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onBackToDashboard}
              className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label={t('common.back') || 'Back'}
            >
              <Icon name="arrow_back" className="text-xl sm:text-xl" />
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700 dark:bg-slate-600 rounded-lg flex items-center justify-center text-white shrink-0">
              <Icon name="receipt_long" className="text-lg sm:text-xl" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 dark:text-white leading-tight truncate">
                {t('accounts.title')}
              </h1>
              <span className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
                {t('accounts.allTransactions')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={downloadTransactionsPDF}
              disabled={filteredTransactions.length === 0}
              className="h-9 sm:h-10 px-2 sm:px-3 bg-primary text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 sm:gap-2"
              aria-label={t('accounts.downloadPDF') || 'Download PDF'}
              title={t('accounts.downloadPDF') || 'Download PDF'}
            >
              <Icon name="download" className="text-lg" />
              <span className="hidden sm:inline">{t('accounts.downloadPDF') || 'Download'}</span>
            </button>
            <button
              onClick={onToggleTheme}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer inline-flex items-center justify-center"
              aria-label={t('common.toggleTheme') || 'Toggle theme'}
              title={t('common.toggleTheme') || 'Toggle theme'}
            >
              {isDark ? <Icon name="light_mode" className="text-slate-400 text-xl" /> : <Icon name="dark_mode" className="text-slate-500 text-xl" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Icon name="arrow_upward" className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('accounts.totalIncome')}</p>
                <p className="text-2xl font-bold text-green-600">{loading ? '...' : `৳${Math.round(totalIncome).toLocaleString()}`}</p>
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
                <p className="text-2xl font-bold text-red-600">{loading ? '...' : `৳${Math.round(totalExpense).toLocaleString()}`}</p>
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
                <p className="text-2xl font-bold text-orange-600">{loading ? '...' : `৳${Math.round(totalCredit).toLocaleString()}`}</p>
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
                <p className="text-2xl font-bold text-blue-600">{loading ? '...' : `৳${Math.round(netBalance).toLocaleString()}`}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['all', 'today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                  dateRange === range ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {range === 'all' ? (t('accounts.all') || 'All') : t(`accounts.${range}`)}
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

        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-800' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t('accounts.allTypes')}
          </button>
          {(Object.keys(typeConfig) as DisplayType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                filterType === type ? `${typeConfig[type].bgColor} ${typeConfig[type].color}` : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon name={typeConfig[type].icon} className="text-sm" />
              {t(typeConfig[type].labelKey)}
            </button>
          ))}
        </div>

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
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const displayType = getDisplayType(tx);
                    const config = typeConfig[displayType];
                    const desc = tx.customer ? `${tx.invoiceNumber} (${tx.customer.name})` : tx.invoiceNumber;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{tx.invoiceNumber}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${config.bgColor} ${config.color}`}>
                            <Icon name={config.icon} className="text-sm" />
                            {t(config.labelKey)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{desc}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={tx.paymentMethod === 'bkash' ? 'text-[#e2136e] font-bold text-sm' : 'text-slate-600 dark:text-slate-400 text-sm'}>
                            {getPaymentLabel(tx.paymentMethod)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-green-600">+৳{Math.round(tx.totalAmount)}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          <div>{formatDateTime(tx.createdAt).date}</div>
                          <div className="text-xs">{formatDateTime(tx.createdAt).time}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => downloadInvoicePDF(tx)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title={t('accounts.downloadInvoice') || 'Download Invoice'}
                          >
                            <Icon name="download" className="text-lg" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {!loading && filteredTransactions.length === 0 && (
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
