import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getAuthHeaders() {
  const token = localStorage.getItem('jwt_token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export interface Product {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  category?: string | null;
  unit: string;
  price: number;
  costPrice?: number | null;
  stock: number;
  minStock: number;
  shopId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getProducts(shopId: string): Promise<Product[]> {
  const { data } = await axios.get<Product[]>(`${API_URL}/shops/${shopId}/products`, {
    headers: getAuthHeaders(),
  });
  return data.map((p) => ({
    ...p,
    price: Number(p.price),
    costPrice: p.costPrice != null ? Number(p.costPrice) : null,
  }));
}

export async function createProduct(
  shopId: string,
  dto: {
    name: string;
    code?: string;
    description?: string;
    category?: string;
    unit?: string;
    price: number;
    costPrice?: number;
    stock?: number;
    minStock?: number;
  },
): Promise<Product> {
  const { data } = await axios.post<Product>(`${API_URL}/shops/${shopId}/products`, dto, {
    headers: getAuthHeaders(),
  });
  return {
    ...data,
    price: Number(data.price),
    costPrice: data.costPrice != null ? Number(data.costPrice) : null,
  };
}

export async function updateProduct(
  shopId: string,
  productId: string,
  dto: Partial<{
    name: string;
    code: string;
    description: string;
    category: string;
    unit: string;
    price: number;
    costPrice: number;
    stock: number;
    minStock: number;
  }>,
): Promise<Product> {
  const { data } = await axios.patch<Product>(
    `${API_URL}/shops/${shopId}/products/${productId}`,
    dto,
    { headers: getAuthHeaders() },
  );
  return {
    ...data,
    price: Number(data.price),
    costPrice: data.costPrice != null ? Number(data.costPrice) : null,
  };
}
