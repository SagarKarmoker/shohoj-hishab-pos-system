import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return { Authorization: `Bearer ${token}` };
};

// Dashboard Stats
export interface SalesDashboardStats {
  totalSales: number;
  monthlySales: number;
  commissionEarned: number;
  pendingCommission: number;
  customersCreated: number;
  activeCustomers: number;
  recentSales: Array<{
    id: string;
    date: string;
    amount: number;
    commission: number;
    customerName: string | null;
    planName: string;
  }>;
}

export const getSalesDashboardStats = async (): Promise<SalesDashboardStats> => {
  const response = await axios.get(`${API_URL}/sales/dashboard`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Performance Data
export interface SalesPerformanceData {
  dailySales: Array<{
    date: string;
    sales: number;
    commission: number;
  }>;
  monthlyComparison: {
    currentMonth: number;
    previousMonth: number;
    change: number;
  };
}

export const getSalesPerformance = async (period: number = 30): Promise<SalesPerformanceData> => {
  const response = await axios.get(`${API_URL}/sales/performance`, {
    headers: getAuthHeaders(),
    params: { period },
  });
  return response.data;
};

// Customers
export interface Customer {
  id: string;
  email: string;
  displayName: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  subscriptionPlan: string | null;
  subscriptionEndDate: string | null;
  createdAt: string;
}

export interface CustomersResponse {
  data: Customer[];
  total: number;
}

export const getMyCustomers = async (options?: {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<CustomersResponse> => {
  const response = await axios.get(`${API_URL}/sales/customers`, {
    headers: getAuthHeaders(),
    params: options,
  });
  return response.data;
};

export const createCustomer = async (data: {
  email: string;
  displayName?: string;
  phoneNumber?: string;
  planId: string;
}): Promise<Customer> => {
  const response = await axios.post(`${API_URL}/sales/customers`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
