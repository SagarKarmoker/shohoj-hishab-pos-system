import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getAuthHeaders() {
  const token = localStorage.getItem('jwt_token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  dueBalance: number;
  shopId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  transactions?: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    createdAt: string;
  }>;
}

export interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  customerId: string;
  customer?: { name: string };
  notes?: string | null;
  receivedBy?: { displayName: string | null };
  transactions?: Array<{ id: string; invoiceNumber: string }>;
  createdAt: string;
}

export async function getCustomers(shopId: string): Promise<Customer[]> {
  const { data } = await axios.get<Customer[]>(`${API_URL}/shops/${shopId}/customers`, {
    headers: getAuthHeaders(),
  });
  return data.map((c) => ({
    ...c,
    dueBalance: Number(c.dueBalance),
    transactions: c.transactions?.map((t) => ({
      ...t,
      totalAmount: Number(t.totalAmount),
      paidAmount: Number(t.paidAmount),
      dueAmount: Number(t.dueAmount),
    })),
  }));
}

export async function createCustomer(
  shopId: string,
  dto: { name: string; phone?: string; email?: string; address?: string },
): Promise<Customer> {
  const { data } = await axios.post<Customer>(`${API_URL}/shops/${shopId}/customers`, dto, {
    headers: getAuthHeaders(),
  });
  return { ...data, dueBalance: Number(data.dueBalance) };
}

export async function collectPayment(
  shopId: string,
  customerId: string,
  amount: number,
  paymentMethod?: string,
  transactionIds?: string[],
  notes?: string,
): Promise<Payment> {
  const { data } = await axios.post<Payment>(
    `${API_URL}/shops/${shopId}/customers/${customerId}/collect`,
    { amount, paymentMethod, transactionIds, notes },
    { headers: getAuthHeaders() },
  );
  return {
    ...data,
    amount: Number(data.amount),
  };
}

export async function getPaymentHistory(shopId: string, customerId: string): Promise<Payment[]> {
  const { data } = await axios.get<Payment[]>(
    `${API_URL}/shops/${shopId}/customers/${customerId}/payments`,
    { headers: getAuthHeaders() },
  );
  return data.map((p) => ({
    ...p,
    amount: Number(p.amount),
  }));
}
