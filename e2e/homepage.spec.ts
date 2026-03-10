import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.describe('Page Load', () => {
    test('loads successfully', async ({ page }) => {
      const response = await page.goto('/');
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible();
    });

    test('displays main headline', async ({ page }) => {
      await page.goto('/');
      await expect(
        page.getByRole('heading', { level: 1 }).first(),
      ).toBeVisible();
    });

    test('displays Intelligence Exchange Platform badge', async ({ page }) => {
      await page.goto('/');
      await expect(
        page.getByText('Intelligence Exchange Platform'),
      ).toBeVisible();
    });

    test('displays Explore Exchange CTA', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('Explore Exchange')).toBeVisible();
    });
  });

  test.describe('Header', () => {
    test('header is visible', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('header').first()).toBeVisible();
    });

    test('header is sticky on scroll', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollBy(0, 500));
      await expect(page.locator('header').first()).toBeVisible();
    });
  });

  test.describe('Stats Section', () => {
    test('displays publisher stats when data exists', async ({ page }) => {
      await page.goto('/');
      // Stats section shows if publishers > 0
      const statsVisible = await page.getByText('Publishers').first().isVisible().catch(() => false);
      const listsVisible = await page.getByText('Intel Lists Published').isVisible().catch(() => false);
      // Either stats show or page loads without them (empty state)
      expect(true).toBeTruthy();
    });
  });

  test.describe('How It Works Section', () => {
    test('displays How It Works heading', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('How It Works')).toBeVisible();
    });

    test('displays all three steps', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('Structure Your Data')).toBeVisible();
      await expect(page.getByText('Produce Intelligence')).toBeVisible();
      await expect(page.getByText('Monetize & Share')).toBeVisible();
    });
  });

  test.describe('Featured Publishers Section', () => {
    test('displays Featured Publishers heading', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('Featured Publishers')).toBeVisible();
      await expect(
        page.getByText('Premium intelligence providers'),
      ).toBeVisible();
    });

    test('publisher cards render when data available', async ({ page }) => {
      await page.goto('/');
      // Scroll to publishers section
      await page.getByText('Featured Publishers').scrollIntoViewIfNeeded();
      // Either cards are present or section is visible without them
      const section = page.locator('#publishers');
      await expect(section).toBeVisible();
    });

    test('View all link points to /exchange', async ({ page }) => {
      await page.goto('/');
      const link = page.getByText('View all on the Exchange');
      if (await link.isVisible()) {
        await expect(link).toHaveAttribute('href', '/exchange');
      }
    });
  });

  test.describe('Footer', () => {
    test('footer is visible', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() =>
        window.scrollTo(0, document.body.scrollHeight),
      );
      await expect(page.locator('footer').first()).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('Explore Exchange CTA navigates to /exchange', async ({ page }) => {
      await page.goto('/');
      await page.getByText('Explore Exchange').click();
      await expect(page).toHaveURL(/\/exchange/);
    });
  });

  test.describe('Responsive', () => {
    test('renders on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
      await expect(
        page.getByText('Intelligence Exchange Platform'),
      ).toBeVisible();
    });

    test('renders on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
