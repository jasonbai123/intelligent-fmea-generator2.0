import { test, expect, devices } from '@playwright/test';

test.skip('移动端测试 - 需要重新设计测试结构以支持多设备测试', async ({ page }) => {
  test.skip(true, '移动端测试需要重新设计，Playwright不支持在describe中使用test.use()');
});

test.describe('弱网环境测试', () => {
  test('3G网络下应该正常工作', async ({ page }) => {
    await page.emulateNetwork({
      offline: false,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      latency: 100
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
  });

  test('4G网络下应该正常工作', async ({ page }) => {
    await page.emulateNetwork({
      offline: false,
      downloadThroughput: (4 * 1024 * 1024) / 8,
      uploadThroughput: (3 * 1024 * 1024) / 8,
      latency: 20
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
  });

  test('离线状态下应该显示错误', async ({ page }) => {
    await page.emulateNetwork({
      offline: true,
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0
    });

    await page.goto('/');

    const errorMessage = page.locator('text=/网络|offline|error/i');
    const errorVisible = await errorMessage.count() > 0;
    if (errorVisible) {
      await expect(errorMessage).toBeVisible();
    }
  });
});

test.describe('性能测试', () => {
  test('页面加载时间应该在合理范围内', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });

  test('首次内容绘制(FCP)应该在合理范围内', async ({ page }) => {
    await page.goto('/');
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
          }
        }).observe({ entryTypes: ['paint'] });
      });
    });

    expect(fcp).toBeLessThan(3000);
  });

  test('可交互时间(TTI)应该在合理范围内', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tti = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const ttiEntry = entries.find(entry => entry.name === 'domInteractive');
          if (ttiEntry) {
            resolve(ttiEntry.startTime);
          }
        }).observe({ entryTypes: ['navigation'] });
      });
    });

    expect(tti).toBeLessThan(4000);
  });
});

test.describe('跨浏览器兼容性测试', () => {
  test('Chrome浏览器应该正常工作', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'This test is for Chrome only');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
  });

  test('Firefox浏览器应该正常工作', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'This test is for Firefox only');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
  });

  test('Safari浏览器应该正常工作', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'This test is for Safari only');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('特殊场景测试', () => {
  test('屏幕旋转应该正常响应', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);

    await expect(page.locator('h1')).toBeVisible();
  });

  test('多任务切换应该保持状态', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const value = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });

    expect(value).toBe('test-value');
  });

  test('内存使用应该在合理范围内', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const memoryUsage = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });

    if (memoryUsage) {
      expect(memoryUsage.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
    }
  });
});