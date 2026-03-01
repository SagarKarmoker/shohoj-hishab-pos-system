import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@Controller('shops/:shopId/products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List products', description: 'Get all products for a shop' })
  @ApiResponse({ status: 200, description: 'List of products' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(@Param('shopId') shopId: string, @Request() req: { user: { id: string } }) {
    return this.productService.findByShop(shopId, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create product', description: 'Create a new product for a shop' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Param('shopId') shopId: string,
    @Body() dto: CreateProductDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.productService.create(shopId, req.user.id, {
      name: dto.name,
      code: dto.code,
      description: dto.description,
      category: dto.category,
      unit: dto.unit ?? 'piece',
      price: dto.price,
      costPrice: dto.costPrice,
      stock: dto.stock ?? 0,
      minStock: dto.minStock ?? 0,
    });
  }

  @Patch(':productId')
  @ApiOperation({ summary: 'Update product', description: 'Update product details or stock' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('shopId') shopId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.productService.update(shopId, productId, req.user.id, dto);
  }
}
