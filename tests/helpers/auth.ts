import { test as base, Page } from '@playwright/test';

type TestOptions = {
  authenticatedPage: Page;
};

export const test = base.extend<TestOptions>({
  authenticatedPage: async ({ page }, use) => {
    // Login functionality is disabled in the current application
    // Simply use the page without authentication
    await use(page);
  },
});

export const expect = test.expect;