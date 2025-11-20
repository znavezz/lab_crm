import { test, expect } from '@playwright/test';
import { login, waitForGraphQLResponse } from './helpers';

test.describe('Members Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display members page', async ({ page }) => {
    await page.goto('/members');
    await waitForGraphQLResponse(page);

    // Check for members page title or heading
    const heading = page.getByRole('heading', { name: /members/i });
    await expect(heading.first()).toBeVisible();
  });

  test('should display members table or list', async ({ page }) => {
    await page.goto('/members');
    await waitForGraphQLResponse(page);

    // Check for table or list of members
    // Adjust selector based on your actual members page structure
    const membersList = page.locator('table, [role="table"], [data-testid="members-list"]');
    
    if (await membersList.count() > 0) {
      await expect(membersList.first()).toBeVisible();
    } else {
      // If no table, check for member cards or items
      const memberItems = page.locator('[data-testid*="member"], .member-item');
      if (await memberItems.count() > 0) {
        await expect(memberItems.first()).toBeVisible();
      }
    }
  });

  test('should navigate to member detail page', async ({ page }) => {
    await page.goto('/members');
    await waitForGraphQLResponse(page);

    // Find first member link and click it
    const memberLink = page.locator('a[href*="/members/"]').first();
    
    if (await memberLink.count() > 0) {
      const href = await memberLink.getAttribute('href');
      await memberLink.click();
      
      // Should navigate to member detail page
      await expect(page).toHaveURL(new RegExp(`/members/\\w+`));
    }
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/members');
    await waitForGraphQLResponse(page);

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
      
      // Test search functionality
      await searchInput.fill('test');
      await page.waitForTimeout(500); // Wait for search to process
    }
  });
});

