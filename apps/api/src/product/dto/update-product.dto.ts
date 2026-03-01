import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({ description: 'Product name', required: false })
  name?: string;

  @ApiProperty({ description: 'Product code', required: false })
  code?: string;

  @ApiProperty({ description: 'Product description', required: false })
  description?: string;

  @ApiProperty({ description: 'Product category', required: false })
  category?: string;

  @ApiProperty({ description: 'Unit', required: false })
  unit?: string;

  @ApiProperty({ description: 'Selling price', required: false })
  price?: number;

  @ApiProperty({ description: 'Cost price', required: false })
  costPrice?: number;

  @ApiProperty({ description: 'Stock quantity', required: false })
  stock?: number;

  @ApiProperty({ description: 'Minimum stock threshold', required: false })
  minStock?: number;
}
