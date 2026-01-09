-- Add default UUID generation to all tables
-- This migration fixes the issue where tables require IDs but don't have automatic generation
-- Previously handled by Prisma client-side, now handled by PostgreSQL

-- Ensure pgcrypto extension is enabled (required for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add default UUID generation to main tables
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Member" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Project" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Grant" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Equipment" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Event" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Publication" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Protocol" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Expense" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Booking" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Document" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "NoteTask" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Collaborator" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "AcademicInfo" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- Add default UUID generation to auth-related tables
ALTER TABLE "Session" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "VerificationToken" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "WebAuthnChallenge" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "SmsVerificationCode" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- Add default CURRENT_TIMESTAMP to updatedAt columns
-- These columns are NOT NULL but had no default, causing insert failures
ALTER TABLE "AcademicInfo" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Account" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Booking" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Collaborator" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Document" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Equipment" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Event" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Member" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "NoteTask" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Project" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Protocol" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Publication" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Add comments explaining the change
COMMENT ON COLUMN "User"."id" IS 'Auto-generated UUID (migrated from Prisma CUID)';
COMMENT ON COLUMN "Member"."id" IS 'Auto-generated UUID (migrated from Prisma CUID)';
COMMENT ON COLUMN "Project"."id" IS 'Auto-generated UUID (migrated from Prisma CUID)';

