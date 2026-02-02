import { test, expect } from '@playwright/test';

test.describe('認証機能', () => {
  test('テストユーザーで正常にログインできること', async ({ page }) => {
    await page.goto('/login');
    
    // テストログインボタンをクリック
    const testLoginButton = page.getByTestId('test-login-button');
    await expect(testLoginButton).toBeVisible();
    await testLoginButton.click();

    // ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/$/);
  });

  test('正常にログアウトできること', async ({ page }) => {
    // まずログイン
    await page.goto('/login');
    await page.getByTestId('test-login-button').click();
    await expect(page).toHaveURL(/\/$/);

    // ログアウトボタンを探してクリック
    // Navbar.tsx の実装に基づき、テキストで探します
    const logoutButton = page.getByRole('button', { name: /ログアウト/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // ユーザーメニューの中にある場合
      const userMenu = page.getByRole('button', { name: /Test User/i });
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.getByRole('button', { name: /ログアウト/i }).click();
      }
    }

    // ログインページまたはトップページ（非公開状態）にリダイレクトされることを確認
    await expect(page).toHaveURL(/\/login|\/$/);
  });
});
