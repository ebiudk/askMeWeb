import { Page, expect } from '@playwright/test';

export class SettingsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/settings');
    await expect(this.page.getByRole('heading', { name: '設定', exact: true })).toBeVisible();
  }

  async getOrCreateApiKey(): Promise<string> {
    let apiKey = await this.page.locator('input[readonly]').inputValue();
    if (apiKey === '未発行') {
      const generateButton = this.page.locator('button', { hasText: /APIキーを(再)?発行する/ });
      await generateButton.click();
      await expect(this.page.locator('input[readonly]')).not.toHaveValue('未発行', { timeout: 10000 });
      apiKey = await this.page.locator('input[readonly]').inputValue();
    }
    return apiKey;
  }

  async toggleLocationSharing(status: 'on' | 'off') {
    const button = this.page.getByRole('button', { name: status === 'on' ? '🔒非公開' : '🔓公開中' });
    await button.click();
    const nextLabel = status === 'on' ? '🔓公開中' : '🔒非公開';
    await expect(this.page.getByRole('button', { name: nextLabel })).toBeVisible();
  }
}
