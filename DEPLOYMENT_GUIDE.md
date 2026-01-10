# 🚀 FMEA智能生成器 - 部署指南

**版本**: v1.3.0
**更新时间**: 2025-01-10

---

## 📦 生产环境部署

### ✅ 已完成的修复

1. **AI提示词优化**
   - ✅ 中文输出
   - ✅ 完整字段
   - ✅ 符合AIAG-VDA标准

2. **前端直连支持**
   - ✅ 智谱AI (GLM)
   - ✅ DeepSeek
   - ✅ 硅基流动
   - ✅ Gemini

3. **调试功能增强**
   - ✅ 详细的控制台日志
   - ✅ 友好的错误提示

---

## 🌐 预览网址

### 生产环境（推荐）

**网址**: https://intelligent-fmea-generator2.pages.dev

**部署平台**: Cloudflare Pages

**状态**: ✅ 已构建，待部署

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 访问
http://localhost:3000
```

---

## 📋 部署步骤

### 方式1: 使用Wrangler CLI（推荐）

```bash
# 1. 构建项目
npm run build

# 2. 部署到Cloudflare Pages
npm run deploy:pages

# 或使用wrangler直接部署
npx wrangler pages deploy docs --project-name=intelligent-fmea-generator2
```

### 方式2: 通过Cloudflare Dashboard

1. **登录Cloudflare**
   - 访问: https://dash.cloudflare.com/
   - 登录账号

2. **进入Pages**
   - 点击 "Workers & Pages"
   - 选择 "Pages" 标签

3. **创建项目（首次）**
   - 点击 "Create a project"
   - 选择 "Upload assets"
   - 项目名称: `intelligent-fmea-generator2`

4. **上传构建文件**
   - 选择 `docs` 文件夹
   - 上传所有文件

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成

6. **访问**
   - 部署完成后会提供网址
   - 或使用: https://intelligent-fmea-generator2.pages.dev

---

## 🔧 环境配置

### 前端环境变量（可选）

创建 `.env` 文件：

```bash
# 后端API地址（可选）
VITE_API_BASE_URL=https://fmea-backend.baipj123.workers.dev

# Gemini API Key（可选，用于前端直接调用）
GEMINI_API_KEY=your_gemini_api_key_here
```

**注意**: 环境变量仅在构建时生效，部署后需要在Cloudflare Pages设置中配置。

### 在Cloudflare Pages中配置环境变量

1. **进入项目设置**
   - Dashboard → Workers & Pages
   - 选择项目: `intelligent-fmea-generator2`

2. **Settings → Environment variables**
   - 添加生产环境变量

3. **重新部署**
   - 配置环境变量后需要重新部署

---

## 🧪 部署验证

### 检查清单

部署后请验证：

- [ ] 页面能正常访问
- [ ] 所有功能正常（登录、FMEA生成等）
- [ ] AI服务商配置正常
- [ ] Excel导出功能正常
- [ ] 移动端适配正常

### 功能测试

#### 1. 测试登录功能
- 访问登录页面
- 输入手机号
- 获取验证码
- 完成登录

#### 2. 测试AI生成

**智谱AI (GLM 4 Plus)**:
- API Key: `07c3e7a8023146cabb10afcb1e087090.QHAsSKJL0Zadrnnt`
- 应该生成全中文的完整FMEA

**Gemini 2.5 Pro**:
- API Key: `AIzaSyAyMnqsJezkGvD7bomSaKeGVGW3hfiyKVA`
- 应该生成高质量的FMEA

#### 3. 测试Excel导出
- 生成FMEA报告
- 点击"导出 Excel 报表"
- 检查导出的文件格式

---

## 📊 性能优化

### 构建优化

当前构建输出：
```
index.html                  1.07 kB │ gzip:   0.54 kB
react (chunk)              11.92 kB │ gzip:   4.25 kB
lucide (chunk)             16.39 kB │ gzip:   3.92 kB
index (main chunk)        308.08 kB │ gzip:  84.99 kB
xlsx (chunk)            1,275.22 kB │ gzip: 384.99 kB
```

### 优化建议

#### 1. 代码分割
- ✅ 已配置manualChunks
- ✅ React、Lucide、XLSX已分离

#### 2. 压缩优化
- ✅ Vite自动压缩
- ✅ Gzip启用

#### 3. 加载优化
- 考虑懒加载XLSX库
- 考虑CDN加速

---

## 🔄 更新部署

### 更新流程

1. **修改代码**
   ```bash
   # 编辑代码
   ```

2. **本地测试**
   ```bash
   npm run dev
   ```

3. **构建**
   ```bash
   npm run build
   ```

4. **部署**
   ```bash
   npm run deploy:pages
   ```

5. **验证**
   - 访问生产环境
   - 测试关键功能

---

## 📚 相关文档

### 技术文档
- [COMPREHENSIVE_TEST_AUTOMATION_PLAN.md](COMPREHENSIVE_TEST_AUTOMATION_PLAN.md) - 测试计划
- [ARCHITECTURE.md](ARCHITECTURE.md) - 系统架构
- [FMEA_TECHNICAL_REQUIREMENTS.md](FMEA_TECHNICAL_REQUIREMENTS.md) - 技术要求

### 使用指南
- [FRONTEND_DIRECT_MODE_GUIDE.md](FRONTEND_DIRECT_MODE_GUIDE.md) - 前端直连模式
- [API_KEY_SETUP_GUIDE.md](API_KEY_SETUP_GUIDE.md) - API Key配置
- [GEMINI_MODEL_GUIDE.md](GEMINI_MODEL_GUIDE.md) - Gemini模型选择

### 部署文档
- [BACKEND_DEPLOYMENT_GUIDE.md](BACKEND_DEPLOYMENT_GUIDE.md) - 后端部署
- [CLOUDFLAR_WORKERS_SETUP.md](CLOUDFLAR_WORKERS_SETUP.md) - Workers配置

---

## 🆘 故障排查

### 问题1: 部署后404错误

**原因**: base path配置错误

**解决**:
```typescript
// vite.config.ts
base: '/',  // Cloudflare Pages使用 '/'
```

### 问题2: API调用失败

**原因**: CORS或环境变量配置

**解决**:
1. 检查后端API是否正常
2. 检查环境变量配置
3. 查看浏览器Console日志

### 问题3: Excel导出失败

**原因**: XLSX库加载问题

**解决**:
1. 检查网络连接
2. 查看Console错误
3. 尝试刷新页面

---

## 📞 技术支持

### 获取帮助

如果遇到问题：

1. **查看文档**
   - 阅读相关文档
   - 查看FAQ

2. **查看日志**
   - 浏览器Console (F12)
   - Network标签
   - 后端日志

3. **提交Issue**
   - GitHub Issues
   - 附上错误信息

---

## 🎯 下一步

### 功能增强

- [ ] 添加更多AI模型
- [ ] 优化提示词
- [ ] 改进用户界面
- [ ] 添加数据验证

### 性能优化

- [ ] 代码分割优化
- [ ] CDN加速
- [ ] 缓存策略
- [ ] 懒加载

### 用户体验

- [ ] 添加进度提示
- [ ] 改进错误提示
- [ ] 添加示例数据
- [ ] 视频教程

---

**部署完成！访问**: https://intelligent-fmea-generator2.pages.dev

**最后更新**: 2025-01-10
**版本**: v1.3.0
