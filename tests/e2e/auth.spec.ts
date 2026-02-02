import { test } from '@playwright/test';
import { 
  ログインする, 
  ログアウトする, 
  ログアウト状態を確認する, 
  URLが一致することを確認する 
} from './steps';

test.describe('認証機能', () => {
  test('テストユーザーで正常にログインできること', async ({ page }) => {
    await ログインする(page);
  });

  test('正常にログアウトできること', async ({ page }) => {
    await ログインする(page);
    await ログアウトする(page);
  });

  test('未ログイン状態で保護されたページにアクセスするとログインにリダイレクトされること', async ({ page }) => {
    await page.goto('/settings');
    await URLが一致することを確認する(page, /\/login|.*\/api\/auth\/signin/);
  });

  test('未ログイン状態でトップページにアクセスするとランディングページが表示されること', async ({ page }) => {
    await page.goto('/');
    await ログアウト状態を確認する(page);
  });
});
