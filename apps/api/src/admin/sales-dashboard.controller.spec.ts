import { Test, TestingModule } from '@nestjs/testing';
import { SalesDashboardController } from './sales-dashboard.controller';
import { SalesDashboardService } from './sales-dashboard.service';
import { BadRequestException } from '@nestjs/common';

describe('SalesDashboardController', () => {
  let controller: SalesDashboardController;

  const mockSalesDashboardService = {
    getDashboardStats: jest.fn(),
    getPerformanceData: jest.fn(),
    getMyCustomers: jest.fn(),
    createCustomer: jest.fn(),
  };

  const mockSalesPerson = {
    id: 'sales-123',
    email: 'sales@example.com',
    role: 'SALES',
    salesPersonId: 'sales-person-123',
  };

  const mockReq = {
    user: mockSalesPerson,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesDashboardController],
      providers: [
        {
          provide: SalesDashboardService,
          useValue: mockSalesDashboardService,
        },
      ],
    }).compile();

    controller = module.get<SalesDashboardController>(SalesDashboardController);

    jest.clearAllMocks();
  });

  describe('GET /sales/dashboard', () => {
    it('should return sales person dashboard stats', async () => {
      const dashboardStats = {
        totalSales: 50,
        monthlySales: 10,
        commissionEarned: 2500,
        pendingCommission: 500,
        customersCreated: 25,
        activeCustomers: 20,
        recentSales: [],
      };
      mockSalesDashboardService.getDashboardStats.mockResolvedValue(dashboardStats);

      const result = await controller.getDashboardStats(mockReq as any);

      expect(result).toEqual(dashboardStats);
      expect(mockSalesDashboardService.getDashboardStats).toHaveBeenCalledWith(mockSalesPerson.salesPersonId);
    });

    it('should return zero stats for new sales person', async () => {
      const zeroStats = {
        totalSales: 0,
        monthlySales: 0,
        commissionEarned: 0,
        pendingCommission: 0,
        customersCreated: 0,
        activeCustomers: 0,
        recentSales: [],
      };
      mockSalesDashboardService.getDashboardStats.mockResolvedValue(zeroStats);

      const result = await controller.getDashboardStats(mockReq as any);

      expect(result.totalSales).toBe(0);
      expect(result.commissionEarned).toBe(0);
      expect(result.customersCreated).toBe(0);
    });
  });

  describe('GET /sales/performance', () => {
    it('should return performance data with default period (30 days)', async () => {
      const performanceData = {
        dailySales: [
          { date: '2024-01-01', sales: 5, commission: 100 },
          { date: '2024-01-02', sales: 3, commission: 60 },
        ],
        monthlyComparison: {
          currentMonth: 50,
          previousMonth: 40,
          growth: 25,
        },
      };
      mockSalesDashboardService.getPerformanceData.mockResolvedValue(performanceData);

      const result = await controller.getPerformanceData(mockReq as any);

      expect(result).toEqual(performanceData);
      expect(mockSalesDashboardService.getPerformanceData).toHaveBeenCalledWith(mockSalesPerson.salesPersonId, 30);
    });

    it('should return performance data with custom period', async () => {
      const performanceData = {
        dailySales: [],
        monthlyComparison: {
          currentMonth: 0,
          previousMonth: 0,
          growth: 0,
        },
      };
      mockSalesDashboardService.getPerformanceData.mockResolvedValue(performanceData);

      await controller.getPerformanceData(mockReq as any, '60');

      expect(mockSalesDashboardService.getPerformanceData).toHaveBeenCalledWith(mockSalesPerson.salesPersonId, 60);
    });

    it('should cap period at 90 days', async () => {
      mockSalesDashboardService.getPerformanceData.mockResolvedValue({
        dailySales: [],
        monthlyComparison: { currentMonth: 0, previousMonth: 0, growth: 0 },
      });

      await controller.getPerformanceData(mockReq as any, '120');

      expect(mockSalesDashboardService.getPerformanceData).toHaveBeenCalledWith(mockSalesPerson.salesPersonId, 90);
    });
  });

  describe('GET /sales/customers', () => {
    it('should return paginated list of customers created by sales person', async () => {
      const customersData = {
        data: [
          { id: 'user-1', email: 'user1@example.com', displayName: 'User 1', isActive: true },
          { id: 'user-2', email: 'user2@example.com', displayName: 'User 2', isActive: true },
        ],
        total: 2,
      };
      mockSalesDashboardService.getMyCustomers.mockResolvedValue(customersData);

      const result = await controller.getMyCustomers(mockReq as any);

      expect(result).toEqual(customersData);
      expect(mockSalesDashboardService.getMyCustomers).toHaveBeenCalledWith(mockSalesPerson.id, {
        search: undefined,
        isActive: undefined,
        page: 1,
        limit: 10,
      });
    });

    it('should filter customers by search term', async () => {
      const customersData = {
        data: [{ id: 'user-1', email: 'user1@example.com', displayName: 'User 1', isActive: true }],
        total: 1,
      };
      mockSalesDashboardService.getMyCustomers.mockResolvedValue(customersData);

      await controller.getMyCustomers(mockReq as any, 'user1');

      expect(mockSalesDashboardService.getMyCustomers).toHaveBeenCalledWith(mockSalesPerson.id, {
        search: 'user1',
        isActive: undefined,
        page: 1,
        limit: 10,
      });
    });

    it('should filter customers by active status', async () => {
      const customersData = {
        data: [{ id: 'user-1', email: 'user1@example.com', displayName: 'User 1', isActive: true }],
        total: 1,
      };
      mockSalesDashboardService.getMyCustomers.mockResolvedValue(customersData);

      await controller.getMyCustomers(mockReq as any, undefined, 'true');

      expect(mockSalesDashboardService.getMyCustomers).toHaveBeenCalledWith(mockSalesPerson.id, {
        search: undefined,
        isActive: true,
        page: 1,
        limit: 10,
      });
    });

    it('should filter customers by inactive status', async () => {
      const customersData = {
        data: [{ id: 'user-1', email: 'user1@example.com', displayName: 'User 1', isActive: false }],
        total: 1,
      };
      mockSalesDashboardService.getMyCustomers.mockResolvedValue(customersData);

      await controller.getMyCustomers(mockReq as any, undefined, 'false');

      expect(mockSalesDashboardService.getMyCustomers).toHaveBeenCalledWith(mockSalesPerson.id, {
        search: undefined,
        isActive: false,
        page: 1,
        limit: 10,
      });
    });

    it('should apply custom pagination', async () => {
      mockSalesDashboardService.getMyCustomers.mockResolvedValue({ data: [], total: 0 });

      await controller.getMyCustomers(mockReq as any, undefined, undefined, '2', '20');

      expect(mockSalesDashboardService.getMyCustomers).toHaveBeenCalledWith(mockSalesPerson.id, {
        search: undefined,
        isActive: undefined,
        page: 2,
        limit: 20,
      });
    });

    it('should return empty list when sales person has no customers', async () => {
      const emptyData = {
        data: [],
        total: 0,
      };
      mockSalesDashboardService.getMyCustomers.mockResolvedValue(emptyData);

      const result = await controller.getMyCustomers(mockReq as any);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('POST /sales/customers', () => {
    const createCustomerDto = {
      email: 'newcustomer@example.com',
      displayName: 'New Customer',
      phoneNumber: '+8801712345678',
      planId: 'plan-123',
    };

    it('should create a new customer', async () => {
      const createdCustomer = {
        id: 'new-user-123',
        email: createCustomerDto.email,
        displayName: createCustomerDto.displayName,
        isActive: true,
        planId: createCustomerDto.planId,
      };
      mockSalesDashboardService.createCustomer.mockResolvedValue(createdCustomer);

      const result = await controller.createCustomer(mockReq as any, createCustomerDto);

      expect(result).toEqual(createdCustomer);
      expect(mockSalesDashboardService.createCustomer).toHaveBeenCalledWith(mockSalesPerson.id, createCustomerDto);
    });

    it('should create customer with minimal fields', async () => {
      const minimalDto = {
        email: 'minimal@example.com',
        planId: 'plan-123',
      };
      mockSalesDashboardService.createCustomer.mockResolvedValue({
        id: 'new-user-456',
        email: minimalDto.email,
        isActive: true,
        planId: minimalDto.planId,
      });

      const result = await controller.createCustomer(mockReq as any, minimalDto as any);

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for invalid email', async () => {
      mockSalesDashboardService.createCustomer.mockRejectedValue(new BadRequestException('Invalid email'));

      await expect(
        controller.createCustomer(mockReq as any, {
          email: 'invalid-email',
          planId: 'plan-123',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing plan', async () => {
      mockSalesDashboardService.createCustomer.mockRejectedValue(new BadRequestException('Plan is required'));

      await expect(
        controller.createCustomer(mockReq as any, {
          email: 'customer@example.com',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid plan', async () => {
      mockSalesDashboardService.createCustomer.mockRejectedValue(new BadRequestException('Invalid plan'));

      await expect(
        controller.createCustomer(mockReq as any, {
          email: 'customer@example.com',
          planId: 'invalid-plan',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when email already exists', async () => {
      mockSalesDashboardService.createCustomer.mockRejectedValue(new BadRequestException('Email already exists'));

      await expect(
        controller.createCustomer(mockReq as any, {
          email: 'existing@example.com',
          planId: 'plan-123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
