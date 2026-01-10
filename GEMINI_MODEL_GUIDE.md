# 🚀 Gemini 模型支持指南

## 📋 支持的 Gemini 模型

### 最新模型（推荐）

#### ✅ Gemini 2.5 Pro（推荐）
- **模型名称**: `gemini-2.5-pro-preview-03625`
- **特点**: Google 最新、最强大的模型
- **优势**:
  - 最先进的推理能力
  - 更好的上下文理解
  - 支持 1M tokens 上下文
  - 多模态支持（文本、图像、视频、音频）
- **适用场景**:
  - 复杂的 FMEA 分析
  - 需要深度推理的任务
  - 大型项目分析
- **状态**: 预览版（Preview）

#### ✅ Gemini 2.5 Flash Exp
- **模型名称**: `gemini-2.5-flash-exp`
- **特点**: 快速且强大的实验性模型
- **优势**:
  - 更快的响应速度
  - 良好的推理能力
  - 成本更低
- **适用场景**:
  - 需要快速响应的场景
  - 简单到中等复杂度的 FMEA
- **状态**: 实验版（Experimental）

### 稳定模型

#### ✅ Gemini 2.0 Flash Exp
- **模型名称**: `gemini-2.0-flash-exp`
- **特点**: 快速、稳定
- **适用场景**: 日常 FMEA 生成

#### ✅ Gemini 1.5 Pro
- **模型名称**: `gemini-1.5-pro`
- **特点**: 稳定、可靠
- **适用场景**: 生产环境推荐

#### ✅ Gemini 1.5 Flash Exp
- **模型名称**: `gemini-1.5-flash-exp`
- **特点**: 快速、轻量
- **适用场景**: 快速原型

### 通用模型

#### ✅ Gemini Pro
- **模型名称**: `gemini-pro`
- **特点**: 通用目的模型
- **适用场景**: 一般性任务

#### ✅ Gemini Flash
- **模型名称**: `gemini-flash`
- **特点**: 快速响应
- **适用场景**: 快速迭代

---

## 🔧 如何选择模型

### 选择指南

| 场景 | 推荐模型 | 原因 |
|------|---------|------|
| **生产环境（高要求）** | Gemini 1.5 Pro | 稳定、可靠 |
| **最新功能（尝鲜）** | Gemini 2.5 Pro | 最强能力 |
| **快速原型** | Gemini 2.0 Flash Exp | 速度快 |
| **成本优化** | Gemini Flash | 免费配额多 |
| **复杂分析** | Gemini 2.5 Pro | 推理能力强 |
| **日常使用** | Gemini 1.5 Pro | 平衡性能 |

### 默认配置

系统默认使用 **Gemini 2.5 Pro** (`gemini-2.5-pro-preview-03625`)

---

## 🎯 如何配置模型

### 方法1: 通过 UI 界面

1. **打开设置**
   - 点击侧边栏 "设置"
   - 进入 "AI API 设置"

2. **选择模型**
   - 在 "模型名称" 下拉菜单中选择
   - 选择想要的 Gemini 模型

3. **保存配置**
   - 点击 "保存设置" 按钮

### 方法2: 通过代码

```typescript
import { AiSettings } from './types';

const settings: AiSettings = {
  provider: 'gemini',
  modelName: 'gemini-2.5-pro-preview-03625', // Gemini 2.5 Pro
  apiKey: 'your-api-key'
};
```

---

## 📊 模型对比

### 性能对比

| 模型 | 速度 | 推理能力 | 上下文 | 稳定性 | 推荐度 |
|------|------|---------|--------|--------|--------|
| **Gemini 2.5 Pro** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 1M | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Gemini 2.5 Flash** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 1M | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Gemini 2.0 Flash** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 1M | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Gemini 1.5 Pro** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 1M | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Gemini 1.5 Flash** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 1M | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Gemini Pro** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Gemini Flash** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

### 功能对比

