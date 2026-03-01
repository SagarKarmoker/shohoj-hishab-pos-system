import { ApiProperty } from '@nestjs/swagger';

export class CollectPaymentDto {
  @ApiProperty({ description: 'Amount to collect' })
  amount!: number;
}
