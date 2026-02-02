import { test, expect } from '@playwright/test';

test.describe('グループ管理機能', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前にログイン
    const username = `test-user-${Date.now()}`;
    await page.goto(`/login?username=${username}`);
    await page.getByTestId('test-login-button').click();
    await expect(page).toHaveURL(/\/$/);
    // ログイン後のコンテンツ読み込みを待つ
    await expect(page.getByText('ダッシュボード')).toBeVisible();
  });

  test('新規グループを作成し、一覧に表示されること', async ({ page }) => {
    // グループ作成ページへ遷移
    await page.goto('/groups/new');
    await expect(page).toHaveURL(/\/groups\/new/);

    // フォーム入力
    const groupName = `テストグループ ${Date.now()}`;
    await page.waitForSelector('input#name');
    await page.fill('input#name', groupName);
    await page.click('button[type="submit"]');

    // ダッシュボードに戻り、新しいグループが表示されていることを確認
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(groupName)).toBeVisible();

    // グループ詳細ページへ遷移
    await page.click(`text=${groupName}`);
    await expect(page).toHaveURL(/\/groups\/[a-zA-Z0-9_-]+/);
    await expect(page.getByText(groupName)).toBeVisible();
  });

  test('グループ名を変更できること', async ({ page }) => {
    // グループ作成
    await page.goto('/groups/new');
    const groupName = `変更前グループ ${Date.now()}`;
    await page.fill('input#name', groupName);
    await page.click('button[type="submit"]');
    
    await page.click(`text=${groupName}`);

    // 編集ボタン（PencilIcon）をクリック
    await page.locator('button[title="グループ名を変更"]').click();
    
    // 新しい名前を入力
    const updatedName = `変更後グループ ${Date.now()}`;
    await page.fill('input[type="text"]', updatedName);
    await page.locator('button.text-green-600').click(); // CheckIcon

    // 名前が更新されていることを確認
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test('グループを削除できること', async ({ page }) => {
    // グループ作成
    await page.goto('/groups/new');
    const groupName = `削除テストグループ ${Date.now()}`;
    await page.fill('input#name', groupName);
    await page.click('button[type="submit"]');
    
    await page.click(`text=${groupName}`);

    // 削除ボタンをクリック
    page.on('dialog', dialog => dialog.accept()); // confirmを許可
    await page.locator('button[title="グループを削除"]').click();

    // ダッシュボードに戻り、グループが消えていることを確認
    await expect(page).toHaveURL('/');
    await expect(page.getByText(groupName)).not.toBeVisible();
  });

  test('メンバーのロールを変更し、グループを脱退できること', async ({ browser }) => {
    // 1. ユーザーAがグループ作成
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto('/login?username=admin-user');
    await pageA.getByTestId('test-login-button').click();
    await expect(pageA).toHaveURL(/\/$/);
    
    await pageA.goto('/groups/new');
    const groupName = `メンバー管理テスト ${Date.now()}`;
    await pageA.fill('input#name', groupName);
    await pageA.click('button[type="submit"]');
    await pageA.click(`text=${groupName}`);

    // 2. 招待URL発行
    await pageA.click('button:has-text("招待URLを発行")');
    const inviteUrl = await pageA.locator('input[readonly]').inputValue();

    // 3. ユーザーBが参加
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto('/login?username=member-user');
    await pageB.getByTestId('test-login-button').click();
    await expect(pageB).toHaveURL(/\/$/);
    await pageB.goto(inviteUrl);
    await pageB.click('button:has-text("参加を承諾する")');
    await expect(pageB).toHaveURL(/\/groups\/[a-zA-Z0-9_-]+/);

    // 4. ユーザーAがユーザーBのロールを「共同管理者」に変更
    await pageA.reload(); // メンバー一覧を更新
    await pageA.getByRole('button', { name: 'メンバー', exact: true }).click();
    await pageA.getByRole('menuitem', { name: /共同管理者/ }).click();
    
    // 変更が反映されたか確認
    await expect(pageA.getByText('共管')).toBeVisible();

    // 5. ユーザーBがグループを脱退
    pageB.on('dialog', async dialog => {
      await dialog.accept();
    });
    await pageB.getByRole('button', { name: '脱退する' }).click();
    
    await expect(pageB).toHaveURL('/');
    await expect(pageB.getByText(groupName)).not.toBeVisible();

    await contextA.close();
    await contextB.close();
  });

  test('管理者がメンバーをグループから削除できること', async ({ browser }) => {
    // 1. ユーザーAがグループ作成
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto('/login?username=admin-user-2');
    await pageA.getByTestId('test-login-button').click();
    await expect(pageA).toHaveURL(/\/$/);
    
    await pageA.goto('/groups/new');
    const groupName = `メンバー削除テスト ${Date.now()}`;
    await pageA.fill('input#name', groupName);
    await pageA.click('button[type="submit"]');
    await pageA.click(`text=${groupName}`);

    // 2. 招待URL発行
    await pageA.click('button:has-text("招待URLを発行")');
    const inviteUrl = await pageA.locator('input[readonly]').inputValue();

    // 3. ユーザーBが参加
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto('/login?username=member-user-2');
    await pageB.getByTestId('test-login-button').click();
    await expect(pageB).toHaveURL(/\/$/);
    await pageB.goto(inviteUrl);
    await pageB.click('button:has-text("参加を承諾する")');
    await expect(pageB).toHaveURL(/\/groups\/[a-zA-Z0-9_-]+/);

    // 4. ユーザーAがユーザーBを削除
    await pageA.reload();
    pageA.on('dialog', dialog => dialog.accept());
    // メンバー一覧からユーザーBの削除ボタン（TrashIcon）を探してクリック
    // MemberRow.tsx では showManagement が true の場合、TrashIcon が表示される
    await pageA.locator('button[title="メンバーを削除"]').click();

    // ユーザーBが表示されなくなったことを確認
    await expect(pageA.getByText('member-user-2')).not.toBeVisible();

    await contextA.close();
    await contextB.close();
  });
});
