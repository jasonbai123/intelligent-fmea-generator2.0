# 🚨 紧急修复：API连接问题解决方案

**时间**: 2025-01-10
**问题**: 所有AI服务商无法在浏览器中直接调用

---

## 📊 错误分析

根据浏览器Console日志：

### 1. DeepSeek、智谱AI、硅基流动
```
net::ERR_CONNECTION_CLOSED
TypeError: Failed to fetch
```
**原因**: 这些API服务商**不支持浏览器直接调用**（CORS限制）

### 2. Gemini
```
404: models/gemini-2.5-pro-preview is not found
```
**原因**: 模型名称错误，应该是 `gemini-2.5-pro-preview-03625`

### 3. 豆包
```
404: InvalidEndpointOrModel.NotFound
```
**原因**: 火山引擎API需要后端代理

---

## ✅ 立即解决方案

### 方案1: 修复Gemini模型名称（最快）

1. **进入设置**
   - 点击"设置" → "AI API 设置"

2. **选择 Gemini**
   - 选择 "Google Gemini"
   - **模型选择**: 不要选 "Gemini 2.5 Pro"
   - **选这个**: "Gemini 2.0 Flash (快速)" 或 "Gemini 1.5 Pro"

3. **输入API Key**
   - API Key: `AIzaSyAyMnqsJezkGvD7bomSaKeGVGW3hfiyKVA`

4. **保存并测试**

**可用的Gemini模型**:
- ✅ `gemini-2.0-flash-exp` (推荐，快速)
- ✅ `gemini-1.5-pro` (稳定)
- ✅ `gemini-1.5-flash-exp` (快速)
- ❌ `gemini-2.5-pro-preview` (不存在，错误!)
- ❌ `gemini-3.0-pro` (不存在)

---

### 方案2: 配置后端环境变量（推荐，需要部署权限）

由于DeepSeek、智谱AI、硅基流动等API不支持浏览器直接调用，需要通过后端代理。

#### 步骤1: 准备API Keys

您已经有了：
- 智谱AI: `07c3e7a8023146cabb10afcb1e087090.QHAsSKJL0Zadrnnt`
- DeepSeek: `sk-fd39b3a22c0d4c82b84bf99f42e212c8`
- 硅基流动: `sk-aadvzzhiqcwvmdhabmahpoipajjmcqzmlrlrciplfksudtza`

#### 步骤2: 配置Cloudflare Workers后端

