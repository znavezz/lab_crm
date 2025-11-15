# Database Testing Guide

This guide explains how to test your database using the seed scripts and test infrastructure.

## Quick Start

### 1. Seed the Database

First, seed your development database with test data:

```bash
# Seed with full lab setup (requires --reset if data exists)
npm run seed:reset

# Or seed with minimal data
npm run seed:minimal
```

### 2. Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Database Setup

The test suite uses a separate test database to avoid affecting your development data.

### Setting Up Test Database

1. **Create Test Database** (if using PostgreSQL directly):
   ```bash
   # Connect to PostgreSQL
   psql -U myuser -d postgres
   
   # Create test database
   CREATE DATABASE test_lab_crm;
   ```

2. **Set Test Database URL**:
   ```bash
   # In .env.local or .env
   TEST_DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/test_lab_crm?schema=public"
   ```

3. **Run Migrations on Test Database**:
   ```bash
   # Set DATABASE_URL to test database temporarily
   DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/test_lab_crm?schema=public" npx prisma migrate deploy
   ```

### Using Docker

If you're using Docker, the test database will be created automatically based on your `DATABASE_URL`:

```bash
# The test setup will use: test_<database_name>
# e.g., if DATABASE_URL points to "lab_crm", test database will be "test_lab_crm"
```

## Test Structure

### Test Files

- **`tests/database.test.ts`** - Integration tests for database models and relationships (37 tests)
- **`tests/factories.test.ts`** - Tests for factory methods (24 tests)
- **`tests/graphql.test.ts`** - GraphQL resolver tests for queries, mutations, and computed fields (22 tests)
- **`tests/setup.ts`** - Test database setup and teardown utilities
- **`tests/helpers.ts`** - Test helper functions and utilities

**Total Test Coverage: 83 tests** covering:
- Database models and relationships
- Factory methods
- GraphQL queries and mutations
- Computed fields (budget calculations, investment totals)
- Database constraints and validations

### Writing Tests

#### Basic Test Example

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testPrisma, setupTestDatabase, teardownTestDatabase, cleanTestDatabase } from './setup';
import { testFactory } from './helpers';

describe('My Feature', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  it('should create a member', async () => {
    const member = await testFactory.createMember({
      name: 'Test Member',
    });

    expect(member.name).toBe('Test Member');
  });
});
```

#### Using Factories

```typescript
// Create a member
const member = await testFactory.createMember();

// Create a professor
const professor = await testFactory.createProfessor();

// Create a project
const project = await testFactory.createProject({
  title: 'My Project',
});

// Create equipment
const equipment = await testFactory.createEquipment({
  name: 'Microscope',
  status: 'AVAILABLE',
});
```

#### Using Fixtures

```typescript
import { testFixtures } from './helpers';

// Create minimal setup
const minimal = await testFixtures.createMinimalSetup();
// Returns: { member, project, grant }

// Create complete lab setup
const data = await testFixtures.createCompleteLabSetup();
// Returns: { members, projects, grants, equipment, events, publication, collaborator }
```

## Testing Workflow

### 1. Development Testing

During development, you can:

1. **Seed your dev database**:
   ```bash
   npm run seed:reset
   ```

2. **View data in Prisma Studio**:
   ```bash
   npm run studio
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

### 2. CI/CD Testing

For continuous integration:

```bash
# Setup test database
createdb test_lab_crm

# Run migrations
DATABASE_URL="..." npx prisma migrate deploy

# Run tests
npm run test:run
```

### 3. Manual Database Testing

You can also test the database manually:

```bash
# 1. Seed the database
npm run seed:reset

# 2. Open Prisma Studio to inspect data
npm run studio

# 3. Or connect directly with psql
psql -U myuser -d lab_crm -h localhost -p 5433
```

## Test Utilities

### Database Cleanup

```typescript
// Clean all data before each test
await cleanTestDatabase();
```

### Transaction Testing

```typescript
import { withTransaction } from './setup';

// Run test in a transaction (auto-rollback)
await withTransaction(async (tx) => {
  const member = await tx.member.create({ ... });
  // Test operations
});
```

