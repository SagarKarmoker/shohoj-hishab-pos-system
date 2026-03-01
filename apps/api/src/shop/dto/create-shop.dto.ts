import { ApiProperty } from '@nestjs/swagger';

export class CreateShopDto {
  @ApiProperty({ description: 'Shop name', example: 'Rahim General Store' })
  name!: string;

  @ApiProperty({ description: 'Shop address', required: false, example: 'Mirpur, Dhaka' })
  address?: string;

  @ApiProperty({ description: 'Shop phone', required: false, example: '+8801712345678' })
  phone?: string;
}
