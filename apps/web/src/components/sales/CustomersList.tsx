import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Icon } from '../Icon';
import { getMyCustomers, type Customer } from '../../api/sales';

interface CustomersListProps {
  onViewCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
}

export function CustomersList({ onViewCustomer, onAddCustomer }: CustomersListProps) {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchCustomers();
  }, [page, searchQuery, statusFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await getMyCustomers({
        search: searchQuery || undefined,
        isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
        page,
        limit,
      });
      setCustomers(response.data);
      setTotal(response.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (customer: Customer) => {
    const now = new Date();
    const hasActiveSubscription = customer.subscriptionEndDate && new Date(customer.subscriptionEndDate) > now;
    
    if (!customer.isActive) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {t('sales.inactive', 'Inactive')}
        </span>
      );
    }
    
    if (hasActiveSubscription) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {t('sales.active', 'Active')}
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        {t('sales.expired', 'Expired')}
      </span>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('sales.myCustomers', 'My Customers')}
        </h2>
        <button
          onClick={onAddCustomer}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-orange-500/25"
        >
          <Icon name="person_add" className="w-5 h-5" />
          {t('sales.addCustomer', 'Add Customer')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('sales.searchCustomers', 'Search by name, email, or phone...')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-w-[150px]"
          >
            <option value="all">{t('sales.allStatuses', 'All Statuses')}</option>
            <option value="active">{t('sales.active', 'Active')}</option>
            <option value="inactive">{t('sales.inactive', 'Inactive')}</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 dark:hover:text-red-400">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Icon name="group" className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="mb-2">{t('sales.noCustomers', 'No customers found')}</p>
            <p className="text-sm">{t('sales.startByAdding', 'Start by adding your first customer!')}</p>
            <button
              onClick={onAddCustomer}
              className="mt-4 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all"
            >
              {t('sales.addCustomer', 'Add Customer')}
            </button>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('sales.customer', 'Customer')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('sales.contact', 'Contact')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('sales.status', 'Status')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('sales.plan', 'Plan')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('sales.joined', 'Joined')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('sales.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                          <Icon name="person" className="text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {customer.displayName || 'No Name'}
                          </div>
                          <div className="text-sm text-slate-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {customer.phoneNumber || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(customer)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {customer.subscriptionPlan || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onViewCustomer(customer)}
                        className="p-2 text-slate-500 hover:text-primary hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        title={t('sales.viewDetails', 'View Details')}
                      >
                        <Icon name="visibility" className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {t('sales.showing', 'Showing {{start}} to {{end}} of {{total}}', {
                    start: (page - 1) * limit + 1,
                    end: Math.min(page * limit, total),
                    total,
                  })}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('common.previous', 'Previous')}
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('common.next', 'Next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
