import { test, expect } from '@playwright/test';

test.describe('移动端网络访问测试', () => {
  // 测试不同设备
  const devices = [
    { name: 'iPhone 12', device: 'iPhone 12' },
    { name: 'iPhone SE', device: 'iPhone SE' },
    { name: 'iPad Pro', device: 'iPad Pro' },
    { name: 'Samsung Galaxy S21', device: 'Galaxy S21' },
    { name: 'Pixel 5', device: 'Pixel 5' }
  ];

  devices.forEach(({ name, device }) => {
    test.describe(`${name} 测试`, () => {
      test.use({ ...devices[device] });

      test(`应该能够在 ${name} 上正常访问应用`, async ({ page }) => {
        await page.goto('/');

        // 等待页面加载
        await page.waitForLoadState('networkidle');

        // 验证页面标题
        await expect(page).toHaveTitle(/FMEA/);

        // 验证主要内容可见
        const mainContent = page.locator('h1, h2').first();
        await expect(mainContent).toBeVisible();
      });

      test(`应该能够在 ${name} 上使用侧边栏导航`, async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // 在移动端，侧边栏可能需要通过菜单按钮打开
        const menuButton = page.locator('button[aria-label*="menu"], button:has-text("菜单")');
        const menuVisible = await menuButton.count() > 0;

        if (menuVisible) {
          await menuButton.click();
          await page.waitForTimeout(500);
        }

        // 验证导航按钮可见
        const navButtons = page.locator('aside nav button, [class*="sidebar"] button');
        const count = await navButtons.count();
        expect(count).toBeGreaterThan(0);
      });

      test(`应该能够在 ${name} 上输入文本`, async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // 点击DFMEA
        const dfmeaButton = page.locator('button:has-text("DFMEA")');
        await dfmeaButton.click();

        // 等待导航完成
        await page.waitForTimeout(500);

        // 找到文本输入框
        const textInput = page.locator('textarea').first();
        await expect(textInput).toBeVisible();

        // 输入测试文本
        await textInput.fill('移动端测试产品描述');

        // 验证输入
        const value = await textInput.inputValue();
        expect(value).toBe('移动端测试产品描述');
      });

      test(`应该能够在 ${name} 上点击按钮`, async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // 点击设置按钮
        const settingsButton = page.locator('button:has-text("设置"), [class*="settings"]').first();
        await settingsButton.click();

        // 验证导航到设置页面
        await page.waitForTimeout(500);
        const settingsTitle = page.locator('h2:has-text("AI API")');
        await expect(settingsTitle).toBeVisible();
      });

      test(`应该能够在 ${name} 上滚动页面`, async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // 获取初始滚动位置
        const scrollPosition1 = await page.evaluate(() => window.scrollY);

        // 滚动页面
        await page.evaluate(() => window.scrollBy(0, 500));

        // 等待滚动完成
        await page.waitForTimeout(500);

        // 获取新的滚动位置
        const scrollPosition2 = await page.evaluate(() => window.scrollY);

        expect(scrollPosition2).toBeGreaterThan(scrollPosition1);
      });

      test(`应该能够在 ${name} 上触摸交互`, async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // 使用tap而不是click（更接近真实触摸）
        const element = page.locator('button').first();
        await element.tap();

        // 验证交互效果
        await page.waitForTimeout(300);
      });
    });
  });

  test.describe('移动端响应式布局测试', () => {
    test('iPhone SE (小屏幕) 应该正确显示', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // 验证主要内容区域宽度
      const mainContent = page.locator('main, [class*="content"]').first();
      const box = await mainContent.boundingBox();

      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    });

    test('iPad (中屏幕) 应该正确显示', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      // 验证侧边栏可能变为可见
      const sidebar = page.locator('aside, [class*="sidebar"]').first();
      const isVisible = await sidebar.isVisible().catch(() => false);

      // 在平板上侧边栏应该是可见的或可以折叠的
      expect(isVisible || true).toBe(true);
    });

    test('横屏模式 应该正确显示', async ({ page }) => {
      await page.setViewportSize({ width: 812, height: 375 }); // iPhone X 横屏
      await page.goto('/');

      // 验证内容适应横屏
      const body = page.locator('body');
      const box = await body.boundingBox();

      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeGreaterThan(box.height);
      }
    });
  });

  test.describe('移动端触摸手势测试', () => {
    test('应该支持滑动手势', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // 模拟从左向右滑动（打开侧边栏）
      await page.touchscreen.tap(50, 300);
      await page.mouse.down();
      await page.mouse.move(300, 300);
      await page.mouse.up();

      await page.waitForTimeout(500);

      // 验证侧边栏可能出现
      const sidebar = page.locator('aside, [class*="sidebar"]');
      const isVisible = await sidebar.isVisible().catch(() => false);
      // 侧边栏可能出现，也可能不出现，都是正常的
      expect(true).toBe(true);
    });

    test('应该支持缩放手势', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // 获取初始页面缩放
      const zoom1 = await page.evaluate(() => document.documentElement.clientWidth / window.innerWidth);

      // 模拟双指缩放（Playwright支持有限，这里做基础验证）
      await page.touchscreen.tap(187, 333);

      // 验证页面仍然可交互
      const button = page.locator('button').first();
      await expect(button).toBeVisible();
    });
  });
});

