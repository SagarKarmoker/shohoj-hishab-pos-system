import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getAuthHeaders() {
  const token = localStorage.getItem('jwt_token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export interface TransactionItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateTransactionInput {
  items: TransactionItemInput[];
  paymentMethod?: string;
  discount?: number;
  paidAmount?: number;
  customerId?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  discount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  createdAt: string;
}

export interface TransactionWithCustomer extends Transaction {
  customer?: { name: string } | null;
}

export async function getTransactions(
  shopId: string,
  params?: { dateFrom?: string; dateTo?: string; customerId?: string },
): Promise<TransactionWithCustomer[]> {
  const searchParams = new URLSearchParams();
  if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
  if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
  if (params?.customerId) searchParams.set('customerId', params.customerId);
  const url = `${API_URL}/shops/${shopId}/transactions${searchParams.toString() ? `?${searchParams}` : ''}`;
  const { data } = await axios.get<TransactionWithCustomer[]>(url, {
    headers: getAuthHeaders(),
  });
  return data.map((t) => ({
    ...t,
    totalAmount: Number(t.totalAmount),
    discount: Number(t.discount),
    paidAmount: Number(t.paidAmount),
    dueAmount: Number(t.dueAmount),
  }));
}

export async function createTransaction(shopId: string, input: CreateTransactionInput): Promise<Transaction> {
  const { data } = await axios.post(
    `${API_URL}/shops/${shopId}/transactions`,
    {
      items: input.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      paymentMethod: input.paymentMethod ?? 'cash',
      discount: input.discount ?? 0,
      paidAmount: input.paidAmount,
      customerId: input.customerId,
      notes: input.notes,
    },
    { headers: getAuthHeaders() },
  );
  return {
    ...data,
    totalAmount: Number(data.totalAmount),
    discount: Number(data.discount),
    paidAmount: Number(data.paidAmount),
    dueAmount: Number(data.dueAmount),
  };
}
