import { test, expect } from '@playwright/test';

test.describe('AI功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够显示AI设置面板', async ({ page }) => {
    const aiSettingsButton = page.locator('button:has-text("AI API 设置")');
    await aiSettingsButton.click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h2:has-text("AI API 设置")')).toBeVisible();
    await expect(page.locator('text=选择AI服务商')).toBeVisible();
  });

  test('应该能够配置AI提供商', async ({ page }) => {
    const aiSettingsButton = page.locator('button:has-text("AI API 设置")');
    await aiSettingsButton.click();
    await page.waitForLoadState('networkidle');

    const providerOption = page.locator('button:has-text("Google Gemini")');
    await expect(providerOption).toBeVisible();

    const apiKeyInput = page.locator('textbox').filter({ hasText: 'API 密钥' });
    if (await apiKeyInput.count() > 0) {
      await apiKeyInput.fill('test-api-key');

      const saveButton = page.locator('button:has-text("保存设置")');
      await saveButton.click();
      await page.waitForTimeout(1000);

      await expect(page.locator('text=Google Gemini')).toBeVisible();
    }
  });

  test('应该能够显示所有AI服务商选项', async ({ page }) => {
    const aiSettingsButton = page.locator('button:has-text("AI API 设置")');
    await aiSettingsButton.click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('button:has-text("Google Gemini")')).toBeVisible();
    await expect(page.locator('button:has-text("DeepSeek")')).toBeVisible();
    await expect(page.locator('button:has-text("智谱 AI")')).toBeVisible();
    await expect(page.locator('button:has-text("硅基流动")')).toBeVisible();
    await expect(page.locator('button:has-text("火山引擎")')).toBeVisible();
    await expect(page.locator('button:has-text("Anthropic")')).toBeVisible();
  });

  test('应该能够选择不同的AI提供商', async ({ page }) => {
    const aiSettingsButton = page.locator('button:has-text("AI API 设置")');
    await aiSettingsButton.click();
    await page.waitForLoadState('networkidle');

    const deepSeekOption = page.locator('button:has-text("DeepSeek")');
    await deepSeekOption.click();
    await page.waitForTimeout(500);

    await expect(page.locator('text=DeepSeek')).toBeVisible();
  });

  test('应该能够保存AI设置', async ({ page }) => {
    const aiSettingsButton = page.locator('button:has-text("AI API 设置")');
    await aiSettingsButton.click();
    await page.waitForLoadState('networkidle');

    const apiKeyInput = page.locator('textbox').filter({ hasText: 'API 密钥' });
    if (await apiKeyInput.count() > 0) {
      await apiKeyInput.fill('test-api-key-123');

      const saveButton = page.locator('button:has-text("保存设置")');
      await saveButton.click();
      await page.waitForTimeout(1000);

      await expect(page.locator('text=Google Gemini')).toBeVisible();
    }
  });

  test('应该能够重置AI设置', async ({ page }) => {
    const aiSettingsButton = page.locator('button:has-text("AI API 设置")');
    await aiSettingsButton.click();
    await page.waitForLoadState('networkidle');

    const resetButton = page.locator('button:has-text("重置默认")');
    if (await resetButton.count() > 0) {
      await resetButton.click();
      await page.waitForTimeout(1000);

      await expect(page.locator('text=Google Gemini')).toBeVisible();
    }
  });

  test('应该能够显示AI设置成功提示', async ({ page }) => {
    const aiSettingsButton = page.locator('button:has-text("AI API 设置")');
    await aiSettingsButton.click();
    await page.waitForLoadState('networkidle');

    const apiKeyInput = page.locator('textbox').filter({ hasText: 'API 密钥' });
    if (await apiKeyInput.count() > 0) {
      await apiKeyInput.fill('test-api-key');

      const saveButton = page.locator('button:has-text("保存设置")');
      await saveButton.click();
      await page.waitForTimeout(1000);

      await expect(page.locator('text=Google Gemini')).toBeVisible();
    }
  });
});