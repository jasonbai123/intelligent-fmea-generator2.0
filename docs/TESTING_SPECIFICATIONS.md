# 智能FMEA生成器 - 软件测试规范

## 一、测试总则

### 1.1 测试目标
- 确保软件功能符合需求规格说明
- 验证软件在各种条件下的稳定性和可靠性
- 发现并修复软件缺陷
- 提高软件质量和用户体验
- 确保软件符合AIAG VDA FMEA 1.0标准

### 1.2 测试原则
- **尽早测试**: 在开发早期开始测试，尽早发现问题
- **全面测试**: 覆盖所有功能模块和用户场景
- **自动化优先**: 优先使用自动化测试提高效率
- **持续测试**: 在开发过程中持续进行测试
- **文档化**: 所有测试过程和结果都需要文档化

### 1.3 测试类型
- **单元测试**: 测试单个组件和函数
- **集成测试**: 测试组件之间的交互
- **端到端测试**: 测试完整的用户流程
- **性能测试**: 测试系统性能和响应时间
- **安全测试**: 测试系统安全性和漏洞
- **兼容性测试**: 测试在不同浏览器和设备上的兼容性
- **可访问性测试**: 测试软件的可访问性

---

## 二、测试环境

### 2.1 开发环境
- **操作系统**: Windows 10/11, macOS, Linux
- **Node.js**: v18.0.0 或更高版本
- **包管理器**: npm 9.0.0 或更高版本
- **浏览器**: Chrome, Firefox, Safari, Edge 最新版本
- **IDE**: VS Code, WebStorm 或其他支持TypeScript的IDE

### 2.2 测试工具
- **单元测试**: Vitest
- **端到端测试**: Playwright
- **代码覆盖率**: @vitest/coverage-v8
- **测试辅助库**: @testing-library/react, @testing-library/user-event
- **Mock工具**: vitest, msw (Mock Service Worker)

### 2.3 测试数据
- **测试用户**: 使用测试手机号和验证码
- **测试项目**: 创建标准测试项目
- **测试文件**: 准备各种格式的测试文件
- **AI响应**: Mock AI服务响应数据

---

## 三、单元测试规范

### 3.1 测试覆盖率要求
- **总体覆盖率**: ≥ 80%
- **核心组件覆盖率**: ≥ 90%
- **工具函数覆盖率**: ≥ 95%
- **服务层覆盖率**: ≥ 85%

### 3.2 测试命名规范
```typescript
// 格式: describe('ComponentName', () => {
//   describe('methodName', () => {
//     it('should do something when condition', () => {
//       // 测试代码
//     });
//   });
// });

describe('FmeaTable', () => {
  describe('render', () => {
    it('should render table with correct data', () => {
      // 测试代码
    });
    
    it('should render empty state when no data', () => {
      // 测试代码
    });
  });
  
  describe('handleExport', () => {
    it('should export data to Excel', () => {
      // 测试代码
    });
  });
});
```

### 3.3 测试结构
```typescript
// 1. Arrange - 准备测试数据和环境
const mockData = createMockFmeaData();
const mockProps = {
  data: mockData,
  onExport: vi.fn()
};

// 2. Act - 执行被测试的操作
render(<FmeaTable {...mockProps} />);
fireEvent.click(screen.getByText('导出'));

// 3. Assert - 验证结果
expect(mockProps.onExport).toHaveBeenCalledWith(mockData);
```

### 3.4 Mock规范
```typescript
// Mock API调用
vi.mock('../services/api', () => ({
  generateFmeaAnalysis: vi.fn()
}));

// Mock React组件
vi.mock('../components/Header', () => ({
  default: () => <div>Mock Header</div>
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;
```

### 3.5 异步测试规范
```typescript
it('should handle async operation', async () => {
  // 使用 waitFor 等待异步操作完成
  await waitFor(() => {
    expect(screen.getByText('加载完成')).toBeInTheDocument();
  });
  
  // 或者使用 async/await
  const result = await generateFmeaAnalysis(mockRequest);
  expect(result).toBeDefined();
});
```

---

## 四、集成测试规范

