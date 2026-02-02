import { test, expect } from '@playwright/test';

test.describe('位置情報共有機能', () => {
  test('APIキーを発行し、位置情報を更新して表示できること', async ({ page, request }) => {
    // 1. ログインして設定ページへ
    await page.goto('/login');
    await page.getByTestId('test-login-button').click();
    await page.goto('/settings');

    // 2. APIキーを発行
    // SettingsContent の実装では「APIキーを発行する」または「APIキーを再発行する」
    const generateButton = page.locator('button', { hasText: /APIキーを(再)?発行する/ });
    await expect(generateButton).toBeVisible();
    await generateButton.click();

    // APIキーを取得 (SettingsContent では input の value に表示される)
    const apiKeyInput = page.locator('input[readonly]');
    await expect(apiKeyInput).not.toHaveValue('未発行', { timeout: 10000 });
    const apiKey = await apiKeyInput.inputValue();

    // 3. グループ作成（表示確認用）
    await page.goto('/groups/new');
    const groupName = `位置情報テストグループ ${Date.now()}`;
    await page.fill('input#name', groupName);
    await page.click('button[type="submit"]');
    await page.click(`text=${groupName}`);
    const groupUrl = page.url();

    // 最初は「オフライン」または位置情報なし
    await expect(page.getByText('オフライン')).toBeVisible();

    // 4. API経由で位置情報を更新
    const worldName = "Test World";
    const updateResponse = await request.post('/api/update-location', {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      data: {
        current_world_id: "wrld_12345",
        current_world_name: worldName,
        current_instance_id: "67890",
        display_name: "Test User",
      }
    });
    expect(updateResponse.ok()).toBeTruthy();

    // 5. 画面に反映されているか確認
    await page.reload();
    await expect(page.getByText(worldName)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Join' })).toBeVisible();

    // 6. 共有をオフにする
    await page.getByRole('button', { name: '🔓公開中' }).click();
    await expect(page.getByRole('button', { name: '🔒非公開' })).toBeVisible();
    await expect(page.getByText('非公開設定')).toBeVisible();

    // 7. 再度オンにする
    await page.getByRole('button', { name: '🔒非公開' }).click();
    await expect(page.getByRole('button', { name: '🔓公開中' })).toBeVisible();
    await expect(page.getByText(worldName)).toBeVisible();
  });

  test('位置情報をプライベート設定（非表示）にできること', async ({ page, request }) => {
    // 1. ログインしてAPIキー取得（既存のものを使用するか新規発行）
    await page.goto('/login');
    await page.getByTestId('test-login-button').click();
    await page.goto('/settings');
    
    let apiKey = await page.locator('input[readonly]').inputValue();
    if (apiKey === '未発行') {
      await page.getByRole('button', { name: 'APIキーを発行する' }).click();
      apiKey = await page.locator('input[readonly]').inputValue();
    }

    // 2. グループページへ
    await page.goto('/groups/new');
    const groupName = `プライベートテスト ${Date.now()}`;
    await page.fill('input#name', groupName);
    await page.click('button[type="submit"]');
    await page.click(`text=${groupName}`);

    // 3. APIで "private" ワールドを送信
    await request.post('/api/update-location', {
      headers: { 'x-api-key': apiKey },
      data: {
        current_world_id: "private",
        current_world_name: "Private World",
      }
    });

    // 4. 画面上では「オフライン」（または非表示）になることを確認
    await page.reload();
    await expect(page.getByText('オフライン')).toBeVisible();
    await expect(page.getByText('Private World')).not.toBeVisible();
  });
});
