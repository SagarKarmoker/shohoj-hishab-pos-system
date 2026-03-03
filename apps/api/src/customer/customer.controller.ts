import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CollectPaymentDto } from './dto/collect-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@Controller('shops/:shopId/customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get(':customerId/payments')
  @ApiOperation({ summary: 'Get payment history', description: 'Get all payments for a customer' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getPaymentHistory(
    @Param('shopId') shopId: string,
    @Param('customerId') customerId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.customerService.getPaymentHistory(shopId, customerId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List customers', description: 'Get all customers for a shop' })
  @ApiResponse({ status: 200, description: 'List of customers' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(@Param('shopId') shopId: string, @Request() req: { user: { id: string } }) {
    return this.customerService.findByShop(shopId, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create customer', description: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Param('shopId') shopId: string,
    @Body() dto: CreateCustomerDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.customerService.create(shopId, req.user.id, {
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
    });
  }

  @Post(':customerId/collect')
  @ApiOperation({ summary: 'Collect payment', description: 'Record payment against customer due' })
  @ApiResponse({ status: 200, description: 'Payment collected' })
  @ApiResponse({ status: 400, description: 'Invalid amount' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async collect(
    @Param('shopId') shopId: string,
    @Param('customerId') customerId: string,
    @Body() dto: CollectPaymentDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.customerService.collectPayment(
      shopId,
      customerId,
      req.user.id,
      dto.amount,
      dto.paymentMethod,
      dto.transactionIds,
      dto.notes,
    );
  }
}
