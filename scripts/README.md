# Database Seeding Scripts

This directory contains scripts for seeding your database with realistic test data via Hasura GraphQL.

## 📁 Files

- **`factories.ts`** - Reusable data builders using Hasura GraphQL mutations
- **`fixtures.ts`** - Pre-configured test scenarios with realistic data
- **`seed.ts`** - Main comprehensive seed script (safe by default)
- **`seed-from-json.ts`** - Import members from JSON template file
- **`create-test-user.ts`** - Create a test user for authentication
- **`set-password.ts`** - Set password for a user

## 🚀 Quick Start

### Prerequisites

Make sure Hasura is running:
```bash
docker-compose up -d
```

### Main Seed Script (Recommended)

The primary seed script creates a **complete, realistic lab setup**. It's **safe by default** - won't delete data unless you use `--reset`.

```bash
# Check if database has data, seed if empty
npm run db:seed

# Clear existing data and reseed (⚠️ destructive)
npm run db:seed:reset

# Quick minimal seed (1 member, 1 project, 1 grant)
npm run db:seed:minimal
```

### Docker Usage

```bash
# In Docker
docker compose exec app npm run db:seed -- --reset
```

### Import from JSON

Import members from `data/members-template.json`:

```bash
# Import members from JSON
npm run db:seed:json

# Clear and import
npm run db:seed:json:reset
```

### Create Test User

```bash
# Create admin user
npx tsx scripts/create-test-user.ts

# Set password for a user
npx tsx scripts/set-password.ts admin@lab.com MyPassword123!
```

## 📊 What Gets Created

### Full Seed (`npm run db:seed:reset`)

Creates a **comprehensive, realistic research lab** with:

#### 👥 **11 Members** (Mix of Active and Alumni)
- 1 Professor (PI)
- Postdocs, PhD Students, MSc Students
- Lab Manager
- Complete academic histories

#### 📊 **10 Projects**
- Spanning multiple years
- Real member assignments
- Realistic titles and descriptions

#### 💰 **6 Grants**
- $200k - $1M budgets each
- From: ISF, ERC, NIH, Horizon Europe, Marie Curie
- Each linked to projects

#### 📚 **15 Publications**
- Realistic titles and DOIs
- Multiple authors per publication
- Linked to projects

#### 🔬 **9 Equipment Items**
- Sequencers, microscopes, lab equipment
- Proper status: Available, In Use, Maintenance

#### 📋 **8 Protocols**
- Categories: Wet Lab, Computational, Safety, General
- Linked to authors and projects

#### 📅 **10 Events**
- Lab meetings, journal clubs, seminars, training

#### 💸 **15 Expenses**
- Linked to projects and grants

#### **And More:**
- Equipment Bookings
- External Collaborators
- Documents

### Minimal Seed (`npm run db:seed:minimal`)

Quick setup for testing:
- 1 Member
- 1 Project  
- 1 Grant

## 🏗️ Using Factories (For Custom Seeds & Tests)

The `DataFactory` class provides reusable methods for creating test data via Hasura GraphQL:

```typescript
import { DataFactory } from './factories';

const factory = new DataFactory();

// Create different types of members
const member = await factory.createMember({ name: 'John Doe', rank: 'MSc' });
const professor = await factory.createProfessor({ name: 'Dr. Jane Smith' });
const postdoc = await factory.createPostdoc({ name: 'Dr. Alice Brown' });
const student = await factory.createStudent({ name: 'Bob Wilson' });
const labManager = await factory.createLabManager({ name: 'Carol Davis' });

// Create other entities
const project = await factory.createProject({ title: 'My Research Project' });
const grant = await factory.createGrant({ name: 'NSF Grant 2024', budget: 500000 });
const equipment = await factory.createEquipment({ name: 'Microscope', status: 'AVAILABLE' });
const publication = await factory.createPublication({ title: 'Research Paper' });
const event = await factory.createEvent({ title: 'Lab Meeting' });
const booking = await factory.createBooking({ purpose: 'Equipment use' });
const expense = await factory.createExpense({ amount: 5000, projectId: project.id });
```

### Factory Features

- **Smart Defaults**: All fields have sensible defaults
- **Auto-Creation**: Some factories auto-create dependencies (e.g., Expense creates a Project if needed)
- **Type-Safe**: Full TypeScript support
- **Hasura-native**: Uses GraphQL mutations directly

## 🎯 Using Fixtures (Pre-configured Scenarios)

The `TestFixtures` class provides ready-to-use test scenarios:

```typescript
import { DataFactory } from './factories';
import { TestFixtures } from './fixtures';

const factory = new DataFactory();
const fixtures = new TestFixtures(factory);

// Create complete lab (what the main seed uses)
const lab = await fixtures.createCompleteLabSetup();
// Returns: { members, projects, grants, equipment, ... }

// Create minimal setup for quick tests
const minimal = await fixtures.createMinimalSetup();
// Returns: { member, project, grant }

// Create project with expenses for budget testing
const budgetTest = await fixtures.createProjectWithExpenses();
// Returns: { project, grant, expenses }
```

## 🔒 Safety Features

1. ✅ **Data Check**: Checks if data exists before seeding
2. ✅ **Explicit Reset**: Requires `--reset` flag to delete data
3. ✅ **Clear Warnings**: Shows helpful messages
4. ✅ **Connection Test**: Tests Hasura connection before seeding
5. ✅ **Validation**: Validates data before creating records

## ⚙️ All Available Commands

```bash
# Main seed commands
npm run db:seed              # Seed if empty (safe)
npm run db:seed:reset        # Clear & reseed (destructive)
npm run db:seed:minimal      # Quick minimal seed

# Import from JSON
npm run db:seed:json         # Import members from JSON
npm run db:seed:json:reset   # Clear & import from JSON

# User management
npx tsx scripts/create-test-user.ts   # Create test user
npx tsx scripts/set-password.ts       # Set user password
```

## 💡 Best Practices

1. **Development**: Use `npm run db:seed:reset` to get fresh, realistic data
2. **Testing**: Use factories in your test files for custom scenarios
3. **Production**: ⚠️ Never run seed scripts in production!
4. **Docker**: Seed runs inside the container with `docker compose exec app npm run db:seed:reset`

## 🧪 For Testing

The factories and fixtures are designed for use in tests:

```typescript
// In your test file
import { DataFactory } from '@/scripts/factories';
import { TestFixtures } from '@/scripts/fixtures';

describe('My Feature', () => {
  it('should work with test data', async () => {
    const factory = new DataFactory();
    const member = await factory.createMember({ name: 'Test User' });
    // ... your test
  });
});
```

See `tests/` directory for examples and [tests/README.md](../tests/README.md) for testing documentation.
