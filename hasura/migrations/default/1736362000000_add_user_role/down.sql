-- Drop index
DROP INDEX IF EXISTS idx_user_role;

-- Remove role column from User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";

