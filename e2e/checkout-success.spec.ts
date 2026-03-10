import { test, expect } from '@playwright/test';

test.describe('Checkout Success Page', () => {
  test.describe('Page Load', () => {
    test('loads successfully', async ({ page }) => {
      const response = await page.goto('/exchange/checkout/success');
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible();
    });

    test('shows error state without session ID', async ({ page }) => {
      await page.goto('/exchange/checkout/success');
      // Without a session_id param, client JS transitions to error state
      await expect(page.getByText('Something went wrong')).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'Back to Exchange' }),
      ).toBeVisible();
    });
  });

  test.describe('Header', () => {
    test('header is visible', async ({ page }) => {
      await page.goto('/exchange/checkout/success');
      await expect(page.locator('header').first()).toBeVisible();
    });
  });

  test.describe('Footer', () => {
    test('footer is visible', async ({ page }) => {
      await page.goto('/exchange/checkout/success');
      await page.evaluate(() =>
        window.scrollTo(0, document.body.scrollHeight),
      );
      await expect(page.locator('footer').first()).toBeVisible();
    });
  });
});
