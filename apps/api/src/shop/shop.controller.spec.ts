import { Test, TestingModule } from '@nestjs/testing';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('ShopController', () => {
  let controller: ShopController;

  const mockShopService = {
    findByOwner: jest.fn(),
    create: jest.fn(),
    getDashboard: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockReq = {
    user: mockUser,
  };

  const mockShop = {
    id: 'shop-123',
    name: 'Test Shop',
    address: 'Test Address',
    phone: '+8801712345678',
    ownerId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopController],
      providers: [
        {
          provide: ShopService,
          useValue: mockShopService,
        },
      ],
    }).compile();

    controller = module.get<ShopController>(ShopController);

    jest.clearAllMocks();
  });

  describe('GET /shops', () => {
    it('should return list of shops owned by the user', async () => {
      const shops = [mockShop, { ...mockShop, id: 'shop-456', name: 'Second Shop' }];
      mockShopService.findByOwner.mockResolvedValue(shops);

      const result = await controller.list(mockReq as any);

      expect(result).toEqual(shops);
      expect(mockShopService.findByOwner).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return empty array when user has no shops', async () => {
      mockShopService.findByOwner.mockResolvedValue([]);

      const result = await controller.list(mockReq as any);

      expect(result).toEqual([]);
    });

    it('should return shops sorted by creation date', async () => {
      const shops = [
        { ...mockShop, createdAt: new Date('2024-01-01') },
        { ...mockShop, id: 'shop-456', createdAt: new Date('2024-01-15') },
      ];
      mockShopService.findByOwner.mockResolvedValue(shops);

      const result = await controller.list(mockReq as any);

      expect(result).toHaveLength(2);
    });
  });

  describe('POST /shops', () => {
    const createShopDto = {
      name: 'New Shop',
      address: 'New Shop Address',
      phone: '+8801712345679',
    };

    it('should create a new shop with all fields', async () => {
      const createdShop = {
        ...mockShop,
        ...createShopDto,
        id: 'new-shop-123',
      };
      mockShopService.create.mockResolvedValue(createdShop);

      const result = await controller.create(createShopDto, mockReq as any);

      expect(result).toEqual(createdShop);
      expect(mockShopService.create).toHaveBeenCalledWith(mockUser.id, createShopDto);
    });

    it('should create shop with only required fields', async () => {
      const minimalDto = {
        name: 'Minimal Shop',
      };
      mockShopService.create.mockResolvedValue({
        ...mockShop,
        name: minimalDto.name,
        address: undefined,
        phone: undefined,
      });

      const result = await controller.create(minimalDto as any, mockReq as any);

      expect(result).toBeDefined();
      expect((result as any).name).toBe(minimalDto.name);
    });

    it('should create shop without phone', async () => {
      const dtoWithoutPhone = {
        name: 'Shop Without Phone',
        address: 'Some Address',
      };
      mockShopService.create.mockResolvedValue({
        ...mockShop,
        name: dtoWithoutPhone.name,
        address: dtoWithoutPhone.address,
        phone: undefined,
      });

      const result = await controller.create(dtoWithoutPhone as any, mockReq as any);

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for empty shop name', async () => {
      mockShopService.create.mockRejectedValue(new BadRequestException('Shop name is required'));

      await expect(controller.create({ name: '' } as any, mockReq as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for shop name too long', async () => {
      mockShopService.create.mockRejectedValue(new BadRequestException('Shop name too long'));

      await expect(
        controller.create({ name: 'a'.repeat(101) } as any, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid phone format', async () => {
      mockShopService.create.mockRejectedValue(new BadRequestException('Invalid phone format'));

      await expect(
        controller.create({ name: 'Test Shop', phone: 'invalid-phone' } as any, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('GET /shops/:id/dashboard', () => {
    it('should return dashboard data for a shop', async () => {
      const dashboardData = {
        todaySummary: {
          totalSales: 5000,
          cashCollected: 3000,
          creditCollected: 2000,
          transactionCount: 10,
        },
        lowStock: [
          { id: 'product-1', name: 'Low Stock Product', stock: 2, minStock: 10 },
        ],
        recentTransactions: [],
      };
      mockShopService.getDashboard.mockResolvedValue(dashboardData);

      const result = await controller.getDashboard('shop-123', mockReq as any);

      expect(result).toEqual(dashboardData);
      expect(mockShopService.getDashboard).toHaveBeenCalledWith('shop-123', mockUser.id);
    });

    it('should return dashboard with zero sales for new shop', async () => {
      const emptyDashboard = {
        todaySummary: {
          totalSales: 0,
          cashCollected: 0,
          creditCollected: 0,
          transactionCount: 0,
        },
        lowStock: [],
        recentTransactions: [],
      };
      mockShopService.getDashboard.mockResolvedValue(emptyDashboard);

      const result = await controller.getDashboard('shop-123', mockReq as any);

      expect(result.todaySummary.totalSales).toBe(0);
      expect((result as any).todaySummary.transactionCount).toBe(0);
    });

    it('should return products below minimum stock', async () => {
      const dashboardWithLowStock = {
        todaySummary: { totalSales: 1000, cashCollected: 800, creditCollected: 200, transactionCount: 5 },
        lowStock: [
          { id: 'p1', name: 'Product 1', stock: 1, minStock: 10 },
          { id: 'p2', name: 'Product 2', stock: 5, minStock: 20 },
        ],
        recentTransactions: [],
      };
      mockShopService.getDashboard.mockResolvedValue(dashboardWithLowStock);

      const result = await controller.getDashboard('shop-123', mockReq as any);

      expect(result.lowStock).toHaveLength(2);
    });

    it('should throw ForbiddenException when user does not own the shop', async () => {
      mockShopService.getDashboard.mockRejectedValue(new ForbiddenException('You do not have permission'));

      await expect(controller.getDashboard('shop-123', mockReq as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when shop does not exist', async () => {
      mockShopService.getDashboard.mockRejectedValue(new NotFoundException('Shop not found'));

      await expect(controller.getDashboard('nonexistent-shop', mockReq as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('PATCH /shops/:id', () => {
    const updateShopDto = {
      name: 'Updated Shop Name',
      address: 'Updated Address',
    };

    it('should update shop successfully', async () => {
      const updatedShop = {
        ...mockShop,
        ...updateShopDto,
      };
      mockShopService.update.mockResolvedValue(updatedShop);

      const result = await controller.update('shop-123', updateShopDto, mockReq as any);

      expect(result).toEqual(updatedShop);
      expect(mockShopService.update).toHaveBeenCalledWith('shop-123', mockUser.id, updateShopDto);
    });

    it('should update only shop name', async () => {
      const nameUpdate = { name: 'New Name Only' };
      mockShopService.update.mockResolvedValue({
        ...mockShop,
        name: nameUpdate.name,
      });

      const result = await controller.update('shop-123', nameUpdate, mockReq as any);

      expect((result as any).name).toBe(nameUpdate.name);
    });

    it('should update shop phone', async () => {
      const phoneUpdate = { phone: '+8801712345670' };
      mockShopService.update.mockResolvedValue({
        ...mockShop,
        phone: phoneUpdate.phone,
      });

      const result = await controller.update('shop-123', phoneUpdate, mockReq as any);

      expect((result as any).phone).toBe(phoneUpdate.phone);
    });

    it('should throw BadRequestException for invalid update data', async () => {
      mockShopService.update.mockRejectedValue(new BadRequestException('Invalid input'));

      await expect(
        controller.update('shop-123', { name: '' } as any, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user does not own the shop', async () => {
      mockShopService.update.mockRejectedValue(new ForbiddenException('You do not have permission'));

      await expect(controller.update('shop-123', updateShopDto, mockReq as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when shop does not exist', async () => {
      mockShopService.update.mockRejectedValue(new NotFoundException('Shop not found'));

      await expect(
        controller.update('nonexistent-shop', updateShopDto, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /shops/:id', () => {
    it('should return shop details by ID', async () => {
      mockShopService.findOne.mockResolvedValue(mockShop);

      const result = await controller.getOne('shop-123', mockReq as any);

      expect(result).toEqual(mockShop);
      expect(mockShopService.findOne).toHaveBeenCalledWith('shop-123', mockUser.id);
    });

    it('should return shop with all details', async () => {
      const detailedShop = {
        ...mockShop,
        products: [],
        customers: [],
        transactions: [],
      };
      mockShopService.findOne.mockResolvedValue(detailedShop);

      const result = await controller.getOne('shop-123', mockReq as any);

      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException when user does not own the shop', async () => {
      mockShopService.findOne.mockRejectedValue(new ForbiddenException('You do not have permission'));

      await expect(controller.getOne('shop-123', mockReq as any)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when shop does not exist', async () => {
      mockShopService.findOne.mockRejectedValue(new NotFoundException('Shop not found'));

      await expect(controller.getOne('nonexistent-shop', mockReq as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
