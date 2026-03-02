import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Icon, StatsCard, Sidebar, UserDetailModal, LineChart, BarChart } from '../components';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import type { AdminTab } from '../components';
import {
  getDashboardStats,
  getRevenueStats,
  getUserGrowthStats,
  getSalesStats,
  type DashboardStats,
  type RevenueStats,
  type UserGrowthStats,
  type SalesStats,
} from '../api/admin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface User {
  id: string;
  phoneNumber?: string | null;
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
  phoneNumber?: string | null;
  commissionRate: number;
  totalSales: number;
  totalEarnings: number;
  isActive: boolean;
}

interface AdminPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export function AdminPage({ isDark, onToggleTheme, onLogout }: AdminPageProps) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Analytics state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [userGrowthStats, setUserGrowthStats] = useState<UserGrowthStats | null>(null);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // User detail modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    durationDays: '',
    features: '',
  });
  
  // Sales state
  const [salesPeople, setSalesPeople] = useState<SalesPerson[]>([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'plans') {
      fetchPlans();
    } else if (activeTab === 'sales') {
      fetchSalesPeople();
    }
  }, [activeTab]);

  // Filter users when search or filters change
  useEffect(() => {
    let result = users;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.email?.toLowerCase().includes(query) ||
          u.displayName?.toLowerCase().includes(query) ||
          u.phoneNumber?.includes(query)
      );
    }
    
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }
    
    if (statusFilter !== 'all') {
      result = result.filter((u) => 
        statusFilter === 'active' ? u.isActive : !u.isActive
      );
    }
    
    setFilteredUsers(result);
  }, [users, searchQuery, roleFilter, statusFilter]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [dashboard, revenue, userGrowth, sales] = await Promise.all([
        getDashboardStats(),
        getRevenueStats(30),
        getUserGrowthStats(30),
        getSalesStats(),
      ]);
      setDashboardStats(dashboard);
      setRevenueStats(revenue);
      setUserGrowthStats(userGrowth);
      setSalesStats(sales);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: getAuthHeaders(),
      });
      const data = response.data.data || response.data || [];
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

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

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.patch(
        `${API_URL}/admin/users/${userId}`,
        { isActive: !currentStatus },
        { headers: getAuthHeaders() }
      );
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      await axios.patch(
        `${API_URL}/admin/users/${userId}`,
        { role },
        { headers: getAuthHeaders() }
      );
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

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

  const openUserDetail = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserDetail(true);
  };

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

  // Dashboard View
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('admin.totalUsers', 'Total Users')}
          value={dashboardStats?.totalUsers || 0}
          change={12}
          changeLabel={t('admin.thisMonth', 'this month')}
          icon="group"
          color="primary"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.totalRevenue', 'Total Revenue')}
          value={`৳${(dashboardStats?.totalRevenue || 0).toLocaleString()}`}
          change={8}
          changeLabel={t('admin.thisMonth', 'this month')}
          icon="payments"
          color="success"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.activeSubscriptions', 'Active Subscriptions')}
          value={dashboardStats?.activeSubscriptions || 0}
          icon="card_membership"
          color="info"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.monthlyRecurring', 'MRR')}
          value={`৳${(dashboardStats?.monthlyRecurringRevenue || 0).toLocaleString()}`}
          icon="repeat"
          color="warning"
          loading={analyticsLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={userGrowthStats?.dailySignups.map(d => ({ label: d.date, value: d.count })) || []}
          title={t('admin.userGrowth', 'User Growth (30 Days)')}
          color="#f97316"
          loading={analyticsLoading}
        />
        <BarChart
          data={revenueStats?.revenueByPlan.map(p => ({ label: p.planName, value: p.revenue })) || []}
          title={t('admin.revenueByPlan', 'Revenue by Plan')}
          loading={analyticsLoading}
          yAxisFormatter={(v) => `৳${v >= 1000 ? (v/1000).toFixed(0) + 'K' : v}`}
        />
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            {t('admin.recentSignups', 'Recent Signups')}
          </h3>
          {analyticsLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardStats?.recentSignups.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  onClick={() => openUserDetail(user.id)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                      <Icon name="person" className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">
                    {format(new Date(user.createdAt), 'MMM dd')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Sales Persons */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            {t('admin.topSalesPersons', 'Top Sales Persons')}
          </h3>
          {analyticsLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {salesStats?.topSalesPersons.slice(0, 5).map((person, index) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {person.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-slate-500">{person.salesCount} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">৳{person.totalSales.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Commission: ৳{person.commission.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Users View
  const renderUsers = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('admin.searchUsers', 'Search by name, email, or phone...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-w-[150px]"
          >
            <option value="all">{t('admin.allRoles', 'All Roles')}</option>
            <option value="USER">{t('admin.user', 'User')}</option>
            <option value="ADMIN">{t('admin.admin', 'Admin')}</option>
            <option value="SUPER_ADMIN">{t('admin.superAdmin', 'Super Admin')}</option>
            <option value="SALES">{t('admin.sales', 'Sales')}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-w-[150px]"
          >
            <option value="all">{t('admin.allStatuses', 'All Statuses')}</option>
            <option value="active">{t('admin.active', 'Active')}</option>
            <option value="inactive">{t('admin.inactive', 'Inactive')}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.user', 'User')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.role', 'Role')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.status', 'Status')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.joined', 'Joined')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                        <Icon name="person" className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {user.displayName || 'No Name'}
                        </div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      disabled={user.role === 'SUPER_ADMIN' && !isSuperAdmin}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer disabled:cursor-not-allowed ${getRoleBadgeColor(user.role)}`}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="SALES">Sales</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {user.isActive ? t('admin.active', 'Active') : t('admin.inactive', 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openUserDetail(user.id)}
                        className="p-2 text-slate-500 hover:text-primary hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Icon name="visibility" className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        disabled={user.role === 'SUPER_ADMIN' && !isSuperAdmin}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                          user.isActive
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Icon name={user.isActive ? 'block' : 'check_circle'} className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-16 text-slate-500">
            <Icon name="group" className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('admin.noUsers', 'No users found')}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Plans View
  const renderPlans = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingPlan(null);
            setPlanForm({ name: '', description: '', price: '', durationDays: '', features: '' });
            setShowPlanForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-orange-500/25"
        >
          <Icon name="add" className="w-5 h-5" />
          {t('admin.addPlan', 'Add Plan')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:shadow-lg ${
              !plan.isActive ? 'opacity-60' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    plan.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {plan.isActive ? t('admin.active', 'Active') : t('admin.inactive', 'Inactive')}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                {plan.description || t('admin.noDescription', 'No description')}
              </p>
              <div className="text-3xl font-bold mb-4">
                ৳{plan.price}
                <span className="text-sm font-normal text-slate-500">
                  /{plan.durationDays} {t('admin.days', 'days')}
                </span>
              </div>
              <div className="flex gap-2">
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
                  className="flex-1 px-4 py-2 text-sm font-semibold text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                >
                  {t('common.edit', 'Edit')}
                </button>
                <button
                  onClick={() => togglePlanStatus(plan.id)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  {plan.isActive ? t('admin.deactivate', 'Deactivate') : t('admin.activate', 'Activate')}
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="px-4 py-2 text-sm font-semibold text-red-600 border-2 border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <Icon name="delete" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <div className="text-center py-16 text-slate-500">
          <Icon name="inventory_2" className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('admin.noPlans', 'No plans found')}</p>
        </div>
      )}

      {/* Plan Form Modal */}
      {showPlanForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-6">
              {editingPlan ? t('admin.editPlan', 'Edit Plan') : t('admin.createPlan', 'Create Plan')}
            </h3>
            <form onSubmit={handlePlanSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">{t('admin.planName', 'Plan Name')} *</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">{t('admin.description', 'Description')}</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('admin.price', 'Price (BDT)')} *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('admin.duration', 'Duration (days)')} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={planForm.durationDays}
                    onChange={(e) => setPlanForm({ ...planForm, durationDays: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowPlanForm(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-orange-500/25"
                >
                  {t('common.save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Sales View
  const renderSales = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.salesPerson', 'Sales Person')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.commissionRate', 'Commission Rate')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.totalSales', 'Total Sales')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.earnings', 'Earnings')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('admin.status', 'Status')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {salesPeople.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <Icon name="person" className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {person.displayName || 'No Name'}
                        </div>
                        <div className="text-sm text-slate-500">{person.phoneNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{person.commissionRate}%</td>
                  <td className="px-6 py-4 text-sm font-medium">৳{Number(person.totalSales).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">৳{Number(person.totalEarnings).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        person.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {person.isActive ? t('admin.active', 'Active') : t('admin.inactive', 'Inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {salesPeople.length === 0 && !loading && (
          <div className="text-center py-16 text-slate-500">
            <Icon name="trending_up" className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('admin.noSalesPersons', 'No sales persons found')}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Settings View
  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {t('admin.appearance', 'Appearance')}
        </h3>
        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{t('admin.darkMode', 'Dark Mode')}</p>
            <p className="text-sm text-slate-500">{t('admin.darkModeDesc', 'Toggle between light and dark theme')}</p>
          </div>
          <button
            onClick={onToggleTheme}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-primary transition-colors"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isSuperAdmin={isSuperAdmin}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {activeTab === 'dashboard' && t('admin.dashboard', 'Dashboard')}
              {activeTab === 'users' && t('admin.users', 'Users')}
              {activeTab === 'plans' && t('admin.plans', 'Plans')}
              {activeTab === 'sales' && t('admin.sales', 'Sales')}
              {activeTab === 'settings' && t('admin.settings', 'Settings')}
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleTheme}
                className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all inline-flex items-center justify-center"
              >
                <Icon name={isDark ? 'light_mode' : 'dark_mode'} className="text-slate-500" />
              </button>
              <button
                onClick={onLogout}
                className="h-10 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all inline-flex items-center justify-center"
              >
                {t('common.logout', 'Logout')}
              </button>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-3 flex items-center justify-between">
            <span className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 dark:hover:text-red-400">
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'plans' && renderPlans()}
          {activeTab === 'sales' && renderSales()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          isOpen={showUserDetail}
          onClose={() => {
            setShowUserDetail(false);
            setSelectedUserId(null);
          }}
        />
      )}
    </div>
  );
}
