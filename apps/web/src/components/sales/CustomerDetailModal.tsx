import { format } from 'date-fns';
import { Icon } from '../Icon';
import type { Customer } from '../../api/sales';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailModal({ customer, isOpen, onClose }: CustomerDetailModalProps) {
  if (!isOpen || !customer) return null;

  const getStatusBadge = () => {
    const now = new Date();
    const hasActiveSubscription = customer.subscriptionEndDate && new Date(customer.subscriptionEndDate) > now;
    
    if (!customer.isActive) {
      return (
        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Inactive
        </span>
      );
    }
    
    if (hasActiveSubscription) {
      return (
        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Active
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        Expired
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Customer Details</h3>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <Icon name="close" className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 flex items-center justify-center">
              <Icon name="person" className="text-3xl text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {customer.displayName || 'No Name'}
              </h4>
              <p className="text-slate-500">{customer.email}</p>
              {getStatusBadge()}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Icon name="phone" className="w-4 h-4" />
                <span className="text-sm">Phone</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {customer.phoneNumber || '-'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Icon name="calendar_today" className="w-4 h-4" />
                <span className="text-sm">Joined</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Icon name="card_membership" className="w-4 h-4" />
                <span className="text-sm">Plan</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {customer.subscriptionPlan || 'Free'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Icon name="event" className="w-4 h-4" />
                <span className="text-sm">Expires</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {customer.subscriptionEndDate
                  ? format(new Date(customer.subscriptionEndDate), 'MMM dd, yyyy')
                  : '-'}
              </p>
            </div>
          </div>

          {/* Account Status */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Account Status</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className={customer.isActive ? 'text-green-600' : 'text-red-600'}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subscription</span>
                <span className={customer.subscriptionEndDate && new Date(customer.subscriptionEndDate) > new Date() ? 'text-green-600' : 'text-yellow-600'}>
                  {customer.subscriptionEndDate && new Date(customer.subscriptionEndDate) > new Date() ? 'Valid' : 'Expired/None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
