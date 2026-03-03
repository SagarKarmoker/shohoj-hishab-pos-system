import { ApiProperty } from '@nestjs/swagger';

export class CollectPaymentDto {
  @ApiProperty({ description: 'Amount to collect' })
  amount!: number;

  @ApiProperty({ description: 'Payment method', required: false, default: 'cash' })
  paymentMethod?: string;

  @ApiProperty({ description: 'Specific transaction IDs to apply payment to', required: false })
  transactionIds?: string[];

  @ApiProperty({ description: 'Notes', required: false })
  notes?: string;
}
