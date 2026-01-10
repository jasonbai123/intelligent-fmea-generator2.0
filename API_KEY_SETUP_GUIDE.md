# 🔑 Gemini API Key 配置指南

## 问题描述

**错误信息**: "An API Key must be set when running in a browser"

**原因**: 使用 Gemini AI 需要配置 API Key

---

## ✅ 解决方案

### 方法1: 通过 UI 配置（推荐）

1. **打开应用**
   - 访问: https://intelligent-fmea-generator2.pages.dev
   - 或本地运行: `npm run dev`

2. **进入设置页面**
   - 点击侧边栏的 "设置" 按钮
   - 或点击 "AI API 设置"

3. **配置 Gemini API**
   - 选择 AI 服务商: "Google Gemini"
   - 输入您的 Gemini API Key
   - 点击 "保存设置"

4. **获取 API Key**（如果还没有）
   - 访问: https://makersuite.google.com/app/apikey
   - 登录 Google 账号
   - 点击 "Create API Key"
   - 复制生成的 API Key

---

### 方法2: 使用环境变量（用于本地开发）

在项目根目录创建 `.env` 文件：

```env
VITE_GEMINI_API_KEY=your-api-key-here
```

---

## 📋 API Key 获取步骤

### 1. 访问 Google AI Studio

打开浏览器访问: https://makersuite.google.com/app/apikey

### 2. 登录 Google 账号

使用您的 Google 账号登录

### 3. 创建 API Key

- 点击 "Create API key" 按钮
- 系统会自动生成一个 API Key
- 复制这个 API Key

### 4. 保存 API Key

**方法 A: 通过应用UI**
1. 打开应用
2. 进入 "设置" → "AI API 设置"
3. 选择 "Google Gemini"
4. 粘贴 API Key
5. 点击 "保存设置"

**方法 B: 直接在应用中输入**
1. 点击 "开始 DFMEA 分析" 或 "开始 PFMEA 分析"
2. 在弹出的设置框中输入 API Key
3. 点击 "保存"

---

## 🔧 API Key 格式

API Key 是一个字符串，格式类似：
```
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**注意**:
- 以 `AIza` 开头
- 大约 39 个字符
- 只包含字母和数字
- 没有空格或特殊字符

---

## 💡 使用建议

### 安全性
- ✅ 不要在公开代码中硬编码 API Key
- ✅ 不要将 API Key 提交到 Git 仓库
- ✅ 定期轮换 API Key
- ✅ 为 API Key 设置使用限制

### 使用限制
- 免费版: 每分钟 15 次请求
- 付费版: 每分钟 60 次请求
- 每天有配额限制

### 费用
- Gemini 2.0 Flash: 免费
- Gemini 1.5 Pro: 免费
- Gemini 1.5 Flash: 免费
- 其他模型: 可能收费

---

## 🧪 验证配置

### 检查步骤

1. **确认 API Key 已保存**
   - 进入 "设置" → "AI API 设置"
   - 检查是否显示配置的 API Key
   - 应该显示部分隐藏的 Key（如 `AIza...XXX`）

2. **测试连接**
   ```typescript
   // 在浏览器控制台测试
   const apiKey = localStorage.getItem('aiSettings');
   console.log('Saved API Key:', apiKey);
   ```

3. **尝试生成 FMEA**
   - 输入产品描述
   - 点击 "开始 DFMEA 分析"
   - 如果成功，说明配置正确

---

## 🐛 常见问题

### Q1: API Key 无效

**错误**: "API key not valid"

**解决**:
1. 检查 API Key 是否正确复制
2. 确认没有多余的空格
3. 确认 API Key 已启用 Gemini API

### Q2: 配额超限

**错误**: "Quota exceeded"

**解决**:
1. 等待配额重置（通常每分钟）
2. 升级到付费计划
3. 使用多个 API Key 轮换

### Q3: 网络错误

**错误**: "Failed to fetch"

**解决**:
1. 检查网络连接
2. 确认可以访问 Google 服务
3. 检查防火墙设置

### Q4: CORS 错误

**错误**: "CORS policy error"

**解决**:
- 确保使用前端直接调用模式
- 检查浏览器控制台错误信息
- 确认 API Key 已正确配置

---

## 📚 相关资源

### 官方文档
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API 文档](https://ai.google.dev/docs)
- [API Key 管理](https://makersuite.google.com/app/apikey)

### 费用和配额
- [定价页面](https://ai.google.dev/pricing)
- [配额页面](https://ai.google.dev/quotas)

### 示例代码
- [JavaScript SDK](https://github.com/google/generative-ai-js)
- [示例项目](https://github.com/google/generative-ai-js/tree/main/samples)

---

## ✅ 配置检查清单

在开始使用前，请确认：

- [ ] 已获取 Gemini API Key
- [ ] 已在应用中配置 API Key
- [ ] 设置页面显示 API Key 已配置
- [ ] 可以正常使用 DFMEA/PFMEA 分析功能
- [ ] 没有看到 "API Key must be set" 错误

---

## 🎯 快速配置（3步）

### 第1步: 获取 API Key
访问: https://makersuite.google.com/app/apikey
点击: "Create API key"

### 第2步: 配置应用
打开应用 → 设置 → AI API 设置
选择: "Google Gemini"
输入: 粘贴您的 API Key
点击: "保存设置"

### 第3步: 测试
输入产品描述
点击: "开始 DFMEA 分析"
确认: 成功生成报告

---

**配置时间**: < 5分钟
**难度**: ⭐ 简单
**状态**: ✅ 完成配置后即可使用

🎉 **配置完成后，您就可以正常使用 DFMEA 和 PFMEA 分析功能了！**