### 4.1 测试范围
- 组件之间的数据传递
- 状态管理逻辑
- API调用和响应处理
- 路由导航
- 事件处理

### 4.2 测试示例
```typescript
describe('FMEA Generation Integration', () => {
  it('should complete full FMEA generation flow', async () => {
    // 1. 渲染主应用
    render(<App />);
    
    // 2. 选择FMEA类型
    fireEvent.click(screen.getByText('DFMEA'));
    
    // 3. 输入文本
    const textarea = screen.getByPlaceholderText('请输入产品描述');
    fireEvent.change(textarea, { target: { value: '测试产品描述' } });
    
    // 4. 配置AI设置
    fireEvent.click(screen.getByText('AI设置'));
    // ... 配置AI设置
    
    // 5. 点击生成
    fireEvent.click(screen.getByText('生成FMEA'));
    
    // 6. 等待结果
    await waitFor(() => {
      expect(screen.getByText('FMEA分析结果')).toBeInTheDocument();
    });
  });
});
```

---

## 五、端到端测试规范

### 5.1 测试场景
- 用户注册和登录
- FMEA生成完整流程
- 项目创建和管理
- 版本管理
- 评论和协作
- Excel导出
- 移动端适配

### 5.2 测试结构
```typescript
import { test, expect } from '@playwright/test';

test.describe('FMEA Generation E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前导航到首页
    await page.goto('http://localhost:3000');
  });

  test('should generate DFMEA successfully', async ({ page }) => {
    // 1. 选择DFMEA标签
    await page.click('text=DFMEA');
    
    // 2. 输入产品描述
    await page.fill('textarea[placeholder*="请输入"]', '测试产品描述');
    
    // 3. 配置AI设置
    await page.click('button:has-text("AI设置")');
    await page.fill('input[placeholder*="API Key"]', 'test-api-key');
    await page.click('button:has-text("保存")');
    
    // 4. 生成FMEA
    await page.click('button:has-text("生成FMEA")');
    
    // 5. 验证结果
    await expect(page.locator('text=FMEA分析结果')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should export FMEA to Excel', async ({ page }) => {
    // 生成FMEA
    await generateFmea(page);
    
    // 导出Excel
    await page.click('button:has-text("导出Excel")');
    
    // 验证下载
    const downloadPromise = page.waitForEvent('download');
    await downloadPromise;
  });
});
```

### 5.3 测试数据准备
```typescript
test.beforeAll(async () => {
  // 创建测试用户
  await createTestUser('13510420462', '888888');
  
  // 创建测试项目
  await createTestProject({
    title: '测试项目',
    type: 'dfmea',
    data: mockFmeaData
  });
});
```

### 5.4 测试清理
```typescript
test.afterAll(async () => {
  // 清理测试数据
  await cleanupTestData();
});
```

---

## 六、性能测试规范

### 6.1 测试指标
- **页面加载时间**: < 3秒
- **FMEA生成时间**: < 30秒
- **API响应时间**: < 2秒
- **内存使用**: < 500MB
- **CPU使用**: < 80%

### 6.2 测试方法
```typescript
test('should load page within 3 seconds', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('http://localhost:3000');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000);
});

test('should generate FMEA within 30 seconds', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  const startTime = Date.now();
  await generateFmea(page);
  const generateTime = Date.now() - startTime;
  
  expect(generateTime).toBeLessThan(30000);
});
```

### 6.3 压力测试
```typescript
test('should handle 10 concurrent FMEA generations', async ({ browser }) => {
  const contexts = await Promise.all(
    Array(10).fill(null).map(() => browser.newContext())
  );
  
  const pages = await Promise.all(
    contexts.map(context => context.newPage())
  );
  
  const results = await Promise.all(
    pages.map(page => generateFmea(page))
  );
  
  results.forEach(result => {
    expect(result.success).toBe(true);
  });
});
```

---

## 七、安全测试规范

### 7.1 测试项目
- **XSS防护**: 测试跨站脚本攻击防护
- **CSRF防护**: 测试跨站请求伪造防护
- **SQL注入**: 测试SQL注入防护
- **认证安全**: 测试认证和授权机制
- **数据加密**: 测试敏感数据加密
- **API安全**: 测试API端点安全性

