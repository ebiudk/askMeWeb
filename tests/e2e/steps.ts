import { Page, expect, APIRequestContext } from '@playwright/test';

/**
 * ログインページに移動してログインします。
 */
export async function ログインする(page: Page, username?: string) {
  const url = username ? `/login?username=${username}` : '/login';
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  await page.getByTestId('test-login-button').waitFor({ state: 'visible' });
  await page.getByTestId('test-login-button').click();
  await expect(page).toHaveURL(/\/$/);
  await page.waitForLoadState('domcontentloaded');
  // ログイン後のコンテンツ読み込みを待つ
  await expect(page.getByText('ダッシュボード')).toBeVisible();
}

/**
 * 新しいグループを作成します。
 */
export async function グループを作成する(page: Page, groupName: string) {
  await page.goto('/groups/new');
  await page.waitForSelector('input#name');
  await page.fill('input#name', groupName);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/groups\/[a-zA-Z0-9_-]+/);
  await expect(page.getByText(groupName)).toBeVisible();
}

/**
 * ダッシュボードから指定した名前のグループ詳細ページを開きます。
 */
export async function グループ詳細ページを開く(page: Page, groupName: string) {
  await page.goto('/');
  await page.locator(`text=${groupName}`).waitFor({ state: 'visible' });
  await page.click(`text=${groupName}`);
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL(/\/groups\/[a-zA-Z0-9_-]+/);
}

/**
 * グループ詳細ページでグループ名を変更します。
 */
export async function グループ名を変更する(page: Page, newName: string) {
  await page.locator('button[title="グループ名を変更"]').click();
  await page.fill('input[type="text"]', newName);
  await page.locator('button.text-green-600').click(); // CheckIcon
  await expect(page.getByText(newName)).toBeVisible();
}

/**
 * グループ詳細ページでグループを削除します。
 */
export async function グループを削除する(page: Page) {
  page.on('dialog', dialog => dialog.accept());
  await page.locator('button[title="グループを削除"]').click();
  await expect(page).toHaveURL('/');
}

/**
 * グループ詳細ページで招待URLを発行して取得します。
 */
export async function 招待URLを発行する(page: Page): Promise<string> {
  await page.click('button:has-text("招待URLを発行")');
  const inviteInput = page.locator('input[readonly]');
  await expect(inviteInput).toBeVisible();
  return await inviteInput.inputValue();
}

/**
 * 招待URLにアクセスしてグループに参加します。
 */
export async function 招待URLからグループに参加する(page: Page, inviteUrl: string) {
  await page.goto(inviteUrl);
  await page.click('button:has-text("参加を承諾する")');
  await expect(page).toHaveURL(/\/groups\/[a-zA-Z0-9_-]+/);
}

/**
 * 設定ページを開きます。
 */
export async function 設定ページを開く(page: Page) {
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: '設定', exact: true })).toBeVisible();
}

/**
 * 設定ページでAPIキーを発行して取得します。
 */
export async function APIキーを発行する(page: Page): Promise<string> {
  const generateButton = page.locator('button', { hasText: /APIキーを(再)?発行する/ });
  await expect(generateButton).toBeVisible();
  await generateButton.click();

  const apiKeyInput = page.locator('input[readonly]');
  await apiKeyInput.waitFor({ state: 'visible' });
  await expect(apiKeyInput).not.toHaveValue('未発行', { timeout: 10000 });
  return await apiKeyInput.inputValue();
}

/**
 * APIを使用して位置情報を更新します。
 */
export async function 位置情報を更新する(
  request: APIRequestContext,
  apiKey: string,
  data: {
    current_world_id: string;
    current_world_name: string;
    current_instance_id: string;
    display_name: string;
  }
) {
  const response = await request.post('/api/update-location', {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    data,
  });
  expect(response.ok()).toBeTruthy();
}

/**
 * 位置情報の公開/非公開を切り替えます。
 */
export async function 公開設定を切り替える(page: Page) {
  // Settingsページにあるトグルを想定
  await page.click('button[role="switch"]');
}

/**
 * 指定したテキストが表示されていることを確認します。
 */
export async function 表示されていることを確認する(page: Page, text: string | RegExp) {
  await expect(page.getByText(text)).toBeVisible();
}

export async function ロールを変更する(page: Page, memberName: string, newRole: string) {
  const memberRow = page.locator(`tr:has-text("${memberName}")`);
  await memberRow.waitFor({ state: 'visible' });

  const roleDropdownButton = memberRow.locator('button[aria-haspopup="menu"]'); // プルダウンメニューを開くボタンを特定
  await roleDropdownButton.waitFor({ state: 'enabled' });
  await roleDropdownButton.click();

  const menuItem = page.getByRole('menuitem', { name: new RegExp(newRole) });
  await menuItem.waitFor({ state: 'visible' });
  await menuItem.click();
}

/**
 * グループから脱退します。
 */
export async function グループから脱退する(page: Page) {
  page.on('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '脱退する' }).click();
  await expect(page).toHaveURL('/');
}

/**
 * ログアウトします。
 */
export async function ログアウトする(page: Page) {
  const logoutButton = page.getByRole('button', { name: /ログアウト/i });
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  } else {
    // ユーザーメニューの中にある場合を想定
    await page.locator('button[aria-haspopup="menu"]').first().click();
    await page.getByRole('button', { name: /ログアウト/i }).click();
  }
  await expect(page).toHaveURL(/\/login|\/$/);
}

/**
 * ログアウト状態であることを確認します。
 */
export async function ログアウト状態を確認する(page: Page) {
  await expect(page.getByRole('link', { name: /ログインしてはじめる/i })).toBeVisible();
  await expect(page.getByText('ダッシュボード')).not.toBeVisible();
}

/**
 * URLが特定のパターンに一致することを確認します。
 */
export async function URLが一致することを確認する(page: Page, pattern: RegExp | string) {
  await expect(page).toHaveURL(pattern);
}

/**
 * メンバーをグループから削除します。
 */
export async function メンバーを削除する(page: Page, _memberName: string) {
  page.on('dialog', dialog => dialog.accept());
  await page.locator('button[title="メンバーを削除"]').first().click();
}
