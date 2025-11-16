# Testing Quick Reference

## Quick Commands

```bash
# Seed development database
npm run seed:reset          # Full seed (clears existing data)
npm run seed:minimal         # Minimal seed

# Run tests (on host)
npm test                     # Watch mode
npm run test:run             # Run once
npm run test:ui              # UI mode
npm run test:coverage        # With coverage

# Run tests (inside Docker)
npm run test:docker          # Run once inside Docker
npm run test:docker:ui       # UI mode inside Docker
npm run test:docker:setup    # Setup test database

# View database
npm run studio               # Prisma Studio
```

## Docker Users

If you're using Docker, see [DOCKER_TESTING.md](./DOCKER_TESTING.md) for detailed instructions.

Quick start:
```bash
# 1. Start Docker
docker-compose up -d

# 2. Setup test database (first time)
npm run test:docker:setup
docker-compose exec app sh -c 'DATABASE_URL="postgresql://myuser:mysecretpassword@db:5432/test_lab_crm?schema=public" npx prisma migrate deploy'

# 3. Run tests
npm run test:docker
```

## First Time Setup

1. **Create test database**:
   ```bash
   # Using psql
   psql -U myuser -d postgres
   CREATE DATABASE test_lab_crm;
   ```

2. **Set environment variable** (in `.env.local`):
   ```
   TEST_DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/test_lab_crm?schema=public"
   ```

3. **Run migrations on test database**:
   ```bash
   DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/test_lab_crm?schema=public" npx prisma migrate deploy
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

## Test Files

### Unit Tests
- `database.test.ts` - Database model and relationship tests (37 tests)
- `factories.test.ts` - Factory method tests (24 tests)
- `graphql.test.ts` - GraphQL resolver tests (22 tests)
- `auth.test.ts` - Authentication unit tests (30+ tests)

### Integration Tests
- `auth.integration.test.ts` - Authentication integration tests (15+ tests)

### End-to-End Tests
- `auth.e2e.test.ts` - Authentication E2E tests (10+ tests)

### Test Infrastructure
- `setup.ts` - Test database utilities
- `helpers.ts` - Test helper functions

**Total: 100+ tests** across all layers

For detailed information about test layers, see [TEST_LAYERS.md](./TEST_LAYERS.md).

## Example Test

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testPrisma, setupTestDatabase, teardownTestDatabase, cleanTestDatabase } from './setup';
import { testFactory } from './helpers';

describe('My Test', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  it('should work', async () => {
    const member = await testFactory.createMember();
    expect(member.id).toBeDefined();
  });
});
```

## Authentication Testing

Authentication is tested at three layers:

### Unit Tests (`auth.test.ts`)
- **User Model Tests**: Creating Users with/without Members
- **Member Model Tests**: Creating Members with/without Users
- **NextAuth Configuration**: Verifying auth setup
- **Session Callbacks**: Testing session management
- **GraphQL Context**: Testing authenticated/unauthenticated contexts
- **Account Model**: Testing multiple authentication methods

### Integration Tests (`auth.integration.test.ts`)
- **NextAuth Adapter**: Testing Prisma adapter integration
- **Database Operations**: Testing User/Account/Session creation
- **User-Member Linking**: Testing database relationships
- **Verification Tokens**: Testing token creation and expiration
- **Database Constraints**: Testing unique constraints and validations

### E2E Tests (`auth.e2e.test.ts`)
- **Complete Sign-in Flow**: User → Account → Session creation
- **User-Member Linking Flow**: Sign-in → Member creation → Linking
- **GraphQL Context E2E**: Testing context with real requests
- **Session Management E2E**: Complete session lifecycle
- **Error Handling**: Testing error scenarios end-to-end

**Run all auth tests**: `npm test auth`

### Authentication Test Helpers

```typescript
import {
  createUser,
  createUserWithMember,
  createMemberWithoutUser,
  createAuthenticatedContext,
  createUnauthenticatedContext,
} from './helpers';

// Create a User without a Member
const user = await createUser({ email: 'admin@example.com' });

// Create a User linked to a Member
const { user, member } = await createUserWithMember();

// Create a Member without a User
const member = await createMemberWithoutUser();

// Create authenticated GraphQL context
const context = createAuthenticatedContext({
  id: user.id,
  email: user.email,
  memberId: member.id,
});
```

For detailed documentation, see [TESTING_GUIDE.md](./TESTING_GUIDE.md).

