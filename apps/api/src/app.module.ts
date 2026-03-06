import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ShopModule } from './shop/shop.module';
import { ProductModule } from './product/product.module';
import { TransactionModule } from './transaction/transaction.module';
import { CustomerModule } from './customer/customer.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/logger.config';
import { MorganMiddleware } from './middleware/morgan.middleware';
import { SentryModule } from '@sentry/nestjs/setup';
import { SentryMetricsService } from './config/sentry-metrics.service';
import { SentryMetricsInterceptor } from './interceptors/sentry-metrics.interceptor';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    SentryModule.forRoot(),
    PrismaModule,
    AuthModule,
    ShopModule,
    ProductModule,
    TransactionModule,
    CustomerModule,
    AdminModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MorganMiddleware,
    SentryMetricsService,
    SentryMetricsInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryMetricsInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}

