import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Shops')
@Controller('shops')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  @ApiOperation({ summary: 'List user shops', description: 'Get all shops owned by the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of shops' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(@Request() req: { user: { id: string } }) {
    return this.shopService.findByOwner(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create shop', description: 'Create a new shop for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Shop created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateShopDto, @Request() req: { user: { id: string } }) {
    return this.shopService.create(req.user.id, dto);
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get dashboard data', description: 'Get today summary, low stock, and recent transactions for a shop' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDashboard(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.shopService.getDashboard(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update shop', description: 'Update shop details (must be owner)' })
  @ApiResponse({ status: 200, description: 'Shop updated' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() dto: UpdateShopDto, @Request() req: { user: { id: string } }) {
    return this.shopService.update(id, req.user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shop', description: 'Get shop details by ID (must be owner)' })
  @ApiResponse({ status: 200, description: 'Shop details' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.shopService.findOne(id, req.user.id);
  }

  @Get(':id/monthly-collected')
  @ApiOperation({ summary: 'Get monthly collected payments', description: 'Get total credit payments collected this month' })
  @ApiResponse({ status: 200, description: 'Monthly collected amount' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMonthlyCollected(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.shopService.getMonthlyCollected(id, req.user.id);
  }
}
