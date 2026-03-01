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
  newUsersThisMonth: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  totalSalesPersons: number;
  totalPlans: number;
  recentSignups: Array<{
    id: string;
    displayName: string | null;
    email: string;
    role: string;
    createdAt: string;
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
