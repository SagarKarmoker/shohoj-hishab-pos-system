import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    createdAt: Date;
  }>;
}

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

export interface UserGrowthStats {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  dailySignups: Array<{
    date: string;
    count: number;
  }>;
}

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

@Injectable()
export class AdminAnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get dashboard overview statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalRevenue,
      activeSubscriptions,
      totalSalesPersons,
      totalPlans,
      recentSignups,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.getTotalRevenue(),
      this.prisma.user.count({
        where: {
          isActive: true,
          subscriptionEndDate: { gte: now },
        },
      }),
      this.prisma.salesPerson.count({ where: { isActive: true } }),
      this.prisma.subscriptionPlan.count({ where: { isActive: true } }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate MRR (Monthly Recurring Revenue)
    const activePlans = await this.prisma.user.groupBy({
      by: ['subscriptionPlanId'],
      where: {
        isActive: true,
        subscriptionEndDate: { gte: now },
        subscriptionPlanId: { not: null },
      },
      _count: { subscriptionPlanId: true },
    });

    let monthlyRecurringRevenue = 0;
    for (const group of activePlans) {
      if (group.subscriptionPlanId) {
        const plan = await this.prisma.subscriptionPlan.findUnique({
          where: { id: group.subscriptionPlanId },
        });
        if (plan) {
          const monthlyPrice = Number(plan.price) * (30 / plan.durationDays);
          monthlyRecurringRevenue += monthlyPrice * group._count.subscriptionPlanId;
        }
      }
    }

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalRevenue,
      monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue * 100) / 100,
      activeSubscriptions,
      totalSalesPersons,
      totalPlans,
      recentSignups,
    };
  }

  /**
   * Get revenue analytics for a specific period
   */
  async getRevenueStats(periodDays: number = 30): Promise<RevenueStats> {
    const now = new Date();
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Get all sales
    const allSales = await this.prisma.sale.findMany({
      select: {
        saleAmount: true,
        commissionAmount: true,
        createdAt: true,
        plan: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = allSales.reduce((sum, s) => sum + Number(s.saleAmount), 0);

    // Filter sales for the period
    const periodSales = allSales.filter(s => s.createdAt >= periodStart);
    const periodRevenue = periodSales.reduce((sum, s) => sum + Number(s.saleAmount), 0);

    // Revenue by plan
    const revenueByPlanMap = new Map<string, { revenue: number; count: number }>();
    for (const sale of allSales) {
      const planName = sale.plan?.name || 'Unknown';
      const existing = revenueByPlanMap.get(planName) || { revenue: 0, count: 0 };
      existing.revenue += Number(sale.saleAmount);
      existing.count += 1;
      revenueByPlanMap.set(planName, existing);
    }
    const revenueByPlan = Array.from(revenueByPlanMap.entries()).map(([planName, data]) => ({
      planName,
      revenue: Math.round(data.revenue * 100) / 100,
      count: data.count,
    }));

    // Daily revenue for the period
    const dailyRevenueMap = new Map<string, number>();
    for (let i = 0; i < periodDays; i++) {
      const date = new Date(periodStart.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyRevenueMap.set(dateStr, 0);
    }

    for (const sale of periodSales) {
      const dateStr = sale.createdAt.toISOString().split('T')[0];
      const current = dailyRevenueMap.get(dateStr) || 0;
      dailyRevenueMap.set(dateStr, current + Number(sale.saleAmount));
    }

    const dailyRevenue = Array.from(dailyRevenueMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }));

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      periodRevenue: Math.round(periodRevenue * 100) / 100,
      revenueByPlan,
      dailyRevenue,
    };
  }

  /**
   * Get user growth analytics
   */
  async getUserGrowthStats(periodDays: number = 30): Promise<UserGrowthStats> {
    const now = new Date();
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: periodStart } } }),
      this.prisma.user.count({ where: { isActive: true } }),
    ]);

    // Daily signups for the period
    const dailySignupsMap = new Map<string, number>();
    for (let i = 0; i < periodDays; i++) {
      const date = new Date(periodStart.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailySignupsMap.set(dateStr, 0);
    }

    const usersInPeriod = await this.prisma.user.findMany({
      where: { createdAt: { gte: periodStart } },
      select: { createdAt: true },
    });

    for (const user of usersInPeriod) {
      const dateStr = user.createdAt.toISOString().split('T')[0];
      const current = dailySignupsMap.get(dateStr) || 0;
      dailySignupsMap.set(dateStr, current + 1);
    }

    const dailySignups = Array.from(dailySignupsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    return {
      totalUsers,
      newUsers,
      activeUsers,
      dailySignups,
    };
  }

  /**
   * Get sales performance analytics
   */
  async getSalesStats(): Promise<SalesStats> {
    const sales = await this.prisma.sale.findMany({
      include: {
        salesPerson: {
          include: {
            user: { select: { displayName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSales = sales.reduce((sum, s) => sum + Number(s.saleAmount), 0);
    const totalCommission = sales.reduce((sum, s) => sum + Number(s.commissionAmount), 0);

    // Top sales persons
    const salesPersonMap = new Map<string, {
      name: string | null;
      totalSales: number;
      commission: number;
      salesCount: number;
    }>();

    for (const sale of sales) {
      const spId = sale.salesPersonId;
      const existing = salesPersonMap.get(spId) || {
        name: sale.salesPerson?.user?.displayName || null,
        totalSales: 0,
        commission: 0,
        salesCount: 0,
      };
      existing.totalSales += Number(sale.saleAmount);
      existing.commission += Number(sale.commissionAmount);
      existing.salesCount += 1;
      salesPersonMap.set(spId, existing);
    }

    const topSalesPersons = Array.from(salesPersonMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);

    // Monthly sales data
    const monthlySalesMap = new Map<string, { sales: number; commission: number }>();
    for (const sale of sales) {
      const monthStr = sale.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const existing = monthlySalesMap.get(monthStr) || { sales: 0, commission: 0 };
      existing.sales += Number(sale.saleAmount);
      existing.commission += Number(sale.commissionAmount);
      monthlySalesMap.set(monthStr, existing);
    }

    const monthlySales = Array.from(monthlySalesMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Last 12 months
      .map(([month, data]) => ({
        month,
        sales: Math.round(data.sales * 100) / 100,
        commission: Math.round(data.commission * 100) / 100,
      }));

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      totalCommission: Math.round(totalCommission * 100) / 100,
      topSalesPersons,
      monthlySales,
    };
  }

  /**
   * Get detailed information about a specific user
   */
  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        plan: true,
        shops: true,
        salesPerson: true,
        loginHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get user's transactions through their shops
    const shopIds = user.shops.map(s => s.id);
    const transactions = shopIds.length > 0
      ? await this.prisma.transaction.findMany({
          where: { shopId: { in: shopIds } },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        })
      : [];

    // Get subscription/purchase history from sales
    const sales = await this.prisma.sale.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    const subscriptionHistory = sales.map(sale => ({
      planName: sale.plan?.name || 'Unknown',
      startDate: sale.createdAt,
      endDate: new Date(sale.createdAt.getTime() + (sale.plan?.durationDays || 30) * 24 * 60 * 60 * 1000),
      amount: Number(sale.saleAmount),
    }));

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.isActive,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      plan: user.plan,
      shops: user.shops,
      transactions,
      subscriptionHistory,
      loginHistory: user.loginHistory,
      recentActivity: user.auditLogs,
    };
  }

  private async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.sale.aggregate({
      _sum: { saleAmount: true },
    });
    return Math.round((Number(result._sum.saleAmount) || 0) * 100) / 100;
  }
}
