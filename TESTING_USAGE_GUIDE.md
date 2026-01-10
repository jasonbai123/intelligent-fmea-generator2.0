# 🚀 快速使用指南

## 立即开始测试

```bash
# 1. 自动测试和修复（最简单）
npm run test:auto

# 2. 生成测试报告
node tests/generateSummaryReport.js

# 3. 打开报告查看
start test-results/summary-*.html
```

## 主要命令速查

| 命令 | 说明 | 时间 |
|------|------|------|
| `npm run test:auto` | 自动测试+修复 | ~10分钟 |
| `npm run test:unit` | 单元测试 | ~1分钟 |
| `npm run test:e2e` | E2E测试 | ~5分钟 |
| `npm run test:network` | 网络测试 | ~1分钟 |
| `npm run test:all` | 所有测试 | ~8分钟 |
| `npm run test:coverage` | 覆盖率 | ~2分钟 |

## 验证网络访问性

```bash
# 验证 GitHub Pages 和 API 可访问性
node tests/verifyNetworkAccess.js

# 或手动在浏览器访问
# https://intelligent-fmea-generator2.pages.dev
# https://fmea-backend.baipj123.workers.dev/api/health
```

## 查看报告

报告位置: `test-results/` 目录

```bash
# 打开最新的HTML报告
# Windows
start test-results\summary-*.html

# macOS
open test-results/summary-*.html

# Linux
xdg-open test-results/summary-*.html
```

## 常见问题

**Q: 测试失败怎么办？**
A: 运行 `npm run test:auto:fix` 尝试自动修复

**Q: 如何查看详细的测试报告？**
A: 运行 `npx playwright show-report` 查看 Playwright 报告

**Q: 网络测试失败？**
A: 可能是网络问题，手动在浏览器验证 URL

**Q: 如何跳过慢速测试？**
A: 运行 `npm run test:quick` 只运行单元测试

## 文档

- 📖 [完整技术方案](COMPREHENSIVE_TEST_AUTOMATION_PLAN.md)
- 📖 [快速启动指南](TESTING_QUICK_START.md)
- 📖 [实施总结](TESTING_IMPLEMENTATION_SUMMARY.md)
- 📖 [测试结果](TEST_RESULTS_SUMMARY.md)

## 需要帮助？

查看 [TESTING_QUICK_START.md](TESTING_QUICK_START.md) 的故障排查部分
