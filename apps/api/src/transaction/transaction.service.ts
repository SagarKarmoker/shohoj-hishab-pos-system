import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const { Decimal } = Prisma;

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyShopAccess(shopId: string, userId: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');
    if (shop.ownerId !== userId) throw new ForbiddenException('You do not have access to this shop');
    return shop;
  }

  async findByShop(
    shopId: string,
    userId: string,
    options?: { dateFrom?: Date; dateTo?: Date; customerId?: string },
  ) {
    await this.verifyShopAccess(shopId, userId);
    const where: { shopId: string; customerId?: string; createdAt?: { gte?: Date; lte?: Date } } = { shopId };
    if (options?.customerId) where.customerId = options.customerId;
    if (options?.dateFrom || options?.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = options.dateFrom;
      if (options.dateTo) where.createdAt.lte = options.dateTo;
    }
    return this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        customer: { select: { name: true } },
      },
    });
  }

  private async generateInvoiceNumber(shopId: string): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `INV-${today}-`;
    const last = await this.prisma.transaction.findFirst({
      where: { shopId, invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
    });
    const nextNum = last ? parseInt(last.invoiceNumber.slice(prefix.length), 10) + 1 : 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  }

  async create(
    shopId: string,
    userId: string,
    data: {
      items: { productId: string; quantity: number; unitPrice: number; totalPrice: number }[];
      paymentMethod?: string;
      discount?: number;
      paidAmount?: number;
      customerId?: string;
      notes?: string;
    },
  ) {
    await this.verifyShopAccess(shopId, userId);

    if (!data.items?.length) {
      throw new BadRequestException('At least one item is required');
    }

    const totalAmount = data.items.reduce((sum, i) => sum + i.totalPrice, 0);
    const discount = data.discount ?? 0;
    const paidAmount = data.paidAmount ?? totalAmount - discount;
    const dueAmount = Math.max(0, totalAmount - discount - paidAmount);

    const invoiceNumber = await this.generateInvoiceNumber(shopId);

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          invoiceNumber,
          totalAmount: new Decimal(totalAmount),
          discount: new Decimal(discount),
          paidAmount: new Decimal(paidAmount),
          dueAmount: new Decimal(dueAmount),
          paymentMethod: data.paymentMethod ?? 'cash',
          notes: data.notes,
          shopId,
          customerId: data.customerId,
          sellerId: userId,
        },
      });

      for (const item of data.items) {
        const qty = Math.round(item.quantity);
        if (qty <= 0) continue;

        const product = await tx.product.findFirst({
          where: { id: item.productId, shopId },
        });
        if (!product) throw new BadRequestException(`Product ${item.productId} not found`);

        const currentStock = product.stock;
        if (currentStock < qty) {
          throw new BadRequestException(`Insufficient stock for ${product.name}. Available: ${currentStock}`);
        }

        await tx.transactionItem.create({
          data: {
            quantity: qty,
            unitPrice: new Decimal(item.unitPrice),
            totalPrice: new Decimal(item.totalPrice),
            transactionId: transaction.id,
            productId: item.productId,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: currentStock - qty },
        });
      }

      if (data.customerId && dueAmount > 0) {
        const customer = await tx.customer.findFirst({
          where: { id: data.customerId, shopId },
        });
        if (customer) {
          await tx.customer.update({
            where: { id: data.customerId },
            data: {
              dueBalance: { increment: new Decimal(dueAmount) },
            },
          });
        }
      }

      return tx.transaction.findUnique({
        where: { id: transaction.id },
        include: { items: { include: { product: true } } },
      });
    });
  }
}
