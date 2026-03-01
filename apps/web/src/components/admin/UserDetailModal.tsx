import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Icon } from '../Icon';
import { getUserDetails, type UserDetails } from '../../api/admin';

type DetailTab = 'overview' | 'shops' | 'transactions' | 'subscription' | 'activity';

interface UserDetailModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ userId, isOpen, onClose }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserDetails(userId);
      setUserDetails(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs: { id: DetailTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'person' },
    { id: 'shops', label: 'Shops', icon: 'store' },
    { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
    { id: 'subscription', label: 'Subscription', icon: 'card_membership' },
    { id: 'activity', label: 'Activity', icon: 'history' },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200';
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
      case 'SALES':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 flex items-center justify-center">
              <Icon name="person" className="text-2xl text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? 'Loading...' : userDetails?.user.displayName || 'User Details'}
              </h2>
              {!loading && userDetails && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {userDetails.user.email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Icon name="close" className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon name={tab.icon} className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : userDetails ? (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Basic Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">Email</span>
                        <span className="font-medium">{userDetails.user.email}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">Phone</span>
                        <span className="font-medium">{userDetails.user.phoneNumber || '-'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">Role</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(userDetails.user.role)}`}>
                          {userDetails.user.role}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">Status</span>
                        <span className={`font-medium ${userDetails.user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {userDetails.user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Account Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">Joined</span>
                        <span className="font-medium">
                          {format(new Date(userDetails.user.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">Last Updated</span>
                        <span className="font-medium">
                          {format(new Date(userDetails.user.updatedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">Subscription Plan</span>
                        <span className="font-medium">{userDetails.user.subscriptionPlan || 'Free'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">Shops</span>
                        <span className="font-medium">{userDetails.shops.length}</span>
                      </div>
                    </div>
                  </div>

                  {userDetails.plan && (
                    <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Current Plan
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500 block">Plan Name</span>
                          <span className="font-medium">{userDetails.plan.name}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Price</span>
                          <span className="font-medium">৳{userDetails.plan.price}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Duration</span>
                          <span className="font-medium">{userDetails.plan.durationDays} days</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Shops Tab */}
              {activeTab === 'shops' && (
                <div className="space-y-4">
                  {userDetails.shops.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Icon name="store" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No shops found</p>
                    </div>
                  ) : (
                    userDetails.shops.map((shop) => (
                      <div
                        key={shop.id}
                        className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                            <Icon name="store" className="text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {shop.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {shop.address || 'No address'} • {shop.phone || 'No phone'}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-400">
                          Created {format(new Date(shop.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Transactions Tab */}
              {activeTab === 'transactions' && (
                <div className="space-y-3">
                  {userDetails.transactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Icon name="receipt_long" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No transactions found</p>
                    </div>
                  ) : (
                    userDetails.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {transaction.invoiceNumber}
                          </p>
                          <p className="text-sm text-slate-500">
                            {transaction.customer?.name || 'Walk-in'} • {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            ৳{transaction.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-sm text-slate-500">
                            Paid: ৳{transaction.paidAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <div className="space-y-4">
                  {userDetails.subscriptionHistory.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Icon name="card_membership" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No subscription history found</p>
                    </div>
                  ) : (
                    userDetails.subscriptionHistory.map((sub, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {sub.planName}
                          </span>
                          <span className="font-bold text-orange-600">
                            ৳{sub.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 flex gap-4">
                          <span>
                            From: {format(new Date(sub.startDate), 'MMM dd, yyyy')}
                          </span>
                          <span>
                            To: {format(new Date(sub.endDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-3">
                  {userDetails.recentActivity.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Icon name="history" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    userDetails.recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {activity.action}
                          </p>
                          <p className="text-xs text-slate-500">
                            {activity.entityType} {activity.entityId ? `• ${activity.entityId}` : ''}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
