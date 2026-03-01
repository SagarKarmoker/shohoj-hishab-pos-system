import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../Icon';
import { createCustomer, type Customer } from '../../api/sales';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  description?: string;
  isActive?: boolean;
}

interface AddCustomerFormProps {
  onSuccess: (customer: Customer) => void;
  onCancel: () => void;
}

export function AddCustomerForm({ onSuccess, onCancel }: AddCustomerFormProps) {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    phoneNumber: '',
    planId: '',
  });

  const [commission, setCommission] = useState(0);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    // Calculate commission when plan changes (assuming 10% commission rate)
    const selectedPlan = plans.find(p => p.id === formData.planId);
    if (selectedPlan) {
      setCommission(Math.round(selectedPlan.price * 0.1 * 100) / 100);
    } else {
      setCommission(0);
    }
  }, [formData.planId, plans]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/plans`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
      });
      const activePlans = response.data.filter((p: SubscriptionPlan) => p.isActive !== false);
      setPlans(activePlans);
      if (activePlans.length > 0) {
        setFormData(prev => ({ ...prev, planId: activePlans[0].id }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const customer = await createCustomer({
        email: formData.email.trim(),
        displayName: formData.displayName.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        planId: formData.planId,
      });
      onSuccess(customer);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === formData.planId);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 dark:hover:text-red-400">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('sales.email', 'Email Address')} *
          </label>
          <div className="relative">
            <Icon name="email" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@example.com"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('sales.fullName', 'Full Name')}
          </label>
          <div className="relative">
            <Icon name="person" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="John Doe"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('sales.phoneNumber', 'Phone Number')}
          </label>
          <div className="relative">
            <Icon name="phone" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+880 1XXX-XXXXXX"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Plan Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          {t('sales.selectPlan', 'Select Subscription Plan')} *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setFormData({ ...formData, planId: plan.id })}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                formData.planId === plan.id
                  ? 'border-primary bg-orange-50 dark:bg-orange-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{plan.name}</h4>
                {formData.planId === plan.id && (
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                    <Icon name="check" className="w-4 h-4" />
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                {plan.description || t('sales.noDescription', 'No description')}
              </p>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                ৳{plan.price}
                <span className="text-sm font-normal text-slate-500">
                  /{plan.durationDays} {t('sales.days', 'days')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commission Preview */}
      {selectedPlan && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('sales.yourCommission', 'Your Commission')}
              </p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                ৳{commission.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600 dark:text-green-400">
                {t('sales.saleAmount', 'Sale Amount')}
              </p>
              <p className="font-semibold text-green-800 dark:text-green-200">
                ৳{selectedPlan.price}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 text-sm font-semibold text-slate-600 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          {t('common.cancel', 'Cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting || !formData.email || !formData.planId}
          className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/25"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('common.creating', 'Creating...')}
            </span>
          ) : (
            t('sales.createCustomer', 'Create Customer')
          )}
        </button>
      </div>
    </form>
  );
}
