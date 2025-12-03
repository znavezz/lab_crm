# Hasura GraphQL Engine Setup Guide

This guide explains how to set up, configure, and use Hasura GraphQL Engine for the Lab CRM project.

## Overview

We've migrated from a custom Apollo Server + Prisma GraphQL backend to Hasura GraphQL Engine. Hasura provides:

- Auto-generated GraphQL queries, mutations, and subscriptions
- Built-in authorization and role-based access control
- Real-time subscriptions out of the box
- High performance with connection pooling and query optimization
- Powerful admin console for managing schema and permissions

## Architecture

### Current Setup

- **Database**: PostgreSQL (same as before)
- **GraphQL Engine**: Hasura GraphQL Engine (v2.40.0)
- **Authentication**: NextAuth.js v5 with JWT strategy
- **Frontend**: Next.js with Apollo Client pointing to Hasura
- **API Proxy**: Next.js API route at `/api/hasura/v1/graphql` that proxies to Hasura

### Authentication Flow

1. User authenticates via NextAuth.js (email, password, SMS, or WebAuthn)
2. NextAuth.js generates a JWT token with Hasura-specific claims:
   ```json
   {
     "https://hasura.io/jwt/claims": {
       "x-hasura-allowed-roles": ["user", "anonymous"],
       "x-hasura-default-role": "user",
       "x-hasura-user-id": "user_id_here",
       "x-hasura-member-id": "member_id_here"
     }
   }
   ```
3. The Next.js proxy route extracts the session and passes user context to Hasura
4. Hasura validates the JWT and enforces permissions based on the user's role

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- Hasura CLI installed (optional, for migrations):
  ```bash
  npm install --global hasura-cli
  ```

### Initial Setup

1. **Start the services**:
   ```bash
   docker-compose up -d
   ```

2. **Apply database migrations**:
   ```bash
   npm run hasura:migrate:apply
   ```

3. **Apply Hasura metadata** (tables, relationships, permissions):
   ```bash
   npm run hasura:metadata:apply
   ```

4. **Seed the database** (optional):
   ```bash
   npm run db:seed
   ```

5. **Access the Hasura Console**:
   - URL: http://localhost:8080/console
   - Admin Secret: Set in `.env.local` as `HASURA_GRAPHQL_ADMIN_SECRET`

### Environment Variables

Add these to your `.env.local` file:

```env
# Hasura Configuration
HASURA_GRAPHQL_ADMIN_SECRET=your-admin-secret-here
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"your-jwt-secret-minimum-32-characters"}
HASURA_ENDPOINT=http://localhost:8080

# PostgreSQL Configuration (already exists)
DATABASE_URL=postgresql://myuser:mypassword@localhost:5433/lab_crm
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=lab_crm

# NextAuth Configuration (already exists)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

**Important**: The `HASURA_GRAPHQL_JWT_SECRET` must match the secret used by NextAuth.js. The key should be at least 32 characters long.

## Project Structure

```
hasura/
├── config.yaml                 # Hasura CLI configuration
├── metadata/                   # Hasura metadata (tables, permissions, etc.)
│   ├── databases/
│   │   └── default/
│   │       └── tables/
│   │           └── tables.yaml # Table tracking and relationships
│   ├── actions.yaml
│   ├── allow_list.yaml
│   ├── cron_triggers.yaml
│   ├── remote_schemas.yaml
│   ├── rest_endpoints.yaml
│   └── version.yaml
└── migrations/                 # Database migrations
    └── default/
        ├── 1733000000000_init_schema/
        │   ├── up.sql          # Initial database schema
        │   └── down.sql
        └── 1733000000001_add_computed_fields/
            ├── up.sql          # Computed field functions
            └── down.sql
