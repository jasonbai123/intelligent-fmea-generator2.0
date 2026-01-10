# 🏗️ 前后端API KEY独立架构说明

## 📐 架构设计原则

### 核心思想
**前端和后端的API KEY完全独立，互不关联，互不干扰。**

---

## 🔑 API KEY 分类

### 1. 前端API KEY
- **用途：** 仅用于 **Google Gemini** 前端直接调用
- **配置位置：** 前端 "AI API设置" 页面
- **存储位置：** 浏览器 localStorage
- **适用服务商：** Google Gemini（仅此一个）
- **安全性：** 密钥存储在用户浏览器，不会发送到服务器

### 2. 后端API KEY
- **用途：** 用于 **所有AI服务商** 的后端代理调用
- **配置位置：** 后端环境变量（`.env` 文件或 Cloudflare Secrets）
- **存储位置：** 服务器端环境变量
- **适用服务商：**
  - DeepSeek（深度求索）
  - 硅基流动 (SiliconFlow)
  - 智谱AI (GLM)
  - 豆包（火山引擎）
  - Anthropic Claude
  - Google Gemini（可选，也支持后端代理）
- **安全性：** 密钥存储在服务器，前端无法访问

---

## 🔄 工作流程

### 方式1：Gemini 前端直接调用（推荐新手）

```
┌─────────────┐         ┌─────────────┐
│   前端      │         │Google Gemini│
│             │────────▶│    API      │
│ 输入API KEY │  直接   │             │
└─────────────┘  调用   └─────────────┘
     │
     ▼
浏览器 localStorage
```

**步骤：**
1. 用户在 "AI API设置" 中输入 Gemini API KEY
2. 前端直接调用 Google Gemini API
3. 无需后端服务支持

**优点：**
- ✅ 简单快速，无需配置后端
- ✅ API密钥由用户自己管理
- ✅ 隐私性好，密钥不上传到服务器

**缺点：**
- ❌ 仅支持 Gemini
- ❌ 每个用户都需要自己的API密钥

---

### 方式2：后端代理调用（推荐企业）

```
┌─────────┐                ┌─────────┐         ┌─────────────┐
│  前端   │                │  后端   │         │ AI服务商    │
│         │───────────────▶│         │────────▶│ (DeepSeek,  │
│ 不需要   │   请求转发     │环境变量  │  调用   │ 硅基流动等) │
│ API KEY │                │API KEY  │         └─────────────┘
└─────────┘                └─────────┘
                                      ▲
                                      │
                                   管理员配置
```

**步骤：**
1. 管理员在后端 `.env` 文件中配置各服务商的API密钥
2. 用户在前端选择任意AI服务商
3. 前端将请求发送到后端
4. 后端使用环境变量中的密钥调用AI服务
5. 后端将结果返回给前端

**优点：**
- ✅ 支持所有主流AI服务商
- ✅ 用户无需配置API密钥
- ✅ 便于企业统一管理
- ✅ 可以控制API成本

**缺点：**
- ❌ 需要部署后端服务
- ❌ 管理员需要维护API密钥

---

## 📊 两种方式对比

| 特性 | Gemini 前端直接调用 | 后端代理调用 |
|------|-------------------|-------------|
| **前端API KEY** | ✅ 需要输入 | ❌ 不需要 |
| **后端API KEY** | ❌ 不需要 | ✅ 需要配置 |
| **支持的服务商** | 仅 Gemini | 所有服务商 |
| **后端依赖** | ❌ 无需后端 | ✅ 需要后端 |
| **适用场景** | 个人用户、测试 | 企业内部、生产 |
| **API成本** | 用户自己承担 | 统一结算 |
| **配置难度** | ⭐ 简单 | ⭐⭐⭐ 中等 |

---

## 🎯 使用指南

### 场景1：个人用户（仅使用Gemini）

**1. 获取 Gemini API密钥**
- 访问：https://aistudio.google.com/app/apikey
- 创建新的API密钥

