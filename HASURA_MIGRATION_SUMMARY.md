# Hasura Migration Summary

This document summarizes the migration from a custom Apollo Server + Prisma GraphQL backend to Hasura GraphQL Engine.

## Overview

We've successfully migrated the Lab CRM backend to use Hasura GraphQL Engine. This migration eliminates custom GraphQL resolvers and replaces them with Hasura's auto-generated, highly optimized GraphQL API.

## What Changed

### Backend

**Removed**:
- Custom Apollo Server at `src/app/api/graphql/route.ts`
- Custom GraphQL schema at `src/graphql/schema.graphql`
- Custom resolvers in `src/graphql/resolvers/`
- Custom GraphQL context at `src/graphql/context.ts`
- Dependencies: `@apollo/server`, `@as-integrations/next`, `@graphql-tools/schema`, `@graphql-tools/merge`, GraphQL codegen packages

**Added**:
- Hasura GraphQL Engine (v2.40.0) in Docker Compose
- Hasura project structure in `hasura/` directory
- Hasura migrations converted from Prisma migrations
- Hasura metadata with table tracking, relationships, and permissions
- SQL functions for computed fields (totalInvestment, totalSpent, remainingBudget)
- Hasura API proxy at `src/app/api/hasura/v1/graphql/route.ts`
- Hasura-specific JWT claims in NextAuth.js configuration

**Modified**:
- Apollo Client now points to Hasura endpoint
- NextAuth.js generates JWT tokens with Hasura claims
- Docker Compose includes Hasura service
- Package.json updated with Hasura CLI scripts

### Database

No changes to the database schema itself - all tables, relationships, and constraints remain the same. We simply:
1. Converted Prisma migrations to Hasura migration format
2. Tracked all tables in Hasura
3. Configured relationships and permissions via Hasura metadata

### Authentication

Enhanced NextAuth.js JWT tokens to include Hasura-specific claims:
```json
{
  "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": ["user", "anonymous"],
    "x-hasura-default-role": "user",
    "x-hasura-user-id": "user_id",
    "x-hasura-member-id": "member_id"
  }
}
```

## Benefits

1. **Auto-generated GraphQL API**: No need to maintain custom resolvers
2. **Performance**: Hasura optimizes queries automatically
3. **Real-time Subscriptions**: Built-in support for GraphQL subscriptions
4. **Authorization**: Powerful role-based permission system
5. **Admin Console**: Visual interface for managing schema and data
6. **Reduced Boilerplate**: Less code to maintain
7. **Better N+1 Query Handling**: Hasura batches and optimizes queries

## Testing

All existing GraphQL operations should work with minimal changes:
- Queries remain mostly the same
- Mutations use Hasura syntax (`insert_[Table]_one` instead of `create[Table]`)
- Relationships are fully functional
- Computed fields work via SQL functions

Run tests:
```bash
npm run test
npm run test:e2e
```

## Next Steps

1. **Start Services**:
   ```bash
   docker-compose up -d
   ```

2. **Apply Migrations**:
   ```bash
   npm run hasura:migrate:apply
   npm run hasura:metadata:apply
   ```

3. **Seed Database** (optional):
   ```bash
   npm run db:seed
   ```

4. **Access Hasura Console**:
   - URL: http://localhost:8080/console
   - Admin Secret: Set in `.env.local`

5. **Test the Application**:
   ```bash
   npm run dev
   ```

## Documentation

See [HASURA_SETUP.md](./HASURA_SETUP.md) for comprehensive setup and usage guide.

## Rollback Plan

If needed, the old GraphQL implementation is preserved in git history. To rollback:
1. Revert the Hasura migration commits
2. Restore deleted files from git history
3. Reinstall removed dependencies
4. Restart services

However, Hasura is production-ready and well-tested, so rollback should not be necessary.

## Support

For questions or issues:
1. Check [HASURA_SETUP.md](./HASURA_SETUP.md)
2. Review Hasura logs: `docker-compose logs graphql-engine`
3. Test in Hasura Console: http://localhost:8080/console
4. Contact the development team

