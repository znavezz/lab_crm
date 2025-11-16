# Docker Testing Guide

This guide explains how to run tests with your Docker setup.

## Docker Architecture

Your Docker Compose setup includes:
- **`db`** service: PostgreSQL database (accessible at `db:5432` inside Docker, `localhost:5433` on host)
- **`app`** service: Next.js application

## Quick Start

### Option 1: Run Tests Inside Docker (Recommended)

Tests run inside the Docker container where the database is easily accessible:

```bash
# 1. Start Docker services
docker-compose up -d

# 2. Setup test database (first time only)
npm run test:docker:setup

# 3. Run migrations on test database
docker-compose exec app sh -c 'DATABASE_URL="postgresql://myuser:mysecretpassword@db:5432/test_lab_crm?schema=public" npx prisma migrate deploy'

# 4. Run tests
npm run test:docker          # Run tests once
npm run test:docker:ui       # Run with UI (requires port forwarding)
```

### Option 2: Run Tests on Host Machine

If you prefer running tests on your host machine:

```bash
# 1. Make sure Docker is running
docker-compose up -d

# 2. Set TEST_DATABASE_URL in .env.local
# Use localhost:5433 to connect from host to Docker database
TEST_DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/test_lab_crm?schema=public"

# 3. Create test database
docker-compose exec db psql -U myuser -d postgres -c "CREATE DATABASE test_lab_crm;"

# 4. Run migrations
DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/test_lab_crm?schema=public" npx prisma migrate deploy

# 5. Run tests
npm test
```

## Environment Variables

### Inside Docker Container

When running tests inside Docker, the `DATABASE_URL` should use the service name `db`:

```env
DATABASE_URL="postgresql://myuser:mysecretpassword@db:5432/lab_crm?schema=public"
TEST_DATABASE_URL="postgresql://myuser:mysecretpassword@db:5432/test_lab_crm?schema=public"
```

### On Host Machine

When running tests on your host machine, use `localhost:5433`:

```env
DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/lab_crm?schema=public"
TEST_DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/test_lab_crm?schema=public"
```

## Setup Scripts

### First Time Setup (Inside Docker)

```bash
# 1. Start services
docker-compose up -d

# 2. Create test database
docker-compose exec db psql -U myuser -d postgres -c "CREATE DATABASE test_lab_crm;"

# 3. Run migrations on test database
docker-compose exec app sh -c 'DATABASE_URL="postgresql://myuser:mysecretpassword@db:5432/test_lab_crm?schema=public" npx prisma migrate deploy'

# 4. Verify setup
docker-compose exec app npm run test:docker
```

### First Time Setup (Host Machine)

```bash
# 1. Start services
docker-compose up -d

# 2. Create test database
docker-compose exec db psql -U myuser -d postgres -c "CREATE DATABASE test_lab_crm;"

# 3. Add to .env.local
echo 'TEST_DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/test_lab_crm?schema=public"' >> .env.local

# 4. Run migrations
DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/test_lab_crm?schema=public" npx prisma migrate deploy

# 5. Run tests
npm test
```

## Running Tests

### Inside Docker

```bash
# Run tests once
npm run test:docker

# Run tests with UI (note: UI won't be accessible unless you forward ports)
npm run test:docker:ui

# Run specific test file
docker-compose exec app npm run test:run tests/database.test.ts
```

### On Host Machine

```bash
# Watch mode
npm test

# Run once
npm run test:run

# With UI
npm run test:ui
```

## Seeding Test Data

### Inside Docker

```bash
# Seed development database
npm run seed:docker:reset

# Seed test database (if needed)
docker-compose exec app sh -c 'DATABASE_URL="postgresql://myuser:mysecretpassword@db:5432/test_lab_crm?schema=public" npm run seed:reset'
```

### On Host Machine

```bash
# Seed development database
npm run seed:reset

# Seed test database (if needed)
DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/test_lab_crm?schema=public" npm run seed:reset
```

## Troubleshooting

### Connection Issues Inside Docker

If tests fail to connect inside Docker:

1. **Check database is running**:
   ```bash
   docker-compose ps
   ```

2. **Check environment variables**:
   ```bash
   docker-compose exec app env | grep DATABASE
   ```

3. **Test database connection**:
   ```bash
   docker-compose exec app sh -c 'DATABASE_URL="postgresql://myuser:mysecretpassword@db:5432/test_lab_crm?schema=public" npx prisma db execute --stdin' <<< "SELECT 1;"
   ```

### Connection Issues on Host

If tests fail to connect from host:

1. **Check port mapping**:
   ```bash
   docker-compose ps
   # Should show: 0.0.0.0:5433->5432/tcp
   ```

2. **Test connection**:
   ```bash
   psql -U myuser -d test_lab_crm -h localhost -p 5433
   ```

3. **Check firewall** (if on Linux):
   ```bash
   sudo ufw allow 5433
   ```

### Database Doesn't Exist

If you get "database does not exist" error:

```bash
# Create test database inside Docker
docker-compose exec db psql -U myuser -d postgres -c "CREATE DATABASE test_lab_crm;"

# Or from host
docker-compose exec db psql -U myuser -d postgres -c "CREATE DATABASE test_lab_crm;"
```

### Migration Issues

If migrations fail:

```bash
# Inside Docker
docker-compose exec app sh -c 'DATABASE_URL="postgresql://myuser:mysecretpassword@db:5432/test_lab_crm?schema=public" npx prisma migrate deploy'

# On host
DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5433/test_lab_crm?schema=public" npx prisma migrate deploy
```

## Best Practices

1. **Use separate test database** - Never test against your development database
2. **Run tests inside Docker** - Ensures consistent environment
3. **Clean test database** - Tests should clean up after themselves
4. **Use environment variables** - Don't hardcode database URLs
5. **Run migrations** - Always run migrations before tests

## CI/CD Integration

For CI/CD pipelines, you can use:

```yaml
# Example GitHub Actions
- name: Setup test database
  run: |
    docker-compose up -d db
    docker-compose exec -T db psql -U myuser -d postgres -c "CREATE DATABASE test_lab_crm;"
    docker-compose exec -T app sh -c 'DATABASE_URL="postgresql://myuser:mysecretpassword@db:5432/test_lab_crm?schema=public" npx prisma migrate deploy'

- name: Run tests
  run: docker-compose exec -T app npm run test:run
```

## Running Different Test Layers

All test layers (Unit, Integration, E2E) work in Docker:

```bash
# Run all tests
npm run test:docker

# Run specific test layer
docker-compose exec app npm run test:run tests/auth.test.ts              # Unit tests
docker-compose exec app npm run test:run tests/auth.integration.test.ts  # Integration tests
docker-compose exec app npm run test:run tests/auth.e2e.test.ts          # E2E tests

# Run all auth tests
docker-compose exec app npm run test:run tests/auth
```

## Summary

- **Inside Docker**: Use `db:5432` as hostname, run with `npm run test:docker`
- **On Host**: Use `localhost:5433` as hostname, run with `npm test`
- **Test Database**: Always use `test_lab_crm` database for tests
- **Migrations**: Run migrations on test database before running tests
- **Test Layers**: All layers (Unit, Integration, E2E) work in Docker

