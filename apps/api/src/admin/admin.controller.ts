import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UserRole } from '@prisma/client';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

class CreatePlanDto {
  @ApiProperty({ description: 'Plan name', example: 'Premium' })
  name!: string;

  @ApiProperty({ description: 'Plan description', required: false, example: 'Full access to all features' })
  description?: string;

  @ApiProperty({ description: 'Plan price in BDT', example: 1000 })
  price!: number;

  @ApiProperty({ description: 'Plan duration in days', example: 30 })
  durationDays!: number;

  @ApiProperty({ description: 'Plan features as JSON string', required: false })
  features?: string;
}

class UpdatePlanDto {
  @ApiProperty({ description: 'Plan name', required: false })
  name?: string;

  @ApiProperty({ description: 'Plan description', required: false })
  description?: string;

  @ApiProperty({ description: 'Plan price in BDT', required: false })
  price?: number;

  @ApiProperty({ description: 'Plan duration in days', required: false })
  durationDays?: number;

  @ApiProperty({ description: 'Plan features as JSON string', required: false })
  features?: string;
}

class UpdateUserDto {
  @ApiProperty({ description: 'User active status', required: false })
  isActive?: boolean;

  @ApiProperty({ description: 'User role', enum: UserRole, required: false })
  role?: UserRole;

  @ApiProperty({ description: 'Subscription plan ID', required: false })
  subscriptionPlanId?: string;

  @ApiProperty({ description: 'Subscription start date', required: false })
  subscriptionStartDate?: Date;

  @ApiProperty({ description: 'Subscription end date', required: false })
  subscriptionEndDate?: Date;
}

class CreateAdminDto {
  @ApiProperty({ description: 'User ID to promote to admin' })
  userId!: string;

  @ApiProperty({ description: 'Admin role', enum: ['ADMIN', 'SUPER_ADMIN'] })
  role!: 'ADMIN' | 'SUPER_ADMIN';
}

class AddSalesPersonDto {
  @ApiProperty({ description: 'User ID to add as sales person' })
  userId!: string;

  @ApiProperty({ description: 'Commission rate percentage', required: false, example: 10 })
  commissionRate?: number;
}

class UpdateSalesPersonDto {
  @ApiProperty({ description: 'Commission rate percentage', required: false })
  commissionRate?: number;

  @ApiProperty({ description: 'Active status', required: false })
  isActive?: boolean;
}

