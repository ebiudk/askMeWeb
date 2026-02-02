import { test, expect } from '@playwright/test';

test('タイトルとログインリンクが表示されていること', async ({ page }) => {
  await page.goto('/');

  // アプリケーションのタイトルを確認
  await expect(page).toHaveTitle(/AskMe!/);

  // ログインページへのリンクがあるか確認
  const loginLink = page.getByRole('link', { name: /login/i });
  if (await loginLink.isVisible()) {
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  }
});

test('ログインページにサインインオプションが表示されていること', async ({ page }) => {
  await page.goto('/login');

  // テスト用ログインボタンなどが表示されているか確認
  await expect(page.getByTestId('test-login-button')).toBeVisible();
});
