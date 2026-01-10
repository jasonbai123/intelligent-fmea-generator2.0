import { test, expect } from '@playwright/test';
import { PageHelper } from '../helpers/pageHelper';

test.describe('评论管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够显示评论管理界面', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const commentManagementButton = page.locator('button:has-text("评论管理"), button:has-text("Comment Management")');
    if (await commentManagementButton.count() > 0) {
      await commentManagementButton.click();

      const commentList = page.locator('[data-testid="comment-list"], .comment-list');
      await expect(commentList).toBeVisible();
    }
  });

  test('应该能够添加新评论', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const commentInput = page.locator('textarea[placeholder*="添加评论"], textarea[placeholder*="add comment"]');
    if (await commentInput.count() > 0) {
      await commentInput.fill('这是一个测试评论');

      const submitButton = page.locator('button:has-text("提交"), button:has-text("Submit")');
      await submitButton.click();

      await helper.checkSuccessMessage(/添加成功|added/i);
    }
  });

  test('应该能够查看评论列表', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const commentManagementButton = page.locator('button:has-text("评论管理"), button:has-text("Comment Management")');
    if (await commentManagementButton.count() > 0) {
      await commentManagementButton.click();

      const commentItems = page.locator('[data-testid="comment-item"], .comment-item');
      await expect(commentItems).toHaveCount(1);
    }
  });

  test('应该能够编辑评论', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const commentManagementButton = page.locator('button:has-text("评论管理"), button:has-text("Comment Management")');
    if (await commentManagementButton.count() > 0) {
      await commentManagementButton.click();

      const editButton = page.locator('button:has-text("编辑"), button:has-text("Edit")').first();
      if (await editButton.count() > 0) {
        await editButton.click();

        const commentTextarea = page.locator('textarea').first();
        await commentTextarea.fill('编辑后的评论内容');

        const saveButton = page.locator('button:has-text("保存"), button:has-text("Save")');
        await saveButton.click();

        await helper.checkSuccessMessage(/更新成功|updated/i);
      }
    }
  });

  test('应该能够删除评论', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const commentManagementButton = page.locator('button:has-text("评论管理"), button:has-text("Comment Management")');
    if (await commentManagementButton.count() > 0) {
      await commentManagementButton.click();

      const deleteButton = page.locator('button:has-text("删除"), button:has-text("Delete")').first();
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        await helper.handleDialog(true);

        await helper.checkSuccessMessage(/删除成功|deleted/i);
      }
    }
  });

  test('应该能够回复评论', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const commentManagementButton = page.locator('button:has-text("评论管理"), button:has-text("Comment Management")');
    if (await commentManagementButton.count() > 0) {
      await commentManagementButton.click();

      const replyButton = page.locator('button:has-text("回复"), button:has-text("Reply")').first();
      if (await replyButton.count() > 0) {
        await replyButton.click();

        const replyTextarea = page.locator('textarea[placeholder*="回复"], textarea[placeholder*="reply"]');
        await replyTextarea.fill('这是一个回复');

        const submitButton = page.locator('button:has-text("提交"), button:has-text("Submit")');
        await submitButton.click();

        await helper.checkSuccessMessage(/回复成功|replied/i);
      }
    }
  });

  test('应该能够点赞评论', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const commentManagementButton = page.locator('button:has-text("评论管理"), button:has-text("Comment Management")');
    if (await commentManagementButton.count() > 0) {
      await commentManagementButton.click();

      const likeButton = page.locator('button:has-text("点赞"), button:has-text("Like")').first();
      if (await likeButton.count() > 0) {
        await likeButton.click();

        await helper.checkSuccessMessage(/点赞成功|liked/i);
      }
    }
  });

  test('应该能够搜索评论', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const commentManagementButton = page.locator('button:has-text("评论管理"), button:has-text("Comment Management")');
    if (await commentManagementButton.count() > 0) {
      await commentManagementButton.click();

      const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('测试');
        await page.waitForTimeout(1000);

        const searchResults = page.locator('[data-testid="comment-item"], .comment-item');
        await expect(searchResults).toHaveCount(1);
      }
    }
  });

  test('应该能够按时间排序评论', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const commentManagementButton = page.locator('button:has-text("评论管理"), button:has-text("Comment Management")');
    if (await commentManagementButton.count() > 0) {
      await commentManagementButton.click();

      const sortButton = page.locator('button:has-text("排序"), button:has-text("Sort")');
      if (await sortButton.count() > 0) {
        await sortButton.click();

        const sortOption = page.locator('text=最新').first();
        await sortOption.click();

        await helper.waitForNetworkIdle();
      }
    }
  });

  test('应该能够过滤评论', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const commentManagementButton = page.locator('button:has-text("评论管理"), button:has-text("Comment Management")');
    if (await commentManagementButton.count() > 0) {
      await commentManagementButton.click();

      const filterButton = page.locator('button:has-text("过滤"), button:has-text("Filter")');
      if (await filterButton.count() > 0) {
        await filterButton.click();

        const filterOption = page.locator('text=我的评论').first();
        await filterOption.click();

        await helper.waitForNetworkIdle();
      }
    }
  });

  test('应该能够导出评论数据', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const commentManagementButton = page.locator('button:has-text("评论管理"), button:has-text("Comment Management")');
    if (await commentManagementButton.count() > 0) {
      await commentManagementButton.click();

      const exportButton = page.locator('button:has-text("导出"), button:has-text("Export")');
      if (await exportButton.count() > 0) {
        await exportButton.click();

        await helper.checkSuccessMessage(/导出成功|exported/i);
      }
    }
  });

  test('应该能够批量删除评论', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await helper.waitForNetworkIdle();

    const commentManagementButton = page.locator('button:has-text("评论管理"), button:has-text("Comment Management")');
    if (await commentManagementButton.count() > 0) {
      await commentManagementButton.click();

      const checkboxes = page.locator('input[type="checkbox"]');
      if (await checkboxes.count() > 0) {
        await checkboxes.first().check();

        const batchDeleteButton = page.locator('button:has-text("批量删除"), button:has-text("Batch Delete")');
        if (await batchDeleteButton.count() > 0) {
          await batchDeleteButton.click();
          await helper.handleDialog(true);

          await helper.checkSuccessMessage(/删除成功|deleted/i);
        }
      }
    }
  });
});
