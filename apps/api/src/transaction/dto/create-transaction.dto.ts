import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionItemDto {
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @ApiProperty({ description: 'Quantity' })
  quantity!: number;

  @ApiProperty({ description: 'Unit price' })
  unitPrice!: number;

  @ApiProperty({ description: 'Total price for this line' })
  totalPrice!: number;
}

export class CreateTransactionDto {
  @ApiProperty({ description: 'Transaction items', type: [CreateTransactionItemDto] })
  items!: CreateTransactionItemDto[];

  @ApiProperty({ description: 'Payment method', default: 'cash' })
  paymentMethod?: string;

  @ApiProperty({ description: 'Discount amount', default: 0 })
  discount?: number;

  @ApiProperty({ description: 'Amount paid (defaults to total)' })
  paidAmount?: number;

  @ApiProperty({ description: 'Customer ID for credit sales', required: false })
  customerId?: string;

  @ApiProperty({ description: 'Notes', required: false })
  notes?: string;
}
