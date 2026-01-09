-- Add role column to User table for role-based access control
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);

-- Add comment to explain the role column
COMMENT ON COLUMN "User"."role" IS 'User role for Hasura RBAC: admin has full CRUD access, user has limited permissions';