### 7.2 测试示例
```typescript
test('should prevent XSS attacks', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 尝试注入XSS脚本
  const xssPayload = '<script>alert("XSS")</script>';
  await page.fill('textarea[placeholder*="请输入"]', xssPayload);
  await page.click('button:has-text("生成FMEA")');
  
  // 验证脚本未执行
  const alerts = [];
  page.on('dialog', dialog => {
    alerts.push(dialog.message());
    dialog.accept();
  });
  
  expect(alerts.length).toBe(0);
});

test('should require authentication for protected routes', async ({ page }) => {
  await page.goto('http://localhost:3000/collaboration');
  
  // 验证重定向到登录页
  await expect(page).toHaveURL(/.*login/);
});
```

---

## 八、兼容性测试规范

### 8.1 浏览器兼容性
- **Chrome**: 最新版本及前2个版本
- **Firefox**: 最新版本及前2个版本
- **Safari**: 最新版本及前2个版本
- **Edge**: 最新版本及前2个版本

### 8.2 设备兼容性
- **桌面**: Windows, macOS, Linux
- **平板**: iPad, Android平板
- **手机**: iPhone, Android手机

### 8.3 测试配置
```typescript
const devices = [
  { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
  { name: 'Laptop', viewport: { width: 1366, height: 768 } },
  { name: 'Tablet', viewport: { width: 768, height: 1024 } },
  { name: 'Mobile', viewport: { width: 375, height: 667 } }
];

devices.forEach(device => {
  test(`should work on ${device.name}`, async ({ page }) => {
    await page.setViewportSize(device.viewport);
    await page.goto('http://localhost:3000');
    
    // 验证页面正常显示
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

---

## 九、可访问性测试规范

### 9.1 测试标准
- **WCAG 2.1**: 遵循Web内容可访问性指南
- **键盘导航**: 所有功能可通过键盘访问
- **屏幕阅读器**: 支持屏幕阅读器
- **颜色对比度**: 符合对比度要求
- **ARIA属性**: 正确使用ARIA属性

### 9.2 测试示例
```typescript
test('should be keyboard navigable', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 使用Tab键导航
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
  
  // 使用Enter键激活
  await page.keyboard.press('Enter');
  
  // 验证操作执行
  await expect(page.locator('text=FMEA生成器')).toBeVisible();
});

test('should have proper ARIA attributes', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 验证按钮有aria-label
  const button = page.locator('button:has-text("生成FMEA")');
  await expect(button).toHaveAttribute('aria-label');
  
  // 验证表单有aria-required
  const textarea = page.locator('textarea');
  await expect(textarea).toHaveAttribute('aria-required', 'true');
});
```

---

## 十、测试报告规范

### 10.1 测试报告内容
- **测试概览**: 测试范围、测试环境、测试时间
- **测试结果**: 通过/失败统计、覆盖率
- **缺陷列表**: 发现的缺陷及其严重程度
- **风险评估**: 测试中发现的风险
- **建议**: 改进建议和后续计划

### 10.2 测试报告模板
```markdown
# 测试报告

## 测试概览
- 测试日期: 2025-01-11
- 测试人员: 测试工程师
- 测试环境: 开发环境
- 测试工具: Vitest, Playwright

## 测试结果
- 总测试用例: 100
- 通过: 95
- 失败: 5
- 覆盖率: 85%

## 缺陷列表
| ID | 严重程度 | 描述 | 状态 |
|----|---------|------|------|
| BUG-001 | 高 | FMEA生成失败 | 已修复 |
| BUG-002 | 中 | 导出Excel格式错误 | 待修复 |

## 风险评估
- 高风险: 无
- 中风险: 2个
- 低风险: 3个

