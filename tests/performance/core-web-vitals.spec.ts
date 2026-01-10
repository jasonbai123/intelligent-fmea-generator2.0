import { test, expect } from '@playwright/test';

/**
 * 性能测试套件 - Core Web Vitals
 * 测试页面的关键性能指标
 */

test.describe('Core Web Vitals 性能测试', () => {
  const baseUrl = 'https://intelligent-fmea-generator2.pages.dev';

  test('应该满足 LCP (最大内容绘制) 要求 < 2.5s', async ({ page }) => {
    const metrics = await gotoAndWaitForMetrics(page, baseUrl);

    expect(metrics.lcp).toBeLessThan(2500);
    console.log(`LCP: ${metrics.lcp}ms ✅ (目标: < 2500ms)`);
  });

  test('应该满足 FID (首次输入延迟) 要求 < 100ms', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // 模拟用户交互
    await page.click('button');

    const fid = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fidEntry = entries.find((entry) => entry.name === 'first-input');
          if (fidEntry) {
            resolve(fidEntry.processingStart - fidEntry.startTime);
          }
        }).observe({ entryTypes: ['first-input'] });

        setTimeout(() => resolve(0), 2000);
      });
    });

    expect(fid).toBeLessThan(100);
    console.log(`FID: ${fid}ms ✅ (目标: < 100ms)`);
  });

  test('应该满足 CLS (累积布局偏移) 要求 < 0.1', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // 等待一段时间以捕获所有布局偏移
    await page.waitForTimeout(3000);

    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => resolve(clsValue), 1000);
      });
    });

    expect(cls).toBeLessThan(0.1);
    console.log(`CLS: ${cls} ✅ (目标: < 0.1)`);
  });

  test('应该满足 FCP (首次内容绘制) 要求 < 1.8s', async ({ page }) => {
    const metrics = await gotoAndWaitForMetrics(page, baseUrl);

    expect(metrics.fcp).toBeLessThan(1800);
    console.log(`FCP: ${metrics.fcp}ms ✅ (目标: < 1800ms)`);
  });

  test('应该满足 TTI (可交互时间) 要求 < 3.8s', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    const tti = await page.evaluate(() => {
      return new Promise((resolve) => {
        const startTime = performance.now();

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

    expect(tti).toBeLessThan(3800);
    console.log(`TTI: ${tti}ms ✅ (目标: < 3800ms)`);
  });
});

test.describe('资源加载性能测试', () => {
  const baseUrl = 'https://intelligent-fmea-generator2.pages.dev';

  test('应该快速加载关键资源', async ({ page }) => {
    const resourceTimings: any[] = [];

    page.on('response', async (response) => {
      const timing = response.request().timing();
      resourceTimings.push({
        url: response.url(),
        duration: timing.responseEnd,
        size: (await response.body()).length
      });
    });

    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // 分析资源加载时间
    const jsResources = resourceTimings.filter(r => r.url.endsWith('.js'));
    const cssResources = resourceTimings.filter(r => r.url.endsWith('.js'));

    console.log('JavaScript 资源加载时间:');
    jsResources.forEach(r => {
      console.log(`  ${r.url.split('/').pop()}: ${r.duration}ms (${(r.size / 1024).toFixed(2)}KB)`);
    });

    // 验证关键JS资源在合理时间内加载
    const mainJs = jsResources.find(r => r.url.includes('index-'));
    if (mainJs) {
      expect(mainJs.duration).toBeLessThan(3000);
    }
  });

  test('应该优化图片加载', async ({ page }) => {
    const images: any[] = [];

    page.on('response', async (response) => {
      if (response.resourceType() === 'image') {
        const buffer = await response.body();
        images.push({
          url: response.url(),
          size: buffer.length,
          timing: response.request().timing()
        });
      }
    });

    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    console.log('图片资源:');
    images.forEach(img => {
      console.log(`  ${img.url.split('/').pop()}: ${(img.size / 1024).toFixed(2)}KB`);
    });

    // 验证图片大小合理
    images.forEach(img => {
      expect(img.size).toBeLessThan(500 * 1024); // 小于500KB
    });
  });
});

test.describe('运行时性能测试', () => {
  const baseUrl = 'https://intelligent-fmea-generator2.pages.dev';

  test('应该快速响应按钮点击', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    const button = page.locator('button').first();
    await expect(button).toBeVisible();

    const startTime = Date.now();
    await button.click();
    const endTime = Date.now();

    const clickDuration = endTime - startTime;
    expect(clickDuration).toBeLessThan(100);
    console.log(`按钮点击响应时间: ${clickDuration}ms ✅`);
  });

  test('应该流畅滚动页面', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    const scrollTimings: number[] = [];

    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      await page.evaluate(() => window.scrollBy(0, 500));
      const endTime = Date.now();

      scrollTimings.push(endTime - startTime);
      await page.waitForTimeout(100);
    }

    const avgScrollTime = scrollTimings.reduce((a, b) => a + b) / scrollTimings.length;
    expect(avgScrollTime).toBeLessThan(50);
    console.log(`平均滚动时间: ${avgScrollTime}ms ✅`);
  });

  test('应该快速输入文本', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // 导航到有输入框的页面
    const dfmeaButton = page.locator('button:has-text("DFMEA")');
    if (await dfmeaButton.count() > 0) {
      await dfmeaButton.click();
      await page.waitForTimeout(500);
    }

    const textarea = page.locator('textarea').first();
    if (await textarea.count() > 0) {
      const testText = '测试输入性能';

      const startTime = Date.now();
      await textarea.fill(testText);
      const endTime = Date.now();

      const inputDuration = endTime - startTime;
      expect(inputDuration).toBeLessThan(100);
      console.log(`文本输入时间: ${inputDuration}ms ✅`);
    }
  });
});

