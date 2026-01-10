# 🚀 自动化测试快速启动指南

本指南将帮助您快速运行 Intelligent FMEA Generator 的全架构自动化测试系统。

---

## 📋 目录

1. [快速开始](#快速开始)
2. [测试命令](#测试命令)
3. [查看报告](#查看报告)
4. [CI/CD集成](#cicd集成)
5. [故障排查](#故障排查)

---

## 🎯 快速开始

### 前置要求

- Node.js >= 18.x
- npm 或 yarn
- Git

### 一键运行所有测试

```bash
# 克隆仓库（如果还没有）
git clone <your-repo-url>
cd intelligent-fmea-generator

# 安装依赖
npm install

# 安装 Playwright 浏览器
npx playwright install --with-deps

# 运行所有测试
npm run test:run
```

### 运行自动测试和修复

```bash
# 运行完整流程（测试 + 分析 + 自动修复 + 验证）
npm run test:auto

# 只运行测试，不修复
npm run test:auto:check

# 运行测试并尝试修复（最多3次重试）
npm run test:auto:fix

# 完整验证（测试 + 构建）
npm run test:verify
```

---

## 🧪 测试命令

### 基础测试命令

```bash
# 单元测试
npm run test:unit

# E2E测试（桌面浏览器）
npm run test:e2e

# 移动端测试
npm run test:e2e:mobile

# 网络访问性测试
npm run test:network

# API测试
npm run test:api

# 运行所有测试
npm run test:all
```

### 带界面的测试

```bash
# 使用 Playwright UI 运行测试
npm run test:e2e:ui

# 使用 headed 模式（可以看到浏览器）
npm run test:e2e:headed
```

### 覆盖率报告

```bash
# 生成覆盖率报告
npm run test:coverage

# 查看 HTML 报告
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

### 特定测试

```bash
# 测试特定文件
npx playwright test tests/e2e/auth.spec.ts

# 测试特定项目
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"

# 测试特定关键词
npx playwright test --grep "登录"
```

---

## 📊 查看报告

### 测试报告位置

```
test-results/
├── report-<timestamp>.html      # HTML报告（推荐）
├── report-<timestamp>.md        # Markdown报告
├── report-<timestamp>.json      # JSON报告
└── summary-<timestamp>.html     # 汇总报告

coverage/
└── index.html                    # 覆盖率报告

playwright-report/
└── index.html                    # Playwright报告
```

### 打开报告

```bash
# 在浏览器中打开最新的HTML报告
# macOS
open test-results/report-$(ls -t test-results/*.html | head -n 1)

# Linux
xdg-open test-results/report-$(ls -t test-results/*.html | head -n 1)

# Windows
start test-results\report-$(dir /b /o-d test-results\*.html | more +1)

# 或者使用 Playwright UI
npx playwright show-report
```

### 报告内容

HTML 报告包含：
- ✅ 总体测试统计
- 📊 各分类测试结果
- ❌ 失败测试详情
- ⚡ 性能指标
- 🔧 修复建议

---

## 🔄 CI/CD 集成

### GitHub Actions

测试工作流已配置在 `.github/workflows/comprehensive-test.yml`

触发条件：
- 推送到 master/develop 分支
- 创建/更新 Pull Request
- 每天凌晨 2:00（北京时间上午 10:00）
- 手动触发

### 手动触发工作流

1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "🧪 全架构自动化测试"
4. 点击 "Run workflow"
5. 选择分支并运行

### 查看工作流结果

1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择对应的工作流运行
4. 查看测试结果和报告

---

## 🛠️ 故障排查

### 常见问题

#### 1. Playwright 浏览器未安装

**错误信息:**
```
Executable doesn't exist at /path/to/playwright-browsers
```

**解决方案:**
```bash
npx playwright install --with-deps
```

#### 2. 测试超时

**错误信息:**
```
Test timeout of 30000ms exceeded
```

**解决方案:**
```bash
# 增加超时时间
npx playwright test --timeout=60000
```

#### 3. 端口被占用

**错误信息:**
```
Port 5173 is already in use
```

**解决方案:**
```bash
# 查找并关闭占用端口的进程
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

#### 4. 网络测试失败

**错误信息:**
```
connect ECONNREFUSED <url>
```

**解决方案:**
- 检查网络连接
- 确认 GitHub Pages 和 Cloudflare Workers 可访问
- 检查防火墙设置

#### 5. 依赖安装失败

**错误信息:**
```
npm ERR! code ERESOLVE
```

**解决方案:**
```bash
# 使用 legacy-peer-deps
npm install --legacy-peer-deps

# 或使用 --force
npm install --force
```

### 调试模式

```bash
# 启用调试模式
DEBUG=pw:api npx playwright test

# 查看 Playwright 日志
PWDEBUG=1 npx playwright test

# 慢动作模式（用于调试）
npx playwright test --slow-mo=1000
```

### 查看详细日志

```bash
# Vitest 详细输出
npm run test:unit -- --reporter=verbose

# Playwright 详细输出
npx playwright test --reporter=list
```

---

## 📈 测试分类说明

### 1. 单元测试 (Unit Tests)
- **文件:** `tests/unit/*.test.tsx`
- **框架:** Vitest + React Testing Library
- **内容:** 测试单个组件和函数
- **时间:** 快速（< 1分钟）

### 2. 集成测试 (Integration Tests)
- **文件:** `tests/integration/*.test.tsx`
- **框架:** Vitest
- **内容:** 测试组件间交互
- **时间:** 中等（1-3分钟）

### 3. E2E测试 (End-to-End Tests)
- **文件:** `tests/e2e/*.spec.ts`
- **框架:** Playwright
- **内容:** 完整用户流程
- **时间:** 较长（3-5分钟）

### 4. 移动端测试 (Mobile Tests)
- **文件:** `tests/e2e/mobile.spec.ts`
- **框架:** Playwright
- **内容:** 移动设备和触摸交互
- **时间:** 中等（2-4分钟）

### 5. 网络测试 (Network Tests)
- **文件:** `tests/e2e/network.spec.ts`
- **框架:** Playwright
- **内容:** 外部网络访问性
- **时间:** 快速（< 1分钟）

### 6. API测试 (API Tests)
- **文件:** `tests/api/*.test.ts`
- **框架:** Vitest
- **内容:** 后端 API 接口
- **时间:** 快速（< 1分钟）

### 7. 性能测试 (Performance Tests)
- **文件:** `tests/performance/*.spec.ts`
- **框架:** Playwright
- **内容:** Core Web Vitals
- **时间:** 中等（2-3分钟）

### 8. 安全测试 (Security Tests)
- **工具:** npm audit, Snyk, CodeQL
- **内容:** 安全漏洞扫描
- **时间:** 快速（< 1分钟）

### 9. 可访问性测试 (Accessibility Tests)
- **文件:** `tests/accessibility/*.spec.ts`
- **框架:** Playwright + axe-core
- **内容:** WCAG 2.1 标准
- **时间:** 中等（1-2分钟）

---

## 🎓 最佳实践

### 1. 本地开发时

```bash
# 运行快速测试（单元 + 构建）
npm run test:quick

# 或监听模式（自动重新运行）
npm run test:unit -- --watch
```

### 2. 提交代码前

```bash
# 运行完整测试套件
npm run test:all

# 运行代码检查
npm run lint

# 构建验证
npm run build
```

### 3. 发布前

```bash
# 完整验证（包括网络测试）
npm run test:verify

# 检查安全漏洞
npm audit

# 检查覆盖率
npm run test:coverage
```

### 4. 定期维护

```bash
# 每天自动运行（通过 GitHub Actions）
# 或手动运行：
npm run test:auto

# 查看测试趋势
# 定期检查测试报告，识别不稳定测试
```

---

## 📚 更多资源

- [完整技术方案](COMPREHENSIVE_TEST_AUTOMATION_PLAN.md)
- [测试指南](TEST_GUIDE.md)
- [自动化测试计划](AUTOMATED_TESTING_PLAN.md)
- [架构文档](ARCHITECTURE.md)
- [Playwright 文档](https://playwright.dev/)
- [Vitest 文档](https://vitest.dev/)

---

## 💡 提示

1. **首次运行** 可能需要较长时间（下载浏览器等）
2. **网络测试** 需要稳定的网络连接
3. **E2E 测试** 建议在专用机器上运行（避免干扰）
4. **报告保存** 测试报告会保存在 `test-results/` 目录
5. **并行运行** Playwright 支持并行测试，可以加快速度

---

## 🤝 贡献

如果您发现问题或有改进建议，请：
1. 创建 Issue 描述问题
2. 提交 Pull Request
3. 参考 [技术方案](COMPREHENSIVE_TEST_AUTOMATION_PLAN.md) 添加新测试

---

**Happy Testing! 🎉**

如有问题，请查看 [故障排查](#故障排查) 部分或提交 Issue。
