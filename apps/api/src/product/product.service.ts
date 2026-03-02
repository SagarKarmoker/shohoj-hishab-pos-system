import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyShopAccess(shopId: string, userId: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');
    if (shop.ownerId !== userId) throw new ForbiddenException('You do not have access to this shop');
    return shop;
  }

  async findByShop(shopId: string, userId: string) {
    await this.verifyShopAccess(shopId, userId);
    return this.prisma.product.findMany({
      where: { shopId },
      orderBy: { name: 'asc' },
    });
  }

  async create(
    shopId: string,
    userId: string,
    data: {
      name: string;
      code?: string;
      description?: string;
      category?: string;
      unit?: string;
      imageUrl?: string;
      price: number;
      costPrice?: number;
      stock?: number;
      minStock?: number;
    },
  ) {
    await this.verifyShopAccess(shopId, userId);
    return this.prisma.product.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        category: data.category,
        unit: data.unit ?? 'piece',
        imageUrl: data.imageUrl,
        price: data.price,
        costPrice: data.costPrice,
        stock: data.stock ?? 0,
        minStock: data.minStock ?? 0,
        shopId,
        sellerId: userId,
      },
    });
  }

  async update(
    shopId: string,
    productId: string,
    userId: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      category?: string;
      unit?: string;
      imageUrl?: string;
      price?: number;
      costPrice?: number;
      stock?: number;
      minStock?: number;
    },
  ) {
    await this.verifyShopAccess(shopId, userId);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, shopId },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.unit !== undefined && { unit: data.unit }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.minStock !== undefined && { minStock: data.minStock }),
      },
    });
  }
}
