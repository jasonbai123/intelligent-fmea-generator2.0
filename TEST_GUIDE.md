# 🧪 FMEA生成器 - 测试指南

## 📋 目录
- [快速开始](#快速开始)
- [测试类型](#测试类型)
- [运行测试](#运行测试)
- [测试报告](#测试报告)
- [CI/CD](#cicd)
- [故障排除](#故障排除)

---

## 🚀 快速开始

### 前提条件
- Node.js 18+ 已安装
- 依赖已安装 (`npm install`)

### 安装测试依赖
```bash
npm install
```

### 安装Playwright浏览器
```bash
npx playwright install
```

---

## 📝 测试类型

### 1. 单元测试
- **工具:** Vitest + React Testing Library
- **覆盖范围:** 组件、工具函数、服务
- **命令:** `npm run test:unit`

### 2. E2E测试
- **工具:** Playwright
- **覆盖范围:** 用户交互流程、页面导航
- **命令:** `npm run test:e2e`

### 3. 移动端测试
- **工具:** Playwright (设备模拟)
- **覆盖范围:** iPhone、Android、iPad、弱网环境
- **命令:** `npm run test:e2e:mobile`

### 4. API测试
- **工具:** Vitest + Supertest
- **覆盖范围:** 后端API接口
- **命令:** `npm run test:api`

### 5. FMEA功能测试
- **工具:** Playwright
- **覆盖范围:** FMEA生成、AI服务调用
- **命令:** `npm run test:e2e:fmea`

---

## 🔧 运行测试

### 方式1：运行所有测试
```bash
npm run test:all
```

### 方式2：运行特定类型测试

#### 单元测试
```bash
npm run test:unit
```

#### E2E测试（Chrome）
```bash
npm run test:e2e
```

#### E2E测试（带UI）
```bash
npm run test:e2e:ui
```

#### 移动端测试
```bash
npm run test:e2e:mobile
```

#### FMEA生成测试
```bash
npm run test:e2e:fmea
```

#### API认证测试
```bash
npm run test:api:auth
```

#### API AI服务测试
```bash
npm run test:api:ai
```

### 方式3：使用测试脚本

#### 运行所有测试
```bash
npm run test:run
# 或
bash scripts/test-all.sh
```

#### 快速测试（单元+构建）
```bash
npm run test:quick
# 或
bash scripts/test-all.sh quick
```

#### 仅运行单元测试
```bash
bash scripts/test-all.sh unit
```

#### 仅运行E2E测试
```bash
bash scripts/test-all.sh e2e
```

#### 仅运行移动端测试
```bash
bash scripts/test-all.sh mobile
```

#### 仅运行API测试
```bash
bash scripts/test-all.sh api
```

---

## 📊 测试报告

### 查看测试报告

#### HTML报告
```bash
# E2E测试报告
open playwright-report/index.html

# 单元测试覆盖率报告
open coverage/index.html
```

#### JSON报告
```bash
# 单元测试结果
cat test-results/unit-results.json

# E2E测试结果
cat test-results/results.json
```

### 生成覆盖率报告
```bash
npm run test:coverage
```

报告位置: `coverage/index.html`

---

## 🔄 CI/CD自动化测试

### GitHub Actions

测试会在以下情况自动运行：
- ✅ 推送到main/master/develop分支
- ✅ 创建Pull Request
- ✅ 每天凌晨2点（定时任务）
- ✅ 手动触发（workflow_dispatch）

### 测试流程
```
1. 单元测试 → 代码质量检查
2. E2E测试 → Chrome/Firefox/Safari
3. 移动端测试 → iPhone/Android/iPad
4. API测试 → 后端接口测试
5. 性能测试 → Lighthouse CI
6. 构建测试 → 生产环境构建
```

### 查看CI/CD结果

#### GitHub Actions
1. 访问仓库的 "Actions" 标签
2. 选择最近的workflow运行
3. 查看测试结果和报告

#### 下载测试报告
在CI/CD运行页面，可以下载：
- `playwright-report-chrome` - Chrome测试报告
- `playwright-report-firefox` - Firefox测试报告
- `playwright-report-webkit` - Safari测试报告
- `playwright-report-mobile` - 移动端测试报告
- `unit-test-results` - 单元测试结果
- `test-summary` - 测试汇总报告

---

## 🐛 故障排除

### 问题1：Playwright浏览器未安装

**错误信息:**
```
Error: Executable doesn't exist at ...
```

**解决方案:**
```bash
npx playwright install
```

---

### 问题2：端口被占用

**错误信息:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

---

### 问题3：后端API测试失败

**错误信息:**
```
Error: connect ECONNREFUSED ::1:3001
```

**解决方案:**
```bash
# 启动后端服务
cd backend
npm run dev

# 在另一个终端运行API测试
npm run test:api
```

---

### 问题4：测试超时

**错误信息:**
```
Error: Test timeout of 30000ms exceeded
```

**解决方案:**
1. 增加测试超时时间
2. 检查网络连接
3. 验证API服务是否正常运行

---

### 问题5：模拟数据测试失败

**错误信息:**
```
Error: Cannot find module './mockData'
```

**解决方案:**
```bash
# 确保所有测试文件存在
ls tests/e2e/
ls tests/api/
```

---

## 📱 移动端测试详解

### 支持的设备

#### iOS设备
- iPhone 12
- iPhone SE
- iPad Pro

#### Android设备
- Samsung Galaxy S21
- Pixel 5

### 弱网测试

测试包含以下网络条件：
- ✅ 3G网络 (1.6 Mbps)
- ✅ 慢速3G (500 Kbps)
- ✅ 高延迟 (400ms)
- ✅ 网络不稳定
- ✅ 离线模式

### 运行特定设备测试

```bash
# 仅测试iPhone
npx playwright test --project="Mobile Safari"

# 仅测试Android
npx playwright test --project="Mobile Chrome"
```

---

## 🔍 测试覆盖率

### 当前覆盖范围

| 模块 | 单元测试 | E2E测试 | API测试 | 移动端测试 |
|------|---------|---------|---------|------------|
| 认证功能 | ✅ | ✅ | ✅ | ✅ |
| FMEA生成 | ✅ | ✅ | ✅ | ✅ |
| AI服务 | ✅ | ✅ | ✅ | ✅ |
| 用户管理 | ✅ | ✅ | ✅ | ✅ |
| 项目协作 | ✅ | ✅ | ✅ | ✅ |

### 提高覆盖率

```bash
# 生成覆盖率报告
npm run test:coverage

# 查看未覆盖的代码
open coverage/index.html
```

---

## 📧 测试通知

### 配置测试通知

#### GitHub Actions
在 `.github/workflows/test.yml` 中添加：

```yaml
- name: 发送测试结果通知
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: '测试失败！请检查测试报告。'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🚀 性能基准

### 目标性能指标

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| 页面加载时间 | < 2s | TBD |
| 首次内容绘制(FCP) | < 1s | TBD |
| 可交互时间(TTI) | < 3s | TBD |
| Lighthouse评分 | > 90 | TBD |

---

## 📞 技术支持

- **设计联系方式 / 微信：** jasonbai 13510420462
- **版权归属：** Jasonbai 老师

---

**提示：** 每次提交代码前，建议运行 `npm run test:quick` 进行快速测试。
