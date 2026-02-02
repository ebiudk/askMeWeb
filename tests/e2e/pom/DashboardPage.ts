import { Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async expectLoggedIn() {
    await expect(this.page.getByText('ダッシュボード')).toBeVisible();
  }

  async expectLoggedOut() {
    await expect(this.page.getByRole('link', { name: /ログインしてはじめる/i })).toBeVisible();
    await expect(this.page.getByText('ダッシュボード')).not.toBeVisible();
  }

  async logout() {
    const logoutButton = this.page.getByRole('button', { name: /ログアウト/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      const userMenu = this.page.getByRole('button', { name: /Test User/i });
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await this.page.getByRole('button', { name: /ログアウト/i }).click();
      }
    }
    await expect(this.page).toHaveURL(/\/login|\/$/);
  }

  async clickGroup(name: string) {
    await this.page.click(`text=${name}`);
  }

  async expectGroupVisible(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }

  async expectGroupNotVisible(name: string) {
    await expect(this.page.getByText(name)).not.toBeVisible();
  }
}
