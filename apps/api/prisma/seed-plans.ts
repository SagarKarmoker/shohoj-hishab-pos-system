import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // Delete existing plans
  await pool.query('DELETE FROM "SubscriptionPlan"');
  console.log('Deleted existing plans');

  // Monthly Plan - 99/month
  await pool.query(
    `INSERT INTO "SubscriptionPlan" (id, name, description, price, "durationDays", features, "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
    [
      'plan-monthly',
      'Monthly Plan',
      'Pay monthly, cancel anytime',
      99,
      30,
      JSON.stringify(['Unlimited Invoices', 'Advanced Analytics', '5 Users + Management', 'Free E-commerce Website']),
      true
    ]
  );
  console.log('Created Monthly Plan: ৳99/month');

  // Quarterly Plan - 10% discount
  await pool.query(
    `INSERT INTO "SubscriptionPlan" (id, name, description, price, "durationDays", features, "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
    [
      'plan-quarterly',
      'Quarterly Plan',
      'Save 10% with 3 months commitment',
      267,
      90,
      JSON.stringify(['Unlimited Invoices', 'Advanced Analytics', '5 Users + Management', 'Free E-commerce Website', 'Priority Support']),
      true
    ]
  );
  console.log('Created Quarterly Plan: ৳267/3months (10% discount)');

  // Yearly Plan - 15% discount
  await pool.query(
    `INSERT INTO "SubscriptionPlan" (id, name, description, price, "durationDays", features, "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
    [
      'plan-yearly',
      'Yearly Plan',
      'Save 15% with annual commitment - Best Value!',
      1010,
      365,
      JSON.stringify(['Unlimited Invoices', 'Advanced Analytics', '10 Users + Management', 'Free E-commerce Website', 'Priority Support', 'API Access']),
      true
    ]
  );
  console.log('Created Yearly Plan: ৳1010/year (15% discount)');

  console.log('\nAll plans created successfully!');

  await pool.end();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
