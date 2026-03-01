import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer name' })
  name!: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'Email', required: false })
  email?: string;

  @ApiProperty({ description: 'Address', required: false })
  address?: string;
}
