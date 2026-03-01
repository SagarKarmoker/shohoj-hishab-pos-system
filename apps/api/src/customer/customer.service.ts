import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const { Decimal } = Prisma;

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyShopAccess(shopId: string, userId: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');
    if (shop.ownerId !== userId) throw new ForbiddenException('You do not have access to this shop');
    return shop;
  }

  async findByShop(shopId: string, userId: string) {
    await this.verifyShopAccess(shopId, userId);
    return this.prisma.customer.findMany({
      where: { shopId },
      orderBy: { dueBalance: 'desc' },
      include: {
        transactions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            paidAmount: true,
            dueAmount: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async create(
    shopId: string,
    userId: string,
    data: { name: string; phone?: string; email?: string; address?: string },
  ) {
    await this.verifyShopAccess(shopId, userId);
    return this.prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        shopId,
        ownerId: userId,
      },
    });
  }

  async collectPayment(shopId: string, customerId: string, userId: string, amount: number) {
    await this.verifyShopAccess(shopId, userId);
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, shopId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    const currentDue = Number(customer.dueBalance);
    const collectAmount = Math.min(amount, currentDue);
    const newDue = Math.max(0, currentDue - collectAmount);
    return this.prisma.customer.update({
      where: { id: customerId },
      data: { dueBalance: new Decimal(newDue) },
    });
  }
}
