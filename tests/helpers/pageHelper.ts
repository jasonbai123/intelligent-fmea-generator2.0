import { Page, expect } from '@playwright/test';

export class PageHelper {
  constructor(private page: Page) {}

  async waitForElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async clickElement(selector: string) {
    await this.waitForElement(selector);
    await this.page.click(selector);
  }

  async fillInput(selector: string, value: string) {
    await this.waitForElement(selector);
    await this.page.fill(selector, value);
  }

  async getText(selector: string) {
    await this.waitForElement(selector);
    return await this.page.textContent(selector);
  }

  async isVisible(selector: string) {
    try {
      await this.waitForElement(selector, 1000);
      return true;
    } catch {
      return false;
    }
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  async waitForNetworkIdle(timeout = 30000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  async checkAccessibility(selector: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    await expect(element).toBeEnabled();
  }

  async checkToast(message: string) {
    const toast = this.page.locator(`.toast, [role="alert"], [data-testid="toast"]`).filter({ hasText: message });
    await expect(toast).toBeVisible({ timeout: 5000 });
  }

  async checkErrorMessage(message: string) {
    const error = this.page.locator(`.error, [role="alert"], [data-testid="error"]`).filter({ hasText: message });
    await expect(error).toBeVisible({ timeout: 5000 });
  }

  async checkSuccessMessage(message: string) {
    const success = this.page.locator(`.success, [role="status"], [data-testid="success"]`).filter({ hasText: message });
    await expect(success).toBeVisible({ timeout: 5000 });
  }

  async checkUrl(expectedUrl: string) {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  async navigateTo(path: string) {
    await this.page.goto(path);
    await this.waitForNetworkIdle();
  }

  async reload() {
    await this.page.reload();
    await this.waitForNetworkIdle();
  }

  async waitForDialog() {
    return this.page.waitForEvent('dialog');
  }

  async handleDialog(accept: boolean, promptText?: string) {
    const dialog = await this.waitForDialog();
    if (promptText) {
      await dialog.accept(promptText);
    } else if (accept) {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  }
}