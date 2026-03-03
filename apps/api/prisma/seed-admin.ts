import "dotenv/config";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const hashedPassword = await bcrypt.hash('Password1', 10);

  // Check if users already exist
  const existingSuperAdmin = await pool.query(
    'SELECT email FROM "User" WHERE email = $1',
    ['superadmin@shohojhisab.com']
  );

  if (existingSuperAdmin.rows.length === 0) {
    await pool.query(
      `INSERT INTO "User" (id, email, password, "displayName", "phoneNumber", "emailVerified", "firebaseUid", role, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        'superadmin@shohojhisab.com',
        hashedPassword,
        'Super Admin',
        '+8801234567890',
        true,
        null,
        'SUPER_ADMIN'
      ]
    );
    console.log('Super Admin created: superadmin@shohojhisab.com');
  } else {
    console.log('Super Admin already exists: superadmin@shohojhisab.com');
  }

  // Check if admin already exists
  const existingAdmin = await pool.query(
    'SELECT email FROM "User" WHERE email = $1',
    ['admin@shohojhisab.com']
  );

  if (existingAdmin.rows.length === 0) {
    await pool.query(
      `INSERT INTO "User" (id, email, password, "displayName", "phoneNumber", "emailVerified", "firebaseUid", role, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        'admin@shohojhisab.com',
        hashedPassword,
        'Admin User',
        '+8801234567891',
        true,
        null,
        'ADMIN'
      ]
    );
    console.log('Admin created: admin@shohojhisab.com');
  } else {
    console.log('Admin already exists: admin@shohojhisab.com');
  }

  // Check if sales user already exists
  const existingSales = await pool.query(
    'SELECT email, id FROM "User" WHERE email = $1',
    ['sales@shohojhisab.com']
  );

  let salesUserId: string | null = null;

  if (existingSales.rows.length === 0) {
    const result = await pool.query(
      `INSERT INTO "User" (id, email, password, "displayName", "phoneNumber", "emailVerified", "firebaseUid", role, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id`,
      [
        'sales@shohojhisab.com',
        hashedPassword,
        'Sales Person',
        '+8801234567892',
        true,
        null,
        'SALES'
      ]
    );
    salesUserId = result.rows[0].id;
    console.log('Sales user created: sales@shohojhisab.com');
  } else {
    console.log('Sales user already exists: sales@shohojhisab.com');
    salesUserId = existingSales.rows[0].id;
  }

  // Create sales person record for the sales user
  if (salesUserId) {
    const existingSalesPerson = await pool.query(
      'SELECT id FROM "SalesPerson" WHERE "userId" = $1',
      [salesUserId]
    );

    if (existingSalesPerson.rows.length === 0) {
      await pool.query(
        `INSERT INTO "SalesPerson" (id, "userId", "commissionRate", "totalSales", "totalEarnings", "isActive", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, 10, 0, 0, true, NOW(), NOW())`,
        [salesUserId]
      );
      console.log('Sales person record created for sales user');
    } else {
      console.log('Sales person record already exists for sales user');
    }
  }

  console.log('\nLogin credentials:');
  console.log('  Super Admin: superadmin@shohojhisab.com / Password1');
  console.log('  Admin: admin@shohojhisab.com / Password1');
  console.log('  Sales: sales@shohojhisab.com / Password1');

  await pool.end();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
