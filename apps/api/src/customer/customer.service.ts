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

  async collectPayment(
    shopId: string,
    customerId: string,
    userId: string,
    amount: number,
    paymentMethod: string = 'cash',
    transactionIds?: string[],
    notes?: string,
  ) {
    await this.verifyShopAccess(shopId, userId);
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, shopId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    
    const currentDue = Number(customer.dueBalance);
    const collectAmount = Math.min(amount, currentDue);
    const newDue = Math.max(0, currentDue - collectAmount);

    let transactionsToLink: string[] = [];
    
    if (transactionIds && transactionIds.length > 0) {
      transactionsToLink = transactionIds;
    } else {
      const unpaidTransactions = await this.prisma.transaction.findMany({
        where: {
          customerId,
          dueAmount: { gt: new Decimal(0) },
        },
        orderBy: { createdAt: 'asc' },
        take: 100,
      });
      
      let remainingAmount = collectAmount;
      for (const tx of unpaidTransactions) {
        if (remainingAmount <= 0) break;
        const txDue = Number(tx.dueAmount);
        const paymentAmount = Math.min(txDue, remainingAmount);
        const newTxDue = Math.max(0, txDue - paymentAmount);
        
        await this.prisma.transaction.update({
          where: { id: tx.id },
          data: {
            dueAmount: new Decimal(newTxDue),
            paidAmount: new Decimal(Number(tx.paidAmount) + paymentAmount),
          },
        });
        
        transactionsToLink.push(tx.id);
        remainingAmount -= paymentAmount;
      }
    }

    const payment = await this.prisma.payment.create({
      data: {
        amount: new Decimal(collectAmount),
        paymentMethod,
        customerId,
        receivedById: userId,
        shopId,
        notes,
        transactions: {
          connect: transactionsToLink.map((id) => ({ id })),
        },
      },
      include: {
        transactions: true,
        customer: true,
        receivedBy: {
          select: { id: true, displayName: true, email: true },
        },
      },
    });

    await this.prisma.customer.update({
      where: { id: customerId },
      data: { dueBalance: new Decimal(newDue) },
    });

    return payment;
  }

  async getPaymentHistory(shopId: string, customerId: string, userId: string) {
    await this.verifyShopAccess(shopId, userId);
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, shopId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    return this.prisma.payment.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        receivedBy: { select: { displayName: true } },
        transactions: {
          select: { id: true, invoiceNumber: true },
        },
      },
    });
  }
}
