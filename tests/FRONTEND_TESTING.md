# Frontend Testing Guide

This guide explains how to test the frontend of the Lab CRM application.

## Overview

The frontend testing setup includes:
- **Component Tests**: Unit tests for React components using Vitest + React Testing Library
- **E2E Tests**: End-to-end tests using Playwright

## Component Testing

### Setup

Component tests use:
- **Vitest** - Test runner
- **React Testing Library** - Component testing utilities
- **jsdom** - DOM environment
- **@apollo/client/testing** - Mock Apollo Client for GraphQL

### Running Component Tests

```bash
# Run all component tests
npm run test:component

# Run component tests in watch mode
npm run test:component:ui

# Run specific component test file
npm run test src/components/ui/button.test.tsx
```

### Writing Component Tests

Example component test:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/../tests/utils/test-utils';
import { Button } from './button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
});
```

### Testing Components with Apollo Client

For components that use GraphQL queries:

```tsx
import { render, screen, waitFor } from '@/../tests/utils/test-utils';
import { createMockResponse } from '@/../tests/mocks/apollo-client';
import { gql } from '@apollo/client';
import { MyComponent } from './my-component';

const GET_DATA = gql`
  query GetData {
    data {
      id
      name
    }
  }
`;

describe('MyComponent', () => {
  it('renders data from GraphQL query', async () => {
    const mocks = [
      createMockResponse(GET_DATA, {}, {
        data: { id: '1', name: 'Test' }
      })
    ];

    render(<MyComponent />, { mocks });
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});
```

### Test Utilities

- `tests/utils/test-utils.tsx` - Custom render function with Apollo Provider
- `tests/mocks/apollo-client.ts` - Helper functions for creating GraphQL mocks

## E2E Testing

### Setup

E2E tests use:
- **Playwright** - Browser automation framework
- Runs against the Next.js dev server (automatically started)

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

### Writing E2E Tests

Example E2E test:

```typescript
import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});
```

### E2E Helpers

- `tests/e2e/helpers.ts` - Helper functions for common E2E operations
  - `login()` - Login a user
  - `waitForGraphQLResponse()` - Wait for GraphQL queries to complete
  - `navigateTo()` - Navigate to a page
  - `waitForToast()` - Wait for toast notifications

## Running All Tests

```bash
# Run all tests (backend + component + E2E)
npm run test:all

# Run only backend tests
npm run test:backend

# Run only component tests
npm run test:component

# Run only E2E tests
npm run test:e2e
```

## Test File Locations

- **Component tests**: `src/**/*.test.tsx` (next to components)
- **E2E tests**: `tests/e2e/**/*.spec.ts`
- **Backend tests**: `tests/**/*.test.ts`

## Configuration Files

- `vitest.config.ts` - Vitest configuration for component tests
- `playwright.config.ts` - Playwright configuration for E2E tests
- `tests/setup-react.ts` - Setup file for React component tests
- `tests/utils/test-utils.tsx` - Test utilities

## Best Practices

1. **Component Tests**:
   - Test user interactions, not implementation details
   - Use `screen.getByRole()` for accessible queries
   - Mock GraphQL queries with `createMockResponse()`
   - Test loading and error states

2. **E2E Tests**:
   - Use helper functions for common operations
   - Wait for network requests to complete
   - Use data-testid attributes for stable selectors
   - Keep tests focused on user workflows

3. **Test Organization**:
   - Keep component tests next to components
   - Group related tests with `describe` blocks
   - Use descriptive test names
   - Clean up after tests

## Troubleshooting

### Component Tests

- **"Cannot find module" errors**: Check that `@/` alias is configured in `vitest.config.ts`
- **Apollo Client errors**: Ensure mocks are properly set up with `createMockResponse()`
- **Next.js router errors**: The router is mocked in `tests/setup-react.ts`

### E2E Tests

- **Server not starting**: Ensure port 3000 is available
- **Timeout errors**: Increase timeout in `playwright.config.ts`
- **Element not found**: Use `page.waitForSelector()` before interacting

## Examples

See the following example test files:
- `src/components/ui/button.test.tsx` - Simple component test
- `src/components/dashboard/stats-card.test.tsx` - Component with props
- `tests/e2e/dashboard.spec.ts` - E2E test example
- `tests/e2e/auth.spec.ts` - Authentication E2E test

