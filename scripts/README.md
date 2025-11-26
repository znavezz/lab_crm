# Database Seeding Scripts

This directory contains scripts for seeding your database with realistic test data.

## 📁 Files

- **`factories.ts`** - Reusable data builders for creating test/seed data
- **`fixtures.ts`** - Pre-configured test scenarios with realistic data
- **`seed.ts`** - Main comprehensive seed script (safe by default)
- **`seed-from-json.ts`** - Import members from JSON template file

## 🚀 Quick Start

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

## 📊 What Gets Created

### Full Seed (`npm run db:seed:reset`)

Creates a **comprehensive, realistic research lab** with:

#### 👥 **20 Members** (13 Active, 7 Alumni)
- 1 Professor (PI)
- 5 Active Postdocs + 3 Alumni Postdocs
- 3 Active PhD Students + 2 Alumni PhD Students
- 3 Active MSc Students + 2 Alumni MSc Students
- 1 Active BSc Student
- 1 Lab Manager
- Complete academic histories (degrees, institutions, graduation years)

#### 📊 **30 Projects**
- Spanning multiple years
- Real member assignments (2-5 members per project)
- Realistic titles and descriptions
- Active and completed projects

#### 💰 **18 Grants**
- $200k - $1M budgets each
- From: ISF, ERC, NIH, NSF, Horizon Europe, Marie Curie, Wellcome Trust, etc.
- Each linked to multiple projects
- Spanning 2020-2028

#### 📚 **45 Publications**
- Realistic titles and DOIs
- 2-5 authors per publication
- Linked to 1-2 projects
- Spanning multiple years

#### 🔬 **35 Equipment Items**
- Sequencers, microscopes, computers, lab equipment
- Proper status: ~50% Available, ~40% In Use, ~10% Maintenance
- Some assigned to members, some to projects
- Serial numbers and descriptions

#### 📋 **25 Protocols**
- Categories: Wet Lab, Computational, Safety, General
- Linked to authors and projects
- Different difficulty levels

#### 📅 **30 Events**
- Lab meetings, journal clubs, seminars, training
- 3-8 attendees per event
- Linked to projects
- Spanning multiple years

#### 💸 **40 Expenses**
- $500 - $10k each
- Linked to projects and grants
- Proper budget tracking

#### **And More:**
- 20 Equipment Bookings
- 15 External Collaborators
- 20 Documents (CVs, proposals)
- 15 Note/Tasks

### Minimal Seed (`npm run db:seed:minimal`)

Quick setup for testing:
- 1 Member
- 1 Project  
- 1 Grant

## 🏗️ Using Factories (For Custom Seeds & Tests)

The `DataFactory` class provides reusable methods for creating test data:

```typescript
import { PrismaClient } from '@/generated/prisma';
import { DataFactory } from './factories';

const prisma = new PrismaClient();
const factory = new DataFactory(prisma);

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
- **Validation**: Validates foreign keys exist before creation
- **Type-Safe**: Full TypeScript support

## 🎯 Using Fixtures (Pre-configured Scenarios)

The `TestFixtures` class provides ready-to-use test scenarios:

```typescript
import { PrismaClient } from '@/generated/prisma';
import { DataFactory } from './factories';
import { TestFixtures } from './fixtures';

const prisma = new PrismaClient();
const factory = new DataFactory(prisma);
const fixtures = new TestFixtures(prisma, factory);

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
4. ✅ **Transactions**: Uses Prisma transactions for data integrity
5. ✅ **Validation**: Validates relationships before creating records
6. ✅ **Connection Test**: Tests database connection before seeding

## ⚙️ All Available Commands

```bash
# Main seed commands
npm run db:seed              # Seed if empty (safe)
npm run db:seed:reset        # Clear & reseed (destructive)
npm run db:seed:minimal      # Quick minimal seed

# Import from JSON
npm run db:seed:json         # Import members from JSON
npm run db:seed:json:reset   # Clear & import from JSON

# Database management
npm run db:reset             # Reset migrations & schema
npm run studio               # Open Prisma Studio (database GUI)
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
    const factory = new DataFactory(prisma);
    const member = await factory.createMember({ name: 'Test User' });
    // ... your test
  });
});
```

See `tests/` directory for examples and [tests/README.md](../tests/README.md) for testing documentation.

