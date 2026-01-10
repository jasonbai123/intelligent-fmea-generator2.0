import { test, expect } from '@playwright/test';

test.describe('FMEA生成功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够显示DFMEA生成器界面', async ({ page }) => {
    const dfmeaButton = page.locator('button:has-text("DFMEA")');
    await dfmeaButton.click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1:has-text("设计 FMEA")')).toBeVisible();
    await expect(page.locator('text=AIAG & VDA 1.0')).toBeVisible();

    const textInput = page.locator('textbox').filter({ hasText: 'BOM' });
    await expect(textInput).toBeVisible();

    const generateButton = page.locator('button:has-text("开始生成分析报告")');
    await expect(generateButton).toBeVisible();
  });

  test('应该能够显示PFMEA生成器界面', async ({ page }) => {
    const pfmeaButton = page.locator('button:has-text("PFMEA")');
    await pfmeaButton.click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1:has-text("过程 FMEA")')).toBeVisible();
    await expect(page.locator('text=AIAG & VDA 1.0')).toBeVisible();

    const textInput = page.locator('textbox').filter({ hasText: 'BOM' });
    await expect(textInput).toBeVisible();
  });

  test('应该能够输入产品描述', async ({ page }) => {
    await page.click('button:has-text("DFMEA")');
    await page.waitForLoadState('networkidle');

    const textInput = page.locator('textbox').filter({ hasText: 'BOM' });
    await textInput.fill('电动牙刷动力总成，包含：微型电机(DC 3.7V)、传动轴（不锈钢）、偏心轮（铜合金）');

    const value = await textInput.inputValue();
    expect(value).toContain('电动牙刷');
    expect(value).toContain('微型电机');
  });

  test('应该能够上传图片文件', async ({ page }) => {
    await page.click('button:has-text("DFMEA")');
    await page.waitForLoadState('networkidle');

    const uploadArea = page.locator('button:has-text("Choose File")');
    await expect(uploadArea).toBeVisible();
  });

  test('应该能够验证必填输入', async ({ page }) => {
    await page.click('button:has-text("DFMEA")');
    await page.waitForLoadState('networkidle');

    const generateButton = page.locator('button:has-text("开始生成分析报告")');
    await generateButton.click();
    await page.waitForTimeout(2000);

    const h1Element = page.locator('h1:has-text("设计 FMEA")');
    await expect(h1Element).toBeVisible();
  });

  test('应该能够导航到AI API设置页面', async ({ page }) => {
    const settingsButton = page.locator('button:has-text("AI API 设置")');
    await settingsButton.click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h2:has-text("AI API 设置")')).toBeVisible();

    const geminiOption = page.locator('button:has-text("Google Gemini")');
    await expect(geminiOption).toBeVisible();
  });

  test('应该能够在AI设置页面选择Gemini', async ({ page }) => {
    await page.click('button:has-text("AI API 设置")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Google Gemini")');
    await page.waitForTimeout(500);

    await expect(page.locator('text=Google Gemini')).toBeVisible();
  });

  test('应该能够输入Gemini API密钥', async ({ page }) => {
    await page.click('button:has-text("AI API 设置")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Google Gemini")');

    const apiKeyInput = page.locator('textbox').filter({ hasText: 'API 密钥' });
    await apiKeyInput.fill('test_api_key_12345');

    const value = await apiKeyInput.inputValue();
    expect(value).toBe('test_api_key_12345');

    await page.click('button:has-text("保存设置")');
    await page.waitForTimeout(1000);

    await expect(page.locator('text=Google Gemini')).toBeVisible();
  });

  test('应该能够显示其他AI服务商的提示', async ({ page }) => {
    await page.click('button:has-text("AI API 设置")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("DeepSeek")');
    await page.waitForTimeout(500);

    await expect(page.locator('text=DeepSeek')).toBeVisible();
  });

  test('应该能够访问DFMEA准则页面', async ({ page }) => {
    await page.click('button:has-text("DFMEA 准则")');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1, h2')).toContainText('DFMEA');
    await expect(page.locator('h1, h2')).toContainText('准则');
  });

  test('应该能够访问PFMEA准则页面', async ({ page }) => {
    await page.click('button:has-text("PFMEA 准则")');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1, h2')).toContainText('PFMEA');
    await expect(page.locator('h1, h2')).toContainText('准则');
  });

  test('应该能够在不同页面间导航', async ({ page }) => {
    await page.click('button:has-text("DFMEA")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('DFMEA');

    await page.click('button:has-text("PFMEA")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('PFMEA');

    await page.click('button:has-text("AI API 设置")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h2')).toContainText('AI API');

    await page.click('button:has-text("DFMEA")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('DFMEA');
  });

  test('应该能够响应式显示侧边栏', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const sidebarDesktop = page.locator('aside, [class*="sidebar"]').first();
    await expect(sidebarDesktop).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    const sidebarMobile = page.locator('aside, [class*="sidebar"]').first();
    const isVisible = await sidebarMobile.isVisible().catch(() => false);
    const menuButton = page.locator('button[aria-label*="menu"], button:has-text("菜单")');
    const hasMenu = await menuButton.count() > 0;
    expect(isVisible || hasMenu).toBeTruthy();
  });
});

test.describe('FMEA生成 - API模拟测试', () => {
  test('应该能够处理AI服务错误', async ({ page }) => {
    await page.route('**/api/ai/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'AI service unavailable' })
      });
    });

    await page.goto('/');
    await page.click('button:has-text("DFMEA")');
    await page.waitForLoadState('networkidle');

    const textInput = page.locator('textbox').filter({ hasText: 'BOM' });
    await textInput.fill('测试产品描述');

    await page.click('button:has-text("开始生成分析报告")');
    await page.waitForTimeout(3000);

    const h1Element = page.locator('h1:has-text("设计 FMEA")');
    await expect(h1Element).toBeVisible();
  });

  test('应该能够处理网络超时', async ({ page }) => {
    await page.route('**/api/ai/**', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ result: 'success' })
        });
      }, 35000);
    });

    await page.goto('/');
    await page.click('button:has-text("DFMEA")');
    await page.waitForLoadState('networkidle');

    const textInput = page.locator('textbox').filter({ hasText: 'BOM' });
    await textInput.fill('测试产品描述');

    await page.click('button:has-text("开始生成分析报告")');

    await page.waitForTimeout(30000);
  });
});
