import { ApiProperty } from '@nestjs/swagger';

export class UpdateShopDto {
  @ApiProperty({ description: 'Shop name', required: false })
  name?: string;

  @ApiProperty({ description: 'Shop address', required: false })
  address?: string;

  @ApiProperty({ description: 'Shop phone', required: false })
  phone?: string;
}