| 功能 | 2.5 Pro | 2.5 Flash | 1.5 Pro | 2.0 Flash |
|------|---------|----------|---------|----------|
| **文本生成** | ✅ | ✅ | ✅ | ✅ |
| **多模态** | ✅ | ✅ | ✅ | ✅ |
| **函数调用** | ✅ | ✅ | ✅ | ✅ |
| **JSON 模式** | ✅ | ✅ | ✅ | ✅ |
| **系统指令** | ✅ | ✅ | ✅ | ✅ |
| **长上下文** | ✅ (1M) | ✅ (1M) | ✅ (1M) | ✅ (1M) |
| **思维链** | ✅ | ❌ | ❌ | ❌ |

---

## 🔑 API Key 配置

### 获取 API Key

1. 访问: https://makersuite.google.com/app/apikey
2. 登录 Google 账号
3. 点击 "Create API key"
4. 复制 API Key

### 在应用中配置

1. 打开应用
2. 进入 "设置" → "AI API 设置"
3. 选择 "Google Gemini"
4. 粘贴 API Key
5. 选择模型（推荐 Gemini 2.5 Pro）
6. 点击 "保存设置"

---

## ⚠️ 注意事项

### 预览版模型

**Gemini 2.5 Pro** 和 **Gemini 2.5 Flash** 是预览版/实验版：
- ⚠️ 可能会有变更
- ⚠️ 性能可能不稳定
- ⚠️ 不建议用于关键生产环境

### 稳定性建议

**生产环境推荐**:
- ✅ Gemini 1.5 Pro（最稳定）
- ✅ Gemini 1.5 Flash Exp（稳定且快速）

**开发/测试环境**:
- ✅ Gemini 2.5 Pro（体验最新功能）
- ✅ Gemini 2.0 Flash Exp（平衡选择）

---

## 🐛 常见问题

### Q1: "models/gemini-2.5-pro-preview is not found"

**原因**: 模型名称错误或版本号不对

**解决**:
- 使用完整的模型名称: `gemini-2.5-pro-preview-03625`
- 检查模型版本号是否正确
- 参考 [Gemini 模型列表](https://ai.google.dev/models)

### Q2: 模型响应慢

**原因**: 选择了高级模型

**解决**:
- 切换到 Flash 系列模型
- 减少 `maxTokens` 设置
- 使用 Gemini 2.0 Flash Exp

### Q3: 分析质量不高

**原因**: 模型能力不足

**解决**:
- 升级到 Gemini 2.5 Pro
- 优化提示词
- 提供更详细的上下文

### Q4: 配额超限

**原因**: 免费配额用完

**解决**:
- 等待配额重置
- 切换到不同的 API Key
- 升级到付费计划

---

## 📚 相关资源

### 官方文档
- [Gemini API 文档](https://ai.google.dev/docs)
- [模型列表](https://ai.google.dev/models)
- [定价页面](https://ai.google.dev/pricing)
- [配额页面](https://ai.google.dev/quotas)

### 快速链接
- [Google AI Studio](https://makersuite.google.com/)
- [API Key 管理](https://makersuite.google.com/app/apikey)
- [JavaScript SDK](https://github.com/google/generative-ai-js)

---

## ✅ 配置检查清单

在使用前，请确认：

- [ ] 已获取 Gemini API Key
- [ ] 已在应用中配置 API Key
- [ ] 已选择合适的模型
  - [ ] 生产环境: Gemini 1.5 Pro
  - [ ] 开发环境: Gemini 2.5 Pro
  - [ ] 快速测试: Gemini 2.0 Flash Exp
- [ ] 设置已保存
- [ ] 测试连接成功

---

## 🎯 推荐配置

### 最佳实践配置

```typescript
// 配置1: 生产环境（稳定优先）
const productionConfig = {
  modelName: 'gemini-1.5-pro',
  temperature: 0.7,
  maxTokens: 8192
};

// 配置2: 开发环境（能力优先）
const developmentConfig = {
  modelName: 'gemini-2.5-pro-preview-03625',
  temperature: 0.7,
  maxTokens: 8192
};

// 配置3: 快速测试（速度优先）
const quickTestConfig = {
  modelName: 'gemini-2.0-flash-exp',
  temperature: 0.7,
  maxTokens: 4096
};
```

---

**最后更新**: 2025-01-10
**支持版本**: Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 1.5 Pro/Flash, Gemini 2.0 Flash
**默认模型**: Gemini 2.5 Pro Preview

🎉 **现在支持最新的 Gemini 2.5 Pro 和 Gemini 2.5 Flash！**
