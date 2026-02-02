import { test, expect } from '@playwright/test';
import { 
  ログインする, 
  グループを作成する, 
  グループ詳細ページを開く, 
  招待URLを発行する, 
  招待URLからグループに参加する, 
  表示されていることを確認する 
} from './steps';

test.describe('招待機能', () => {
  test('招待URLを発行し、別のユーザーが参加できること', async ({ browser }) => {
    // 1. ユーザーAとしてグループを作成
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await ログインする(pageA, 'user-a');
    
    const groupName = `招待テストグループ ${Date.now()}`;
    await グループを作成する(pageA, groupName);
    await グループ詳細ページを開く(pageA, groupName);

    // 2. 招待URLを発行
    const inviteUrl = await 招待URLを発行する(pageA);
    expect(inviteUrl).toContain('/groups/join?token=');

    // 3. ユーザーBとして参加
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await ログインする(pageB, 'user-b');
    
    await 招待URLからグループに参加する(pageB, inviteUrl);
    await 表示されていることを確認する(pageB, groupName);
    
    // メンバー一覧にユーザーBが表示されていることを確認
    await 表示されていることを確認する(pageB, 'user-b');

    await contextA.close();
    await contextB.close();
  });
});
