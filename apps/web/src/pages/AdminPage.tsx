import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  displayName?: string;
  role: string;
  isActive: boolean;
  subscriptionPlan?: string;
  subscriptionPlanId?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  createdAt: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  features?: string;
  isActive: boolean;
}

interface SalesPerson {
  id: string;
  userId: string;
  displayName?: string;
  phoneNumber: string;
  commissionRate: number;
  totalSales: number;
  totalEarnings: number;
  isActive: boolean;
}

interface AdminPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
  onLogout: () => void;
}

type TabType = 'users' | 'plans' | 'sales' | 'analytics';

export function AdminPage({
  isDark,
  onToggleTheme,
  onBackToDashboard,
  onLogout,
}: AdminPageProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [salesPeople, setSalesPeople] = useState<SalesPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // User search/filter
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Plan form
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    durationDays: '',
    features: '',
  });

  // User approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvingUser, setApprovingUser] = useState<User | null>(null);
  const [approvalForm, setApprovalForm] = useState({
    subscriptionStartDate: '',
    subscriptionEndDate: '',
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: getAuthHeaders(),
      });
      setUsers(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/plans`, {
        headers: getAuthHeaders(),
      });
      setPlans(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  // Fetch sales people
  const fetchSalesPeople = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/sales`, {
        headers: getAuthHeaders(),
      });
      setSalesPeople(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sales people');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'plans') {
      fetchPlans();
    } else if (activeTab === 'sales') {
      fetchSalesPeople();
    }
  }, [activeTab]);

  // Open approval modal for activating user
  const openApprovalModal = (user: User) => {
    setApprovingUser(user);
    // Set default dates: start = today, end = today + 30 days
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    setApprovalForm({
      subscriptionStartDate: today.toISOString().split('T')[0],
      subscriptionEndDate: thirtyDaysLater.toISOString().split('T')[0],
    });
    setShowApprovalModal(true);
  };

  // Submit user approval with subscription dates
  const handleApprovalSubmit = async () => {
    if (!approvingUser) return;
    
    try {
      await axios.patch(
        `${API_URL}/admin/users/${approvingUser.id}`,
        {
          isActive: true,
          subscriptionStartDate: new Date(approvalForm.subscriptionStartDate).toISOString(),
          subscriptionEndDate: new Date(approvalForm.subscriptionEndDate).toISOString(),
        },
        { headers: getAuthHeaders() }
      );
      setShowApprovalModal(false);
      setApprovingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve user');
    }
  };

  // Toggle user active status (with subscription dates for activation)
  const toggleUserStatus = async (userId: string, currentStatus: boolean, subscriptionStartDate?: string, subscriptionEndDate?: string) => {
    try {
      const updateData: any = { isActive: !currentStatus };
      
      // If activating user, include subscription dates
      if (!currentStatus && subscriptionStartDate && subscriptionEndDate) {
        updateData.subscriptionStartDate = subscriptionStartDate;
        updateData.subscriptionEndDate = subscriptionEndDate;
      }
      
      await axios.patch(
        `${API_URL}/admin/users/${userId}`,
        updateData,
        { headers: getAuthHeaders() }
      );
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Update user role
  const updateUserRole = async (userId: string, role: string) => {
    try {
      await axios.patch(
        `${API_URL}/admin/users/${userId}`,
        { role },
        { headers: getAuthHeaders() }
      );
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  // Create/Update plan
  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const planData = {
        name: planForm.name,
        description: planForm.description || undefined,
        price: parseFloat(planForm.price),
        durationDays: parseInt(planForm.durationDays),
        features: planForm.features || undefined,
      };

      if (editingPlan) {
        await axios.patch(
          `${API_URL}/admin/plans/${editingPlan.id}`,
          planData,
          { headers: getAuthHeaders() }
        );
      } else {
        await axios.post(`${API_URL}/admin/plans`, planData, {
          headers: getAuthHeaders(),
        });
      }

      setShowPlanForm(false);
      setEditingPlan(null);
      setPlanForm({ name: '', description: '', price: '', durationDays: '', features: '' });
      fetchPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save plan');
    }
  };

  // Toggle plan active status
  const togglePlanStatus = async (planId: string) => {
    try {
      await axios.patch(
        `${API_URL}/admin/plans/${planId}/toggle`,
        {},
        { headers: getAuthHeaders() }
      );
      fetchPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle plan');
    }
  };

  // Delete plan
  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await axios.delete(`${API_URL}/admin/plans/${planId}`, {
        headers: getAuthHeaders(),
      });
      fetchPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete plan');
    }
  };

  // Create sales person
  const createSalesPerson = async (userId: string, commissionRate: number = 5) => {
    try {
      await axios.post(
        `${API_URL}/admin/sales`,
        { userId, commissionRate },
        { headers: getAuthHeaders() }
      );
      fetchSalesPeople();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create sales person');
    }
  };

  // Toggle sales person status
  const toggleSalesPersonStatus = async (salesPersonId: string, currentStatus: boolean) => {
    try {
      await axios.patch(
        `${API_URL}/admin/sales/${salesPersonId}`,
        { isActive: !currentStatus },
        { headers: getAuthHeaders() }
      );
      fetchSalesPeople();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update sales person');
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.phoneNumber.includes(userSearch) ||
      user.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'SALES':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Icon name="arrow_back" className="text-slate-500" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Icon name="admin_panel_settings" className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                {t('admin.title', 'Admin Panel')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
            >
              {t('common.logout', 'Logout')}
            </button>
          </div>
        </div>
      </nav>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3 flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex gap-8">
            {(['users', 'plans', 'sales'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab === 'users' && t('admin.users', 'Users')}
                {tab === 'plans' && t('admin.plans', 'Plans')}
                {tab === 'sales' && t('admin.sales', 'Sales')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('admin.searchUsers', 'Search by phone, name, or email...')}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500"
              >
                <option value="all">{t('admin.allRoles', 'All Roles')}</option>
                <option value="USER">{t('admin.user', 'User')}</option>
                <option value="ADMIN">{t('admin.admin', 'Admin')}</option>
                <option value="SUPER_ADMIN">{t('admin.superAdmin', 'Super Admin')}</option>
                <option value="SALES">{t('admin.sales', 'Sales')}</option>
              </select>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.user', 'User')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.phone', 'Phone')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.role', 'Role')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.plan', 'Plan')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.status', 'Status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.actions', 'Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                              <Icon name="person" className="text-slate-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">
                                {user.displayName || t('admin.noName', 'No Name')}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {user.email || '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${getRoleBadgeColor(user.role)}`}
                          >
                            <option value="USER">{t('admin.user', 'User')}</option>
                            <option value="ADMIN">{t('admin.admin', 'Admin')}</option>
                            <option value="SUPER_ADMIN">{t('admin.superAdmin', 'Super Admin')}</option>
                            <option value="SALES">{t('admin.sales', 'Sales')}</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.subscriptionPlan || t('admin.free', 'Free')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {user.isActive ? t('admin.active', 'Active') : t('admin.inactive', 'Inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => user.isActive ? toggleUserStatus(user.id, user.isActive) : openApprovalModal(user)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              user.isActive
                                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                          >
                            <Icon
                              name={user.isActive ? 'block' : 'check_circle'}
                              className="w-5 h-5"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    {t('admin.noUsers', 'No users found')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div>
            {/* Add Plan Button */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => {
                  setShowPlanForm(true);
                  setEditingPlan(null);
                  setPlanForm({ name: '', description: '', price: '', durationDays: '', features: '' });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                <Icon name="add" className="w-5 h-5" />
                {t('admin.addPlan', 'Add Plan')}
              </button>
            </div>

            {/* Plan Form Modal */}
            {showPlanForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingPlan ? t('admin.editPlan', 'Edit Plan') : t('admin.createPlan', 'Create Plan')}
                  </h3>
                  <form onSubmit={handlePlanSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t('admin.planName', 'Plan Name')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={planForm.name}
                        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        placeholder="e.g., Premium Monthly"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t('admin.description', 'Description')}
                      </label>
                      <textarea
                        value={planForm.description}
                        onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t('admin.price', 'Price (BDT)')} *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={planForm.price}
                          onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t('admin.duration', 'Duration (days)')} *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={planForm.durationDays}
                          onChange={(e) => setPlanForm({ ...planForm, durationDays: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          placeholder="30"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t('admin.features', 'Features')}
                      </label>
                      <textarea
                        value={planForm.features}
                        onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        rows={3}
                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                      />
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPlanForm(false);
                          setEditingPlan(null);
                        }}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        {t('common.cancel', 'Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                      >
                        {t('common.save', 'Save')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* User Approval Modal */}
            {showApprovalModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {t('admin.approveUser', 'Approve User')}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {t('admin.approveUserDesc', 'Set subscription dates to activate this user account.')}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t('admin.subscriptionStart', 'Subscription Start Date')} *
                      </label>
                      <input
                        type="date"
                        required
                        value={approvalForm.subscriptionStartDate}
                        onChange={(e) => setApprovalForm({ ...approvalForm, subscriptionStartDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t('admin.subscriptionEnd', 'Subscription End Date')} *
                      </label>
                      <input
                        type="date"
                        required
                        value={approvalForm.subscriptionEndDate}
                        min={approvalForm.subscriptionStartDate}
                        onChange={(e) => setApprovalForm({ ...approvalForm, subscriptionEndDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowApprovalModal(false);
                          setApprovingUser(null);
                        }}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        {t('common.cancel', 'Cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={handleApprovalSubmit}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                      >
                        {t('admin.approve', 'Approve')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Plans Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden ${
                      !plan.isActive ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            plan.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {plan.isActive ? t('admin.active', 'Active') : t('admin.inactive', 'Inactive')}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                        {plan.description || t('admin.noDescription', 'No description')}
                      </p>
                      <div className="text-3xl font-bold mb-1">
                        ৳{plan.price}
                        <span className="text-sm font-normal text-slate-500">
                          /{plan.durationDays} {t('admin.days', 'days')}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            setEditingPlan(plan);
                            setPlanForm({
                              name: plan.name,
                              description: plan.description || '',
                              price: plan.price.toString(),
                              durationDays: plan.durationDays.toString(),
                              features: plan.features || '',
                            });
                            setShowPlanForm(true);
                          }}
                          className="flex-1 px-3 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer"
                        >
                          {t('common.edit', 'Edit')}
                        </button>
                        <button
                          onClick={() => togglePlanStatus(plan.id)}
                          className="flex-1 px-3 py-2 text-sm text-slate-600 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          {plan.isActive ? t('admin.deactivate', 'Deactivate') : t('admin.activate', 'Activate')}
                        </button>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                        >
                          <Icon name="delete" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {plans.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    {t('admin.noPlans', 'No plans found. Create your first plan!')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.salesPerson', 'Sales Person')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.phone', 'Phone')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.commission', 'Commission Rate')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.totalSales', 'Total Sales')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.earnings', 'Earnings')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.status', 'Status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('admin.actions', 'Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {salesPeople.map((sp) => (
                      <tr key={sp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <Icon name="person" className="text-blue-600 dark:text-blue-300" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">
                                {sp.displayName || t('admin.noName', 'No Name')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {sp.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {sp.commissionRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          ৳{sp.totalSales.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ৳{sp.totalEarnings.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              sp.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {sp.isActive ? t('admin.active', 'Active') : t('admin.inactive', 'Inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleSalesPersonStatus(sp.id, sp.isActive)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              sp.isActive
                                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                          >
                            <Icon
                              name={sp.isActive ? 'block' : 'check_circle'}
                              className="w-5 h-5"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {salesPeople.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    {t('admin.noSalesPeople', 'No sales people found')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
