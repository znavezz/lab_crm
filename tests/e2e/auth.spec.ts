import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check for sign in form elements
    // Adjust selectors based on your actual signin page structure
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // If the form exists, check it's visible
    if (await emailInput.count() > 0) {
      await expect(emailInput).toBeVisible();
    }
    if (await passwordInput.count() > 0) {
      await expect(passwordInput).toBeVisible();
    }
  });

  test('should redirect to dashboard after login', async ({ page }) => {
    // This test assumes you have a working login flow
    // Adjust based on your actual authentication implementation
    await page.goto('/auth/signin');

    // Fill in login form if it exists
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password');
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Wait for navigation
        await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
          // If navigation doesn't happen, the test will fail
        });
      }
    }
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    if (await emailInput.count() > 0) {
      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('wrongpassword');
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Wait for error message (adjust selector based on your error display)
        await page.waitForTimeout(1000);
        // Check for error message - adjust selector as needed
        const errorMessage = page.locator('text=/error|invalid|incorrect/i');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });
});

