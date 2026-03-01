import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async findByOwner(userId: string) {
    return this.prisma.shop.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(ownerId: string, data: { name: string; address?: string; phone?: string }) {
    return this.prisma.shop.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        ownerId,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
    });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    if (shop.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this shop');
    }
    return shop;
  }

  async getDashboard(shopId: string, userId: string) {
    await this.findOne(shopId, userId);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [todayTransactions, todayAggregates, lowStock, recentTransactions] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          shopId,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        select: {
          totalAmount: true,
          paidAmount: true,
          dueAmount: true,
          paymentMethod: true,
          customerId: true,
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          shopId,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        _sum: {
          totalAmount: true,
          paidAmount: true,
        },
        _count: true,
      }),
      this.prisma.$queryRaw<
        { id: string; name: string; stock: number; minStock: number; unit: string; category: string | null }[]
      >(
        Prisma.sql`
          SELECT id, name, stock, "minStock", unit, category
          FROM "Product"
          WHERE "shopId" = ${shopId}
            AND (( "minStock" > 0 AND stock <= "minStock" ) OR ( "minStock" = 0 AND stock < 10 ))
        `,
      ),
      this.prisma.transaction.findMany({
        where: { shopId },
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } },
        },
      }),
    ]);

    const totalSales = Number(todayAggregates._sum.totalAmount ?? 0);
    const cashCollected = todayTransactions
      .filter((t) => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + Number(t.paidAmount), 0);
    const creditCollected = todayTransactions
      .filter((t) => t.customerId != null)
      .reduce((sum, t) => sum + Number(t.paidAmount), 0);

    return {
      todaySummary: {
        totalSales,
        cashCollected,
        creditCollected,
        transactionCount: todayAggregates._count,
      },
      lowStock: lowStock.map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        minStock: p.minStock,
        unit: p.unit,
        category: p.category,
      })),
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        invoiceNumber: t.invoiceNumber,
        totalAmount: Number(t.totalAmount),
        paidAmount: Number(t.paidAmount),
        dueAmount: Number(t.dueAmount),
        paymentMethod: t.paymentMethod,
        createdAt: t.createdAt,
        customer: t.customer ? { name: t.customer.name } : null,
      })),
    };
  }
}
