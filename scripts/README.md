# Database Seeding & Testing Scripts

This directory contains scripts for seeding your database with test data and setting up test infrastructure.

## Files

- **`factories.ts`** - Reusable data builders for creating test/seed data
- **`fixtures.ts`** - Common test scenarios and data combinations
- **`seed.ts`** - Safe development seed script with `--reset` flag

## Usage

### Seed Script

The seed script is **safe by default** - it won't delete existing data unless you explicitly use the `--reset` flag.

#### Basic Usage (Safe - Won't Delete Data)

```bash
# Local
npm run seed

# Docker
npm run seed:docker
```

If the database already contains data, the script will:
- Show a warning message
- Exit without making changes
- Suggest using `--reset` flag if you want to clear data

#### Reset and Seed (Clears All Data)

```bash
# Local
npm run seed:reset

# Docker
npm run seed:docker:reset
```

This will:
- Clear all existing data
- Seed the database with a complete lab setup

#### Minimal Seed (Adds Small Dataset)

```bash
npm run seed:minimal
```

Creates a minimal setup:
- 1 Member
- 1 Project
- 1 Grant

### What Gets Created

#### Full Seed (`npm run seed -- --reset`)

- **5 Members**: 1 Professor (PI), 1 Postdoc, 2 Students, 1 Lab Manager
- **2 Projects**: With descriptions and dates
- **2 Grants**: With budgets and deadlines
- **4 Equipment**: Various lab equipment
- **2 Bookings**: Equipment reservations
- **1 Event**: Lab meeting with attendees
- **1 Publication**: Research paper
- **1 Collaborator**: External researcher
- **2 Documents**: Project proposal and CV
- **2 Expenses**: Linked to projects and grants
- **1 NoteTask**: Project task

#### Minimal Seed (`npm run seed:minimal`)

- 1 Member
- 1 Project
- 1 Grant

## Factories

The `DataFactory` class provides reusable methods for creating test data:

```typescript
import { PrismaClient } from '@/generated/prisma';
import { DataFactory } from './factories';

const prisma = new PrismaClient();
const factory = new DataFactory(prisma);

// Create a member
const member = await factory.createMember({
  name: 'John Doe',
  rank: 'MSc',
  status: 'ACTIVE',
});

// Create a professor
const professor = await factory.createProfessor({
  name: 'Dr. Jane Smith',
});

// Create a project
const project = await factory.createProject({
  title: 'My Research Project',
  description: 'Project description',
});

// Create equipment
const equipment = await factory.createEquipment({
  name: 'Microscope',
  status: 'AVAILABLE',
});
```

## Fixtures

The `TestFixtures` class provides pre-configured test scenarios:

```typescript
import { PrismaClient } from '@/generated/prisma';
import { DataFactory } from './factories';
import { TestFixtures } from './fixtures';

const prisma = new PrismaClient();
const factory = new DataFactory(prisma);
const fixtures = new TestFixtures(prisma, factory);

// Create complete lab setup
const data = await fixtures.createCompleteLabSetup();
// Returns: { members, projects, grants, equipment, events, publication, collaborator }

// Create minimal setup
const minimal = await fixtures.createMinimalSetup();
// Returns: { member, project, grant }

// Create project with expenses (for testing budget calculations)
const budgetTest = await fixtures.createProjectWithExpenses();
// Returns: { project, grant, expenses }
```

## Safety Features

1. **Data Existence Check**: Script checks if data exists before proceeding
2. **Explicit Reset Flag**: Requires `--reset` flag to delete data
3. **Clear Warnings**: Shows warnings when data exists
4. **Transaction Safety**: Uses Prisma transactions where appropriate

## Best Practices

1. **Development**: Use `npm run seed` for local development
2. **Testing**: Use factories and fixtures in your test files
3. **Production**: Never run seed scripts in production
4. **CI/CD**: Use isolated test databases for automated tests

## Testing

See `tests/` directory for test infrastructure:
- `tests/setup.ts` - Test database setup and teardown
- `tests/helpers.ts` - Test utilities and helper functions
- `tests/database.test.ts` - Database integration tests
- `tests/factories.test.ts` - Factory method tests
- `tests/graphql.test.ts` - GraphQL resolver tests

The factories and fixtures in this directory are used by the test suite. See [tests/README.md](../tests/README.md) for testing documentation.

