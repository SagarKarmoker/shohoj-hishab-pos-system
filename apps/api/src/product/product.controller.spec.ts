import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductController', () => {
  let controller: ProductController;

  const mockProductService = {
    findByShop: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockReq = {
    user: mockUser,
  };

  const shopId = 'shop-123';

  const mockProduct = {
    id: 'product-123',
    name: 'Test Product',
    code: 'PROD001',
    description: 'Test Description',
    category: 'Test Category',
    unit: 'piece',
    price: 100,
    costPrice: 80,
    stock: 50,
    minStock: 10,
    shopId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);

    jest.clearAllMocks();
  });

  describe('GET /shops/:shopId/products', () => {
    it('should return list of products for a shop', async () => {
      const products = [mockProduct, { ...mockProduct, id: 'product-456', name: 'Another Product' }];
      mockProductService.findByShop.mockResolvedValue(products);

      const result = await controller.list(shopId, mockReq as any);

      expect(result).toEqual(products);
      expect(mockProductService.findByShop).toHaveBeenCalledWith(shopId, mockUser.id);
    });

    it('should return empty array when shop has no products', async () => {
      mockProductService.findByShop.mockResolvedValue([]);

      const result = await controller.list(shopId, mockReq as any);

      expect(result).toEqual([]);
    });

    it('should throw ForbiddenException when user does not own the shop', async () => {
      mockProductService.findByShop.mockRejectedValue(new ForbiddenException('You do not have permission'));

      await expect(controller.list(shopId, mockReq as any)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when shop does not exist', async () => {
      mockProductService.findByShop.mockRejectedValue(new NotFoundException('Shop not found'));

      await expect(controller.list('nonexistent-shop', mockReq as any)).rejects.toThrow(NotFoundException);
    });

    it('should include products with zero stock', async () => {
      const productsWithZeroStock = [{ ...mockProduct, stock: 0 }];
      mockProductService.findByShop.mockResolvedValue(productsWithZeroStock);

      const result = await controller.list(shopId, mockReq as any);

      expect(result).toHaveLength(1);
      expect((result as any)[0].stock).toBe(0);
    });
  });

  describe('POST /shops/:shopId/products', () => {
    const createProductDto = {
      name: 'New Product',
      code: 'PROD002',
      description: 'New Product Description',
      category: 'Electronics',
      unit: 'piece',
      price: 200,
      costPrice: 150,
      stock: 100,
      minStock: 20,
    };

    it('should create a new product with all fields', async () => {
      const createdProduct = {
        ...mockProduct,
        ...createProductDto,
        id: 'new-product-123',
      };
      mockProductService.create.mockResolvedValue(createdProduct);

      const result = await controller.create(shopId, createProductDto, mockReq as any);

      expect(result).toEqual(createdProduct);
      expect(mockProductService.create).toHaveBeenCalledWith(shopId, mockUser.id, {
        name: createProductDto.name,
        code: createProductDto.code,
        description: createProductDto.description,
        category: createProductDto.category,
        unit: createProductDto.unit,
        price: createProductDto.price,
        costPrice: createProductDto.costPrice,
        stock: createProductDto.stock,
        minStock: createProductDto.minStock,
      });
    });

    it('should create product with default values for optional fields', async () => {
      const minimalDto = {
        name: 'Minimal Product',
        price: 100,
      };
      mockProductService.create.mockResolvedValue({
        ...mockProduct,
        name: minimalDto.name,
        price: minimalDto.price,
        unit: 'piece',
        stock: 0,
        minStock: 0,
        code: undefined,
        description: undefined,
        category: undefined,
        costPrice: undefined,
      });

      const result = await controller.create(shopId, minimalDto as any, mockReq as any);

      expect(result).toBeDefined();
      expect((result as any).unit).toBe('piece');
      expect((result as any).stock).toBe(0);
      expect((result as any).minStock).toBe(0);
    });

    it('should create product with custom unit', async () => {
      const dtoWithCustomUnit = {
        name: 'Product By Weight',
        price: 50,
        unit: 'kg',
      };
      mockProductService.create.mockResolvedValue({
        ...mockProduct,
        name: dtoWithCustomUnit.name,
        price: dtoWithCustomUnit.price,
        unit: dtoWithCustomUnit.unit,
      });

      const result = await controller.create(shopId, dtoWithCustomUnit as any, mockReq as any);

      expect((result as any).unit).toBe('kg');
    });

    it('should create product without code', async () => {
      const dtoWithoutCode = {
        name: 'Product Without Code',
        price: 100,
      };
      mockProductService.create.mockResolvedValue({
        ...mockProduct,
        name: dtoWithoutCode.name,
        price: dtoWithoutCode.price,
        code: null,
      });

      const result = await controller.create(shopId, dtoWithoutCode as any, mockReq as any);

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for negative price', async () => {
      mockProductService.create.mockRejectedValue(new BadRequestException('Price cannot be negative'));

      await expect(
        controller.create(shopId, { name: 'Invalid Product', price: -100 } as any, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for negative stock', async () => {
      mockProductService.create.mockRejectedValue(new BadRequestException('Stock cannot be negative'));

      await expect(
        controller.create(shopId, { name: 'Invalid Product', price: 100, stock: -10 } as any, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user does not own the shop', async () => {
      mockProductService.create.mockRejectedValue(new ForbiddenException('You do not have permission'));

      await expect(controller.create(shopId, createProductDto, mockReq as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when shop does not exist', async () => {
      mockProductService.create.mockRejectedValue(new NotFoundException('Shop not found'));

      await expect(
        controller.create('nonexistent-shop', createProductDto, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for duplicate product code', async () => {
      mockProductService.create.mockRejectedValue(new BadRequestException('Product code already exists'));

      await expect(controller.create(shopId, createProductDto, mockReq as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('PATCH /shops/:shopId/products/:productId', () => {
    const productId = 'product-123';
    const updateProductDto = {
      name: 'Updated Product Name',
      price: 150,
      stock: 75,
    };

    it('should update product successfully', async () => {
      const updatedProduct = {
        ...mockProduct,
        ...updateProductDto,
      };
      mockProductService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(shopId, productId, updateProductDto, mockReq as any);

      expect(result).toEqual(updatedProduct);
      expect(mockProductService.update).toHaveBeenCalledWith(shopId, productId, mockUser.id, updateProductDto);
    });

    it('should update only product name', async () => {
      const nameUpdate = { name: 'New Name Only' };
      mockProductService.update.mockResolvedValue({
        ...mockProduct,
        name: nameUpdate.name,
      });

      const result = await controller.update(shopId, productId, nameUpdate, mockReq as any);

      expect((result as any).name).toBe(nameUpdate.name);
    });

    it('should update stock quantity', async () => {
      const stockUpdate = { stock: 200 };
      mockProductService.update.mockResolvedValue({
        ...mockProduct,
        stock: 200,
      });

      const result = await controller.update(shopId, productId, stockUpdate, mockReq as any);

      expect((result as any).stock).toBe(200);
    });

    it('should update cost price', async () => {
      const costPriceUpdate = { costPrice: 120 };
      mockProductService.update.mockResolvedValue({
        ...mockProduct,
        costPrice: 120,
      });

      const result = await controller.update(shopId, productId, costPriceUpdate, mockReq as any);

      expect((result as any).costPrice).toBe(120);
    });

    it('should throw BadRequestException for invalid update data', async () => {
      mockProductService.update.mockRejectedValue(new BadRequestException('Invalid input'));

      await expect(
        controller.update(shopId, productId, { price: -50 } as any, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user does not own the shop', async () => {
      mockProductService.update.mockRejectedValue(new ForbiddenException('You do not have permission'));

      await expect(controller.update(shopId, productId, updateProductDto, mockReq as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockProductService.update.mockRejectedValue(new NotFoundException('Product not found'));

      await expect(
        controller.update(shopId, 'nonexistent-product', updateProductDto, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when shop does not exist', async () => {
      mockProductService.update.mockRejectedValue(new NotFoundException('Shop not found'));

      await expect(
        controller.update('nonexistent-shop', productId, updateProductDto, mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for duplicate product code on update', async () => {
      mockProductService.update.mockRejectedValue(new BadRequestException('Product code already exists'));

      await expect(
        controller.update(shopId, productId, { code: 'EXISTING-CODE' }, mockReq as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
