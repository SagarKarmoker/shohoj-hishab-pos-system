import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name' })
  name!: string;

  @ApiProperty({ description: 'Product code (optional)', required: false })
  code?: string;

  @ApiProperty({ description: 'Product description', required: false })
  description?: string;

  @ApiProperty({ description: 'Product category', required: false })
  category?: string;

  @ApiProperty({ description: 'Unit (e.g. kg, piece, liter)', default: 'piece' })
  unit?: string;

  @ApiProperty({ description: 'Product image URL (optional)', required: false })
  imageUrl?: string;

  @ApiProperty({ description: 'Selling price' })
  price!: number;

  @ApiProperty({ description: 'Cost price', required: false })
  costPrice?: number;

  @ApiProperty({ description: 'Initial stock', default: 0 })
  stock?: number;

  @ApiProperty({ description: 'Minimum stock alert threshold', default: 0 })
  minStock?: number;
}