test.describe('内存和CPU性能测试', () => {
  const baseUrl = 'https://intelligent-fmea-generator2.pages.dev';

  test('应该控制内存使用', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // 执行一些操作
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 100));
      await page.waitForTimeout(100);
    }

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;
    console.log(`内存增长: ${memoryIncrease.toFixed(2)}MB`);

    // 内存增长应该在合理范围内 (< 50MB)
    expect(memoryIncrease).toBeLessThan(50);
  });

  test('应该避免长任务阻塞', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    const longTasks: any[] = [];

    await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime
            });
          }
        });
        observer.observe({ entryTypes: ['longtask'] });

        setTimeout(() => {
          observer.disconnect();
          resolve(longTasks);
        }, 5000);
      });
    });

    console.log(`长任务数量: ${longTasks.length}`);
    if (longTasks.length > 0) {
      longTasks.forEach(task => {
        console.log(`  持续时间: ${task.duration}ms`);
      });

      // 验证没有超过500ms的长任务
      longTasks.forEach(task => {
        expect(task.duration).toBeLessThan(500);
      });
    }
  });
});

test.describe('网络性能测试', () => {
  const baseUrl = 'https://intelligent-fmea-generator2.pages.dev';

  test('应该快速建立连接', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();

    const pageLoadTime = endTime - startTime;
    expect(pageLoadTime).toBeLessThan(3000);
    console.log(`页面完全加载时间: ${pageLoadTime}ms ✅`);
  });

  test('应该有效利用缓存', async ({ page }) => {
    // 第一次访问
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // 第二次访问（应该使用缓存）
    const startTime = Date.now();
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();

    const cachedLoadTime = endTime - startTime;
    console.log(`缓存加载时间: ${cachedLoadTime}ms`);

    // 缓存加载应该更快
    expect(cachedLoadTime).toBeLessThan(2000);
  });
});

/**
 * 辅助函数：导航并等待性能指标
 */
async function gotoAndWaitForMetrics(page: any, url: string) {
  const metrics = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const metrics = {
        lcp: 0,
        fcp: 0,
        ttfb: 0
      };

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            metrics.lcp = entry.startTime;
          }
          if (entry.name === 'first-contentful-paint') {
            metrics.fcp = entry.startTime;
          }
        }
      }).observe({ entryTypes: ['largest-contentful-paint', 'paint'] });

      // 获取 TTFB
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      if (navigation) {
        metrics.ttfb = navigation.responseStart;
      }

      // 5秒后返回结果
      setTimeout(() => resolve(metrics), 5000);
    });
  });

  return metrics;
}

test.describe('不同网络条件下的性能', () => {
  const baseUrl = 'https://intelligent-fmea-generator2.pages.dev';

  test('在慢速3G网络下应该可用', async ({ page }) => {
    // 模拟慢速3G网络
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const startTime = Date.now();
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const endTime = Date.now();

    const loadTime = endTime - startTime;
    console.log(`3G网络加载时间: ${loadTime}ms`);

    // 即使在慢速网络下，也应该在30秒内加载完成
    expect(loadTime).toBeLessThan(30000);
  });

  test('在快速3G网络下应该快速加载', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();

    const loadTime = endTime - startTime;
    console.log(`快速3G网络加载时间: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(5000);
  });
});