```

## Database Schema

### Core Tables

- **Member**: Lab members (students, researchers, PIs)
- **Project**: Research projects
- **Equipment**: Lab equipment and tools
- **Booking**: Equipment reservations
- **Event**: Lab meetings and events
- **Grant**: Funding sources
- **Publication**: Research publications
- **Protocol**: Lab protocols and SOPs
- **Expense**: Financial expenses

### Auth Tables (NextAuth.js)

- **User**: User accounts
- **Account**: OAuth provider accounts
- **Session**: User sessions
- **VerificationToken**: Email verification tokens
- **Authenticator**: WebAuthn credentials
- **SmsVerificationCode**: SMS 2FA codes
- **WebAuthnChallenge**: WebAuthn challenges

### Relationships

Hasura automatically tracks all foreign key relationships:

- **1:1**: User ↔ Member
- **1:M**: Member → AcademicInfo, Member → Bookings, etc.
- **M:N**: Member ↔ Project, Member ↔ Publication, etc.

### Computed Fields

We've added SQL functions for computed fields:

- `Project.totalInvestment`: Sum of all expenses for a project
- `Grant.totalSpent`: Sum of all expenses for a grant
- `Grant.remainingBudget`: Budget minus total spent

## Permissions

### Roles

1. **anonymous**: Unauthenticated users
   - Read-only access to public data (members, projects, publications, events)
   - No write access

2. **user**: Authenticated users
   - Read access: All tables
   - Create access: Bookings, NoteTasks
   - Update access: Own profile, own bookings
   - Delete access: Own bookings
   - Special rules:
     - Can only edit Member record if `id` matches `X-Hasura-Member-Id`
     - Can only edit/delete Booking if `memberId` matches `X-Hasura-Member-Id`

3. **admin**: Admin users (future)
   - Full access to all operations

### Permission Examples

**Member Table** (user role):
- Select: All members (no filter)
- Update: Only own profile (`id = X-Hasura-Member-Id`)

**Booking Table** (user role):
- Select: All bookings (no filter)
- Insert: Any booking
- Update: Only own bookings (`memberId = X-Hasura-Member-Id`)
- Delete: Only own bookings (`memberId = X-Hasura-Member-Id`)

**Account/Session Tables** (user role):
- Select: Only own records (`userId = X-Hasura-User-Id`)

## Using the Hasura Console

### Access

```bash
npm run hasura:console
```

Or directly at: http://localhost:8080/console

### Features

1. **Data Browser**: View and edit data in tables
2. **GraphiQL**: Test GraphQL queries and mutations
3. **Schema Explorer**: View database schema and relationships
4. **Permissions**: Configure role-based access control
5. **Events**: Set up event triggers
6. **Remote Schemas**: Add external GraphQL APIs
7. **Actions**: Create custom business logic

### GraphiQL Examples

**Query all members**:
```graphql
query GetMembers {
  Member {
    id
    name
    rank
    status
    role
    photoUrl
    academicInfo {
      degree
      institution
      graduationYear
    }
  }
}
```

**Query a project with computed field**:
```graphql
query GetProject($id: String!) {
  Project_by_pk(id: $id) {
    id
    title
    description
    totalInvestment
    expenses {
      description
      amount
      date
    }
  }
}
```

**Create a booking**:
```graphql
mutation CreateBooking($object: Booking_insert_input!) {
  insert_Booking_one(object: $object) {
    id
    startTime
    endTime
    purpose
    equipment {
      name
    }
    member {
      name
    }
  }
}
```

Variables:
```json
{
  "object": {
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T12:00:00Z",
    "purpose": "PCR experiment",
    "equipmentId": "equipment_id_here",
    "memberId": "member_id_here"
  }
}
```

## Migrations

### Creating New Migrations

1. **Via Console** (recommended):
   ```bash
   npm run hasura:console
   ```
   Make changes in the console, and Hasura CLI will auto-generate migration files.

2. **Manually**:
   Create a new migration directory:
   ```bash
   cd hasura
   hasura migrate create "migration_name" --database-name default
   ```
   
   Edit the `up.sql` and `down.sql` files.

3. **Apply Migrations**:
   ```bash
   npm run hasura:migrate:apply
   ```

4. **Check Migration Status**:
   ```bash
   npm run hasura:migrate:status
   ```

### Migration Best Practices

- Always test migrations locally before applying to production
- Create rollback migrations (`down.sql`) for every migration
- Use descriptive migration names
- Keep migrations atomic (one logical change per migration)
- Version control all migration files

## Metadata

### Exporting Metadata

After making changes in the Hasura Console:

```bash
npm run hasura:metadata:export
```

This exports all metadata (tables, relationships, permissions) to YAML files.

### Applying Metadata

To apply metadata to a new Hasura instance:

```bash
npm run hasura:metadata:apply
```

### Metadata Files

- `databases/default/tables/tables.yaml`: All table configurations
- `actions.yaml`: Custom actions
- `remote_schemas.yaml`: Remote schema configurations
- `cron_triggers.yaml`: Scheduled events

## Deployment

### Docker Compose (Development)

Already configured in `docker-compose.yml`:

```yaml
graphql-engine:
  image: hasura/graphql-engine:v2.40.0
  ports:
    - "8080:8080"
  depends_on:
    - db
  environment:
    HASURA_GRAPHQL_DATABASE_URL: postgresql://...
    HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
    HASURA_GRAPHQL_ADMIN_SECRET: ${HASURA_GRAPHQL_ADMIN_SECRET}
    HASURA_GRAPHQL_JWT_SECRET: ${HASURA_GRAPHQL_JWT_SECRET}
