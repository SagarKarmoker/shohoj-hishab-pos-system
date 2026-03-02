import { UserRole } from '@prisma/client';

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  role: UserRole.USER,
  emailVerified: true,
  isActive: true,
};

export const mockAdmin = {
  id: 'admin-123',
  email: 'admin@example.com',
  displayName: 'Admin User',
  role: UserRole.ADMIN,
  emailVerified: true,
  isActive: true,
};

export const mockSuperAdmin = {
  id: 'superadmin-123',
  email: 'superadmin@example.com',
  displayName: 'Super Admin',
  role: UserRole.SUPER_ADMIN,
  emailVerified: true,
  isActive: true,
};

export const mockSalesPerson = {
  id: 'sales-123',
  email: 'sales@example.com',
  displayName: 'Sales Person',
  role: UserRole.SALES,
  emailVerified: true,
  isActive: true,
  salesPersonId: 'sales-person-123',
};

export const mockShop = {
  id: 'shop-123',
  name: 'Test Shop',
  address: 'Test Address',
  phone: '+8801712345678',
  ownerId: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockProduct = {
  id: 'product-123',
  name: 'Test Product',
  code: 'PROD001',
  description: 'Test Description',
  category: 'Test Category',
  unit: 'piece',
  price: 100,
  costPrice: 80,
  stock: 50,
  minStock: 10,
  shopId: 'shop-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockCustomer = {
  id: 'customer-123',
  name: 'Test Customer',
  phone: '+8801712345679',
  email: 'customer@example.com',
  address: 'Customer Address',
  shopId: 'shop-123',
  totalDue: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockTransaction = {
  id: 'transaction-123',
  shopId: 'shop-123',
  customerId: 'customer-123',
  totalAmount: 500,
  discount: 0,
  paidAmount: 500,
  paymentMethod: 'cash',
  notes: 'Test transaction',
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
};

export const mockSubscriptionPlan = {
  id: 'plan-123',
  name: 'Basic Plan',
  description: 'Basic subscription',
  price: 1000,
  durationDays: 30,
  features: ['feature1', 'feature2'],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockSalesPersonRecord = {
  id: 'sales-person-123',
  userId: 'sales-123',
  commissionRate: 10,
  isActive: true,
  totalSales: 5,
  totalCommission: 500,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const createMockRequest = (user: any) => ({
  user,
  headers: {},
  body: {},
  params: {},
  query: {},
});
