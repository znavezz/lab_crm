# Hasura Migration - Quick Start Guide

🎉 **Migration Complete!** Your backend has been successfully migrated from custom Apollo Server to Hasura GraphQL Engine.

## What to Do Now

### 1. Update Your Environment Variables

Add these to your `.env.local` file:

```env
# Hasura Configuration
HASURA_GRAPHQL_ADMIN_SECRET=hasura_admin_secret_change_in_production
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"this-is-a-dev-secret-key-change-in-production-minimum-32-characters"}
HASURA_ENDPOINT=http://localhost:8080

# Make sure you have these existing variables:
# DATABASE_URL=postgresql://myuser:mypassword@localhost:5433/lab_crm
# POSTGRES_USER=myuser
# POSTGRES_PASSWORD=mypassword
# POSTGRES_DB=lab_crm
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your-nextauth-secret-here
```

### 2. Start the Services

```bash
# Start all services (PostgreSQL, Next.js, Hasura)
docker-compose up -d

# Check that all services are running
docker-compose ps
```

### 3. Apply Database Migrations

```bash
# Apply Hasura migrations (creates all tables)
npm run hasura:migrate:apply

# Apply Hasura metadata (tracks tables, sets up relationships and permissions)
npm run hasura:metadata:apply
```

### 4. Seed the Database (Optional)

```bash
# Seed with sample data
npm run db:seed
```

### 5. Access Hasura Console

Open your browser and go to:
- **URL**: http://localhost:8080/console
- **Admin Secret**: `hasura_admin_secret_change_in_production` (or whatever you set in `.env.local`)

### 6. Start Next.js Development Server

```bash
# If not already running in Docker, or to run locally:
npm run dev
```

Visit http://localhost:3000 to see your application.

### 7. Test GraphQL Queries

In the Hasura Console, go to the "GraphiQL" tab and try:

```graphql
query GetMembers {
  Member {
    id
    name
    rank
    status
    role
  }
}
```

## Key Changes

### GraphQL Endpoint

- **Old**: `/api/graphql` (custom Apollo Server)
- **New**: `/api/hasura/v1/graphql` (Hasura proxy)

The Apollo Client has been updated automatically to use the new endpoint.

### Query Syntax Changes

Most queries remain the same, but mutations have changed:

**Old**:
```graphql
mutation CreateMember($input: CreateMemberInput!) {
  createMember(input: $input) {
    id
    name
  }
}
```

**New**:
```graphql
mutation CreateMember($object: Member_insert_input!) {
  insert_Member_one(object: $object) {
    id
    name
  }
}
```

### New Features Available

1. **Real-time Subscriptions**: Subscribe to data changes
   ```graphql
   subscription OnNewBooking {
     Booking(order_by: {createdAt: desc}, limit: 10) {
       id
       startTime
       member { name }
     }
   }
   ```

2. **Computed Fields**: Available on Project and Grant
   ```graphql
   query GetProject($id: String!) {
     Project_by_pk(id: $id) {
       totalInvestment  # Auto-calculated from expenses
     }
   }
   ```

3. **Advanced Filtering**: Use Hasura's powerful filter operators
   ```graphql
   query GetActiveMembers {
     Member(where: {status: {_eq: ACTIVE}}) {
       id
       name
     }
   }
   ```

## Useful Commands

```bash
# Open Hasura Console
npm run hasura:console

# Check migration status
npm run hasura:migrate:status

# Export current metadata
npm run hasura:metadata:export

# View Hasura logs
docker-compose logs graphql-engine

# Restart Hasura service
docker-compose restart graphql-engine
```

## Documentation

- **[HASURA_SETUP.md](./HASURA_SETUP.md)**: Comprehensive setup and usage guide
- **[HASURA_MIGRATION_SUMMARY.md](./HASURA_MIGRATION_SUMMARY.md)**: Summary of changes made
- **[hasura.plan.md](./hasura.plan.md)**: Original migration plan

## Troubleshooting

### Issue: Services won't start
```bash
docker-compose down
docker-compose up -d
```

### Issue: "JWTInvalid" error
- Make sure `HASURA_GRAPHQL_JWT_SECRET` is set correctly in `.env.local`
- Restart the Hasura service: `docker-compose restart graphql-engine`

### Issue: Tables not showing in Hasura Console
```bash
npm run hasura:metadata:apply
```

### Issue: Permission denied errors
- Check the Hasura Console → Data → [Table] → Permissions
- Make sure you're logged in (authenticated users have the "user" role)

## Next Steps

1. ✅ Review the Hasura Console and explore your schema
2. ✅ Test your existing frontend features
3. ✅ Read [HASURA_SETUP.md](./HASURA_SETUP.md) for advanced features
4. ✅ Update any custom GraphQL queries in your frontend (if needed)
5. ✅ Set up production deployment with secure secrets

## Need Help?

1. Check the documentation files mentioned above
2. Review Hasura logs: `docker-compose logs graphql-engine`
3. Test queries in Hasura Console GraphiQL: http://localhost:8080/console
4. Visit [Hasura Documentation](https://hasura.io/docs/latest/index/)

---

**🚀 Your Hasura-powered backend is ready to use!**

