# FMEA 生成器 - 完整部署指南

## 📋 目录
- [架构说明](#架构说明)
- [架构图](#架构图)
- [后端部署](#后端部署)
- [前端配置](#前端配置)
- [使用指南](#使用指南)
- [常见问题](#常见问题)

---

## 🎯 架构说明

### 核心原则：前后端API KEY完全独立

本方案实现了**前后端完全独立**的架构：

#### **前端API KEY**
- ✅ **仅用于：** Google Gemini 前端直接调用
- ✅ **配置位置：** 用户在前端"AI API设置"页面输入
- ✅ **存储位置：** 浏览器 localStorage
- ✅ **不会发送到：** 后端服务器
- ✅ **适用场景：** 个人用户、测试

#### **后端API KEY**
- ✅ **仅用于：** 后端代理调用所有AI服务商
- ✅ **配置位置：** 后端环境变量（`.env` 文件）
- ✅ **存储位置：** 服务器端
- ✅ **前端无法访问：** 前端看不到也改不了
- ✅ **适用场景：** 企业部署、团队使用

---

## 🏗️ 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  前端 (React)                                          │   │
│  │  - AI API设置页面                                      │   │
│  │  - DFMEA/PFMEA生成器                                   │   │
│  │  - localStorage存储前端KEY                             │   │
│  └──────────┬──────────────────────────────────┬─────────┘   │
│             │                                  │              │
│             │ (方式1: 前端直接调用)             │ (方式2: 后端代理) │
│             ▼                                  ▼              │
│  ┌──────────────────┐              ┌──────────────────────┐  │
│  │ Google Gemini    │              │  后端代理服务          │  │
│  │ API              │              │  (Node.js/Express)    │  │
│  │                  │              │  - 环境变量存储KEY    │  │
│  │ 前端KEY          │              │  - API代理            │  │
│  └──────────────────┘              │  - CORS解决          │  │
│                                    └──────┬───────────────┘  │
└──────────────────────────────────────────┼───────────────────┘
                                           │
                        ┌──────────────────┼──────────────────┐
                        │                  │                  │
                        ▼                  ▼                  ▼
               ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
               │ DeepSeek    │   │ 硅基流动     │   │ 智谱AI      │
               │ API         │   │ API         │   │ API         │
               │             │   │             │   │             │
               │ 后端KEY     │   │ 后端KEY     │   │ 后端KEY     │
               └─────────────┘   └─────────────┘   └─────────────┘
```

---

## 🚀 后端部署

### 方式A：本地开发部署

#### 1. 安装依赖
```bash
cd backend
npm install
```

#### 2. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入API密钥
```

**重要：** 后端的API密钥与前端完全独立，管理员在服务器端配置。

#### 3. 启动开发服务器
```bash
npm run dev
```

服务器将运行在：`http://localhost:3001`

---

### 方式B：Cloudflare Workers部署（推荐）

#### 1. 安装Wrangler CLI
```bash
npm install -g wrangler
```

#### 2. 登录Cloudflare
```bash
wrangler login
```

#### 3. 配置环境变量
在 `backend/wrangler.toml` 中配置：
```toml
name = "fmea-backend"
main = "src/index.js"
compatibility_date = "2024-01-01"

# 在 Cloudflare Dashboard 中配置 Secrets
# GEMINI_API_KEY, DEEPSEEK_API_KEY, etc.
```

#### 4. 部署
```bash
cd backend
wrangler deploy
```

#### 5. 在Cloudflare Dashboard配置密钥
1. 访问 https://dash.cloudflare.com
2. 进入 Workers & Pages
3. 选择你的 Worker
4. Settings → Variables → Secrets
5. 添加密钥：
   - `GEMINI_API_KEY`
   - `DEEPSEEK_API_KEY`
   - `SILICONFLOW_API_KEY`
   - 等等...

---

### 方式C：Docker部署

#### 1. 创建Dockerfile
在 `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### 2. 构建并运行
```bash
cd backend
docker build -t fmea-backend .

docker run -p 3001:3001 \
  -e GEMINI_API_KEY=your_key \
  -e DEEPSEEK_API_KEY=your_key \
  -e SILICONFLOW_API_KEY=your_key \
  fmea-backend
```

---

## ⚙️ 前端配置

### 1. 配置后端API地址

编辑前端 `.env` 文件：
```env
# 后端API地址
VITE_API_BASE_URL=http://localhost:3001

# 或者部署后的地址
# VITE_API_BASE_URL=https://fmea-backend.your-domain.com
```

### 2. 启动前端
```bash
npm install
npm run dev
```

前端将运行在：`http://localhost:3000`

---

## 📖 使用指南

### 场景1：个人用户（仅使用Gemini前端直接调用）

#### 1. 获取Gemini API密钥
- 访问：https://aistudio.google.com/app/apikey
- 创建新的API密钥

#### 2. 在前端配置
- 打开应用
- 点击侧边栏 "⚙️ AI API设置"
- 选择 "Google Gemini"
- 在 "API 密钥" 输入框中粘贴密钥
- 点击 "保存设置"

#### 3. 生成FMEA报告
- 返回DFMEA/PFMEA页面
- 输入产品描述
- 点击 "开始生成分析报告"

**特点：**
- ✅ 无需后端
- ✅ 简单快速
- ❌ 仅支持Gemini

---

### 场景2：企业部署（使用后端代理）

#### 管理员配置后端：

1. **编辑后端 `.env` 文件**
```env
# Google Gemini API Key
GEMINI_API_KEY=AIzaSy...

# DeepSeek API Key（推荐 - 性价比高）
DEEPSEEK_API_KEY=sk-...

# 硅基流动 API Key（便宜）
SILICONFLOW_API_KEY=sk-...

# 智谱AI API Key
GLM_API_KEY=...

# 其他服务商...
```

2. **启动后端服务**
```bash
cd backend
npm run dev
```

#### 用户使用：

1. 打开应用
2. 点击侧边栏 "⚙️ AI API设置"
3. 选择任意AI服务商（DeepSeek、硅基流动等）
4. 点击 "保存设置"
5. **无需输入API密钥**（使用后端配置的密钥）

**特点：**
- ✅ 支持所有AI服务商
- ✅ 用户无需输入密钥
- ✅ 统一管理，便于控制成本
- ❌ 需要部署后端

---

## ❓ 常见问题

### Q1: 为什么前端和后端的API KEY要分开？

**A:**
- **安全性：** 前端KEY存储在用户浏览器，后端KEY存储在服务器
- **灵活性：** 个人用户可以用自己的Gemini密钥，企业可以用后端统一管理
- **隐私性：** 用户输入的密钥不会发送到服务器
- **可控性：** 管理员可以控制后端使用的服务商和成本

### Q2: 前端输入的API KEY会发送到后端吗？

**A:** 不会。
- 前端输入的API KEY仅用于Gemini直接调用
- 不会发送到后端服务器
- 不会存储在后端数据库
- 完全由用户自己控制

### Q3: 后端必须配置API密钥吗？

**A:**
- 如果仅使用Gemini前端直接调用 → 不需要后端
- 如果要使用其他AI服务商 → 必须在后端配置

### Q4: 如何切换不同的AI服务商？

**A:**
1. 在 "AI API设置" 页面选择不同的服务商
2. 如果是Gemini → 输入您的密钥
3. 如果是其他服务商 → 确保后端已配置对应密钥
4. 保存设置

### Q5: 支持哪些AI服务商？

**A:**
- ✅ **Google Gemini** - 支持前端直接调用和后端代理
- ✅ **DeepSeek** - 通过后端代理
- ✅ **硅基流动** - 通过后端代理
- ✅ **智谱AI (GLM)** - 通过后端代理
- ✅ **豆包（火山引擎）** - 通过后端代理
- ✅ **Claude** - 通过后端代理

### Q6: 企业如何管理API成本？

**A:** 使用后端统一管理：
1. 管理员在后端配置API密钥
2. 用户无需输入密钥
3. 所有请求通过后端
4. 可以添加使用限额和监控
5. 统一结算，便于控制成本

### Q7: 如何查看后端是否正常运行？

**A:** 访问健康检查端点：
```bash
curl http://localhost:3001/api/health
```

正常返回：
```json
{
  "status": "ok",
  "timestamp": "2024-01-09T12:00:00.000Z"
}
```

---

## 🔒 安全建议

### 个人用户
1. ✅ API密钥存储在浏览器，相对安全
2. ✅ 不要在公共电脑上保存密钥
3. ✅ 定期更换API密钥

### 企业部署
1. ✅ 使用HTTPS协议
2. ✅ 配置CORS白名单
3. ✅ 启用速率限制
4. ✅ 定期轮换API密钥
5. ✅ 添加使用监控和告警
6. ✅ 设置使用限额
7. ✅ 定期审查API账单

### API密钥管理
- ❌ 不要在代码中硬编码密钥
- ✅ 使用环境变量或密钥管理服务
- ✅ 定期审查密钥使用情况
- ✅ 禁用不再使用的密钥

---

## 📊 部署方案对比

| 部署方式 | 难度 | 成本 | 适用场景 | 推荐度 |
|---------|------|------|---------|--------|
| **前端Gemini直接调用** | ⭐ 简单 | 免费额度大 | 个人、测试 | ⭐⭐⭐⭐⭐ |
| **本地后端开发** | ⭐⭐ 中等 | API成本 | 小团队 | ⭐⭐⭐⭐ |
| **Cloudflare Workers** | ⭐⭐⭐ 中等 | API + Workers费用 | 中小企业 | ⭐⭐⭐⭐⭐ |
| **Docker部署** | ⭐⭐⭐ 中等 | 服务器 + API | 自建服务器 | ⭐⭐⭐ |
| **Vercel部署** | ⭐⭐ 简单 | API + Vercel费用 | 快速上线 | ⭐⭐⭐⭐ |

---

## 📞 技术支持

- **设计联系方式 / 微信：** jasonbai 13510420462
- **版权归属：** Jasonbai 老师

---

## 📝 部署检查清单

### 后端部署
- [ ] 安装依赖
- [ ] 配置环境变量（API密钥）
- [ ] 测试健康检查端点
- [ ] 配置CORS（如需要）
- [ ] 部署到服务器
- [ ] 配置域名和SSL证书

### 前端配置
- [ ] 配置后端API地址
- [ ] 测试连接到后端
- [ ] 测试AI服务商配置
- [ ] 测试FMEA生成功能
- [ ] 部署到生产环境

### 功能测试
- [ ] Gemini前端直接调用
- [ ] 后端代理调用（DeepSeek等）
- [ ] DFMEA生成
- [ ] PFMEA生成
- [ ] Excel导出
- [ ] 用户认证（如启用）
- [ ] 项目协作功能（如启用）

---

**祝部署顺利！🎉**
