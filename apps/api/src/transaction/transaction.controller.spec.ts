import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('TransactionController', () => {
  let controller: TransactionController;

  const mockTransactionService = {
    findByShop: jest.fn(),
    create: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockReq = {
    user: mockUser,
  };

  const shopId = 'shop-123';

  const mockTransaction = {
    id: 'transaction-123',
    shopId,
    customerId: 'customer-123',
    invoiceNumber: 'INV-001',
    totalAmount: 500,
    discount: 0,
    paidAmount: 500,
    dueAmount: 0,
    paymentMethod: 'cash',
    notes: 'Test transaction',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);

    jest.clearAllMocks();
  });

  describe('GET /shops/:shopId/transactions', () => {
    it('should return list of transactions for a shop', async () => {
      const transactions = [mockTransaction, { ...mockTransaction, id: 'transaction-456', invoiceNumber: 'INV-002' }];
      mockTransactionService.findByShop.mockResolvedValue(transactions);

      const result = await controller.list(shopId, mockReq as any);

      expect(result).toEqual(transactions);
      expect(mockTransactionService.findByShop).toHaveBeenCalledWith(shopId, mockUser.id, {});
    });

    it('should return empty array when shop has no transactions', async () => {
      mockTransactionService.findByShop.mockResolvedValue([]);

      const result = await controller.list(shopId, mockReq as any);

      expect(result).toEqual([]);
    });

    it('should filter transactions by date range', async () => {
      const dateFrom = '2024-01-01';
      const dateTo = '2024-01-31';
      mockTransactionService.findByShop.mockResolvedValue([mockTransaction]);

      await controller.list(shopId, mockReq as any, dateFrom, dateTo);

      expect(mockTransactionService.findByShop).toHaveBeenCalledWith(
        shopId,
        mockUser.id,
        expect.objectContaining({
          dateFrom: new Date(dateFrom),
          dateTo: new Date(dateTo),
        }),
      );
    });

    it('should filter transactions by customer', async () => {
      const customerId = 'customer-123';
      mockTransactionService.findByShop.mockResolvedValue([mockTransaction]);

      await controller.list(shopId, mockReq as any, undefined, undefined, customerId);

      expect(mockTransactionService.findByShop).toHaveBeenCalledWith(
        shopId,
        mockUser.id,
        expect.objectContaining({ customerId }),
      );
    });

    it('should filter transactions by date range and customer', async () => {
      const dateFrom = '2024-01-01';
      const dateTo = '2024-01-31';
      const customerId = 'customer-123';
      mockTransactionService.findByShop.mockResolvedValue([mockTransaction]);

      await controller.list(shopId, mockReq as any, dateFrom, dateTo, customerId);

      expect(mockTransactionService.findByShop).toHaveBeenCalledWith(
        shopId,
        mockUser.id,
        expect.objectContaining({
          dateFrom: new Date(dateFrom),
          dateTo: new Date(dateTo),
          customerId,
        }),
      );
    });

    it('should throw ForbiddenException when user does not own the shop', async () => {
      mockTransactionService.findByShop.mockRejectedValue(new ForbiddenException('You do not have permission'));

      await expect(controller.list(shopId, mockReq as any)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when shop does not exist', async () => {
      mockTransactionService.findByShop.mockRejectedValue(new NotFoundException('Shop not found'));

      await expect(controller.list('nonexistent-shop', mockReq as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('POST /shops/:shopId/transactions', () => {
    const createTransactionDto = {
      items: [
        {
          productId: 'product-123',
          quantity: 2,
          unitPrice: 100,
          totalPrice: 200,
        },
        {
          productId: 'product-456',
          quantity: 3,
          unitPrice: 100,
          totalPrice: 300,
        },
      ],
      paymentMethod: 'cash',
      discount: 0,
      paidAmount: 500,
      customerId: 'customer-123',
      notes: 'Test sale',
    };

    it('should create a new transaction with all fields', async () => {
      const createdTransaction = {
        ...mockTransaction,
        ...createTransactionDto,
        id: 'new-transaction-123',
      };
      mockTransactionService.create.mockResolvedValue(createdTransaction);

      const result = await controller.create(shopId, createTransactionDto, mockReq as any);

      expect(result).toEqual(createdTransaction);
      expect(mockTransactionService.create).toHaveBeenCalledWith(shopId, mockUser.id, {
        items: createTransactionDto.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })),
        paymentMethod: createTransactionDto.paymentMethod,
        discount: createTransactionDto.discount,
        paidAmount: createTransactionDto.paidAmount,
        customerId: createTransactionDto.customerId,
        notes: createTransactionDto.notes,
      });
    });

    it('should create transaction with default payment method', async () => {
      const dtoWithoutPaymentMethod = {
        items: [
          {
            productId: 'product-123',
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
          },
        ],
        paidAmount: 100,
      };
      mockTransactionService.create.mockResolvedValue({
        ...mockTransaction,
        paymentMethod: 'cash',
      });

      await controller.create(shopId, dtoWithoutPaymentMethod as any, mockReq as any);

      expect(mockTransactionService.create).toHaveBeenCalledWith(
        shopId,
        mockUser.id,
        expect.objectContaining({ paymentMethod: 'cash' }),
      );
    });

    it('should create transaction with default discount of 0', async () => {
      const dtoWithoutDiscount = {
        items: [
          {
            productId: 'product-123',
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
          },
        ],
        paidAmount: 100,
      };
      mockTransactionService.create.mockResolvedValue({
        ...mockTransaction,
        discount: 0,
      });

      await controller.create(shopId, dtoWithoutDiscount as any, mockReq as any);

      expect(mockTransactionService.create).toHaveBeenCalledWith(
        shopId,
        mockUser.id,
        expect.objectContaining({ discount: 0 }),
      );
    });

    it('should create cash sale without customer', async () => {
      const cashSaleDto = {
        items: [
          {
            productId: 'product-123',
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
          },
        ],
        paymentMethod: 'cash',
        paidAmount: 100,
      };
      mockTransactionService.create.mockResolvedValue({
        ...mockTransaction,
        customerId: null,
        paymentMethod: 'cash',
      });

      await controller.create(shopId, cashSaleDto as any, mockReq as any);

      expect(mockTransactionService.create).toHaveBeenCalledWith(
        shopId,
        mockUser.id,
        expect.objectContaining({ customerId: undefined }),
      );
    });

    it('should create credit sale with customer', async () => {
      const creditSaleDto = {
        items: [
          {
            productId: 'product-123',
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
          },
        ],
        paymentMethod: 'credit',
        paidAmount: 50,
        customerId: 'customer-123',
      };
      mockTransactionService.create.mockResolvedValue({
        ...mockTransaction,
        customerId: 'customer-123',
        paidAmount: 50,
        dueAmount: 50,
      });

      const result = await controller.create(shopId, creditSaleDto as any, mockReq as any);

      expect(result?.customerId).toBe('customer-123');
    });

    it('should create transaction without notes', async () => {
      const dtoWithoutNotes = {
        items: [
          {
            productId: 'product-123',
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
          },
        ],
        paidAmount: 100,
      };
      mockTransactionService.create.mockResolvedValue({
        ...mockTransaction,
        notes: undefined,
      });

      await controller.create(shopId, dtoWithoutNotes as any, mockReq as any);

      expect(mockTransactionService.create).toHaveBeenCalledWith(
        shopId,
        mockUser.id,
        expect.objectContaining({ notes: undefined }),
      );
    });

    it('should throw BadRequestException for empty items array', async () => {
      mockTransactionService.create.mockRejectedValue(new BadRequestException('Items cannot be empty'));

      await expect(
        controller.create(shopId, { items: [], paidAmount: 0 } as any, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for insufficient stock', async () => {
      mockTransactionService.create.mockRejectedValue(new BadRequestException('Insufficient stock for product'));

      await expect(
        controller.create(
          shopId,
          {
            items: [
              {
                productId: 'product-123',
                quantity: 999,
                unitPrice: 100,
                totalPrice: 99900,
              },
            ],
            paidAmount: 99900,
          } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid product', async () => {
      mockTransactionService.create.mockRejectedValue(new BadRequestException('Invalid product'));

      await expect(
        controller.create(
          shopId,
          {
            items: [
              {
                productId: 'invalid-product',
                quantity: 1,
                unitPrice: 100,
                totalPrice: 100,
              },
            ],
            paidAmount: 100,
          } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when paidAmount exceeds total', async () => {
      mockTransactionService.create.mockRejectedValue(
        new BadRequestException('Paid amount cannot exceed total amount'),
      );

      await expect(
        controller.create(
          shopId,
          {
            items: [
              {
                productId: 'product-123',
                quantity: 1,
                unitPrice: 100,
                totalPrice: 100,
              },
            ],
            paidAmount: 200,
          } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user does not own the shop', async () => {
      mockTransactionService.create.mockRejectedValue(new ForbiddenException('You do not have permission'));

      await expect(controller.create(shopId, createTransactionDto, mockReq as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when shop does not exist', async () => {
      mockTransactionService.create.mockRejectedValue(new NotFoundException('Shop not found'));

      await expect(
        controller.create('nonexistent-shop', createTransactionDto, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      mockTransactionService.create.mockRejectedValue(new NotFoundException('Customer not found'));

      await expect(
        controller.create(
          shopId,
          {
            ...createTransactionDto,
            customerId: 'nonexistent-customer',
          },
          mockReq as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for negative discount', async () => {
      mockTransactionService.create.mockRejectedValue(new BadRequestException('Discount cannot be negative'));

      await expect(
        controller.create(
          shopId,
          {
            items: [
              {
                productId: 'product-123',
                quantity: 1,
                unitPrice: 100,
                totalPrice: 100,
              },
            ],
            discount: -10,
            paidAmount: 90,
          } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for negative quantity', async () => {
      mockTransactionService.create.mockRejectedValue(new BadRequestException('Quantity must be positive'));

      await expect(
        controller.create(
          shopId,
          {
            items: [
              {
                productId: 'product-123',
                quantity: -1,
                unitPrice: 100,
                totalPrice: -100,
              },
            ],
            paidAmount: 0,
          } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
