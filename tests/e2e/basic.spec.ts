import { test, expect } from '@playwright/test';

test('has title and login link', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // アプリケーションのタイトルやロゴに合わせて調整してください
  await expect(page).toHaveTitle(/AskMe!/);

  // ログインページへのリンクがあるか確認（middlewareでリダイレクトされる可能性も考慮）
  // 実際の実装に合わせてセレクターを調整してください
  const loginLink = page.getByRole('link', { name: /login/i });
  if (await loginLink.isVisible()) {
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  }
});

test('login page displays sign in options', async ({ page }) => {
  await page.goto('/login');

  // Auth.jsのログインボタンなどが表示されているか確認
  // 複数のボタンがある場合は最初のものを確認するか、テキストで指定します
  await expect(page.getByRole('button').first()).toBeVisible();
});
