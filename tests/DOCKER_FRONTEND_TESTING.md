# Docker Frontend Testing Guide

This guide explains how to run frontend tests using Docker.

## Overview

The Docker setup includes:
- **Component Tests**: React component tests using Vitest
- **E2E Tests**: End-to-end tests using Playwright (with Chromium)

## Prerequisites

1. Docker and Docker Compose installed
2. Test database created (run `npm run test:docker:setup`)

## Running Tests in Docker

### Component Tests

```bash
# Run component tests in Docker
docker-compose run --rm test npm run test:docker:component

# Run component tests with UI
docker-compose run --rm test npm run test:docker:component -- --ui
```

### E2E Tests

For E2E tests, you need the app server running:

```bash
# Start the app and database
docker-compose up -d app db

# Wait for app to be ready
sleep 10

# Run E2E tests
docker-compose run --rm -e DOCKER=true test npm run test:docker:e2e

# Run E2E tests in headed mode (requires X11 forwarding)
docker-compose run --rm -e DOCKER=true test npm run test:docker:e2e -- --headed
```

### All Tests

```bash
# Run all tests (backend + component)
docker-compose run --rm test npm run test:docker:all

# Or run backend and component tests separately
docker-compose run --rm test npm run test:docker
docker-compose run --rm test npm run test:docker:component
```

## Docker Services

### Test Service

The `test` service in `docker-compose.yml`:
- Uses `Dockerfile.test` which includes Playwright dependencies
- Has access to the database via `db` service
- Mounts your code for live updates
- Uses test database by default

### App Service

The `app` service:
- Runs the Next.js dev server
- Required for E2E tests
- Accessible at `http://localhost:3000`

## Configuration

### Environment Variables

The test service uses:
- `DATABASE_URL`: Points to test database
- `TEST_DATABASE_URL`: Same as DATABASE_URL
- `DOCKER=true`: Disables Playwright webServer (app already running)

### Playwright in Docker

Playwright is configured to:
- Use system Chromium (installed in Dockerfile.test)
- Skip browser download (uses system browser)
- Work in headless mode by default

## Troubleshooting

### Test Database Not Found

```bash
# Create test database
docker-compose exec db psql -U myuser -d postgres -c "CREATE DATABASE test_lab_crm;"

# Run migrations
docker-compose exec test sh -c 'DATABASE_URL="postgresql://myuser:mysecretpassword@db:5432/test_lab_crm?schema=public" npx prisma migrate deploy'
```

### E2E Tests Can't Connect to App

1. Ensure app service is running: `docker-compose up -d app`
2. Check app is accessible: `curl http://localhost:3000`
3. Wait for app to fully start (may take 10-30 seconds)

### Playwright Browser Issues

If Playwright can't find Chromium:
```bash
# Check Chromium is installed
docker-compose run --rm test which chromium-browser

# Verify Playwright config
docker-compose run --rm test env | grep PLAYWRIGHT
```

### Component Tests Failing

1. Check dependencies are installed:
   ```bash
   docker-compose run --rm test npm install --legacy-peer-deps
   ```

2. Verify test files are accessible:
   ```bash
   docker-compose run --rm test ls -la src/**/*.test.tsx
   ```

## Example Workflow

```bash
# 1. Start services
docker-compose up -d db app

# 2. Setup test database (first time only)
npm run test:docker:setup
docker-compose exec test sh -c 'DATABASE_URL="postgresql://myuser:mysecretpassword@db:5432/test_lab_crm?schema=public" npx prisma migrate deploy'

# 3. Run backend tests
docker-compose run --rm test npm run test:docker

# 4. Run component tests
docker-compose run --rm test npm run test:docker:component

# 5. Run E2E tests (app must be running)
docker-compose run --rm -e DOCKER=true test npm run test:docker:e2e
```

## CI/CD Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests in Docker
  run: |
    docker-compose up -d db app
    docker-compose run --rm test npm run test:docker:all
    docker-compose run --rm -e DOCKER=true test npm run test:docker:e2e
```

## Notes

- Component tests run faster than E2E tests
- E2E tests require the app server to be running
- All tests use the same test database
- Test database is cleaned between test runs
- Playwright runs in headless mode in Docker by default

