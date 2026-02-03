import { test, expect } from '@playwright/test';
import { 
  ログインする, 
  グループを作成する, 
  グループ詳細ページを開く, 
  グループ名を変更する, 
  グループを削除する, 
  招待URLを発行する, 
  招待URLからグループに参加する, 
  表示されていることを確認する,
  ロールを変更する,
  グループから脱退する,
  メンバーを削除する
} from './steps';

test.describe('グループ管理機能', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前にログイン
    const username = `test-user-${Date.now()}`;
    await ログインする(page, username);
  });

  test('新規グループを作成し、一覧に表示されること', async ({ page }) => {
    const groupName = `テストグループ ${Date.now()}`;
    await グループを作成する(page, groupName);

    // グループ詳細ページへ遷移
    await グループ詳細ページを開く(page, groupName);
    await 表示されていることを確認する(page, groupName);
  });

  test('グループ名を変更できること', async ({ page }) => {
    const groupName = `変更前グループ ${Date.now()}`;
    await グループを作成する(page, groupName);
    await グループ詳細ページを開く(page, groupName);

    // グループ名を変更
    const updatedName = `変更後グループ ${Date.now()}`;
    await グループ名を変更する(page, updatedName);

    // 名前が更新されていることを確認
    await 表示されていることを確認する(page, updatedName);
  });

  test('グループを削除できること', async ({ page }) => {
    const groupName = `削除テストグループ ${Date.now()}`;
    await グループを作成する(page, groupName);
    await グループ詳細ページを開く(page, groupName);

    // 削除ボタンをクリック
    await グループを削除する(page);

    // ダッシュボードに戻り、グループが消えていることを確認
    await expect(page.getByText(groupName)).not.toBeVisible();
  });

  test('メンバーのロールを変更し、グループを脱退できること', {tag: 'flacky'},async ({ browser }) => {
    // 1. ユーザーAがグループ作成
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await ログインする(pageA, 'admin-user');
    
    const groupName = `メンバー管理テスト ${Date.now()}`;
    await グループを作成する(pageA, groupName);
    await グループ詳細ページを開く(pageA, groupName);

    // 2. 招待URL発行
    const inviteUrl = await 招待URLを発行する(pageA);

    // 3. ユーザーBが参加
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await ログインする(pageB, 'member-user');
    await 招待URLからグループに参加する(pageB, inviteUrl);
    await 表示されていることを確認する(pageB, groupName);
    
    // メンバー一覧にユーザーBが表示されていることを確認
    await 表示されていることを確認する(pageB, 'member-user');

    // 4. ユーザーAがユーザーBのロールを「共同管理者」に変更
    await pageA.reload(); // メンバー一覧を更新
    await ロールを変更する(pageA, 'member-user', '共同管理者');
    
    // 変更が反映されたか確認
    await 表示されていることを確認する(pageA, '共管');

    // 5. ユーザーBがグループを脱退
    await グループから脱退する(pageB);
    
    await expect(pageB.getByText(groupName)).not.toBeVisible();

    await contextA.close();
    await contextB.close();
  });

  test('管理者がメンバーをグループから削除できること', async ({ browser }) => {
    // 1. ユーザーAがグループ作成
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await ログインする(pageA, 'admin-user-2');
    
    const groupName = `メンバー削除テスト ${Date.now()}`;
    await グループを作成する(pageA, groupName);
    await グループ詳細ページを開く(pageA, groupName);

    // 2. 招待URL発行
    const inviteUrl = await 招待URLを発行する(pageA);

    // 3. ユーザーBが参加
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await ログインする(pageB, 'member-user-2');
    await 招待URLからグループに参加する(pageB, inviteUrl);

    // 4. ユーザーAがユーザーBを削除
    await pageA.reload();
    await メンバーを削除する(pageA, 'member-user-2');

    // ユーザーBが表示されなくなったことを確認
    await expect(pageA.getByText('member-user-2')).not.toBeVisible();

    await contextA.close();
    await contextB.close();
  });
});