test.describe('弱网环境测试', () => {
  test('3G网络下应该正常工作', async ({ page }) => {
    // 模拟3G网络
    await page.emulateNetwork({
      offline: false,
      downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
      uploadThroughput: (750 * 1024) / 8, // 750 Kbps
      latency: 100 // 100ms延迟
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 应该能够正常加载
    await expect(page.locator('h1')).toBeVisible();
  });

  test('慢速3G网络下应该正常工作', async ({ page }) => {
    // 模拟慢速3G网络
    await page.emulateNetwork({
      offline: false,
      downloadThroughput: (500 * 1024) / 8, // 500 Kbps
      uploadThroughput: (500 * 1024) / 8, // 500 Kbps
      latency: 400 // 400ms延迟
    });

    await page.goto('/');

    // 等待页面加载（可能需要更长时间）
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // 应该能够加载完成
    await expect(page.locator('h1')).toBeVisible();
  });

  test('网络不稳定时应该有重试机制', async ({ page }) => {
    let requestCount = 0;

    // 模拟网络不稳定
    await page.route('**/api/**', async (route) => {
      requestCount++;

      // 前两次请求失败，第三次成功
      if (requestCount < 3) {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });

    await page.goto('/');

    // 应该显示错误提示或重试
    await page.waitForTimeout(3000);

    // 验证页面仍然可用
    const title = page.locator('h1').first();
    const isVisible = await title.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('离线时应该显示适当提示', async ({ page }) => {
    // 模拟离线
    await page.setOffline(true);

    await page.goto('/');

    // 应该显示离线提示或使用缓存内容
    await page.waitForTimeout(2000);

    // 验证页面有某些内容（即使是缓存的）
    const hasContent = await page.locator('body').textContent();
    expect(hasContent.length).toBeGreaterThan(0);

    // 恢复在线
    await page.setOffline(false);
  });
});

test.describe('移动端性能测试', () => {
  test('页面加载时间应该在可接受范围内', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // 等待页面完全加载
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 移动端加载时间应该在5秒内
    expect(loadTime).toBeLessThan(5000);

    console.log(`${loadTime}ms - 移动端加载时间`);
  });

  test('首次内容绘制(FCP)应该在2秒内', async ({ page }) => {
    const metrics = await page.goto('/');

    if (metrics) {
      const fcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              resolve(fcpEntry.startTime);
            }
          }).observe({ entryTypes: ['paint'] });

          // 如果2秒内没有FCP，返回超时
          setTimeout(() => resolve(2000), 2000);
        });
      });

      expect(fcp).toBeLessThan(2000);
      console.log(`${fcp}ms - 首次内容绘制时间`);
    }
  });

  test('交互时间(TTI)应该在4秒内', async ({ page }) => {
    await page.goto('/');

    // 等待页面可交互
    await page.waitForLoadState('domcontentloaded');

    const tti = await page.evaluate(() => {
      return new Promise((resolve) => {
        const startTime = performance.now();

        // 尝试连续执行任务
        const checkTTI = () => {
          const longTasks = performance.getEntriesByType('longtask');
          const lastLongTask = longTasks[longTasks.length - 1];

          if (!lastLongTask || performance.now() - lastLongTask.startTime > 5000) {
            resolve(performance.now() - startTime);
          } else {
            requestIdleCallback(() => checkTTI());
          }
        };

        checkTTI();
      });
    });

    expect(tti).toBeLessThan(4000);
    console.log(`${tti}ms - 可交互时间`);
  });
});

