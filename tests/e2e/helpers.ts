import { Page, expect } from '@playwright/test';

/**
 * Helper function to login a user
 * Adjust this based on your authentication setup
 */
export async function login(page: Page, email: string = 'test@example.com', password: string = 'password') {
  await page.goto('/auth/signin');
  
  // Fill in login form (adjust selectors based on your actual signin page)
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation after login
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Helper function to wait for GraphQL query to complete
 */
export async function waitForGraphQLResponse(page: Page) {
  // Wait for any GraphQL requests to complete
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to navigate to a page and wait for it to load
 */
export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to check if element is visible
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper function to wait for toast notification
 */
export async function waitForToast(page: Page, message?: string) {
  const toastSelector = '[data-sonner-toast]';
  await page.waitForSelector(toastSelector, { timeout: 5000 });
  
  if (message) {
    await expect(page.locator(toastSelector)).toContainText(message);
  }
}

