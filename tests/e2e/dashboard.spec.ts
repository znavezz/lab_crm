import { test, expect } from '@playwright/test';
import { login, waitForGraphQLResponse } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should display dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForGraphQLResponse(page);

    // Check for dashboard title
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForGraphQLResponse(page);

    // Check for stats cards
    const statsCards = page.locator('[data-slot="card"]');
    await expect(statsCards.first()).toBeVisible();
  });

  test('should navigate to members page from stats card', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForGraphQLResponse(page);

    // Click on members stats card
    const membersCard = page.getByText('Active Members').first();
    await membersCard.click();

    // Should navigate to members page
    await expect(page).toHaveURL(/\/members/);
  });

  test('should display recent activities', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForGraphQLResponse(page);

    // Check for recent activities section
    const recentActivities = page.getByText('Recent Activities');
    await expect(recentActivities).toBeVisible();
  });

  test('should display upcoming events', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForGraphQLResponse(page);

    // Check for upcoming events section
    const upcomingEvents = page.getByText('Upcoming Events');
    await expect(upcomingEvents).toBeVisible();
  });
});

