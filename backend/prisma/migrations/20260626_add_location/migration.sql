-- AlterTable: Add location fields to User
ALTER TABLE "User" ADD COLUMN "address" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "city" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "state" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'India';
ALTER TABLE "User" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "longitude" DOUBLE PRECISION;

-- AlterTable: Add location fields to Service  
ALTER TABLE "Service" ADD COLUMN "address" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Service" ADD COLUMN "city" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Service" ADD COLUMN "state" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Service" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Service" ADD COLUMN "longitude" DOUBLE PRECISION;

-- Add unique constraint on phone
ALTER TABLE "User" ADD CONSTRAINT "User_phone_key" UNIQUE ("phone");
