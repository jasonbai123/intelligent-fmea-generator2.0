import { test, expect } from '@playwright/test';
import { PageHelper } from '../helpers/pageHelper';

test.describe('项目管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.skip('应该能够显示项目列表 - 应用当前为单机模式，无项目管理功能', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const projectList = page.locator('[data-testid="project-list"], .project-list, table');
    await expect(projectList).toBeVisible();
  });

  test.skip('应该能够创建新项目 - 应用当前为单机模式，无项目管理功能', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const createButton = page.locator('button:has-text("新建"), button:has-text("创建"), button:has-text("New"), button:has-text("Create")');
    if (await createButton.count() > 0) {
      await createButton.click();

      const projectNameInput = page.locator('input[placeholder*="项目名称"], input[placeholder*="project name"]');
      await projectNameInput.fill('测试项目');

      const submitButton = page.locator('button:has-text("提交"), button:has-text("保存"), button:has-text("Submit"), button:has-text("Save")');
      await submitButton.click();

      await helper.checkSuccessMessage(/创建成功|created|saved/i);
    }
  });

  test.skip('应该能够查看项目详情 - 应用当前为单机模式，无项目管理功能', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const firstProject = page.locator('[data-testid="project-item"], .project-item, tr').first();
    if (await firstProject.count() > 0) {
      await firstProject.click();
      await helper.waitForNetworkIdle();

      await expect(page.locator('body')).toContainText(/项目详情|project detail/i);
    }
  });

  test.skip('应该能够编辑项目 - 应用当前为单机模式，无项目管理功能', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const firstProject = page.locator('[data-testid="project-item"], .project-item, tr').first();
    if (await firstProject.count() > 0) {
      await firstProject.click();
      await helper.waitForNetworkIdle();

      const editButton = page.locator('button:has-text("编辑"), button:has-text("Edit")');
      if (await editButton.count() > 0) {
        await editButton.click();

        const projectNameInput = page.locator('input[placeholder*="项目名称"], input[placeholder*="project name"]');
        await projectNameInput.fill('编辑后的测试项目');

        const submitButton = page.locator('button:has-text("提交"), button:has-text("保存"), button:has-text("Submit"), button:has-text("Save")');
        await submitButton.click();

        await helper.checkSuccessMessage(/更新成功|updated/i);
      }
    }
  });

  test.skip('应该能够删除项目 - 应用当前为单机模式，无项目管理功能', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const firstProject = page.locator('[data-testid="project-item"], .project-item, tr').first();
    if (await firstProject.count() > 0) {
      await firstProject.click();
      await helper.waitForNetworkIdle();

      const deleteButton = page.locator('button:has-text("删除"), button:has-text("Delete")');
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        await helper.handleDialog(true);

        await helper.checkSuccessMessage(/删除成功|deleted/i);
      }
    }
  });

  test.skip('应该能够搜索项目 - 应用当前为单机模式，无项目管理功能', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('测试');
      await page.waitForTimeout(1000);

      const searchResults = page.locator('[data-testid="project-item"], .project-item, tr');
      await expect(searchResults).toHaveCount(1);
    }
  });

  test.skip('应该能够导出项目数据 - 应用当前为单机模式，无项目管理功能', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const exportButton = page.locator('button:has-text("导出"), button:has-text("Export")');
    if (await exportButton.count() > 0) {
      await exportButton.click();

      await helper.checkSuccessMessage(/导出成功|exported/i);
    }
  });
});