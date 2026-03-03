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
  bulkUserAction,
  createAdmin,
  getAuditLogs,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getPlatformSettings,
  updatePlatformSettings,
  triggerBackup,
  clearCache,
  type DashboardStats,
  type RevenueStats,
  type UserGrowthStats,
  type SalesStats,
  type AuditLog,
  type Announcement,
  type PlatformSettings,
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
  const isSales = currentUser?.role === 'SALES';
  
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
  
  // Bulk selection state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Add Admin modal state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [addAdminForm, setAddAdminForm] = useState({ userId: '', role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN' });
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  
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

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLogsMeta, setAuditLogsMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditLogFilters, setAuditLogFilters] = useState({
    action: '',
    userId: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    targetRoles: 'ALL' as 'ALL' | 'USER' | 'ADMIN' | 'SALES',
    isActive: true,
  });

  // Settings state
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);

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
    } else if (activeTab === 'audit-logs') {
      fetchAuditLogs();
    } else if (activeTab === 'announcements') {
      fetchAnnouncements();
    } else if (activeTab === 'settings') {
      fetchPlatformSettings();
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
      setSelectedUsers(new Set());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.size === 0) return;
    
    const confirmMsg = action === 'delete' 
      ? `Are you sure you want to delete ${selectedUsers.size} user(s)? This cannot be undone.`
      : `Are you sure you want to ${action} ${selectedUsers.size} user(s)?`;
    
    if (!window.confirm(confirmMsg)) return;
    
    setBulkActionLoading(true);
    try {
      const result = await bulkUserAction(Array.from(selectedUsers), action);
      alert(`${result.successCount} users ${action}d successfully${result.failedCount > 0 ? `. ${result.failedCount} failed.` : '.'}`);
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Bulk action failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAdminForm.userId) return;
    
    setAddAdminLoading(true);
    try {
      await createAdmin(addAdminForm.userId, addAdminForm.role);
      setShowAddAdminModal(false);
      setAddAdminForm({ userId: '', role: 'ADMIN' });
      fetchUsers();
      alert('Admin created successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setAddAdminLoading(false);
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

  const fetchAuditLogs = async (page: number = 1) => {
    setAuditLogsLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (auditLogFilters.action) params.action = auditLogFilters.action;
      if (auditLogFilters.userId) params.userId = auditLogFilters.userId;
      if (auditLogFilters.entityType) params.entityType = auditLogFilters.entityType;
      if (auditLogFilters.startDate) params.startDate = auditLogFilters.startDate;
      if (auditLogFilters.endDate) params.endDate = auditLogFilters.endDate;
      
      const response = await getAuditLogs(params);
      setAuditLogs(response.data);
      setAuditLogsMeta(response.meta);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setAuditLogsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const response = await getAnnouncements();
      setAnnouncements(response);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch announcements');
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, announcementForm);
      } else {
        await createAnnouncement(announcementForm);
      }
      setShowAnnouncementForm(false);
      setEditingAnnouncement(null);
      setAnnouncementForm({ title: '', message: '', targetRoles: 'ALL', isActive: true });
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const fetchPlatformSettings = async () => {
    try {
      const response = await getPlatformSettings();
      setPlatformSettings(response);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch settings');
    }
  };

  const handleSettingsSave = async () => {
    if (!platformSettings) return;
    try {
      await updatePlatformSettings({
        platformName: platformSettings.platformName,
        platformEmail: platformSettings.platformEmail || undefined,
        supportPhone: platformSettings.supportPhone || undefined,
        defaultCommissionRate: platformSettings.defaultCommissionRate,
        maintenanceMode: platformSettings.maintenanceMode,
      });
      alert('Settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    }
  };

  const handleTriggerBackup = async () => {
    try {
      const result = await triggerBackup();
      alert(result.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to trigger backup');
    }
  };

  const handleClearCache = async () => {
    try {
      const result = await clearCache();
      alert(result.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clear cache');
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
      {/* Stats Cards Row - 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title={t('admin.totalUsers', 'Total Users')}
          value={dashboardStats?.totalUsers || 0}
          icon="group"
          color="primary"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.activeUsers', 'Active Users')}
          value={dashboardStats?.activeUsers || 0}
          icon="check_circle"
          color="success"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.newUsers', 'New This Month')}
          value={dashboardStats?.newUsersThisMonth || 0}
          icon="person_add"
          color="info"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.totalRevenue', 'Total Revenue')}
          value={`৳${(dashboardStats?.totalRevenue || 0).toLocaleString()}`}
          icon="payments"
          color="success"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.activeSubscriptions', 'Active Subscriptions')}
          value={dashboardStats?.activeSubscriptions || 0}
          icon="card_membership"
          color="warning"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.monthlyRecurring', 'MRR')}
          value={`৳${(dashboardStats?.monthlyRecurringRevenue || 0).toLocaleString()}`}
          icon="repeat"
          color="danger"
          loading={analyticsLoading}
        />
      </div>

      {/* Second Row - More Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('admin.inactiveUsers', 'Inactive Users')}
          value={dashboardStats?.inactiveUsers || 0}
          icon="cancel"
          color="info"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.expiredSubscriptions', 'Expired')}
          value={dashboardStats?.expiredSubscriptions || 0}
          icon="warning"
          color="danger"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.salesPersons', 'Sales Persons')}
          value={dashboardStats?.totalSalesPersons || 0}
          icon="store"
          color="info"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.totalPlans', 'Plans')}
          value={dashboardStats?.totalPlans || 0}
          icon="list"
          color="primary"
          loading={analyticsLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={dashboardStats?.userTrend.map(d => ({ label: d.date, value: d.users })) || []}
          title={t('admin.userTrend', 'User Signups (7 Days)')}
          color="#f97316"
          loading={analyticsLoading}
        />
        <LineChart
          data={dashboardStats?.revenueTrend.map(d => ({ label: d.date, value: d.revenue })) || []}
          title={t('admin.revenueTrend', 'Revenue (7 Days)')}
          color="#22c55e"
          loading={analyticsLoading}
          yAxisFormatter={(v) => `৳${v >= 1000 ? (v/1000).toFixed(0) + 'K' : v}`}
        />
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={(revenueStats?.revenueByPlan || []).map(p => ({ label: p.planName, value: p.revenue }))}
          title={t('admin.revenueByPlan', 'Revenue by Plan')}
          loading={analyticsLoading}
          yAxisFormatter={(v) => `৳${v >= 1000 ? (v/1000).toFixed(0) + 'K' : v}`}
        />
        <LineChart
          data={(userGrowthStats?.dailySignups || []).map(d => ({ label: d.date, value: d.count }))}
          title={t('admin.userGrowth', 'User Growth (30 Days)')}
          color="#f97316"
          loading={analyticsLoading}
        />
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          ) : dashboardStats?.recentSignups.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No recent signups</p>
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

        {/* Recent Logins */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            {t('admin.recentLogins', 'Recent Logins')}
          </h3>
          {analyticsLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded"></div>
              ))}
            </div>
          ) : dashboardStats?.recentLogins.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No recent logins</p>
          ) : (
            <div className="space-y-3">
              {dashboardStats?.recentLogins.slice(0, 5).map((login) => (
                <div
                  key={login.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{login.email}</p>
                    <p className="text-xs text-slate-400">{format(new Date(login.createdAt), 'MMM dd, HH:mm')}</p>
                  </div>
                  <Icon name="login" className="text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscription Expiry Alerts */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            {t('admin.expiryAlerts', 'Subscription Expiry')}
          </h3>
          {analyticsLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardStats?.subscriptionExpiry?.map((item) => (
                <div
                  key={item.daysUntilExpiry}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    item.daysUntilExpiry <= 7 
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      name="warning" 
                      className={item.daysUntilExpiry <= 7 ? 'text-red-600' : 'text-yellow-600'} 
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {item.daysUntilExpiry <= 7 ? 'Expiring in 7 days' : 'Expiring in 30 days'}
                      </p>
                      <p className="text-sm text-slate-500">{item.count} subscriptions</p>
                    </div>
                  </div>
                  <span className={`font-bold ${item.daysUntilExpiry <= 7 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {item.count}
                  </span>
                </div>
              ))}
              {(!dashboardStats?.subscriptionExpiry || dashboardStats.subscriptionExpiry.every(s => s.count === 0)) && (
                <p className="text-slate-500 text-center py-4">No expiring subscriptions</p>
              )}
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
          {isSuperAdmin && (
            <button
              onClick={() => setShowAddAdminModal(true)}
              className="px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium flex items-center gap-2 transition-all"
            >
              <Icon name="person_add" className="w-5 h-5" />
              Add Admin
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-primary dark:text-primary-200">
            {selectedUsers.size} user(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              disabled={bulkActionLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <Icon name="check_circle" className="text-lg" />
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              disabled={bulkActionLoading}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <Icon name="cancel" className="text-lg" />
              Deactivate
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={bulkActionLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <Icon name="delete" className="text-lg" />
              Delete
            </button>
          </div>
        </div>
      )}

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
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                    onChange={toggleAllUsers}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </th>
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
                <tr key={user.id} className={`hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors ${selectedUsers.has(user.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                  </td>
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

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100">
              Add Admin
            </h3>
            <form onSubmit={handleCreateAdmin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Select User</label>
                <select
                  value={addAdminForm.userId}
                  onChange={(e) => setAddAdminForm({ ...addAdminForm, userId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  required
                >
                  <option value="">Select a user...</option>
                  {users.filter(u => u.role === 'USER').map(user => (
                    <option key={user.id} value={user.id}>
                      {user.displayName || user.email} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Role</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={addAdminForm.role === 'ADMIN'}
                      onChange={() => setAddAdminForm({ ...addAdminForm, role: 'ADMIN' })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-slate-700 dark:text-slate-300">Admin</span>
                  </label>
                  {isSuperAdmin && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="SUPER_ADMIN"
                        checked={addAdminForm.role === 'SUPER_ADMIN'}
                        onChange={() => setAddAdminForm({ ...addAdminForm, role: 'SUPER_ADMIN' })}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-slate-700 dark:text-slate-300">Super Admin</span>
                    </label>
                  )}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAdminModal(false);
                    setAddAdminForm({ userId: '', role: 'ADMIN' });
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!addAdminForm.userId || addAdminLoading}
                  className="px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addAdminLoading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

      {isSuperAdmin && platformSettings && (
        <>
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Platform Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Platform Name</label>
                <input
                  type="text"
                  value={platformSettings.platformName}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Support Email</label>
                <input
                  type="email"
                  value={platformSettings.platformEmail || ''}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, platformEmail: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Support Phone</label>
                <input
                  type="text"
                  value={platformSettings.supportPhone || ''}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, supportPhone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Default Commission Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={platformSettings.defaultCommissionRate}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, defaultCommissionRate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
              <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Maintenance Mode</p>
                  <p className="text-sm text-slate-500">Disable access to all users</p>
                </div>
                <button
                  onClick={() => setPlatformSettings({ ...platformSettings, maintenanceMode: !platformSettings.maintenanceMode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${platformSettings.maintenanceMode ? 'bg-red-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${platformSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <button
                onClick={handleSettingsSave}
                className="w-full px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Maintenance
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleTriggerBackup}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon name="backup" className="text-slate-500" />
                  <span>Trigger Database Backup</span>
                </div>
                <Icon name="chevron_right" className="text-slate-400" />
              </button>
              <button
                onClick={handleClearCache}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon name="cached" className="text-slate-500" />
                  <span>Clear Cache</span>
                </div>
                <Icon name="chevron_right" className="text-slate-400" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Revenue View
  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('admin.totalRevenue', 'Total Revenue')}
          value={`৳${(revenueStats?.totalRevenue || 0).toLocaleString()}`}
          icon="payments"
          color="success"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.periodRevenue', 'Period Revenue')}
          value={`৳${(revenueStats?.periodRevenue || 0).toLocaleString()}`}
          icon="trending_up"
          color="primary"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.totalSales', 'Total Sales')}
          value={salesStats?.totalSales?.toString() || '0'}
          icon="shopping_cart"
          color="info"
          loading={analyticsLoading}
        />
        <StatsCard
          title={t('admin.commission', 'Commission')}
          value={`৳${(salesStats?.totalCommission || 0).toLocaleString()}`}
          icon="account_balance_wallet"
          color="warning"
          loading={analyticsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <BarChart
            title="Revenue by Plan"
            data={(revenueStats?.revenueByPlan || []).map(p => ({ label: p.planName, value: p.revenue }))}
            loading={analyticsLoading}
            yAxisFormatter={(v) => `৳${v >= 1000 ? (v/1000).toFixed(0) + 'K' : v}`}
          />
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <LineChart
            title="Daily Revenue"
            data={(revenueStats?.dailyRevenue || []).map(d => ({ label: d.date, value: d.revenue }))}
            color="#22c55e"
            loading={analyticsLoading}
            yAxisFormatter={(v) => `৳${v >= 1000 ? (v/1000).toFixed(0) + 'K' : v}`}
          />
        </div>
      </div>
    </div>
  );

  // Audit Logs View
  const renderAuditLogs = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={auditLogFilters.action}
            onChange={(e) => setAuditLogFilters({ ...auditLogFilters, action: e.target.value })}
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-w-[150px]"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
          </select>
          <input
            type="text"
            placeholder="Filter by entity type..."
            value={auditLogFilters.entityType}
            onChange={(e) => setAuditLogFilters({ ...auditLogFilters, entityType: e.target.value })}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
          <input
            type="date"
            value={auditLogFilters.startDate}
            onChange={(e) => setAuditLogFilters({ ...auditLogFilters, startDate: e.target.value })}
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
          <input
            type="date"
            value={auditLogFilters.endDate}
            onChange={(e) => setAuditLogFilters({ ...auditLogFilters, endDate: e.target.value })}
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
          <button
            onClick={() => fetchAuditLogs(1)}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all"
          >
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {auditLogsLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      log.action === 'CREATE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {log.entityType}
                    {log.entityId && <span className="text-slate-400 ml-1">#{log.entityId.slice(0, 8)}</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {log.user?.displayName || log.user?.email || 'System'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {log.ipAddress || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {auditLogs.length === 0 && !auditLogsLoading && (
          <div className="text-center py-16 text-slate-500">
            <Icon name="history" className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No audit logs found</p>
          </div>
        )}
      </div>

      {auditLogsMeta && auditLogsMeta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: auditLogsMeta.totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => fetchAuditLogs(page)}
              className={`px-4 py-2 rounded-lg ${page === auditLogsMeta.page ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Announcements View
  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingAnnouncement(null);
            setAnnouncementForm({ title: '', message: '', targetRoles: 'ALL', isActive: true });
            setShowAnnouncementForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-orange-500/25"
        >
          <Icon name="add" className="w-5 h-5" />
          Create Announcement
        </button>
      </div>

      <div className="grid gap-4">
        {announcementsLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Icon name="campaign" className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No announcements found</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 ${!announcement.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Target: {announcement.targetRoles} | Created: {format(new Date(announcement.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    announcement.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {announcement.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">{announcement.message}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingAnnouncement(announcement);
                    setAnnouncementForm({
                      title: announcement.title,
                      message: announcement.message,
                      targetRoles: announcement.targetRoles as any,
                      isActive: announcement.isActive,
                    });
                    setShowAnnouncementForm(true);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="px-4 py-2 text-sm font-semibold text-red-600 border-2 border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAnnouncementForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-6">
              {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
            </h3>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Message *</label>
                <textarea
                  required
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Target Roles</label>
                <select
                  value={announcementForm.targetRoles}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, targetRoles: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                >
                  <option value="ALL">All Users</option>
                  <option value="USER">Regular Users</option>
                  <option value="ADMIN">Admins</option>
                  <option value="SALES">Sales Team</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={announcementForm.isActive}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-semibold">Active</label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementForm(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-orange-500/25"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isSuperAdmin={isSuperAdmin}
        isSales={isSales}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 flex items-center px-6">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {activeTab === 'dashboard' && t('admin.dashboard', 'Dashboard')}
              {activeTab === 'users' && t('admin.users', 'Users')}
              {activeTab === 'plans' && t('admin.plans', 'Plans')}
              {activeTab === 'sales' && t('admin.sales', 'Sales')}
              {activeTab === 'revenue' && t('admin.revenue', 'Revenue')}
              {activeTab === 'audit-logs' && t('admin.auditLogs', 'Audit Logs')}
              {activeTab === 'announcements' && t('admin.announcements', 'Announcements')}
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
          {activeTab === 'revenue' && renderRevenue()}
          {activeTab === 'audit-logs' && renderAuditLogs()}
          {activeTab === 'announcements' && renderAnnouncements()}
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