## 建议
1. 修复所有高严重程度缺陷
2. 提高测试覆盖率到90%
3. 添加更多边界条件测试
```

---

## 十一、测试执行流程

### 11.1 测试计划
1. **需求分析**: 理解需求和功能规格
2. **测试设计**: 设计测试用例和测试数据
3. **测试环境准备**: 搭建测试环境
4. **测试执行**: 执行测试用例
5. **缺陷报告**: 报告发现的缺陷
6. **缺陷验证**: 验证缺陷修复
7. **测试报告**: 生成测试报告

### 11.2 测试执行命令
```bash
# 运行所有单元测试
npm run test:unit

# 运行所有E2E测试
npm run test:e2e

# 运行特定测试
npm run test:unit -- FmeaTable.test.tsx

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试并自动修复
npm run test:fix
```

### 11.3 持续集成
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run test:coverage
```

---

## 十二、测试维护

### 12.1 测试用例维护
- **定期更新**: 随着功能更新定期更新测试用例
- **删除过时测试**: 删除不再相关的测试用例
- **添加新测试**: 为新功能添加测试用例
- **优化测试**: 优化慢速测试和重复测试

### 12.2 测试数据维护
- **定期清理**: 定期清理过时的测试数据
- **更新Mock数据**: 更新Mock数据以匹配实际API
- **管理测试用户**: 管理测试用户和权限

### 12.3 测试工具维护
- **更新测试工具**: 定期更新测试工具到最新版本
- **修复工具问题**: 及时修复测试工具的问题
- **优化测试配置**: 优化测试配置以提高效率

---

## 十三、测试最佳实践

### 13.1 编写可维护的测试
- **使用描述性名称**: 测试名称应该清楚地描述测试内容
- **保持测试独立**: 每个测试应该独立运行
- **避免测试依赖**: 避免测试之间的依赖关系
- **使用辅助函数**: 使用辅助函数减少重复代码

### 13.2 编写快速的测试
- **避免不必要的等待**: 使用合理的等待策略
- **并行执行测试**: 并行执行独立的测试
- **使用Mock**: 使用Mock避免慢速操作
- **优化测试数据**: 使用最小必要的测试数据

### 13.3 编写可靠的测试
- **处理异步操作**: 正确处理异步操作
- **验证关键路径**: 验证关键用户路径
- **测试边界条件**: 测试边界条件和异常情况
- **使用稳定的定位器**: 使用稳定的元素定位器

---

## 十四、测试度量

### 14.1 测试覆盖率度量
- **代码覆盖率**: 测试覆盖的代码行数百分比
- **分支覆盖率**: 测试覆盖的代码分支百分比
- **函数覆盖率**: 测试覆盖的函数百分比
- **语句覆盖率**: 测试覆盖的语句百分比

### 14.2 测试质量度量
- **缺陷密度**: 每千行代码发现的缺陷数
- **缺陷修复率**: 已修复缺陷占总缺陷的百分比
- **测试通过率**: 通过测试占总测试的百分比
- **测试效率**: 单位时间执行的测试用例数

### 14.3 测试效果度量
- **缺陷发现率**: 测试发现的缺陷占总缺陷的百分比
- **缺陷逃逸率**: 生产环境发现的缺陷占总缺陷的百分比
- **测试覆盖率提升**: 测试覆盖率随时间的变化
- **测试成本**: 测试所需的资源和时间

---

## 十五、总结

本测试规范提供了全面的测试指导，包括：

1. **测试总则**: 测试目标、原则和类型
2. **测试环境**: 开发环境、测试工具和测试数据
3. **单元测试规范**: 覆盖率要求、命名规范、测试结构
4. **集成测试规范**: 测试范围和示例
5. **端到端测试规范**: 测试场景、结构和数据准备
6. **性能测试规范**: 测试指标、方法和压力测试
7. **安全测试规范**: 测试项目和示例
8. **兼容性测试规范**: 浏览器、设备和测试配置
9. **可访问性测试规范**: 测试标准和示例
10. **测试报告规范**: 报告内容和模板
11. **测试执行流程**: 测试计划、命令和持续集成
12. **测试维护**: 测试用例、数据和工具维护
13. **测试最佳实践**: 可维护、快速和可靠的测试
14. **测试度量**: 覆盖率、质量和效果度量

遵循本规范可以确保软件质量和用户体验，提高开发效率，降低维护成本。
