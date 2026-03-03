import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return { Authorization: `Bearer ${token}` };
};

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalSalesPersons: number;
  totalPlans: number;
  recentSignups: Array<{
    id: string;
    displayName: string | null;
    email: string;
    role: string;
    createdAt: string;
  }>;
  revenueTrend: Array<{
    date: string;
    revenue: number;
  }>;
  userTrend: Array<{
    date: string;
    users: number;
  }>;
  recentLogins: Array<{
    id: string;
    userId: string;
    email: string;
    createdAt: string;
  }>;
  subscriptionExpiry: Array<{
    daysUntilExpiry: number;
    count: number;
  }>;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get(`${API_URL}/admin/analytics/dashboard`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Revenue Stats
export interface RevenueStats {
  totalRevenue: number;
  periodRevenue: number;
  revenueByPlan: Array<{
    planName: string;
    revenue: number;
    count: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
  }>;
}

export const getRevenueStats = async (period: number = 30): Promise<RevenueStats> => {
  const response = await axios.get(`${API_URL}/admin/analytics/revenue`, {
    headers: getAuthHeaders(),
    params: { period },
  });
  return response.data;
};

// User Growth Stats
export interface UserGrowthStats {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  dailySignups: Array<{
    date: string;
    count: number;
  }>;
}

export const getUserGrowthStats = async (period: number = 30): Promise<UserGrowthStats> => {
  const response = await axios.get(`${API_URL}/admin/analytics/users`, {
    headers: getAuthHeaders(),
    params: { period },
  });
  return response.data;
};

// Sales Stats
export interface SalesStats {
  totalSales: number;
  totalCommission: number;
  topSalesPersons: Array<{
    id: string;
    name: string | null;
    totalSales: number;
    commission: number;
    salesCount: number;
  }>;
  monthlySales: Array<{
    month: string;
    sales: number;
    commission: number;
  }>;
}

export const getSalesStats = async (): Promise<SalesStats> => {
  const response = await axios.get(`${API_URL}/admin/analytics/sales`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// User Details
export interface UserDetails {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    phoneNumber: string | null;
    role: string;
    isActive: boolean;
    subscriptionPlan: string | null;
    subscriptionStartDate: string | null;
    subscriptionEndDate: string | null;
    createdAt: string;
    updatedAt: string;
  };
  plan: {
    id: string;
    name: string;
    price: number;
    durationDays: number;
  } | null;
  shops: Array<{
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    paymentMethod: string;
    createdAt: string;
    customer: {
      id: string;
      name: string;
      phone: string | null;
    } | null;
  }>;
  subscriptionHistory: Array<{
    planName: string;
    startDate: string;
    endDate: string;
    amount: number;
  }>;
  loginHistory: Array<{
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    success: boolean;
    failureReason: string | null;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    createdAt: string;
  }>;
}

export const getUserDetails = async (userId: string): Promise<UserDetails> => {
  const response = await axios.get(`${API_URL}/admin/analytics/users/${userId}/details`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Bulk User Actions
export interface BulkUserActionResult {
  message: string;
  total: number;
  successCount: number;
  failedCount: number;
  results: {
    success: string[];
    failed: Array<{ id: string; reason: string }>;
  };
}

export const bulkUserAction = async (
  userIds: string[],
  action: 'activate' | 'deactivate' | 'delete'
): Promise<BulkUserActionResult> => {
  const response = await axios.post<BulkUserActionResult>(
    `${API_URL}/admin/users/bulk-action`,
    { userIds, action },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Create Admin
export interface CreateAdminResult {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
}

export const createAdmin = async (
  userId: string,
  role: 'ADMIN' | 'SUPER_ADMIN'
): Promise<CreateAdminResult> => {
  const response = await axios.post<CreateAdminResult>(
    `${API_URL}/admin/admins`,
    { userId, role },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Sales Person
export interface SalesPerson {
  id: string;
  userId: string;
  displayName: string | null;
  phoneNumber: string | null;
  email: string;
  commissionRate: number;
  totalSales: number;
  totalEarnings: number;
  isActive: boolean;
}

export const addSalesPerson = async (
  userId: string,
  commissionRate?: number
): Promise<SalesPerson> => {
  const response = await axios.post<SalesPerson>(
    `${API_URL}/admin/sales`,
    { userId, commissionRate },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Audit Logs
export interface AuditLog {
  id: string;
  userId: string;
  user: {
    id: string;
    displayName: string | null;
    email: string;
    phoneNumber: string | null;
  } | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getAuditLogs = async (params: {
  page?: number;
  limit?: number;
  action?: string;
  userId?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AuditLogsResponse> => {
  const response = await axios.get(`${API_URL}/admin/audit-logs`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

export const exportAuditLogs = async (params: {
  action?: string;
  userId?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ csv: string; count: number }> => {
  const response = await axios.get(`${API_URL}/admin/audit-logs/export`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

// Announcements
export interface Announcement {
  id: string;
  title: string;
  message: string;
  targetRoles: string;
  isActive: boolean;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const response = await axios.get(`${API_URL}/admin/announcements`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createAnnouncement = async (data: {
  title: string;
  message: string;
  targetRoles?: 'ALL' | 'USER' | 'ADMIN' | 'SALES';
  isActive?: boolean;
  scheduledAt?: string;
}): Promise<Announcement> => {
  const response = await axios.post(`${API_URL}/admin/announcements`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateAnnouncement = async (
  id: string,
  data: Partial<{
    title: string;
    message: string;
    targetRoles: 'ALL' | 'USER' | 'ADMIN' | 'SALES';
    isActive: boolean;
    scheduledAt: string;
  }>
): Promise<Announcement> => {
  const response = await axios.patch(`${API_URL}/admin/announcements/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/admin/announcements/${id}`, {
    headers: getAuthHeaders(),
  });
};

// Platform Settings
export interface PlatformSettings {
  id: string;
  platformName: string;
  platformEmail: string | null;
  supportPhone: string | null;
  defaultCommissionRate: number;
  featureFlags: Record<string, boolean>;
  maintenanceMode: boolean;
}

export const getPlatformSettings = async (): Promise<PlatformSettings> => {
  const response = await axios.get(`${API_URL}/admin/settings`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updatePlatformSettings = async (data: Partial<{
  platformName: string;
  platformEmail: string;
  supportPhone: string;
  defaultCommissionRate: number;
  featureFlags: string;
  maintenanceMode: boolean;
}>): Promise<PlatformSettings> => {
  const response = await axios.patch(`${API_URL}/admin/settings`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const triggerBackup = async (): Promise<{ message: string; backupId: string; timestamp: string }> => {
  const response = await axios.post(`${API_URL}/admin/settings/backup`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const clearCache = async (): Promise<{ message: string; clearedAt: string }> => {
  const response = await axios.post(`${API_URL}/admin/settings/cache/clear`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
