# Test Layers Documentation

This document explains the three layers of testing in this project: **Unit Tests**, **Integration Tests**, and **End-to-End (E2E) Tests**.

## Test Pyramid

```
        /\
       /  \      E2E Tests (Few, Slow, Expensive)
      /----\
     /      \    Integration Tests (Some, Medium Speed)
    /--------\
   /          \  Unit Tests (Many, Fast, Cheap)
  /------------\
```

## Test Layers

### 1. Unit Tests (`*.test.ts`)

**Purpose**: Test individual functions, components, or modules in isolation.

**Characteristics**:
- Fast execution
- Test single units of code
- Mock external dependencies
- High coverage, low cost

**Example Files**:
- `tests/auth.test.ts` - Unit tests for authentication logic
- `tests/factories.test.ts` - Unit tests for factory methods
- `tests/database.test.ts` - Unit tests for database models

**Example**:
```typescript
it('should create a User without a Member', async () => {
  const user = await createUser({ email: 'admin@example.com' });
  expect(user.memberId).toBeNull();
});
```

### 2. Integration Tests (`*.integration.test.ts`)

**Purpose**: Test how multiple components work together, including database interactions, API adapters, and service integrations.

**Characteristics**:
- Medium execution speed
- Test component interactions
- Use real database (test database)
- Test NextAuth adapter, Prisma operations, etc.

**Example Files**:
- `tests/auth.integration.test.ts` - Integration tests for NextAuth adapter and database

**Example**:
```typescript
it('should create User via Prisma adapter', async () => {
  const adapter = PrismaAdapter(testPrisma);
  const user = await testPrisma.user.create({...});
  expect(user.id).toBeDefined();
});
```

### 3. End-to-End Tests (`*.e2e.test.ts`)

**Purpose**: Test complete user flows and system behavior from start to finish.

**Characteristics**:
- Slower execution
- Test full workflows
- Test actual HTTP requests (when applicable)
- Test complete authentication flows

**Example Files**:
- `tests/auth.e2e.test.ts` - E2E tests for complete authentication flows

**Example**:
```typescript
it('should handle complete sign-in flow', async () => {
  // User creation -> Account creation -> Session creation
  const user = await testPrisma.user.create({...});
  const account = await testPrisma.account.create({...});
  const session = await testPrisma.session.create({...});
  // Verify complete flow
});
```

## Authentication Test Layers

### Unit Tests (`auth.test.ts`)

Tests individual authentication components:
- ✅ User model creation
- ✅ Member model creation
- ✅ NextAuth configuration
- ✅ Session callbacks
- ✅ GraphQL context creation
- ✅ User-Member independence

**Run**: `npm test auth.test.ts`

### Integration Tests (`auth.integration.test.ts`)

Tests NextAuth adapter and database interactions:
- ✅ Prisma adapter integration
- ✅ Account creation and linking
- ✅ Session creation and retrieval
- ✅ User-Member linking via database
- ✅ Verification token handling
- ✅ Database constraints

**Run**: `npm test auth.integration.test.ts`

### E2E Tests (`auth.e2e.test.ts`)

Tests complete authentication flows:
- ✅ Complete sign-in flow (User → Account → Session)
- ✅ User creation → Member creation → Linking
- ✅ GraphQL context with real requests
- ✅ Session management end-to-end
- ✅ Error handling in real scenarios

**Run**: `npm test auth.e2e.test.ts`

## Running Tests

### Run All Tests
```bash
npm test                    # Watch mode
npm run test:run           # Run once
npm run test:coverage      # With coverage
```

### Run Specific Test Layer
```bash
# Unit tests only
npm test auth.test.ts

# Integration tests only
npm test auth.integration.test.ts

# E2E tests only
npm test auth.e2e.test.ts

# All auth tests
npm test auth
```

### Run in Docker
```bash
# All tests
npm run test:docker

# Specific test file
docker-compose exec app npm run test:run tests/auth.test.ts
docker-compose exec app npm run test:run tests/auth.integration.test.ts
docker-compose exec app npm run test:run tests/auth.e2e.test.ts
```

## Test Coverage Goals

### Unit Tests
- **Target**: 80%+ coverage
- **Focus**: All business logic, utilities, helpers
- **Speed**: Fast (< 1 second per test)

### Integration Tests
- **Target**: Critical paths covered
- **Focus**: Database operations, adapter integrations
- **Speed**: Medium (1-5 seconds per test)

### E2E Tests
- **Target**: All user flows covered
- **Focus**: Complete workflows, error scenarios
- **Speed**: Slower (5-30 seconds per test)

## Best Practices

### Unit Tests
1. Test one thing at a time
2. Use mocks for external dependencies
3. Keep tests fast and isolated
4. Test edge cases and error conditions

### Integration Tests
1. Use real database (test database)
2. Test component interactions
3. Clean up after each test
4. Test database constraints and relationships

### E2E Tests
1. Test complete user flows
2. Use realistic data
3. Test error scenarios
4. Verify end-to-end behavior

## Adding New Test Layers

When adding a new feature, create tests at all three layers:

1. **Unit Tests**: Test individual functions/components
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user flows

### Example: Adding "Project Management" Tests

```bash
# Unit tests
tests/project.test.ts              # Test project model, helpers

# Integration tests
tests/project.integration.test.ts   # Test project + member relationships

# E2E tests
tests/project.e2e.test.ts          # Test complete project creation flow
```

## Docker Testing

All test layers work with Docker:

```bash
# Setup (first time)
docker-compose up -d
npm run test:docker:setup
docker-compose exec app sh -c 'DATABASE_URL="..." npx prisma migrate deploy'

# Run all tests
npm run test:docker

# Run specific layer
docker-compose exec app npm run test:run tests/auth.test.ts
docker-compose exec app npm run test:run tests/auth.integration.test.ts
docker-compose exec app npm run test:run tests/auth.e2e.test.ts
```

## Summary

- **Unit Tests**: Fast, isolated, test individual components
- **Integration Tests**: Medium speed, test component interactions
- **E2E Tests**: Slower, test complete workflows

All three layers are essential for robust testing. Unit tests catch bugs early, integration tests verify component interactions, and E2E tests ensure the system works end-to-end.

