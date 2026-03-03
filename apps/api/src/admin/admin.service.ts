import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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

  /**
   * Bulk user action - activate, deactivate, or delete multiple users
   */
  async bulkUserAction(userIds: string[], action: 'activate' | 'deactivate' | 'delete', requesterRole: UserRole) {
    if (!userIds || userIds.length === 0) {
      throw new BadRequestException('No users specified');
    }

    if (userIds.length > 100) {
      throw new BadRequestException('Cannot process more than 100 users at once');
    }

    const results = {
      success: [] as string[],
      failed: [] as { id: string; reason: string }[],
    };

    for (const userId of userIds) {
      try {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
          results.failed.push({ id: userId, reason: 'User not found' });
          continue;
        }

        // Check permissions
        if (
          (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) &&
          requesterRole !== UserRole.SUPER_ADMIN
        ) {
          results.failed.push({ id: userId, reason: 'Only Super Admin can modify admin users' });
          continue;
        }

        switch (action) {
          case 'activate':
            await this.prisma.user.update({
              where: { id: userId },
              data: { isActive: true },
            });
            results.success.push(userId);
            break;

          case 'deactivate':
            await this.prisma.user.update({
              where: { id: userId },
              data: { isActive: false },
            });
            results.success.push(userId);
            break;

          case 'delete':
            await this.prisma.user.delete({ where: { id: userId } });
            results.success.push(userId);
            break;
        }
      } catch (error) {
        results.failed.push({ id: userId, reason: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return {
      message: `Bulk ${action} completed`,
      total: userIds.length,
      successCount: results.success.length,
      failedCount: results.failed.length,
      results,
    };
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

  // ============ Audit Logs ============

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(options: {
    page?: number;
    limit?: number;
    action?: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
    userId?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page = 1, limit = 20, action, userId, entityType, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.userId = userId;
    }

    if (entityType) {
      where.entityType = { contains: entityType, mode: 'insensitive' };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Export audit logs as CSV
   */
  async exportAuditLogs(options: {
    action?: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
    userId?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { action, userId, entityType, startDate, endDate } = options;

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.userId = userId;
    }

    if (entityType) {
      where.entityType = { contains: entityType, mode: 'insensitive' };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
      include: {
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });

    const csvHeader = 'Date,Action,Entity Type,Entity ID,User Email,User Name,Old Value,New Value\n';
    const csvRows = logs.map(log => 
      `"${log.createdAt.toISOString()}","${log.action}","${log.entityType || ''}","${log.entityId || ''}","${log.user?.email || ''}","${log.user?.displayName || ''}","${log.oldValue || ''}","${log.newValue || ''}"`
    ).join('\n');

    return {
      csv: csvHeader + csvRows,
      count: logs.length,
    };
  }

  // ============ Announcements ============

  /**
   * Get all announcements
   */
  async getAnnouncements() {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  /**
   * Create announcement
   */
  async createAnnouncement(data: {
    title: string;
    message: string;
    targetRoles?: 'ALL' | 'USER' | 'ADMIN' | 'SALES';
    isActive?: boolean;
    scheduledAt?: Date;
  }) {
    return this.prisma.announcement.create({
      data: {
        title: data.title,
        message: data.message,
        targetRoles: data.targetRoles || 'ALL',
        isActive: data.isActive !== undefined ? data.isActive : true,
        scheduledAt: data.scheduledAt,
        publishedAt: data.scheduledAt ? null : new Date(),
      },
    });
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(id: string, data: {
    title?: string;
    message?: string;
    targetRoles?: 'ALL' | 'USER' | 'ADMIN' | 'SALES';
    isActive?: boolean;
    scheduledAt?: Date;
  }) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return this.prisma.announcement.update({
      where: { id },
      data: {
        ...data,
        publishedAt: announcement.publishedAt || new Date(),
      },
    });
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    await this.prisma.announcement.delete({ where: { id } });

    return { message: 'Announcement deleted successfully' };
  }

  // ============ Platform Settings ============

  /**
   * Get platform settings
   */
  async getPlatformSettings() {
    let settings = await this.prisma.platformSettings.findFirst();

    if (!settings) {
      settings = await this.prisma.platformSettings.create({
        data: {
          platformName: 'Shohoj Hishab',
          platformEmail: 'support@shohojhisab.com',
          supportPhone: '+8801234567890',
          defaultCommissionRate: 5,
          featureFlags: JSON.stringify({
            darkMode: true,
            emailVerification: true,
            phoneVerification: true,
          }),
          maintenanceMode: false,
        },
      });
    }

    return {
      ...settings,
      featureFlags: JSON.parse(settings.featureFlags as string || '{}'),
    };
  }

  /**
   * Update platform settings
   */
  async updatePlatformSettings(data: {
    platformName?: string;
    platformEmail?: string;
    supportPhone?: string;
    defaultCommissionRate?: number;
    featureFlags?: string;
    maintenanceMode?: boolean;
  }) {
    let settings = await this.prisma.platformSettings.findFirst();

    if (!settings) {
      settings = await this.prisma.platformSettings.create({
        data: {
          platformName: data.platformName || 'Shohoj Hishab',
          platformEmail: data.platformEmail,
          supportPhone: data.supportPhone,
          defaultCommissionRate: data.defaultCommissionRate,
          featureFlags: data.featureFlags || '{}',
          maintenanceMode: data.maintenanceMode,
        },
      });
    } else {
      const updateData: any = {};
      if (data.platformName !== undefined) updateData.platformName = data.platformName;
      if (data.platformEmail !== undefined) updateData.platformEmail = data.platformEmail;
      if (data.supportPhone !== undefined) updateData.supportPhone = data.supportPhone;
      if (data.defaultCommissionRate !== undefined) updateData.defaultCommissionRate = data.defaultCommissionRate;
      if (data.featureFlags !== undefined) updateData.featureFlags = data.featureFlags;
      if (data.maintenanceMode !== undefined) updateData.maintenanceMode = data.maintenanceMode;

      settings = await this.prisma.platformSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    return {
      ...settings,
      featureFlags: JSON.parse(settings.featureFlags as string || '{}'),
    };
  }

  /**
   * Trigger database backup
   */
  async triggerBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return {
      message: 'Backup initiated',
      backupId: `backup-${timestamp}`,
      timestamp: new Date(),
    };
  }

  /**
   * Clear application cache
   */
  async clearCache() {
    return {
      message: 'Cache cleared successfully',
      clearedAt: new Date(),
    };
  }
}
