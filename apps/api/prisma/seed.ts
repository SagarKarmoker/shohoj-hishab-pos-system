import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password1', 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      displayName: 'Admin User',
      emailVerified: true,
      role: 'SUPER_ADMIN',
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      password: hashedPassword,
      displayName: 'Shop Owner',
      emailVerified: true,
      role: 'USER',
    },
  });

  console.log('Created users:', admin.email, owner.email);

  // Shop (create if not exists)
  let shop = await prisma.shop.findFirst({
    where: { ownerId: owner.id, name: 'Demo Shop' },
  });
  if (!shop) {
    shop = await prisma.shop.create({
      data: {
        name: 'Demo Shop',
        address: '123 Main Street, Dhaka',
        phone: '+880 1XXX-XXXXXX',
        ownerId: owner.id,
      },
    });
  }
  console.log('Created shop:', shop.name);

  // Products
  const productData = [
    { name: 'Rice', code: 'R001', category: 'Grocery', unit: 'kg', price: 80, stock: 100, minStock: 10 },
    { name: 'Flour', code: 'F001', category: 'Grocery', unit: 'kg', price: 55, stock: 50, minStock: 5 },
    { name: 'Oil', code: 'O001', category: 'Grocery', unit: 'liter', price: 180, stock: 30, minStock: 5 },
    { name: 'Sugar', code: 'S001', category: 'Grocery', unit: 'kg', price: 120, stock: 40, minStock: 5 },
    { name: 'Tea', code: 'T001', category: 'Beverage', unit: 'piece', price: 25, stock: 200, minStock: 20 },
    { name: 'Biscuit', code: 'B001', category: 'Snacks', unit: 'piece', price: 15, stock: 150, minStock: 10 },
  ];

  for (const p of productData) {
    const existing = await prisma.product.findFirst({
      where: { shopId: shop.id, code: p.code },
    });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          code: p.code,
          category: p.category,
          unit: p.unit,
          price: p.price,
          stock: p.stock,
          minStock: p.minStock,
          shopId: shop.id,
          sellerId: owner.id,
        },
      });
    }
  }
  console.log('Created products:', productData.length);

  // Customers
  const customerData = [
    { name: 'Karim Ahmed', phone: '+880 1711-111111' },
    { name: 'Fatima Begum', phone: '+880 1722-222222' },
    { name: 'Rahim Uddin', phone: null },
  ];

  for (const c of customerData) {
    const existing = await prisma.customer.findFirst({
      where: { shopId: shop.id, name: c.name },
    });
    if (!existing) {
      await prisma.customer.create({
        data: {
          name: c.name,
          phone: c.phone,
          shopId: shop.id,
          ownerId: owner.id,
        },
      });
    }
  }
  console.log('Created customers:', customerData.length);

  console.log('\nSeed complete. Login with:');
  console.log('  admin@example.com / Password1');
  console.log('  owner@example.com / Password1');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
