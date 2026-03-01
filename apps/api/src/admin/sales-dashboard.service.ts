import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SalesDashboardStats {
  totalSales: number;
  monthlySales: number;
  commissionEarned: number;
  pendingCommission: number;
  customersCreated: number;
  activeCustomers: number;
  recentSales: Array<{
    id: string;
    date: Date;
    amount: number;
    commission: number;
    customerName: string | null;
    planName: string;
  }>;
}

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

export interface CustomerListItem {
  id: string;
  email: string;
  displayName: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  subscriptionPlan: string | null;
  subscriptionEndDate: Date | null;
  createdAt: Date;
}

@Injectable()
export class SalesDashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get dashboard stats for a specific sales person
   */
  async getDashboardStats(salesPersonId: string): Promise<SalesDashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get sales person record
    const salesPerson = await this.prisma.salesPerson.findUnique({
      where: { id: salesPersonId },
    });

    if (!salesPerson) {
      throw new Error('Sales person not found');
    }

    // Get all sales for this sales person
    const allSales = await this.prisma.sale.findMany({
      where: { salesPersonId },
      include: {
        user: { select: { displayName: true, email: true } },
        plan: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get monthly sales
    const monthlySales = await this.prisma.sale.findMany({
      where: {
        salesPersonId,
        createdAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
    });

    // Get customers created by this sales person
    const customers = await this.prisma.user.findMany({
      where: {
        createdById: salesPerson.userId,
      },
      select: {
        id: true,
        isActive: true,
        subscriptionEndDate: true,
      },
    });

    // Calculate active customers (with valid subscription)
    const activeCustomers = customers.filter(
      (c) => c.isActive && c.subscriptionEndDate && c.subscriptionEndDate > now
    ).length;

    // Calculate stats
    const totalSales = allSales.reduce((sum, s) => sum + Number(s.saleAmount), 0);
    const monthlySalesTotal = monthlySales.reduce((sum, s) => sum + Number(s.saleAmount), 0);
    const commissionEarned = allSales.reduce((sum, s) => sum + Number(s.commissionAmount), 0);

    // Recent sales (last 5)
    const recentSales = allSales.slice(0, 5).map((sale) => ({
      id: sale.id,
      date: sale.createdAt,
      amount: Number(sale.saleAmount),
      commission: Number(sale.commissionAmount),
      customerName: sale.user?.displayName || sale.user?.email || null,
      planName: sale.plan?.name || 'Unknown',
    }));

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      monthlySales: Math.round(monthlySalesTotal * 100) / 100,
      commissionEarned: Math.round(commissionEarned * 100) / 100,
      pendingCommission: Math.round(commissionEarned * 100) / 100, // TODO: Calculate actual pending
      customersCreated: customers.length,
      activeCustomers,
      recentSales,
    };
  }

  /**
   * Get performance data for charts
   */
  async getPerformanceData(
    salesPersonId: string,
    periodDays: number = 30
  ): Promise<SalesPerformanceData> {
    const now = new Date();
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Get sales for the period
    const periodSales = await this.prisma.sale.findMany({
      where: {
        salesPersonId,
        createdAt: {
          gte: periodStart,
        },
      },
      select: {
        saleAmount: true,
        commissionAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Build daily sales map
    const dailySalesMap = new Map<string, { sales: number; commission: number }>();
    
    // Initialize all days with 0
    for (let i = 0; i < periodDays; i++) {
      const date = new Date(periodStart.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailySalesMap.set(dateStr, { sales: 0, commission: 0 });
    }

    // Fill in actual sales
    for (const sale of periodSales) {
      const dateStr = sale.createdAt.toISOString().split('T')[0];
      const existing = dailySalesMap.get(dateStr) || { sales: 0, commission: 0 };
      existing.sales += Number(sale.saleAmount);
      existing.commission += Number(sale.commissionAmount);
      dailySalesMap.set(dateStr, existing);
    }

    const dailySales = Array.from(dailySalesMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        sales: Math.round(data.sales * 100) / 100,
        commission: Math.round(data.commission * 100) / 100,
      }));

    // Calculate monthly comparison
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [currentMonthSales, previousMonthSales] = await Promise.all([
      this.prisma.sale.aggregate({
        where: {
          salesPersonId,
          createdAt: { gte: currentMonthStart },
        },
        _sum: { saleAmount: true },
      }),
      this.prisma.sale.aggregate({
        where: {
          salesPersonId,
          createdAt: {
            gte: previousMonthStart,
            lt: currentMonthStart,
          },
        },
        _sum: { saleAmount: true },
      }),
    ]);

    const currentMonth = Number(currentMonthSales._sum.saleAmount) || 0;
    const previousMonth = Number(previousMonthSales._sum.saleAmount) || 0;
    const change = previousMonth > 0
      ? Math.round(((currentMonth - previousMonth) / previousMonth) * 100)
      : 0;

    return {
      dailySales,
      monthlyComparison: {
        currentMonth: Math.round(currentMonth * 100) / 100,
        previousMonth: Math.round(previousMonth * 100) / 100,
        change,
      },
    };
  }

  /**
   * Get customers created by this sales person
   */
  async getMyCustomers(
    salesPersonUserId: string,
    options: {
      search?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: CustomerListItem[]; total: number }> {
    const { search, isActive, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      createdById: salesPersonUserId,
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [customers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          displayName: true,
          phoneNumber: true,
          isActive: true,
          subscriptionPlan: true,
          subscriptionEndDate: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: customers, total };
  }

  /**
   * Create a new user as a sales person
   */
  async createCustomer(
    salesPersonUserId: string,
    data: {
      email: string;
      displayName?: string;
      phoneNumber?: string;
      planId: string;
    }
  ): Promise<CustomerListItem> {
    const { email, displayName, phoneNumber, planId } = data;

    // Get the plan to calculate commission
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Get sales person record for commission rate
    const salesPerson = await this.prisma.salesPerson.findUnique({
      where: { userId: salesPersonUserId },
    });

    if (!salesPerson) {
      throw new Error('Sales person not found');
    }

    // Calculate commission
    const commissionRate = Number(salesPerson.commissionRate);
    const saleAmount = Number(plan.price);
    const commissionAmount = (saleAmount * commissionRate) / 100;

    // Create user and sale in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          email,
          displayName,
          phoneNumber,
          password: '', // Will be set via password reset
          role: 'USER',
          isActive: true,
          createdById: salesPersonUserId,
          subscriptionPlanId: planId,
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          phoneNumber: true,
          isActive: true,
          subscriptionPlan: true,
          subscriptionEndDate: true,
          createdAt: true,
        },
      });

      // Create the sale record
      await tx.sale.create({
        data: {
          salesPersonId: salesPerson.id,
          userId: user.id,
          planId,
          saleAmount,
          commissionAmount,
        },
      });

      // Update sales person totals
      await tx.salesPerson.update({
        where: { id: salesPerson.id },
        data: {
          totalSales: { increment: saleAmount },
          totalEarnings: { increment: commissionAmount },
        },
      });

      return user;
    });

    return result;
  }
}
