import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ============ User Management ============

  /**
   * Get all users with pagination and filters
   */
  async getUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 10, search, role, isActive } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        plan: true,
        shops: true,
        salesPerson: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user (activate/deactivate, change plan)
   */
  async updateUser(
    id: string,
    data: {
      isActive?: boolean;
      role?: UserRole;
      subscriptionPlanId?: string;
      subscriptionStartDate?: Date;
      subscriptionEndDate?: Date;
    },
    requesterRole: UserRole,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Any change that touches admin roles (ADMIN / SUPER_ADMIN), either for the
    // existing user or the target role, must be performed by a Super Admin.
    const touchesAdminRole =
      user.role === UserRole.ADMIN ||
      user.role === UserRole.SUPER_ADMIN ||
      data.role === UserRole.ADMIN ||
      data.role === UserRole.SUPER_ADMIN;

    if (touchesAdminRole && requesterRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admin can manage admin roles');
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: { plan: true },
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id: string, requesterRole: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only Super Admin can delete admin-level users (ADMIN / SUPER_ADMIN)
    if (
      (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) &&
      requesterRole !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Only Super Admin can delete admin users');
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }

  // ============ Subscription Plan Management ============

  /**
   * Get all subscription plans
   */
  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });
  }

  /**
   * Get plan by ID
   */
  async getPlanById(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  /**
   * Create new subscription plan
   */
  async createPlan(data: {
    name: string;
    description?: string;
    price: number;
    durationDays: number;
    features?: string;
  }) {
    return this.prisma.subscriptionPlan.create({
      data,
    });
  }

  /**
   * Update subscription plan
   */
  async updatePlan(id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    durationDays?: number;
    features?: string;
  }) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data,
    });
  }

  /**
   * Toggle plan active status
   */
  async togglePlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: !plan.isActive },
    });
  }

  /**
   * Delete subscription plan
   */
  async deletePlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    await this.prisma.subscriptionPlan.delete({ where: { id } });

    return { message: 'Plan deleted successfully' };
  }

  // ============ Admin Management (Super Admin Only) ============

  /**
   * Get all admins
   */
  async getAdmins() {
    return this.prisma.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  /**
   * Create new admin user.
   * Only Super Admin can create ADMIN or SUPER_ADMIN accounts.
   */
  async createAdmin(
    data: { userId: string; role: 'ADMIN' | 'SUPER_ADMIN' },
    requesterRole: UserRole,
  ) {
    if (requesterRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admin can create admin users');
    }

    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: data.userId },
      data: { role: data.role },
    });
  }

  /**
   * Remove admin role.
   * Only Super Admin can remove ADMIN or SUPER_ADMIN privileges.
   */
  async removeAdmin(id: string, requesterRole: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('User is not an admin');
    }

    if (requesterRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admin can manage admin users');
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: UserRole.USER },
    });
  }

  // ============ Sales Person Management ============

  /**
   * Get all sales persons
   */
  async getSalesPersons() {
    return this.prisma.salesPerson.findMany({
      include: {
        user: {
          select: {
            id: true,
            phoneNumber: true,
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Add sales person
   */
  async addSalesPerson(data: {
    userId: string;
    commissionRate?: number;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot convert an admin user to sales');
    }

    const existingSalesPerson = await this.prisma.salesPerson.findUnique({
      where: { userId: data.userId },
    });

    if (existingSalesPerson) {
      throw new ForbiddenException('User is already a sales person');
    }

    // Promote user to SALES role and create SalesPerson record
    return this.prisma.salesPerson.create({
      data: {
        userId: data.userId,
        commissionRate: data.commissionRate || 5,
      },
      include: {
        user: {
          select: {
            id: true,
            phoneNumber: true,
            displayName: true,
            email: true,
          },
        },
      },
    }).then(async (salesPerson) => {
      await this.prisma.user.update({
        where: { id: data.userId },
        data: { role: UserRole.SALES },
      });
      return salesPerson;
    });
  }

  /**
   * Update sales person
   */
  async updateSalesPerson(id: string, data: {
    commissionRate?: number;
    isActive?: boolean;
  }) {
    const salesPerson = await this.prisma.salesPerson.findUnique({ where: { id } });

    if (!salesPerson) {
      throw new NotFoundException('Sales person not found');
    }

    return this.prisma.salesPerson.update({
      where: { id },
      data,
    });
  }

  /**
   * Remove sales person
   */
  async removeSalesPerson(id: string) {
    const salesPerson = await this.prisma.salesPerson.findUnique({ where: { id } });

    if (!salesPerson) {
      throw new NotFoundException('Sales person not found');
    }

    await this.prisma.salesPerson.delete({ where: { id } });

    // Demote back to USER role if they were SALES
    await this.prisma.user.update({
      where: { id: salesPerson.userId },
      data: { role: UserRole.USER },
    });

    return { message: 'Sales person removed successfully' };
  }

  // ============ Analytics ============

  /**
   * Get dashboard overview stats
   */
  async getOverviewStats() {
    const [
      totalUsers,
      activeUsers,
      totalAdmins,
      totalSalesPersons,
      totalPlans,
      activePlans,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
      this.prisma.salesPerson.count({ where: { isActive: true } }),
      this.prisma.subscriptionPlan.count(),
      this.prisma.subscriptionPlan.count({ where: { isActive: true } }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phoneNumber: true,
          displayName: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalAdmins,
      totalSalesPersons,
      totalPlans,
      activePlans,
      recentUsers,
    };
  }

  /**
   * Get revenue analytics
   */
  async getRevenueStats() {
    const sales = await this.prisma.sale.findMany({
      select: {
        saleAmount: true,
        commissionAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.saleAmount), 0);
    const totalCommission = sales.reduce((sum, s) => sum + Number(s.commissionAmount), 0);

    return {
      totalRevenue,
      totalCommission,
      recentSales: sales,
    };
  }
}
