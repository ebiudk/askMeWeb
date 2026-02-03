import { test, expect } from '@playwright/test';
import { 
  ログインする, 
  設定ページを開く, 
  APIキーを発行する, 
  グループを作成する, 
  グループ詳細ページを開く, 
  位置情報を更新する, 
  表示されていることを確認する 
} from './steps';

test.describe('位置情報共有機能', () => {
  test('APIキーを発行し、位置情報を更新して表示できること', async ({ page, request }) => {
    const username = `user-loc-${Date.now()}`;
    
    // 1. ログインして設定ページへ
    await ログインする(page, username);
    await 設定ページを開く(page);

    // 2. APIキーを発行
    const apiKey = await APIキーを発行する(page);

    // 3. グループ作成（表示確認用）
    const groupName = `位置情報テストグループ ${Date.now()}`;
    await グループを作成する(page, groupName);
    await グループ詳細ページを開く(page, groupName);

    // 最初は「オフライン」または位置情報なし
    await 表示されていることを確認する(page, 'オフライン');

    // 4. API経由で位置情報を更新
    const worldName = "Test World";
    await 位置情報を更新する(request, apiKey, {
      current_world_id: "wrld_12345",
      current_world_name: worldName,
      current_instance_id: "67890",
      display_name: "Test User",
    });

    // 5. 画面に反映されていることを確認
    await page.reload();
    await 表示されていることを確認する(page, worldName);
    await 表示されていることを確認する(page, 'Test User');

    // 6. worldId が 'offline' の場合はオフライン扱いになること
    await 位置情報を更新する(request, apiKey, {
      current_world_id: "offline",
      current_world_name: "",
      current_instance_id: "",
      display_name: "",
    });

    await page.reload();
    await 表示されていることを確認する(page, 'オフライン');
    await expect(page.getByText(worldName)).not.toBeVisible();
    await expect(page.getByText('Test User')).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Join' })).not.toBeVisible();
  });

  test('すべてのグループの居場所共有を一括でオン/オフできること', async ({ page }) => {
    const username = `user-toggle-all-${Date.now()}`;
    await ログインする(page, username);

    // 2つのグループを作成
    const group1 = `Group 1 ${Date.now()}`;
    const group2 = `Group 2 ${Date.now()}`;
    await グループを作成する(page, group1);
    await グループを作成する(page, group2);

    // ダッシュボードに移動
    await page.goto('/');

    // 最初はデフォルトでオンになっているはず
    await expect(page.locator('button[title="このグループに居場所を公開中"]')).toHaveCount(2);

    // 一括オフボタンをクリック
    const offButton = page.getByRole('button', { name: 'すべての共有をオフ' });
    await offButton.click();

    // 更新を待つ (ボタンが再度有効になるのを待つ)
    await expect(offButton).toBeEnabled();

    // すべてのトグルがオフになっていることを確認
    await expect(page.locator('button[title="このグループに居場所を非公開"]')).toHaveCount(2);
    await expect(page.locator('button[title="このグループに居場所を公開中"]')).toHaveCount(0);

    // 一括オンボタンをクリック
    const onButton = page.getByRole('button', { name: 'すべての共有をオン' });
    await onButton.click();

    // 更新を待つ
    await expect(onButton).toBeEnabled();

    // すべてのトグルがオンになっていることを確認
    await expect(page.locator('button[title="このグループに居場所を公開中"]')).toHaveCount(2);
    await expect(page.locator('button[title="このグループに居場所を非公開"]')).toHaveCount(0);
  });
});
