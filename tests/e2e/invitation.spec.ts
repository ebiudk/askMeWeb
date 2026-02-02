import { test, expect } from '@playwright/test';

test.describe('招待機能', () => {
  test('招待URLを発行し、別のユーザーが参加できること', async ({ browser }) => {
    // 1. ユーザーAとしてグループを作成
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto('/login?username=user-a');
    await pageA.getByTestId('test-login-button').click();
    
    await pageA.goto('/groups/new');
    const groupName = `招待テストグループ ${Date.now()}`;
    await pageA.fill('input#name', groupName);
    await pageA.click('button[type="submit"]');
    await expect(pageA).toHaveURL('/');
    
    await pageA.click(`text=${groupName}`);
    await expect(pageA).toHaveURL(/\/groups\/[a-zA-Z0-9_-]+/);

    // 2. 招待URLを発行
    await pageA.click('button:has-text("招待URLを発行")');
    const inviteInput = pageA.locator('input[readonly]');
    await expect(inviteInput).toBeVisible();
    const inviteUrl = await inviteInput.inputValue();
    expect(inviteUrl).toContain('/groups/join?token=');

    // 3. ユーザーBとして参加
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto('/login?username=user-b');
    await pageB.getByTestId('test-login-button').click();
    
    await pageB.goto(inviteUrl);
    await expect(pageB.getByText(groupName)).toBeVisible();
    await expect(pageB.getByText('に招待されています')).toBeVisible();

    // 参加ボタンをクリック (実際の実装は「参加を承諾する」)
    await pageB.click('button:has-text("参加を承諾する")');
    
    // グループページまたはダッシュボードに遷移することを確認
    await expect(pageB).toHaveURL(/\/groups\/[a-zA-Z0-9_-]+/);
    await expect(pageB.getByText(groupName)).toBeVisible();
    
    // メンバー一覧にユーザーBが表示されていることを確認
    // display_name が設定されていない場合は username になる
    await expect(pageB.getByText('user-b')).toBeVisible();

    await contextA.close();
    await contextB.close();
  });
});
