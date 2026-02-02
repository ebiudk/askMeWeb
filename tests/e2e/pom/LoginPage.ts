import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(username?: string) {
    const url = username ? `/login?username=${username}` : '/login';
    await this.page.goto(url);
    await this.page.getByTestId('test-login-button').click();
    await expect(this.page).toHaveURL(/\/$/);
  }

  async expectVisible() {
    await expect(this.page.getByTestId('test-login-button')).toBeVisible();
  }
}