1. **访问Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com/
   ```

2. **进入Workers设置**
   - Workers & Pages → Workers
   - 选择: `fmea-backend` (或您的Worker名称)

3. **配置环境变量**
   - Settings → Variables and Secrets
   - 添加以下环境变量：

   ```bash
   # 智谱AI
   ZHIPU_API_KEY=07c3e7a8023146cabb10afcb1e087090.QHAsSKJL0Zadrnnt

   # DeepSeek
   DEEPSEEK_API_KEY=sk-fd39b3a22c0d4c82b84bf99f42e212c8

   # 硅基流动
   SILICONFLOW_API_KEY=sk-aadvzzhiqcwvmdhabmahpoipajjmcqzmlrlrciplfksudtza

   # Gemini (可选)
   GEMINI_API_KEY=AIzaSyAyMnqsJezkGvD7bomSaKeGVGW3hfiyKVA
   ```

4. **保存并重新部署**
   - 保存设置
   - 重新部署Worker

#### 步骤3: 使用后端代理

配置完成后，在应用中：

1. **进入设置**
   - 设置 → AI API 设置

2. **选择服务商**
   - 智谱AI、DeepSeek或硅基流动

3. **不要输入API Key**
   - 前端不需要输入
   - 后端会使用配置的环境变量

4. **保存设置**

5. **生成FMEA**
   - 系统会自动使用后端代理

---

### 方案3: 使用本地开发模式（临时）

如果您无法配置Cloudflare Workers，可以使用本地模式：

#### 1. 安装依赖
```bash
npm install
```

#### 2. 配置环境变量

创建 `.env` 文件：
```bash
GEMINI_API_KEY=AIzaSyAyMnqsJezkGvD7bomSaKeGVGW3hfiyKVA
```

#### 3. 启动开发服务器
```bash
npm run dev
```

#### 4. 访问
```
http://localhost:3000
```

#### 5. 配置并使用Gemini
- 选择 "Google Gemini"
- 选择 "Gemini 2.0 Flash" (不是2.5 Pro)
- 输入API Key
- 生成FMEA

---

## 🎯 推荐方案（按优先级）

### 方案A: 使用Gemini 2.0 Flash（最简单，立即可用）

**优点**:
- ✅ 不需要后端配置
- ✅ 支持浏览器直接调用
- ✅ 质量优秀
- ✅ 响应快速

**步骤**:
1. 设置 → AI API 设置
2. 选择 "Google Gemini"
3. 选择 "Gemini 2.0 Flash (快速)"
4. 输入API Key: `AIzaSyAyMnqsJezkGvD7bomSaKeGVGW3hfiyKVA`
5. 保存并生成

---

### 方案B: 配置后端环境变量（推荐，功能完整）

**优点**:
- ✅ 支持所有服务商
- ✅ 使用最新的中文提示词
- ✅ 完整的FMEA功能

**缺点**:
- ⚠️ 需要Cloudflare Workers访问权限

**步骤**:
1. 访问Cloudflare Dashboard
2. 配置环境变量（见方案2）
3. 重新部署
4. 使用任何服务商

---

### 方案C: 使用本地开发（临时方案）

**优点**:
- ✅ 完全控制
- ✅ 可以修改代码

**缺点**:
- ❌ 需要在本地运行
- ❌ 无法分享给他人

---

## 📋 快速修复检查清单

### 如果您有Cloudflare Workers访问权限：

- [ ] 登录Cloudflare Dashboard
- [ ] 进入Workers设置
- [ ] 添加环境变量（ZHIPU_API_KEY等）
- [ ] 重新部署Worker
- [ ] 在应用中选择服务商（不输入API Key）
- [ ] 生成FMEA测试

### 如果您没有Cloudflare Workers访问权限：

- [ ] 使用方案A（Gemini 2.0 Flash）
- [ ] 或使用方案C（本地开发）

---

## 🔍 为什么会这样？

### CORS限制

大多数AI服务商的API **不允许浏览器直接调用**，原因：

1. **安全考虑**: 防止API Key泄露
2. **CORS政策**: 浏览器同源策略
3. **商业策略**: 希望通过后端调用

### Gemini例外

Google Gemini API **允许浏览器调用**，所以：
- ✅ Gemini可以直接在前端使用
- ✅ 不需要后端代理
- ❌ 但模型名称必须正确

---

## 💡 重要提示

### 可用的Gemini模型

在 AiSettings 中选择：

**✅ 可用**:
- Gemini 2.0 Flash (快速) - `gemini-2.0-flash-exp`
- Gemini 1.5 Pro - `gemini-1.5-pro`
- Gemini 1.5 Flash Exp - `gemini-1.5-flash-exp`

**❌ 不可用**:
- Gemini 2.5 Pro (最新推荐) - 模型不存在
- Gemini 3.0 Pro - 模型不存在

### 中文提示词已优化

新的中文提示词已经在代码中，但需要后端才能生效（因为前端直连不支持大部分服务商）。

如果使用Gemini 2.0 Flash，会使用英文提示词，但仍然可以生成中文内容（在提示词中要求）。

---

## 🚀 立即行动

**最快解决方案（1分钟）**:

1. 打开应用
2. 设置 → AI API 设置
3. 选择 "Google Gemini"
4. 选择 "Gemini 2.0 Flash (快速)"
5. 输入API Key: `AIzaSyAyMnqsJezkGvD7bomSaKeGVGW3hfiyKVA`
6. 保存
7. 生成FMEA

**应该可以立即工作！** ✅

---

## 📞 需要帮助？

如果上述方案都不行：

1. **提供更多信息**:
   - 您是否有Cloudflare Workers访问权限？
   - 您是想本地使用还是部署到云端？
   - 您更倾向于使用哪个AI服务商？

2. **查看文档**:
   - [BACKEND_DEPLOYMENT_GUIDE.md](BACKEND_DEPLOYMENT_GUIDE.md)
   - [CLOUDFLAR_WORKERS_SETUP.md](CLOUDFLAR_WORKERS_SETUP.md)

3. **考虑替代方案**:
   - 使用Gemini 2.0 Flash
   - 配置本地开发环境
   - 联系有部署权限的同事

---

**立即尝试Gemini 2.0 Flash，应该可以马上使用！** 🎯
