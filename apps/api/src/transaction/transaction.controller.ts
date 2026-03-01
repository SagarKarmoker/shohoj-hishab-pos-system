import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Transactions')
@Controller('shops/:shopId/transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions', description: 'Get transactions for a shop with optional date filter' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(
    @Param('shopId') shopId: string,
    @Request() req: { user: { id: string } },
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('customerId') customerId?: string,
  ) {
    const options: { dateFrom?: Date; dateTo?: Date; customerId?: string } = {};
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);
    if (customerId) options.customerId = customerId;
    return this.transactionService.findByShop(shopId, req.user.id, options);
  }

  @Post()
  @ApiOperation({ summary: 'Create transaction', description: 'Create a new sale transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created' })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient stock' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Param('shopId') shopId: string,
    @Body() dto: CreateTransactionDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.transactionService.create(shopId, req.user.id, {
      items: dto.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      paymentMethod: dto.paymentMethod ?? 'cash',
      discount: dto.discount ?? 0,
      paidAmount: dto.paidAmount,
      customerId: dto.customerId,
      notes: dto.notes,
    });
  }
}
