import { test, expect } from '../helpers/auth';
import { PageHelper } from '../helpers/pageHelper';

test.describe('认证功能测试', () => {
  test('应该能够访问应用主页', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await page.goto('/');
    await helper.waitForNetworkIdle();

    await expect(page).toHaveTitle(/FMEA/);
    
    const sidebar = page.locator('aside, [class*="sidebar"]');
    await expect(sidebar).toBeVisible();
  });

  test.skip('应该能够访问登录页面 - 登录功能已禁用', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await page.goto('/');
    await helper.waitForNetworkIdle();

    await expect(page).toHaveTitle(/FMEA/);
    
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="手机"], input[placeholder*="phone"]');
    await expect(phoneInput).toBeVisible();
  });

  test.skip('应该能够发送验证码 - 登录功能已禁用', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await page.goto('/');
    await helper.waitForNetworkIdle();

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="手机"], input[placeholder*="phone"]');
    await phoneInput.fill('13800138000');

    const sendCodeButton = page.locator('button:has-text("发送验证码"), button:has-text("Send Code")');
    await sendCodeButton.click();

    await helper.checkSuccessMessage(/验证码|code/i);
  });

  test.skip('应该能够使用验证码登录 - 登录功能已禁用', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await page.goto('/');
    await helper.waitForNetworkIdle();

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="手机"], input[placeholder*="phone"]');
    await phoneInput.fill('13800138000');

    const sendCodeButton = page.locator('button:has-text("发送验证码"), button:has-text("Send Code")');
    await sendCodeButton.click();
    await page.waitForTimeout(1000);

    const codeInput = page.locator('input[type="text"], input[placeholder*="验证码"], input[placeholder*="code"]');
    await codeInput.fill('123456');

    const loginButton = page.locator('button:has-text("登录"), button:has-text("Login")');
    await loginButton.click();
    await helper.waitForNetworkIdle();

    await expect(page.locator('body')).not.toContainText('登录');
    await expect(page.locator('body')).not.toContainText('Login');
  });

  test.skip('应该能够显示验证码错误提示 - 登录功能已禁用', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await page.goto('/');
    await helper.waitForNetworkIdle();

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="手机"], input[placeholder*="phone"]');
    await phoneInput.fill('13800138000');

    const codeInput = page.locator('input[type="text"], input[placeholder*="验证码"], input[placeholder*="code"]');
    await codeInput.fill('000000');

    const loginButton = page.locator('button:has-text("登录"), button:has-text("Login")');
    await loginButton.click();

    await helper.checkErrorMessage(/验证码错误|invalid code/i);
  });

  test.skip('应该能够验证手机号格式 - 登录功能已禁用', async ({ page }) => {
    const helper = new PageHelper(page);
    
    await page.goto('/');
    await helper.waitForNetworkIdle();

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="手机"], input[placeholder*="phone"]');
    await phoneInput.fill('123');

    const sendCodeButton = page.locator('button:has-text("发送验证码"), button:has-text("Send Code")');
    await sendCodeButton.click();

    await helper.checkErrorMessage(/手机号|phone/i);
  });

  test.skip('应该能够处理网络错误 - 登录功能已禁用', async ({ page }) => {
    await page.route('**/api/**', route => route.abort('failed'));

    const helper = new PageHelper(page);
    
    await page.goto('/');
    await helper.waitForNetworkIdle();

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="手机"], input[placeholder*="phone"]');
    await phoneInput.fill('13800138000');

    const sendCodeButton = page.locator('button:has-text("发送验证码"), button:has-text("Send Code")');
    await sendCodeButton.click();

    await helper.checkErrorMessage(/网络|network|error/i);
  });
});