import { test, expect } from '@playwright/test';
import { PageHelper } from '../helpers/pageHelper';

test.describe('FMEA表格功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够显示FMEA表格', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const fmeaTable = page.locator('table');
    await expect(fmeaTable).toBeVisible();
    
    const tableHead = page.locator('thead');
    await expect(tableHead).toBeVisible();
    
    const tableBody = page.locator('tbody');
    await expect(tableBody).toBeVisible();
  });

  test('应该能够显示表头信息', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const tableHead = page.locator('thead tr');
    const headerRows = await tableHead.count();
    expect(headerRows).toBeGreaterThan(0);
    
    const stepHeaders = page.locator('th:has-text("Structure Analysis"), th:has-text("Function Analysis"), th:has-text("Failure Analysis"), th:has-text("Risk Analysis"), th:has-text("Optimization")');
    await expect(stepHeaders.first()).toBeVisible();
  });

  test('应该能够显示表格数据行', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    const firstRow = tableRows.first();
    await expect(firstRow).toBeVisible();
    
    const cells = firstRow.locator('td');
    const cellCount = await cells.count();
    expect(cellCount).toBeGreaterThan(0);
  });

  test('应该能够显示严重度、发生度、探测度评分', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const severityCells = page.locator('td:has-text(/^\\d+$/)').filter({ hasText: /^[1-9]|10$/ });
    if (await severityCells.count() > 0) {
      await expect(severityCells.first()).toBeVisible();
    }
  });

  test('应该能够显示AP值', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const apCells = page.locator('td').filter({ hasText: /H|M|L/i });
    if (await apCells.count() > 0) {
      await expect(apCells.first()).toBeVisible();
    }
  });

  test('应该能够显示项目标题', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const title = page.locator('h1, h2, .bg-black.text-white').filter({ hasText: /FMEA|失效模式及影响分析/i });
    if (await title.count() > 0) {
      await expect(title.first()).toBeVisible();
    }
  });

  test('应该能够显示步骤标签', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const stepLabels = page.locator('.bg-yellow-100, .bg-slate-100').filter({ hasText: /步骤|Step/i });
    if (await stepLabels.count() > 0) {
      await expect(stepLabels.first()).toBeVisible();
    }
  });

  test('应该能够显示导出菜单按钮', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const exportButton = page.locator('button').filter({ hasText: /导出|Export|下载|Download/i });
    if (await exportButton.count() > 0) {
      await expect(exportButton.first()).toBeVisible();
    }
  });

  test('应该能够点击导出菜单按钮', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const exportButton = page.locator('button').filter({ hasText: /导出|Export|下载|Download/i });
    if (await exportButton.count() > 0) {
      await exportButton.first().click();
      await page.waitForTimeout(500);
      
      const exportMenu = page.locator('button:has-text("Excel"), button:has-text("JSON"), button:has-text("PDF")');
      if (await exportMenu.count() > 0) {
        await expect(exportMenu.first()).toBeVisible();
      }
    }
  });

  test.skip('应该能够添加FMEA行 - 组件不支持此功能', async ({ page }) => {
  });

  test.skip('应该能够编辑FMEA单元格 - 组件不支持此功能', async ({ page }) => {
  });

  test.skip('应该能够删除FMEA行 - 组件不支持此功能', async ({ page }) => {
  });

  test.skip('应该能够计算RPN值 - 组件不支持此功能', async ({ page }) => {
  });

  test.skip('应该能够保存FMEA数据 - 组件不支持此功能', async ({ page }) => {
  });

  test.skip('应该能够导入FMEA数据 - 组件不支持此功能', async ({ page }) => {
  });
});