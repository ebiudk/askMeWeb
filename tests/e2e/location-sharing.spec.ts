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
  });
});
