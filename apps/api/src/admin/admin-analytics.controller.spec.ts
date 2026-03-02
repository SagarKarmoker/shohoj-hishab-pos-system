import { Test, TestingModule } from '@nestjs/testing';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAnalyticsService } from './admin-analytics.service';
import { NotFoundException } from '@nestjs/common';

describe('AdminAnalyticsController', () => {
  let controller: AdminAnalyticsController;

  const mockAnalyticsService = {
    getDashboardStats: jest.fn(),
    getRevenueStats: jest.fn(),
    getUserGrowthStats: jest.fn(),
    getSalesStats: jest.fn(),
    getUserDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAnalyticsController],
      providers: [
        {
          provide: AdminAnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    controller = module.get<AdminAnalyticsController>(AdminAnalyticsController);

    jest.clearAllMocks();
  });

  describe('GET /admin/analytics/dashboard', () => {
    it('should return comprehensive dashboard stats', async () => {
      const dashboardStats = {
        totalUsers: 100,
        totalShops: 50,
        totalTransactions: 1000,
        totalRevenue: 50000,
        recentSignups: [],
        recentTransactions: [],
        userGrowth: {
          today: 5,
          thisWeek: 20,
          thisMonth: 50,
        },
      };
      mockAnalyticsService.getDashboardStats.mockResolvedValue(dashboardStats);

      const result = await controller.getDashboardStats();

      expect(result).toEqual(dashboardStats);
      expect(mockAnalyticsService.getDashboardStats).toHaveBeenCalled();
    });

    it('should return dashboard stats with zero values for new system', async () => {
      const emptyStats = {
        totalUsers: 0,
        totalShops: 0,
        totalTransactions: 0,
        totalRevenue: 0,
        recentSignups: [],
        recentTransactions: [],
        userGrowth: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
        },
      };
      mockAnalyticsService.getDashboardStats.mockResolvedValue(emptyStats);

      const result = await controller.getDashboardStats();

      expect(result.totalUsers).toBe(0);
      expect(result.totalRevenue).toBe(0);
    });
  });

  describe('GET /admin/analytics/revenue', () => {
    it('should return revenue stats with default period (30 days)', async () => {
      const revenueStats = {
        totalRevenue: 100000,
        periodRevenue: 30000,
        dailyBreakdown: [],
        planDistribution: [],
      };
      mockAnalyticsService.getRevenueStats.mockResolvedValue(revenueStats);

      const result = await controller.getRevenueStats();

      expect(result).toEqual(revenueStats);
      expect(mockAnalyticsService.getRevenueStats).toHaveBeenCalledWith(30);
    });

    it('should return revenue stats with custom period', async () => {
      const revenueStats = {
        totalRevenue: 100000,
        periodRevenue: 50000,
        dailyBreakdown: [],
        planDistribution: [],
      };
      mockAnalyticsService.getRevenueStats.mockResolvedValue(revenueStats);

      const result = await controller.getRevenueStats('60');

      expect(result).toEqual(revenueStats);
      expect(mockAnalyticsService.getRevenueStats).toHaveBeenCalledWith(60);
    });

    it('should cap period at 365 days', async () => {
      mockAnalyticsService.getRevenueStats.mockResolvedValue({
        totalRevenue: 0,
        periodRevenue: 0,
        dailyBreakdown: [],
        planDistribution: [],
      });

      await controller.getRevenueStats('500');

      expect(mockAnalyticsService.getRevenueStats).toHaveBeenCalledWith(365);
    });

    it('should handle period of 7 days', async () => {
      mockAnalyticsService.getRevenueStats.mockResolvedValue({
        totalRevenue: 10000,
        periodRevenue: 2000,
        dailyBreakdown: [],
        planDistribution: [],
      });

      await controller.getRevenueStats('7');

      expect(mockAnalyticsService.getRevenueStats).toHaveBeenCalledWith(7);
    });
  });

  describe('GET /admin/analytics/users', () => {
    it('should return user growth stats with default period', async () => {
      const userGrowthStats = {
        totalUsers: 100,
        periodSignups: 30,
        dailySignups: [],
        growthRate: 15,
      };
      mockAnalyticsService.getUserGrowthStats.mockResolvedValue(userGrowthStats);

      const result = await controller.getUserGrowthStats();

      expect(result).toEqual(userGrowthStats);
      expect(mockAnalyticsService.getUserGrowthStats).toHaveBeenCalledWith(30);
    });

    it('should return user growth stats with custom period', async () => {
      const userGrowthStats = {
        totalUsers: 100,
        periodSignups: 60,
        dailySignups: [],
        growthRate: 25,
      };
      mockAnalyticsService.getUserGrowthStats.mockResolvedValue(userGrowthStats);

      const result = await controller.getUserGrowthStats('90');

      expect(result).toEqual(userGrowthStats);
      expect(mockAnalyticsService.getUserGrowthStats).toHaveBeenCalledWith(90);
    });

    it('should cap user growth period at 365 days', async () => {
      mockAnalyticsService.getUserGrowthStats.mockResolvedValue({
        totalUsers: 0,
        periodSignups: 0,
        dailySignups: [],
        growthRate: 0,
      });

      await controller.getUserGrowthStats('1000');

      expect(mockAnalyticsService.getUserGrowthStats).toHaveBeenCalledWith(365);
    });
  });

  describe('GET /admin/analytics/sales', () => {
    it('should return sales performance stats', async () => {
      const salesStats = {
        totalSales: 100,
        totalCommission: 5000,
        topSalesPersons: [],
      };
      mockAnalyticsService.getSalesStats.mockResolvedValue(salesStats);

      const result = await controller.getSalesStats();

      expect(result).toEqual(salesStats);
      expect(mockAnalyticsService.getSalesStats).toHaveBeenCalled();
    });

    it('should return empty sales stats when no sales persons', async () => {
      const emptySalesStats = {
        totalSales: 0,
        totalCommission: 0,
        topSalesPersons: [],
      };
      mockAnalyticsService.getSalesStats.mockResolvedValue(emptySalesStats);

      const result = await controller.getSalesStats();

      expect(result.totalSales).toBe(0);
      expect(result.totalCommission).toBe(0);
    });
  });

  describe('GET /admin/analytics/users/:id/details', () => {
    const userId = 'user-123';

    it('should return detailed user information', async () => {
      const userDetails = {
        id: userId,
        email: 'user@example.com',
        displayName: 'Test User',
        role: 'USER',
        shops: [],
        transactions: [],
        loginHistory: [],
        activity: [],
      };
      mockAnalyticsService.getUserDetails.mockResolvedValue(userDetails);

      const result = await controller.getUserDetails(userId);

      expect(result).toEqual(userDetails);
      expect(mockAnalyticsService.getUserDetails).toHaveBeenCalledWith(userId);
    });

    it('should return user with multiple shops', async () => {
      const userWithShops = {
        id: userId,
        email: 'user@example.com',
        displayName: 'Test User',
        role: 'USER',
        shops: [
          { id: 'shop-1', name: 'Shop 1' },
          { id: 'shop-2', name: 'Shop 2' },
        ],
        transactions: [],
        loginHistory: [],
        activity: [],
      };
      mockAnalyticsService.getUserDetails.mockResolvedValue(userWithShops);

      const result = await controller.getUserDetails(userId);

      expect(result.shops).toHaveLength(2);
    });

    it('should return user with transaction history', async () => {
      const userWithTransactions = {
        id: userId,
        email: 'user@example.com',
        displayName: 'Test User',
        role: 'USER',
        shops: [],
        transactions: [
          { id: 'trans-1', amount: 100 },
          { id: 'trans-2', amount: 200 },
        ],
        loginHistory: [],
        activity: [],
      };
      mockAnalyticsService.getUserDetails.mockResolvedValue(userWithTransactions);

      const result = await controller.getUserDetails(userId);

      expect(result.transactions).toHaveLength(2);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockAnalyticsService.getUserDetails.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.getUserDetails('nonexistent-user')).rejects.toThrow(NotFoundException);
    });
  });
});
