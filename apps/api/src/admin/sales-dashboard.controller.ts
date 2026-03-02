import { Controller, Get, Post, Query, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { SalesDashboardService, type SalesDashboardStats, type SalesPerformanceData, type CustomerListItem } from './sales-dashboard.service';
import { SalesRoleGuard } from '../auth/guards/sales-role.guard';

class SalesCreateCustomerDto {
  @ApiProperty({ description: 'Customer email' })
  email!: string;

  @ApiProperty({ description: 'Customer display name', required: false })
  displayName?: string;

  @ApiProperty({ description: 'Customer phone number', required: false })
  phoneNumber?: string;

  @ApiProperty({ description: 'Subscription plan ID' })
  planId!: string;
}

@ApiTags('Sales Dashboard')
@Controller('sales')
@UseGuards(AuthGuard('jwt'), SalesRoleGuard)
@ApiBearerAuth('JWT-auth')
export class SalesDashboardController {
  constructor(private salesDashboardService: SalesDashboardService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get sales person dashboard stats',
    description: 'Get personal sales statistics including total sales, commission, and customer count',
  })
  @ApiResponse({ status: 200, description: 'Dashboard stats returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Sales role required' })
  async getDashboardStats(@Request() req: { user: { salesPersonId: string } }): Promise<SalesDashboardStats> {
    return this.salesDashboardService.getDashboardStats(req.user.salesPersonId);
  }

  @Get('performance')
  @ApiOperation({
    summary: 'Get sales performance data',
    description: 'Get daily sales trends and monthly comparison for charts',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: 'Number of days to analyze (default: 30, max: 90)',
    example: 30,
  })
  @ApiResponse({ status: 200, description: 'Performance data returned successfully' })
  async getPerformanceData(
    @Request() req: { user: { salesPersonId: string } },
    @Query('period') period?: string,
  ): Promise<SalesPerformanceData> {
    const periodDays = Math.min(parseInt(period || '30', 10), 90);
    return this.salesDashboardService.getPerformanceData(req.user.salesPersonId, periodDays);
  }

  @Get('customers')
  @ApiOperation({
    summary: 'Get customers created by sales person',
    description: 'Get paginated list of users created by this sales person',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Customers list returned successfully' })
  async getMyCustomers(
    @Request() req: { user: { id: string } },
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: CustomerListItem[]; total: number }> {
    return this.salesDashboardService.getMyCustomers(req.user.id, {
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Post('customers')
  @ApiOperation({
    summary: 'Create a new customer',
    description: 'Create a new user (shop owner) and record the sale',
  })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async createCustomer(
    @Request() req: { user: { id: string } },
    @Body() dto: SalesCreateCustomerDto,
  ): Promise<CustomerListItem> {
    return this.salesDashboardService.createCustomer(req.user.id, dto);
  }
}
