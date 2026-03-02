import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserRole } from '@prisma/client';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('AdminController', () => {
  let controller: AdminController;

  const mockAdminService = {
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getPlans: jest.fn(),
    getPlanById: jest.fn(),
    createPlan: jest.fn(),
    updatePlan: jest.fn(),
    togglePlan: jest.fn(),
    deletePlan: jest.fn(),
    getAdmins: jest.fn(),
    createAdmin: jest.fn(),
    removeAdmin: jest.fn(),
    getSalesPersons: jest.fn(),
    addSalesPerson: jest.fn(),
    updateSalesPerson: jest.fn(),
    removeSalesPerson: jest.fn(),
    getOverviewStats: jest.fn(),
    getRevenueStats: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    displayName: 'Test User',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
  };

  const mockAdminReq = {
    user: {
      id: 'admin-123',
      role: UserRole.ADMIN,
    },
  };

  const mockSuperAdminReq = {
    user: {
      id: 'superadmin-123',
      role: UserRole.SUPER_ADMIN,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);

    jest.clearAllMocks();
  });

  describe('GET /admin/users', () => {
    it('should return paginated list of users', async () => {
      const expectedResponse = {
        data: [mockUser],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      mockAdminService.getUsers.mockResolvedValue(expectedResponse);

      const result = await controller.getUsers({});

      expect(result).toEqual(expectedResponse);
      expect(mockAdminService.getUsers).toHaveBeenCalledWith({
        page: undefined,
        limit: undefined,
        search: undefined,
        role: undefined,
        isActive: undefined,
      });
    });

    it('should apply pagination parameters', async () => {
      const query = { page: 2, limit: 20 };
      mockAdminService.getUsers.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 2, limit: 20, totalPages: 0 },
      });

      await controller.getUsers(query);

      expect(mockAdminService.getUsers).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        search: undefined,
        role: undefined,
        isActive: undefined,
      });
    });

    it('should filter by role', async () => {
      const query = { role: UserRole.USER };
      mockAdminService.getUsers.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      await controller.getUsers(query);

      expect(mockAdminService.getUsers).toHaveBeenCalledWith(expect.objectContaining({
        role: UserRole.USER,
      }));
    });

    it('should filter by active status', async () => {
      const query = { isActive: true };
      mockAdminService.getUsers.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      await controller.getUsers(query);

      expect(mockAdminService.getUsers).toHaveBeenCalledWith(expect.objectContaining({
        isActive: true,
      }));
    });

    it('should filter by isActive false', async () => {
      const query = { isActive: false };
      mockAdminService.getUsers.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      await controller.getUsers(query);

      expect(mockAdminService.getUsers).toHaveBeenCalledWith(expect.objectContaining({
        isActive: false,
      }));
    });

    it('should search users', async () => {
      const query = { search: 'test' };
      mockAdminService.getUsers.mockResolvedValue({
        data: [mockUser],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      await controller.getUsers(query);

      expect(mockAdminService.getUsers).toHaveBeenCalledWith(expect.objectContaining({
        search: 'test',
      }));
    });
  });

  describe('GET /admin/users/:id', () => {
    it('should return user by ID', async () => {
      mockAdminService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById('user-123');

      expect(result).toEqual(mockUser);
      expect(mockAdminService.getUserById).toHaveBeenCalledWith('user-123');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockAdminService.getUserById.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.getUserById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH /admin/users/:id', () => {
    const updateDto = {
      isActive: false,
      role: UserRole.ADMIN,
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      mockAdminService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.updateUser('user-123', updateDto, mockAdminReq as any);

      expect(result).toEqual(updatedUser);
      expect(mockAdminService.updateUser).toHaveBeenCalledWith('user-123', updateDto, UserRole.ADMIN);
    });

    it('should throw ForbiddenException when ADMIN tries to modify SUPER_ADMIN', async () => {
      mockAdminService.updateUser.mockRejectedValue(new ForbiddenException('ADMIN cannot modify SUPER_ADMIN'));

      await expect(controller.updateUser('superadmin-123', updateDto, mockAdminReq as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockAdminService.updateUser.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.updateUser('nonexistent', updateDto, mockAdminReq as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update user subscription', async () => {
      const subscriptionUpdate = {
        subscriptionPlanId: 'plan-123',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(),
      };
      mockAdminService.updateUser.mockResolvedValue({ ...mockUser, ...subscriptionUpdate });

      const result = await controller.updateUser('user-123', subscriptionUpdate, mockAdminReq as any);

      expect(result).toEqual(expect.objectContaining(subscriptionUpdate));
    });
  });

  describe('DELETE /admin/users/:id', () => {
    it('should delete user successfully', async () => {
      mockAdminService.deleteUser.mockResolvedValue({ message: 'User deleted successfully' });

      const result = await controller.deleteUser('user-123', mockAdminReq as any);

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(mockAdminService.deleteUser).toHaveBeenCalledWith('user-123', UserRole.ADMIN);
    });

    it('should throw ForbiddenException when ADMIN tries to delete SUPER_ADMIN', async () => {
      mockAdminService.deleteUser.mockRejectedValue(new ForbiddenException('ADMIN cannot delete SUPER_ADMIN'));

      await expect(controller.deleteUser('superadmin-123', mockAdminReq as any)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockAdminService.deleteUser.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.deleteUser('nonexistent', mockAdminReq as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /admin/plans', () => {
    it('should return all subscription plans', async () => {
      const plans = [
        {
          id: 'plan-1',
          name: 'Basic',
          price: 1000,
          durationDays: 30,
          isActive: true,
        },
      ];
      mockAdminService.getPlans.mockResolvedValue(plans);

      const result = await controller.getPlans();

      expect(result).toEqual(plans);
      expect(mockAdminService.getPlans).toHaveBeenCalled();
    });

    it('should return empty array when no plans exist', async () => {
      mockAdminService.getPlans.mockResolvedValue([]);

      const result = await controller.getPlans();

      expect(result).toEqual([]);
    });
  });

  describe('GET /admin/plans/:id', () => {
    it('should return plan by ID', async () => {
      const plan = {
        id: 'plan-123',
        name: 'Premium',
        price: 2000,
        durationDays: 30,
      };
      mockAdminService.getPlanById.mockResolvedValue(plan);

      const result = await controller.getPlanById('plan-123');

      expect(result).toEqual(plan);
    });

    it('should throw NotFoundException for non-existent plan', async () => {
      mockAdminService.getPlanById.mockRejectedValue(new NotFoundException('Plan not found'));

      await expect(controller.getPlanById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('POST /admin/plans', () => {
    const createPlanDto = {
      name: 'Premium Plan',
      description: 'Full access to all features',
      price: 2000,
      durationDays: 30,
      features: JSON.stringify(['feature1', 'feature2']),
    };

    it('should create new subscription plan', async () => {
      const createdPlan = {
        id: 'new-plan-123',
        ...createPlanDto,
        features: ['feature1', 'feature2'],
        isActive: true,
      };
      mockAdminService.createPlan.mockResolvedValue(createdPlan);

      const result = await controller.createPlan(createPlanDto);

      expect(result).toEqual(createdPlan);
      expect(mockAdminService.createPlan).toHaveBeenCalledWith(createPlanDto);
    });

    it('should create plan without optional fields', async () => {
      const minimalDto = {
        name: 'Basic Plan',
        price: 1000,
        durationDays: 30,
      };
      mockAdminService.createPlan.mockResolvedValue({ id: 'plan-123', ...minimalDto, isActive: true });

      const result = await controller.createPlan(minimalDto as any);

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for invalid plan data', async () => {
      mockAdminService.createPlan.mockRejectedValue(new BadRequestException('Invalid plan data'));

      await expect(controller.createPlan({ name: '', price: -1, durationDays: 0 } as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('PATCH /admin/plans/:id', () => {
    const updatePlanDto = {
      name: 'Updated Plan',
      price: 2500,
    };

    it('should update plan successfully', async () => {
      const updatedPlan = {
        id: 'plan-123',
        name: 'Updated Plan',
        price: 2500,
        durationDays: 30,
      };
      mockAdminService.updatePlan.mockResolvedValue(updatedPlan);

      const result = await controller.updatePlan('plan-123', updatePlanDto);

      expect(result).toEqual(updatedPlan);
      expect(mockAdminService.updatePlan).toHaveBeenCalledWith('plan-123', updatePlanDto);
    });

    it('should throw NotFoundException for non-existent plan', async () => {
      mockAdminService.updatePlan.mockRejectedValue(new NotFoundException('Plan not found'));

      await expect(controller.updatePlan('nonexistent', updatePlanDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH /admin/plans/:id/toggle', () => {
    it('should toggle plan status to inactive', async () => {
      mockAdminService.togglePlan.mockResolvedValue({
        id: 'plan-123',
        name: 'Basic Plan',
        isActive: false,
      });

      const result = await controller.togglePlan('plan-123');

      expect(result.isActive).toBe(false);
    });

    it('should toggle plan status to active', async () => {
      mockAdminService.togglePlan.mockResolvedValue({
        id: 'plan-123',
        name: 'Basic Plan',
        isActive: true,
      });

      const result = await controller.togglePlan('plan-123');

      expect(result.isActive).toBe(true);
    });

    it('should throw NotFoundException for non-existent plan', async () => {
      mockAdminService.togglePlan.mockRejectedValue(new NotFoundException('Plan not found'));

      await expect(controller.togglePlan('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /admin/plans/:id', () => {
    it('should delete plan successfully', async () => {
      mockAdminService.deletePlan.mockResolvedValue({ message: 'Plan deleted successfully' });

      const result = await controller.deletePlan('plan-123');

      expect(result).toEqual({ message: 'Plan deleted successfully' });
    });

    it('should throw NotFoundException for non-existent plan', async () => {
      mockAdminService.deletePlan.mockRejectedValue(new NotFoundException('Plan not found'));

      await expect(controller.deletePlan('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /admin/admins (Super Admin Only)', () => {
    it('should return list of all admins', async () => {
      const admins = [
        { id: 'admin-1', email: 'admin1@example.com', role: UserRole.ADMIN },
        { id: 'admin-2', email: 'admin2@example.com', role: UserRole.SUPER_ADMIN },
      ];
      mockAdminService.getAdmins.mockResolvedValue(admins);

      const result = await controller.getAdmins();

      expect(result).toEqual(admins);
    });
  });

  describe('POST /admin/admins', () => {
    const createAdminDto = {
      userId: 'user-123',
      role: 'ADMIN' as const,
    };

    it('should promote user to admin', async () => {
      const promotedUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.ADMIN,
      };
      mockAdminService.createAdmin.mockResolvedValue(promotedUser);

      const result = await controller.createAdmin(createAdminDto, mockSuperAdminReq as any);

      expect(result).toEqual(promotedUser);
      expect(mockAdminService.createAdmin).toHaveBeenCalledWith(createAdminDto, UserRole.SUPER_ADMIN);
    });

    it('should promote user to SUPER_ADMIN', async () => {
      const createSuperAdminDto = {
        userId: 'user-123',
        role: 'SUPER_ADMIN' as const,
      };
      mockAdminService.createAdmin.mockResolvedValue({
        id: 'user-123',
        role: UserRole.SUPER_ADMIN,
      });

      const result = await controller.createAdmin(createSuperAdminDto, mockSuperAdminReq as any);

      expect(result.role).toBe(UserRole.SUPER_ADMIN);
    });

    it('should throw ForbiddenException when ADMIN tries to create SUPER_ADMIN', async () => {
      mockAdminService.createAdmin.mockRejectedValue(new ForbiddenException('Only Super Admin can create Super Admin'));

      await expect(controller.createAdmin(
        { userId: 'user-123', role: 'SUPER_ADMIN' },
        mockAdminReq as any,
      )).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DELETE /admin/admins/:id', () => {
    it('should remove admin privileges', async () => {
      mockAdminService.removeAdmin.mockResolvedValue({ message: 'Admin removed successfully' });

      const result = await controller.removeAdmin('admin-123', mockSuperAdminReq as any);

      expect(result).toEqual({ message: 'Admin removed successfully' });
    });

    it('should throw ForbiddenException when ADMIN tries to remove SUPER_ADMIN', async () => {
      mockAdminService.removeAdmin.mockRejectedValue(
        new ForbiddenException('Only Super Admin can remove Super Admin'),
      );

      await expect(controller.removeAdmin('superadmin-123', mockAdminReq as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('GET /admin/sales', () => {
    it('should return all sales persons', async () => {
      const salesPersons = [
        { id: 'sales-1', userId: 'user-1', commissionRate: 10, isActive: true },
      ];
      mockAdminService.getSalesPersons.mockResolvedValue(salesPersons);

      const result = await controller.getSalesPersons();

      expect(result).toEqual(salesPersons);
    });
  });

  describe('POST /admin/sales', () => {
    const addSalesPersonDto = {
      userId: 'user-123',
      commissionRate: 10,
    };

    it('should add user as sales person', async () => {
      const salesPerson = {
        id: 'sales-123',
        userId: 'user-123',
        commissionRate: 10,
        isActive: true,
      };
      mockAdminService.addSalesPerson.mockResolvedValue(salesPerson);

      const result = await controller.addSalesPerson(addSalesPersonDto);

      expect(result).toEqual(salesPerson);
    });

    it('should add sales person without commission rate', async () => {
      const dtoWithoutCommission = { userId: 'user-123' };
      mockAdminService.addSalesPerson.mockResolvedValue({
        id: 'sales-123',
        userId: 'user-123',
        commissionRate: 0,
        isActive: true,
      });

      const result = await controller.addSalesPerson(dtoWithoutCommission as any);

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for user already a sales person', async () => {
      mockAdminService.addSalesPerson.mockRejectedValue(new BadRequestException('User already a sales person'));

      await expect(controller.addSalesPerson(addSalesPersonDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('PATCH /admin/sales/:id', () => {
    const updateSalesPersonDto = {
      commissionRate: 15,
      isActive: true,
    };

    it('should update sales person', async () => {
      const updatedSalesPerson = {
        id: 'sales-123',
        userId: 'user-123',
        commissionRate: 15,
        isActive: true,
      };
      mockAdminService.updateSalesPerson.mockResolvedValue(updatedSalesPerson);

      const result = await controller.updateSalesPerson('sales-123', updateSalesPersonDto);

      expect(result).toEqual(updatedSalesPerson);
    });

    it('should update only commission rate', async () => {
      mockAdminService.updateSalesPerson.mockResolvedValue({
        id: 'sales-123',
        commissionRate: 20,
        isActive: true,
      });

      const result = await controller.updateSalesPerson('sales-123', { commissionRate: 20 });

      expect(result.commissionRate).toBe(20);
    });

    it('should throw NotFoundException for non-existent sales person', async () => {
      mockAdminService.updateSalesPerson.mockRejectedValue(new NotFoundException('Sales person not found'));

      await expect(controller.updateSalesPerson('nonexistent', updateSalesPersonDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('DELETE /admin/sales/:id', () => {
    it('should remove sales person', async () => {
      mockAdminService.removeSalesPerson.mockResolvedValue({ message: 'Sales person removed successfully' });

      const result = await controller.removeSalesPerson('sales-123');

      expect(result).toEqual({ message: 'Sales person removed successfully' });
    });

    it('should throw NotFoundException for non-existent sales person', async () => {
      mockAdminService.removeSalesPerson.mockRejectedValue(new NotFoundException('Sales person not found'));

      await expect(controller.removeSalesPerson('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /admin/analytics/overview', () => {
    it('should return overview stats', async () => {
      const stats = {
        totalUsers: 100,
        totalShops: 50,
        totalTransactions: 1000,
        totalRevenue: 50000,
      };
      mockAdminService.getOverviewStats.mockResolvedValue(stats);

      const result = await controller.getOverviewStats();

      expect(result).toEqual(stats);
    });
  });

  describe('GET /admin/analytics/revenue', () => {
    it('should return revenue stats', async () => {
      const revenueStats = {
        totalRevenue: 100000,
        monthlyRevenue: 10000,
        revenueGrowth: 15,
      };
      mockAdminService.getRevenueStats.mockResolvedValue(revenueStats);

      const result = await controller.getRevenueStats();

      expect(result).toEqual(revenueStats);
    });
  });
});