### Helper Functions

```typescript
import { futureDate, pastDate, createBookingTimeRange } from './helpers';

// Create future date
const future = futureDate(7); // 7 days from now

// Create past date
const past = pastDate(30); // 30 days ago

// Create booking time range
const { startTime, endTime } = createBookingTimeRange(1, 3); // 1 hour from now, 3 hour duration
```

## Common Test Scenarios

### Testing Relationships

```typescript
it('should link members to projects', async () => {
  const member = await testFactory.createMember();
  const project = await testFactory.createProject();

  await testPrisma.project.update({
    where: { id: project.id },
    data: {
      members: { connect: [{ id: member.id }] },
    },
  });

  const updated = await testPrisma.project.findUnique({
    where: { id: project.id },
    include: { members: true },
  });

  expect(updated?.members).toHaveLength(1);
});
```

### Testing Constraints

```typescript
it('should enforce unique DOI', async () => {
  await testFactory.createPublication({ doi: '10.1000/test' });
  
  await expect(
    testFactory.createPublication({ doi: '10.1000/test' })
  ).rejects.toThrow();
});
```

### Testing Computed Values

```typescript
it('should calculate grant remaining budget', async () => {
  const grant = await testFactory.createGrant({ budget: 100000 });
  await testFactory.createExpense({ amount: 30000, grantId: grant.id });
  
  const grantWithExpenses = await testPrisma.grant.findUnique({
    where: { id: grant.id },
    include: { expenses: true },
  });

  const totalSpent = grantWithExpenses!.expenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const remaining = grant.budget - totalSpent;
  
  expect(remaining).toBe(70000);
});
```

## Troubleshooting

### Test Database Connection Issues

If tests fail to connect:

1. Check `TEST_DATABASE_URL` is set correctly
2. Ensure test database exists
3. Verify migrations have been run on test database
4. Check database credentials

### Data Persistence Between Tests

Tests should clean up data in `beforeEach`. If you see data from previous tests:

1. Ensure `cleanTestDatabase()` is called in `beforeEach`
2. Check that test database is separate from dev database
3. Verify test isolation

### Migration Issues

If migrations fail:

```bash
# Reset test database
dropdb test_lab_crm
createdb test_lab_crm

# Run migrations
DATABASE_URL="..." npx prisma migrate deploy
```

## Best Practices

1. **Always clean test database** in `beforeEach` to ensure test isolation
2. **Use factories** instead of raw Prisma calls for consistency
3. **Test relationships** to ensure foreign keys work correctly
4. **Test constraints** like unique fields and required fields
5. **Use descriptive test names** that explain what is being tested
6. **Keep tests fast** by using minimal data when possible
7. **Test edge cases** like null values, empty strings, etc.

## GraphQL Testing

The test suite includes comprehensive GraphQL resolver tests:

### Query Resolvers

```typescript
// Test querying all members
const result = await queries.members(undefined, undefined, context);

// Test querying by ID
const member = await queries.member(undefined, { id: memberId }, context);
```

### Mutation Resolvers

```typescript
// Test creating a member
const result = await mutations.createMember(
  undefined,
  { input: { name: 'New Member', rank: 'MSc' } },
  context
);

// Test updating a member
const updated = await mutations.updateMember(
  undefined,
  { id: memberId, input: { name: 'Updated Name' } },
  context
);
```

### Computed Fields

```typescript
// Test Project.totalInvestment
const investment = await types.Project.totalInvestment(
  { id: projectId },
  undefined,
  context
);

// Test Grant.totalSpent and remainingBudget
const totalSpent = await types.Grant.totalSpent(
  { id: grantId },
  undefined,
  context
);
```

See `tests/graphql.test.ts` for complete examples.

## Next Steps

- Add API endpoint tests (REST/GraphQL HTTP layer)
- Add integration tests for full user workflows
- Set up test coverage reporting
- Add performance tests for database queries
- Add E2E tests with Playwright or Cypress

