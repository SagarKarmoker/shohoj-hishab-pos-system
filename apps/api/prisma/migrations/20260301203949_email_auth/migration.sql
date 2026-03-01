-- Drop existing unique constraints and indexes
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_firebaseUid_key";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_phoneNumber_key";

-- Make firebaseUid and phoneNumber nullable and non-unique
ALTER TABLE "User" ALTER COLUMN "firebaseUid" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "phoneNumber" DROP NOT NULL;

-- Make email required and unique
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");

-- Add email verification fields
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "emailVerificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN "emailVerificationExpires" TIMESTAMP(3);

-- Add password reset fields
ALTER TABLE "User" ADD COLUMN "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordResetExpires" TIMESTAMP(3);

-- Make password required (for new email auth)
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;

-- Truncate users table for fresh start (as per plan)
TRUNCATE TABLE "User" CASCADE;