```

### Production Deployment

1. **Disable Console**:
   ```yaml
   HASURA_GRAPHQL_ENABLE_CONSOLE: "false"
   ```

2. **Use Strong Admin Secret**:
   Generate a secure random string for `HASURA_GRAPHQL_ADMIN_SECRET`.

3. **Apply Migrations on Startup**:
   Add a startup script that runs:
   ```bash
   hasura migrate apply --skip-update-check
   hasura metadata apply --skip-update-check
   ```

4. **Monitor Hasura**:
   - Enable metrics endpoint
   - Set up logging
   - Monitor query performance

### Hasura Cloud (Alternative)

Instead of self-hosting, you can use Hasura Cloud:

1. Sign up at https://cloud.hasura.io
2. Create a new project
3. Connect to your PostgreSQL database
4. Update `HASURA_ENDPOINT` in `.env.local`
5. Apply migrations and metadata

## Troubleshooting

### Common Issues

**Issue**: "JWTInvalid" error
- **Solution**: Ensure `HASURA_GRAPHQL_JWT_SECRET` matches the NextAuth.js secret
- Check that JWT token contains Hasura claims

**Issue**: "PermissionDenied" error
- **Solution**: Check role permissions in Hasura Console
- Verify that `X-Hasura-User-Id` and `X-Hasura-Member-Id` are being passed correctly

**Issue**: Relationships not showing up
- **Solution**: Run `npm run hasura:metadata:apply` to apply relationship configurations

**Issue**: Computed fields not working
- **Solution**: Ensure SQL functions are created and tracked in Hasura Console

### Debugging

1. **Check Hasura Logs**:
   ```bash
   docker-compose logs graphql-engine
   ```

2. **Test GraphQL Queries**:
   Use the GraphiQL interface in Hasura Console

3. **Verify JWT Token**:
   Decode the JWT token at https://jwt.io to check claims

4. **Check Database Connection**:
   ```bash
   docker-compose exec graphql-engine env | grep DATABASE
   ```

## Advanced Features

### Subscriptions

Hasura supports real-time GraphQL subscriptions:

```graphql
subscription OnNewBooking {
  Booking(order_by: {createdAt: desc}, limit: 10) {
    id
    startTime
    endTime
    member {
      name
    }
    equipment {
      name
    }
  }
}
```

### Event Triggers

Create event triggers to run webhooks on database events:

1. Go to Events tab in Hasura Console
2. Create a new event trigger
3. Choose table and operation (INSERT, UPDATE, DELETE)
4. Set webhook URL
5. Configure retry logic

### Actions

Create custom GraphQL mutations that call your Next.js API:

1. Go to Actions tab in Hasura Console
2. Define custom type and action
3. Set handler URL (e.g., `http://app:3000/api/custom-action`)
4. Implement the handler in Next.js

### Remote Schemas

Integrate external GraphQL APIs:

1. Go to Remote Schemas tab
2. Add remote schema URL
3. Hasura will merge it with your schema

## Performance Optimization

### Connection Pooling

Already configured in `databases.yaml`:
```yaml
pool_settings:
  connection_lifetime: 600
  idle_timeout: 180
  max_connections: 50
  retries: 1
```

### Query Performance

- Use `@cached` directive for frequently accessed data
- Add database indexes for commonly queried fields
- Use aggregations instead of fetching all records
- Limit result sets with `limit` and `offset`

### Monitoring

Track these metrics:
- Query execution time
- Database connection pool usage
- Error rates
- Active subscriptions

## Migration from Custom GraphQL

### Changes Made

1. **Removed**:
   - `src/app/api/graphql/route.ts` - Custom Apollo Server
   - `src/graphql/schema.graphql` - Manual schema definition
   - `src/graphql/resolvers/` - Custom resolvers
   - `src/graphql/context.ts` - Custom context

2. **Added**:
   - `hasura/` directory - Hasura configuration
   - `src/app/api/hasura/v1/graphql/route.ts` - Hasura proxy
   - Hasura-specific JWT claims in NextAuth.js

3. **Modified**:
   - `src/lib/apollo-client.ts` - Now points to Hasura endpoint
   - `src/lib/auth.ts` - Added Hasura JWT claims
   - `docker-compose.yml` - Added Hasura service
   - `package.json` - Removed Apollo Server dependencies, added Hasura scripts

### GraphQL API Changes

**Old (Custom)**:
```graphql
mutation CreateMember($input: CreateMemberInput!) {
  createMember(input: $input) {
    id
    name
  }
}
```

**New (Hasura)**:
```graphql
mutation CreateMember($object: Member_insert_input!) {
  insert_Member_one(object: $object) {
    id
    name
  }
}
```

Key differences:
- Hasura uses `insert_[Table]_one` for single inserts
- Hasura uses `insert_[Table]` for batch inserts
- Hasura uses `update_[Table]_by_pk` for updates by primary key
- Hasura uses `delete_[Table]_by_pk` for deletes by primary key
- Hasura uses `[Table]_by_pk` for queries by primary key

## Resources

- [Hasura Documentation](https://hasura.io/docs/latest/index/)
- [Hasura GraphQL API Reference](https://hasura.io/docs/latest/api-reference/graphql-api/)
- [Hasura Permissions](https://hasura.io/docs/latest/auth/authorization/)
- [Hasura CLI](https://hasura.io/docs/latest/hasura-cli/overview/)
- [NextAuth.js with Hasura](https://hasura.io/docs/latest/auth/authentication/nextjs/)

## Support

For issues or questions:
1. Check this documentation
2. Check Hasura logs: `docker-compose logs graphql-engine`
3. Test in Hasura Console: http://localhost:8080/console
4. Review Hasura documentation
5. Contact the development team

