# Hasura Migration - Getting Started

## ✅ Current Status

Good news! Your Hasura migration is complete and Hasura is now running successfully!

- ✅ Docker services are running (db, app, graphql-engine)
- ✅ Database schema is migrated
- ✅ SQL computed fields are applied  
- ✅ Hasura GraphQL Engine is running on port 8080

## Issues to Fix

### 1. Database Connection for Local Next.js

You're running Next.js locally (port 3001) but it's trying to connect to `db:5432` which only works inside Docker. 

**Solution**: Update your `.env.local` to use `localhost:5433`:

```env
# Change this line:
DATABASE_URL="postgresql://myuser:mysecretpassword@db:5432/lab_crm"

# To this:
DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/lab_crm"
```

### 2. Apply Hasura Metadata

The metadata (table tracking, relationships, permissions) still needs to be applied. Since you don't have Hasura CLI installed, use the Hasura Console:

1. Open http://localhost:8080/console
2. Enter admin secret: `hasura_admin_secret_change_in_production`
3. Go to "Data" tab
4. Click "Track All" for tables
5. Click "Track All" for relationships

Or install Hasura CLI and run:
```bash
npm install --global hasura-cli@latest
cd hasura
hasura metadata apply --admin-secret hasura_admin_secret_change_in_production
```

### 3. JWT Session Errors

The errors like "no matching decryption secret" are because you have old session cookies. 

**Solution**: Clear your browser cookies for localhost:3001 or use an incognito window.

## Quick Test

1. **Fix DATABASE_URL** in `.env.local`:
   ```bash
   sed -i.bak 's/@db:5432/@localhost:5433/g' .env.local
   ```

2. **Access Hasura Console**:
   - URL: http://localhost:8080/console
   - Admin Secret: `hasura_admin_secret_change_in_production`

3. **Track Tables** in Hasura Console:
   - Go to Data → default → Public
   - Click "Track All" for untracked tables
   - Click "Track All" for relationships

4. **Test GraphQL Query**:
   In Hasura Console GraphiQL tab:
   ```graphql
   query {
     Member {
       id
       name
       rank
     }
   }
   ```

5. **Restart Next.js** (after fixing DATABASE_URL):
   ```bash
   # Stop current dev server (Ctrl+C)
   npm run dev
   ```

## Environment Variables

Make sure your `.env.local` has these:

```env
# Database
DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/lab_crm"
POSTGRES_USER="myuser"
POSTGRES_PASSWORD="mysecretpassword"
POSTGRES_DB="lab_crm"

# Hasura
HASURA_GRAPHQL_ADMIN_SECRET=hasura_admin_secret_change_in_production
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"this-is-a-dev-secret-key-change-in-production-minimum-32-characters"}
HASURA_ENDPOINT=http://localhost:8080
NEXT_PUBLIC_HASURA_ENDPOINT=/api/hasura/v1/graphql

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-minimum-32-characters
```

## Verification

To verify everything is working:

1. **Check Hasura is running**:
   ```bash
   curl http://localhost:8080/healthz
   # Should return: OK
   ```

2. **Check Next.js can connect to DB**:
   Start dev server and visit http://localhost:3001

3. **Check GraphQL endpoint**:
   ```bash
   curl -X POST http://localhost:8080/v1/graphql \
     -H "Content-Type: application/json" \
     -H "x-hasura-admin-secret: hasura_admin_secret_change_in_production" \
     -d '{"query":"{ __typename }"}'
   ```

## Next Steps

1. Fix DATABASE_URL in `.env.local`
2. Track tables in Hasura Console
3. Clear browser cookies
4. Restart Next.js dev server
5. Test the application

## Troubleshooting

**Hasura Console not accessible?**
```bash
docker-compose logs graphql-engine --tail=20
```

**Database connection issues?**
```bash
# Check PostgreSQL is running
docker-compose ps db

# Test connection
docker-compose exec db psql -U myuser -d lab_crm -c "SELECT count(*) FROM \"Member\";"
```

**Need to restart everything?**
```bash
docker-compose restart
```

## Documentation

- [HASURA_SETUP.md](./HASURA_SETUP.md) - Full setup guide
- [HASURA_MIGRATION_SUMMARY.md](./HASURA_MIGRATION_SUMMARY.md) - What changed
- [HASURA_QUICKSTART.md](./HASURA_QUICKSTART.md) - Quick start guide

---

**Status**: Hasura is running! Just need to fix the DATABASE_URL and track tables.

