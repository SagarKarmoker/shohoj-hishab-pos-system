import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAnalyticsService } from './admin-analytics.service';
import { SalesDashboardController } from './sales-dashboard.controller';
import { SalesDashboardService } from './sales-dashboard.service';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { SalesRoleGuard } from '../auth/guards/sales-role.guard';

@Module({
  controllers: [AdminController, AdminAnalyticsController, SalesDashboardController],
  providers: [AdminService, AdminAnalyticsService, SalesDashboardService, AdminRoleGuard, SalesRoleGuard],
  exports: [AdminService, AdminAnalyticsService, SalesDashboardService],
})
export class AdminModule {}
