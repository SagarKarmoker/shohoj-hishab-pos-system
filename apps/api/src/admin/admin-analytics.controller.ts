import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminAnalyticsService, type DashboardStats, type RevenueStats, type UserGrowthStats, type SalesStats } from './admin-analytics.service';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

@ApiTags('Admin Analytics')
@Controller('admin/analytics')
@UseGuards(AuthGuard('jwt'), AdminRoleGuard)
@ApiBearerAuth('JWT-auth')
export class AdminAnalyticsController {
  constructor(private analyticsService: AdminAnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Get dashboard overview stats', 
    description: 'Get comprehensive dashboard statistics including user counts, revenue, and recent activity' 
  })
  @ApiResponse({ status: 200, description: 'Dashboard stats returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDashboardStats(): Promise<DashboardStats> {
    return this.analyticsService.getDashboardStats();
  }

  @Get('revenue')
  @ApiOperation({ 
    summary: 'Get revenue analytics', 
    description: 'Get revenue statistics with daily breakdown and plan distribution' 
  })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    type: Number, 
    description: 'Number of days to analyze (default: 30, max: 365)',
    example: 30 
  })
  @ApiResponse({ status: 200, description: 'Revenue stats returned successfully' })
  async getRevenueStats(@Query('period') period?: string): Promise<RevenueStats> {
    const periodDays = Math.min(parseInt(period || '30', 10), 365);
    return this.analyticsService.getRevenueStats(periodDays);
  }

  @Get('users')
  @ApiOperation({ 
    summary: 'Get user growth analytics', 
    description: 'Get user signup trends and growth statistics' 
  })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    type: Number, 
    description: 'Number of days to analyze (default: 30, max: 365)',
    example: 30 
  })
  @ApiResponse({ status: 200, description: 'User growth stats returned successfully' })
  async getUserGrowthStats(@Query('period') period?: string): Promise<UserGrowthStats> {
    const periodDays = Math.min(parseInt(period || '30', 10), 365);
    return this.analyticsService.getUserGrowthStats(periodDays);
  }

  @Get('sales')
  @ApiOperation({ 
    summary: 'Get sales performance analytics', 
    description: 'Get sales statistics including top performers and monthly trends' 
  })
  @ApiResponse({ status: 200, description: 'Sales stats returned successfully' })
  async getSalesStats(): Promise<SalesStats> {
    return this.analyticsService.getSalesStats();
  }

  @Get('users/:id/details')
  @ApiOperation({ 
    summary: 'Get detailed user information', 
    description: 'Get comprehensive user details including shops, transactions, login history, and activity' 
  })
  @ApiResponse({ status: 200, description: 'User details returned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserDetails(@Param('id') userId: string) {
    return this.analyticsService.getUserDetails(userId);
  }
}
