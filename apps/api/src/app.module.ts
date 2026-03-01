import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ShopModule } from './shop/shop.module';
import { ProductModule } from './product/product.module';
import { TransactionModule } from './transaction/transaction.module';
import { CustomerModule } from './customer/customer.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/logger.config';
import { MorganMiddleware } from './middleware/morgan.middleware';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    PrismaModule,
    AuthModule,
    ShopModule,
    ProductModule,
    TransactionModule,
    CustomerModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, MorganMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}