class GetUsersQuery {
  @ApiProperty({ description: 'Page number', required: false, example: 1 })
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false, example: 10 })
  limit?: number;

  @ApiProperty({ description: 'Search query', required: false })
  search?: string;

  @ApiProperty({ description: 'Filter by role', enum: UserRole, required: false })
  role?: UserRole;

  @ApiProperty({ description: 'Filter by active status', required: false })
  isActive?: boolean;
}

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminRoleGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ============ User Management ============

  @Get('users')
  @ApiOperation({ summary: 'Get all users', description: 'Get paginated list of users with optional filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Users list returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUsers(@Query() query: GetUsersQuery) {
    return this.adminService.getUsers({
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      search: query.search,
      role: query.role,
      isActive: query.isActive !== undefined ? query.isActive === true : undefined,
    });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID', description: 'Get detailed information about a specific user' })
  @ApiResponse({ status: 200, description: 'User details returned' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user', description: 'Update user information including role and subscription' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN cannot modify SUPER_ADMIN' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto, @Request() req: { user: { role: string } }) {
    return this.adminService.updateUser(id, dto, req.user.role as UserRole);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user', description: 'Permanently delete a user account' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN cannot delete SUPER_ADMIN' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string, @Request() req: { user: { role: string } }) {
    return this.adminService.deleteUser(id, req.user.role as UserRole);
  }

  // ============ Subscription Plan Management ============

  @Get('plans')
  @ApiOperation({ summary: 'Get all plans', description: 'Get all subscription plans' })
  @ApiResponse({ status: 200, description: 'Plans list returned' })
  async getPlans() {
    return this.adminService.getPlans();
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get plan by ID', description: 'Get details of a specific subscription plan' })
  @ApiResponse({ status: 200, description: 'Plan details returned' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlanById(@Param('id') id: string) {
    return this.adminService.getPlanById(id);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create plan', description: 'Create a new subscription plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid plan data' })
  async createPlan(@Body() dto: CreatePlanDto) {
    return this.adminService.createPlan(dto);
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Update plan', description: 'Update subscription plan details' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.adminService.updatePlan(id, dto);
  }

  @Patch('plans/:id/toggle')
  @ApiOperation({ summary: 'Toggle plan status', description: 'Enable or disable a subscription plan' })
  @ApiResponse({ status: 200, description: 'Plan status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async togglePlan(@Param('id') id: string) {
    return this.adminService.togglePlan(id);
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: 'Delete plan', description: 'Permanently delete a subscription plan' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async deletePlan(@Param('id') id: string) {
    return this.adminService.deletePlan(id);
  }

  // ============ Admin Management (Super Admin Only) ============

  @Get('admins')
  @ApiOperation({ summary: 'Get all admins', description: 'Get list of all admin users (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Admins list returned' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin only' })
  async getAdmins() {
    return this.adminService.getAdmins();
  }

  @Post('admins')
  @ApiOperation({ summary: 'Create admin', description: 'Promote a user to admin role' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Super Admin can create Super Admin' })
  async createAdmin(@Body() dto: CreateAdminDto, @Request() req: { user: { role: string } }) {
    return this.adminService.createAdmin(dto, req.user.role as UserRole);
  }

  @Delete('admins/:id')
  @ApiOperation({ summary: 'Remove admin', description: 'Remove admin privileges from a user' })
  @ApiResponse({ status: 200, description: 'Admin removed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Super Admin can remove Super Admin' })
  async removeAdmin(@Param('id') id: string, @Request() req: { user: { role: string } }) {
    return this.adminService.removeAdmin(id, req.user.role as UserRole);
  }

  // ============ Sales Person Management ============

  @Get('sales')
  @ApiOperation({ summary: 'Get all sales persons', description: 'Get list of all sales persons' })
  @ApiResponse({ status: 200, description: 'Sales persons list returned' })
  async getSalesPersons() {
    return this.adminService.getSalesPersons();
  }

  @Post('sales')
  @ApiOperation({ summary: 'Add sales person', description: 'Add a user as a sales person' })
  @ApiResponse({ status: 201, description: 'Sales person added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or user already a sales person' })
  async addSalesPerson(@Body() dto: AddSalesPersonDto) {
    return this.adminService.addSalesPerson(dto);
  }

  @Patch('sales/:id')
  @ApiOperation({ summary: 'Update sales person', description: 'Update sales person commission rate or status' })
  @ApiResponse({ status: 200, description: 'Sales person updated successfully' })
  @ApiResponse({ status: 404, description: 'Sales person not found' })
  async updateSalesPerson(@Param('id') id: string, @Body() dto: UpdateSalesPersonDto) {
    return this.adminService.updateSalesPerson(id, dto);
  }

  @Delete('sales/:id')
  @ApiOperation({ summary: 'Remove sales person', description: 'Remove sales person status from a user' })
  @ApiResponse({ status: 200, description: 'Sales person removed successfully' })
  @ApiResponse({ status: 404, description: 'Sales person not found' })
  async removeSalesPerson(@Param('id') id: string) {
    return this.adminService.removeSalesPerson(id);
  }

  // ============ Analytics ============

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get overview stats', description: 'Get overview statistics for dashboard' })
  @ApiResponse({ status: 200, description: 'Overview stats returned' })
  async getOverviewStats() {
    return this.adminService.getOverviewStats();
  }

  @Get('analytics/revenue')
  @ApiOperation({ summary: 'Get revenue stats', description: 'Get revenue statistics and trends' })
  @ApiResponse({ status: 200, description: 'Revenue stats returned' })
  async getRevenueStats() {
    return this.adminService.getRevenueStats();
  }
}
