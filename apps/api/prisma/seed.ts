import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('Password1', 10);

  // Users - Create one of each role
  
  // 1. Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      password: hashedPassword,
      displayName: 'Super Admin',
      emailVerified: true,
      role: 'SUPER_ADMIN',
    },
  });

  // 2. Admin (created by Super Admin)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      displayName: 'Admin User',
      emailVerified: true,
      role: 'ADMIN',
      createdById: superAdmin.id,
    },
  });

  // 3. Sales Person (created by Admin)
  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@example.com' },
    update: {},
    create: {
      email: 'sales@example.com',
      password: hashedPassword,
      displayName: 'Sales Partner',
      phoneNumber: '+880 1733-333333',
      emailVerified: true,
      role: 'SALES',
      createdById: admin.id,
    },
  });

  // Create SalesPerson record for the sales user
  const salesPerson = await prisma.salesPerson.upsert({
    where: { userId: salesUser.id },
    update: {},
    create: {
      userId: salesUser.id,
      commissionRate: 10.00,
      totalSales: 0,
      totalEarnings: 0,
      isActive: true,
    },
  });

  // 4. Regular User (created by Sales)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      password: hashedPassword,
      displayName: 'Shop Owner',
      emailVerified: true,
      role: 'USER',
      createdById: salesUser.id,
    },
  });

  console.log('Created users:');
  console.log('  - Super Admin:', superAdmin.email);
  console.log('  - Admin:', admin.email);
  console.log('  - Sales:', salesUser.email);
  console.log('  - User:', owner.email);

  // Subscription Plans
  const plans = await Promise.all([
    // Monthly Plan
    prisma.subscriptionPlan.upsert({
      where: { id: 'plan-monthly' },
      update: {},
      create: {
        id: 'plan-monthly',
        name: 'Monthly Plan',
        description: 'Perfect for businesses that want flexibility',
        price: 500,
        durationDays: 30,
        features: JSON.stringify(['Unlimited Invoices', 'Advanced Analytics', '5 Users + Management', 'Free E-commerce Website']),
        isActive: true,
      },
    }),
    // Quarterly Plan (3 months) - 10% discount
    prisma.subscriptionPlan.upsert({
      where: { id: 'plan-quarterly' },
      update: {},
      create: {
        id: 'plan-quarterly',
        name: 'Quarterly Plan',
        description: 'Save 10% with 3 months commitment',
        price: 1350, // 500 * 3 = 1500, 10% off = 1350
        durationDays: 90,
        features: JSON.stringify(['Unlimited Invoices', 'Advanced Analytics', '5 Users + Management', 'Free E-commerce Website', 'Priority Support']),
        isActive: true,
      },
    }),
    // Yearly Plan - 15% discount
    prisma.subscriptionPlan.upsert({
      where: { id: 'plan-yearly' },
      update: {},
      create: {
        id: 'plan-yearly',
        name: 'Yearly Plan',
        description: 'Save 15% with annual commitment - Best Value!',
        price: 5100, // 500 * 12 = 6000, 15% off = 5100
        durationDays: 365,
        features: JSON.stringify(['Unlimited Invoices', 'Advanced Analytics', '10 Users + Management', 'Free E-commerce Website', 'Priority Support', 'API Access']),
        isActive: true,
      },
    }),
  ]);
  console.log('Created subscription plans:', plans.length);

  // Create some sample sales data for the sales person
  const sampleSale = await prisma.sale.create({
    data: {
      salesPersonId: salesPerson.id,
      userId: owner.id,
      planId: plans[0].id,
      saleAmount: 999,
      commissionAmount: 99.90,
    },
  });
  console.log('Created sample sale:', sampleSale.id);

  // Update sales person totals
  await prisma.salesPerson.update({
    where: { id: salesPerson.id },
    data: {
      totalSales: 999,
      totalEarnings: 99.90,
    },
  });

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