**2. 在前端配置**
- 打开应用
- 点击侧边栏 "⚙️ AI API设置"
- 选择 "Google Gemini"
- 粘贴API密钥
- 点击 "保存设置"

**3. 开始使用**
- 返回DFMEA/PFMEA页面
- 输入产品描述
- 点击 "开始生成分析报告"

---

### 场景2：企业部署（使用多种AI服务）

**管理员配置：**

**1. 配置后端环境变量**
```bash
cd backend
cp .env.example .env
```

**2. 编辑 `.env` 文件**
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# DeepSeek API Key
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 硅基流动 API Key
SILICONFLOW_API_KEY=your_siliconflow_api_key_here

# 智谱AI API Key
GLM_API_KEY=your_glm_api_key_here

# 豆包 API Key
VOLCENGINE_API_KEY=your_volcengine_api_key_here

# Claude API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**3. 启动后端服务**
```bash
npm run dev
```

**用户使用：**

**1. 打开应用**
- 前端会自动连接到后端

**2. 选择AI服务商**
- 点击侧边栏 "⚙️ AI API设置"
- 选择任意服务商（DeepSeek、硅基流动等）
- 点击 "保存设置"

**3. 开始使用**
- 无需输入API密钥
- 系统会自动使用后端配置的密钥

---

## 🔐 安全性说明

### 前端API KEY安全
- ✅ 存储在浏览器 localStorage
- ✅ 仅用于直接调用 Gemini API
- ✅ 不会发送到后端服务器
- ✅ 用户完全控制自己的密钥
- ⚠️ 每个用户需要自己获取密钥

### 后端API KEY安全
- ✅ 存储在服务器环境变量
- ✅ 前端无法访问
- ✅ 统一管理，便于控制
- ✅ 可以定期轮换密钥
- ⚠️ 需要管理员妥善保管 `.env` 文件

---

## ⚙️ 配置优先级

### Google Gemini 两种调用方式

当同时配置前端和后端Gemini密钥时：

1. **如果前端输入了API密钥** → 使用前端直接调用
2. **如果前端未输入API密钥** → 使用后端代理调用（如果后端配置了）

这样的设计提供了最大的灵活性：
- 个人用户可以输入自己的密钥
- 企业用户可以直接使用后端配置的密钥

---

## 📝 配置文件示例

### 后端 `.env` 文件
```env
# ========================================
# FMEA 后端服务 - AI服务配置
# ========================================

# Google Gemini（推荐用于后端代理）
GEMINI_API_KEY=AIzaSy...

# DeepSeek（性价比高）
DEEPSEEK_API_KEY=sk-...

# 硅基流动（便宜，支持多模型）
SILICONFLOW_API_KEY=sk-...

# 智谱AI（中文优化）
GLM_API_KEY=...

# 其他服务商...
```

### 前端 localStorage
```json
{
  "fmea_ai_settings": {
    "provider": "gemini",
    "modelName": "gemini-2.0-flash",
    "apiKey": "AIzaSy...",  // 用户输入的密钥
    "baseUrl": ""
  }
}
```

---

## 🚀 部署建议

### 个人用户/小型团队
1. 仅使用 Gemini 前端直接调用
2. 无需部署后端
3. 每个用户自己获取 Gemini API密钥

### 中型企业
1. 部署后端服务
2. 配置 1-2 个AI服务商（如 DeepSeek + Gemini）
3. 用户无需配置密钥

### 大型企业
1. 部署完整的后端服务
2. 配置多个AI服务商作为备选
3. 实施API密钥轮换策略
4. 添加使用配额和监控

---

## 📞 技术支持

- **设计联系方式 / 微信：** jasonbai 13510420462
- **版权归属：** Jasonbai 老师

---

**总结：** 前后端API KEY完全独立的设计提供了最大的灵活性和安全性，满足从个人用户到大型企业的不同需求。
