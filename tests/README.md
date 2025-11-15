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

- `database.test.ts` - Database model and relationship tests
- `factories.test.ts` - Factory method tests
- `setup.ts` - Test database utilities
- `helpers.ts` - Test helper functions

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

For detailed documentation, see [TESTING_GUIDE.md](./TESTING_GUIDE.md).