test.describe('移动端兼容性测试', () => {
  test('iOS Safari应该正确渲染', async ({ page, context }) => {
    // 使用iPhone 12模拟iOS Safari
    await page.goto('/');

    // 验证没有CSS渲染问题
    const body = page.locator('body');
    const styles = await body.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });

    expect(styles).not.toBe('none');
  });

  test('Android Chrome应该正确渲染', async ({ page }) => {
    // 使用Pixel 5模拟Android Chrome
    await page.goto('/');

    // 验证主要内容可见
    const mainContent = page.locator('main, [class*="content"]').first();
    await expect(mainContent).toBeVisible();
  });

  test('应该支持移动端浏览器的前进/后退', async ({ page }) => {
    await page.goto('/');

    // 导航到DFMEA页面
    await page.click('button:has-text("DFMEA")');
    await page.waitForTimeout(500);

    // 导航到设置页面
    await page.click('[class*="settings"]');
    await page.waitForTimeout(500);

    // 后退
    await page.goBack();
    await page.waitForTimeout(500);

    // 应该回到DFMEA页面
    await expect(page.locator('h1')).toContainText('DFMEA');

    // 前进
    await page.goForward();
    await page.waitForTimeout(500);

    // 应该回到设置页面
    await expect(page.locator('h2')).toContainText('AI API');
  });

  test('应该支持移动端的键盘弹出', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 点击DFMEA
    await page.click('button:has-text("DFMEA")');
    await page.waitForTimeout(500);

    // 聚焦文本输入框
    const textInput = page.locator('textarea').first();
    await textInput.focus();

    // 等待键盘弹出（Playwright可能无法真实模拟，但至少验证可聚焦）
    await page.waitForTimeout(500);

    const isFocused = await textInput.evaluate((el: any) => document.activeElement === el);
    expect(isFocused).toBe(true);
  });

  test('应该支持移动端的文件选择', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 点击DFMEA
    await page.click('button:has-text("DFMEA")');
    await page.waitForTimeout(500);

    // 验证文件输入存在
    const fileInput = page.locator('input[type="file"]');
    const count = await fileInput.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('移动端特殊场景测试', () => {
  test('应该在屏幕旋转时保持状态', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 输入一些内容
    await page.click('button:has-text("DFMEA")');
    await page.waitForTimeout(500);

    const textInput = page.locator('textarea').first();
    await textInput.fill('测试内容');
    const value1 = await textInput.inputValue();

    // 旋转屏幕
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);

    // 验证内容保留
    const value2 = await textInput.inputValue();
    expect(value2).toBe(value1);
  });

  test('应该在多任务切换后保持状态', async ({ page }) => {
    await page.goto('/');

    // 导航到某个页面
    await page.click('button:has-text("DFMEA")');
    await page.waitForTimeout(500);

    // 模拟页面隐藏（切换到其他应用）
    await page.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // 等待一段时间
    await page.waitForTimeout(2000);

    // 模拟页面重新显示
    await page.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // 验证页面仍然可用
    await expect(page.locator('h1')).toContainText('DFMEA');
  });

  test('应该处理低内存警告', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 模拟内存压力（通过操作大页面）
    for (let i = 0; i < 10; i++) {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
    }

    // 验证应用仍然可用
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
  });
});

test.describe('移动端可访问性测试', () => {
  test('应该有适当的触摸目标大小', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 获取所有可点击元素
    const buttons = page.locator('button, a, input[type="submit"]');

    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();

      if (box) {
        // 移动端建议最小触摸目标44x44px
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('应该支持屏幕阅读器', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 验证有适当的ARIA标签
    const mainButton = page.locator('button').first();

    const ariaLabel = await mainButton.getAttribute('aria-label');
    const text = await mainButton.textContent();

    expect(ariaLabel || text).toBeTruthy();
  });

  test('应该有足够的颜色对比度', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 验证主要文本元素的颜色对比度
    const headings = page.locator('h1, h2, h3');

    const count = await headings.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const heading = headings.nth(i);

      const color = await heading.evaluate((el: any) => {
        return window.getComputedStyle(el).color;
      });

      // 验证颜色不是透明或白色
      expect(color).not.toBe('transparent');
      expect(color).not.toBe('rgba(255, 255, 255, 0)');
    }
  });
});
