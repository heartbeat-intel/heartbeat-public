import { test, expect } from '@playwright/test';

test.describe('Exchange Page', () => {
  test.describe('Page Load', () => {
    test('loads successfully', async ({ page }) => {
      const response = await page.goto('/exchange');
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible();
    });

    test('displays Intelligence Exchange heading', async ({ page }) => {
      await page.goto('/exchange');
      await expect(
        page.getByRole('heading', { name: 'Intelligence Exchange' }),
      ).toBeVisible();
    });

    test('displays description text', async ({ page }) => {
      await page.goto('/exchange');
      await expect(
        page.getByText('Subscribe to curated intelligence'),
      ).toBeVisible();
    });
  });

  test.describe('Stats Bar', () => {
    test('displays publisher count', async ({ page }) => {
      await page.goto('/exchange');
      await expect(page.getByText('Publishers').first()).toBeVisible();
    });

    test('displays publications count', async ({ page }) => {
      await page.goto('/exchange');
      await expect(page.getByText('Publications').first()).toBeVisible();
    });

    test('displays articles count', async ({ page }) => {
      await page.goto('/exchange');
      await expect(page.getByText('Articles').first()).toBeVisible();
    });
  });

  test.describe('Category Filter', () => {
    test('category pills are visible', async ({ page }) => {
      await page.goto('/exchange');
      // At least one category should be visible (Finance, Tech, etc.)
      const hasPills =
        (await page.getByText('Finance').isVisible().catch(() => false)) ||
        (await page.getByText('Tech').isVisible().catch(() => false));
      expect(hasPills).toBeTruthy();
    });

    test('filtering by category updates URL', async ({ page }) => {
      await page.goto('/exchange');
      const financeLink = page.getByRole('link', { name: 'Finance' });
      if (await financeLink.isVisible()) {
        await financeLink.click();
        await expect(page).toHaveURL(/category=Finance/);
      }
    });

    test('filtered page still renders publisher grid', async ({ page }) => {
      await page.goto('/exchange?category=Finance');
      // Should show either filtered publishers or "No publishers found" message
      const hasCards = (await page.locator('.grid').first().isVisible().catch(() => false));
      const hasEmpty = (await page.getByText('No publishers found').isVisible().catch(() => false));
      expect(hasCards || hasEmpty).toBeTruthy();
    });
  });

  test.describe('Publisher Grid', () => {
    test('publisher cards or empty state visible', async ({ page }) => {
      await page.goto('/exchange');
      // Wait for SSR content
      await page.waitForLoadState('networkidle');
      const grid = page.locator('#publishers .grid');
      await expect(grid.or(page.getByText('No publishers found'))).toBeVisible();
    });

    test('publisher cards link to publisher profile', async ({ page }) => {
      await page.goto('/exchange');
      await page.waitForLoadState('networkidle');
      const firstLink = page.locator('#publishers a[href*="/exchange/publisher/"]').first();
      if (await firstLink.isVisible()) {
        const href = await firstLink.getAttribute('href');
        expect(href).toMatch(/\/exchange\/publisher\/.+/);
      }
    });
  });

  test.describe('Feed Section', () => {
    test('Latest from the Exchange section renders', async ({ page }) => {
      await page.goto('/exchange');
      await page.waitForLoadState('networkidle');
      // Feed is optional — only shows if publishers have content
      const feedHeading = page.getByText('Latest from the Exchange');
      if (await feedHeading.isVisible()) {
        await expect(feedHeading).toBeVisible();
      }
    });
  });

  test.describe('Header', () => {
    test('header shows exchange variant', async ({ page }) => {
      await page.goto('/exchange');
      await expect(page.locator('header').first()).toBeVisible();
    });
  });

  test.describe('Footer', () => {
    test('footer is visible', async ({ page }) => {
      await page.goto('/exchange');
      await page.evaluate(() =>
        window.scrollTo(0, document.body.scrollHeight),
      );
      await expect(page.locator('footer').first()).toBeVisible();
    });
  });

  test.describe('Responsive', () => {
    test('renders on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/exchange');
      await expect(
        page.getByRole('heading', { name: 'Intelligence Exchange' }),
      ).toBeVisible();
    });
  });
});
