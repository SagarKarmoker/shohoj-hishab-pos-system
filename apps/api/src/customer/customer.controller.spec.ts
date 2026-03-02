import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('CustomerController', () => {
  let controller: CustomerController;

  const mockCustomerService = {
    findByShop: jest.fn(),
    create: jest.fn(),
    collectPayment: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockReq = {
    user: mockUser,
  };

  const shopId = 'shop-123';

  const mockCustomer = {
    id: 'customer-123',
    name: 'Test Customer',
    phone: '+8801712345678',
    email: 'customer@example.com',
    address: 'Test Address',
    shopId,
    totalDue: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: mockCustomerService,
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);

    jest.clearAllMocks();
  });

  describe('GET /shops/:shopId/customers', () => {
    it('should return list of customers for a shop', async () => {
      const customers = [mockCustomer, { ...mockCustomer, id: 'customer-456', name: 'Another Customer' }];
      mockCustomerService.findByShop.mockResolvedValue(customers);

      const result = await controller.list(shopId, mockReq as any);

      expect(result).toEqual(customers);
      expect(mockCustomerService.findByShop).toHaveBeenCalledWith(shopId, mockUser.id);
    });

    it('should return empty array when shop has no customers', async () => {
      mockCustomerService.findByShop.mockResolvedValue([]);

      const result = await controller.list(shopId, mockReq as any);

      expect(result).toEqual([]);
    });

    it('should throw ForbiddenException when user does not own the shop', async () => {
      mockCustomerService.findByShop.mockRejectedValue(new ForbiddenException('You do not have permission'));

      await expect(controller.list(shopId, mockReq as any)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when shop does not exist', async () => {
      mockCustomerService.findByShop.mockRejectedValue(new NotFoundException('Shop not found'));

      await expect(controller.list('nonexistent-shop', mockReq as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('POST /shops/:shopId/customers', () => {
    const createCustomerDto = {
      name: 'New Customer',
      phone: '+8801712345679',
      email: 'newcustomer@example.com',
      address: 'New Customer Address',
    };

    it('should create a new customer', async () => {
      const createdCustomer = {
        ...mockCustomer,
        ...createCustomerDto,
        id: 'new-customer-123',
      };
      mockCustomerService.create.mockResolvedValue(createdCustomer);

      const result = await controller.create(shopId, createCustomerDto, mockReq as any);

      expect(result).toEqual(createdCustomer);
      expect(mockCustomerService.create).toHaveBeenCalledWith(shopId, mockUser.id, {
        name: createCustomerDto.name,
        phone: createCustomerDto.phone,
        email: createCustomerDto.email,
        address: createCustomerDto.address,
      });
    });

    it('should create customer with only required fields', async () => {
      const minimalDto = {
        name: 'Minimal Customer',
      };
      mockCustomerService.create.mockResolvedValue({
        ...mockCustomer,
        name: minimalDto.name,
        phone: undefined,
        email: undefined,
        address: undefined,
      });

      const result = await controller.create(shopId, minimalDto as any, mockReq as any);

      expect(result).toBeDefined();
      expect(result.name).toBe(minimalDto.name);
    });

    it('should create customer without email', async () => {
      const dtoWithoutEmail = {
        name: 'Customer Without Email',
        phone: '+8801712345680',
        address: 'Some Address',
      };
      mockCustomerService.create.mockResolvedValue({
        ...mockCustomer,
        ...dtoWithoutEmail,
        email: undefined,
      });

      const result = await controller.create(shopId, dtoWithoutEmail as any, mockReq as any);

      expect(result).toBeDefined();
      expect(result.email).toBeUndefined();
    });

    it('should throw BadRequestException for invalid input', async () => {
      mockCustomerService.create.mockRejectedValue(new BadRequestException('Invalid input'));

      await expect(controller.create(shopId, { name: '' } as any, mockReq as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException when user does not own the shop', async () => {
      mockCustomerService.create.mockRejectedValue(new ForbiddenException('You do not have permission'));

      await expect(controller.create(shopId, createCustomerDto, mockReq as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when shop does not exist', async () => {
      mockCustomerService.create.mockRejectedValue(new NotFoundException('Shop not found'));

      await expect(controller.create('nonexistent-shop', createCustomerDto, mockReq as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for duplicate phone number', async () => {
      mockCustomerService.create.mockRejectedValue(new BadRequestException('Phone number already exists'));

      await expect(controller.create(shopId, createCustomerDto, mockReq as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('POST /shops/:shopId/customers/:customerId/collect', () => {
    const customerId = 'customer-123';
    const collectPaymentDto = {
      amount: 500,
    };

    it('should collect payment from customer', async () => {
      const paymentResult = {
        id: 'payment-123',
        customerId,
        amount: collectPaymentDto.amount,
        collectedAt: new Date(),
        previousDue: 1000,
        remainingDue: 500,
      };
      mockCustomerService.collectPayment.mockResolvedValue(paymentResult);

      const result = await controller.collect(shopId, customerId, collectPaymentDto, mockReq as any);

      expect(result).toEqual(paymentResult);
      expect(mockCustomerService.collectPayment).toHaveBeenCalledWith(
        shopId,
        customerId,
        mockUser.id,
        collectPaymentDto.amount,
      );
    });

    it('should collect full payment and clear due', async () => {
      const fullPaymentResult = {
        id: 'payment-456',
        customerId,
        amount: 1000,
        collectedAt: new Date(),
        previousDue: 1000,
        remainingDue: 0,
      };
      mockCustomerService.collectPayment.mockResolvedValue(fullPaymentResult);

      const result = await controller.collect(shopId, customerId, { amount: 1000 }, mockReq as any);

      expect((result as any).remainingDue).toBe(0);
    });

    it('should throw BadRequestException for invalid amount', async () => {
      mockCustomerService.collectPayment.mockRejectedValue(new BadRequestException('Invalid amount'));

      await expect(controller.collect(shopId, customerId, { amount: -100 }, mockReq as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for amount greater than due', async () => {
      mockCustomerService.collectPayment.mockRejectedValue(
        new BadRequestException('Amount exceeds customer due'),
      );

      await expect(controller.collect(shopId, customerId, { amount: 9999 }, mockReq as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException when user does not own the shop', async () => {
      mockCustomerService.collectPayment.mockRejectedValue(new ForbiddenException('You do not have permission'));

      await expect(controller.collect(shopId, customerId, collectPaymentDto, mockReq as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      mockCustomerService.collectPayment.mockRejectedValue(new NotFoundException('Customer not found'));

      await expect(controller.collect(shopId, 'nonexistent-customer', collectPaymentDto, mockReq as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when shop does not exist', async () => {
      mockCustomerService.collectPayment.mockRejectedValue(new NotFoundException('Shop not found'));

      await expect(
        controller.collect('nonexistent-shop', customerId, collectPaymentDto, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for zero amount', async () => {
      mockCustomerService.collectPayment.mockRejectedValue(new BadRequestException('Amount must be greater than zero'));

      await expect(controller.collect(shopId, customerId, { amount: 0 }, mockReq as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
