import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getAuthHeaders() {
  const token = localStorage.getItem('jwt_token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export interface Shop {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  todaySummary: {
    totalSales: number;
    cashCollected: number;
    creditCollected: number;
    transactionCount: number;
  };
  lowStock: Array<{
    id: string;
    name: string;
    stock: number;
    minStock: number;
    unit: string;
    category: string | null;
  }>;
  recentTransactions: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    paymentMethod: string;
    createdAt: string;
    customer: { name: string } | null;
  }>;
}

export async function getShops(): Promise<Shop[]> {
  const { data } = await axios.get<Shop[]>(`${API_URL}/shops`, {
    headers: getAuthHeaders(),
  });
  return data;
}

export async function createShop(dto: { name: string; address?: string; phone?: string }): Promise<Shop> {
  const { data } = await axios.post<Shop>(`${API_URL}/shops`, dto, {
    headers: getAuthHeaders(),
  });
  return data;
}

export async function getShopDashboard(shopId: string): Promise<DashboardData> {
  const { data } = await axios.get<DashboardData>(`${API_URL}/shops/${shopId}/dashboard`, {
    headers: getAuthHeaders(),
  });
  return data;
}
