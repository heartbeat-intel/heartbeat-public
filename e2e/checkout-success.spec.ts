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

    test('does not send Exchange return paths into tenant instant-login', async ({ page }) => {
      await page.route('**/api/v1/payments/checkout/complete', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            subscription_id: 'sub_test',
            status: 'active',
            tenant_url: 'https://pirque.heartbeatintel.com',
            workspace_name: 'Pirque',
            provisioning_status: 'completed',
            login_url: 'https://pirque.heartbeatintel.com/instant-login?token=tok_test&email=user%40example.com',
          }),
        });
      });

      await page.goto('/exchange/checkout/success?session_id=cs_mock_test&returnUrl=%2Fexchange%2Fpublisher%2Fdiego-alcaino');
      const workspaceLink = page.getByRole('link', { name: /Go to Workspace|Go to Pirque/ });
      await expect(workspaceLink).toBeVisible();

      const href = await workspaceLink.getAttribute('href');
      expect(href).toBeTruthy();
      const url = new URL(href!);
      expect(url.hostname).toBe('pirque.localhost');
      expect(url.pathname).toBe('/instant-login');
      expect(url.searchParams.get('redirect')).toBeNull();
    });

    test('preserves workspace content return paths for instant-login', async ({ page }) => {
      await page.route('**/api/v1/payments/checkout/complete', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            subscription_id: 'sub_test',
            status: 'active',
            tenant_url: 'https://pirque.heartbeatintel.com',
            workspace_name: 'Pirque',
            provisioning_status: 'completed',
            login_url: 'https://pirque.heartbeatintel.com/instant-login?token=tok_test&email=user%40example.com',
          }),
        });
      });

      await page.goto('/exchange/checkout/success?session_id=cs_mock_test&returnUrl=%2Flists%2Fpeople%2Fpaypal-mafia%3Ftheme%3Dlight');
      const workspaceLink = page.getByRole('link', { name: /Go to Workspace|Go to Pirque/ });
      await expect(workspaceLink).toBeVisible();

      const href = await workspaceLink.getAttribute('href');
      expect(href).toBeTruthy();
      const url = new URL(href!);
      expect(url.hostname).toBe('pirque.localhost');
      expect(url.pathname).toBe('/instant-login');
      expect(url.searchParams.get('redirect')).toBe('/lists/people/paypal-mafia?theme=light');
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
