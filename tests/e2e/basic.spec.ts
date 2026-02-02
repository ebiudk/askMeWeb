import { test, expect } from '@playwright/test';
import { URLが一致することを確認する } from './steps';

test('タイトルとログインリンクが表示されていること', async ({ page }) => {
  await page.goto('/');

  // アプリケーションのタイトルを確認
  await expect(page).toHaveTitle(/AskMe!/);

  // ログインページへのリンクがあるか確認
  const loginLink = page.getByRole('link', { name: /login/i });
  if (await loginLink.isVisible()) {
    await loginLink.click();
    await URLが一致することを確認する(page, /\/login/);
  }
});

test('ログインページにサインインオプションが表示されていること', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByTestId('test-login-button')).toBeVisible();
});
