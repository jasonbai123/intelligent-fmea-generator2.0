# 🚀 快速开始指南

## 前后端API KEY独立架构 - 5分钟快速部署

---

## 📦 前提条件

- Node.js 18+ 已安装
- npm 或 yarn 包管理器

---

## ⚡ 两种使用方式

### 方式1：个人用户（仅前端，无需后端）

✅ **适合：** 个人用户、测试、快速体验
✅ **AI服务：** 仅支持 Google Gemini
✅ **后端：** 不需要

### 方式2：企业部署（前后端）

✅ **适合：** 企业、团队、生产环境
✅ **AI服务：** 支持所有AI服务商（DeepSeek、硅基流动等）
✅ **后端：** 需要部署

---

## 🎯 方式1：个人用户（推荐新手）

### 步骤1：获取 Gemini API密钥

1. 访问：https://aistudio.google.com/app/apikey
2. 登录Google账号
3. 点击 "Create API key"
4. 复制生成的密钥（格式：`AIzaSy...`）

### 步骤2：启动前端

```bash
# 1. 确保在项目根目录
cd intelligent-fmea-generator

# 2. 安装依赖（如果还没安装）
npm install

# 3. 启动前端
npm run dev
```

✅ 前端运行在：`http://localhost:3000`

### 步骤3：配置API密钥

1. 打开浏览器访问：`http://localhost:3000`
2. 点击侧边栏 **"⚙️ AI API设置"**
3. 选择 **"Google Gemini"**
4. 在 **"API 密钥"** 输入框中粘贴您的密钥
5. 点击 **"保存设置"**

### 步骤4：开始使用

1. 点击左侧菜单 **"DFMEA"** 或 **"PFMEA"**
2. 输入产品描述或上传文件
3. 点击 **"开始生成分析报告"**
4. 等待AI生成FMEA表格
5. 可以导出Excel或PDF

---

## 🏢 方式2：企业部署

### 步骤1：启动后端

```bash
# 1. 进入后端目录
cd backend

# 2. 安装依赖
npm install

# 3. 复制环境变量模板
cp .env.example .env

# 4. 编辑 .env 文件，配置API密钥
```

**配置示例（`backend/.env`）：**
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# DeepSeek API Key（推荐 - 性价比高）
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 硅基流动 API Key（便宜）
SILICONFLOW_API_KEY=your_siliconflow_api_key_here

# 智谱AI API Key
GLM_API_KEY=your_glm_api_key_here
```

**获取API密钥：**
- **Gemini:** https://aistudio.google.com/app/apikey
- **DeepSeek:** https://platform.deepseek.com/user_center/api_keys
- **硅基流动:** https://cloud.siliconflow.cn/account/ak
- **智谱AI:** https://open.bigmodel.cn/usercenter/apikeys

```bash
# 5. 启动后端服务
npm run dev
```

✅ 后端运行在：`http://localhost:3001`

### 步骤2：启动前端

**打开新的终端窗口：**

```bash
# 1. 确保在项目根目录
cd intelligent-fmea-generator

# 2. 安装依赖（如果还没安装）
npm install

# 3. 启动前端
npm run dev
```

✅ 前端运行在：`http://localhost:3000`

### 步骤3：配置AI服务

1. 打开浏览器访问：`http://localhost:3000`
2. 点击侧边栏 **"⚙️ AI API设置"**
3. 选择任意AI服务商（DeepSeek、硅基流动等）
4. 点击 **"保存设置"**
5. 无需输入API密钥（使用后端配置的密钥）

### 步骤4：开始使用

1. 点击左侧菜单 **"DFMEA"** 或 **"PFMEA"**
2. 输入产品描述或上传文件
3. 点击 **"开始生成分析报告"**
4. 等待AI生成FMEA表格

---

## 🎯 两种方式对比

| 特性 | 方式1：个人用户 | 方式2：企业部署 |
|------|----------------|----------------|
| **前端API KEY** | ✅ 需要输入Gemini密钥 | ❌ 不需要输入 |
| **后端API KEY** | ❌ 不需要 | ✅ 需要管理员配置 |
| **支持的AI服务** | 仅 Gemini | 所有服务商 |
| **后端服务** | ❌ 无需启动 | ✅ 需要启动 |
| **配置难度** | ⭐ 简单 | ⭐⭐ 中等 |
| **适用场景** | 个人、测试 | 企业、生产 |

---

## 🔧 常用命令

### 前端
```bash
npm run dev      # 开发模式 (localhost:3000)
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
```

### 后端
```bash
cd backend
npm run dev      # 开发模式 (localhost:3001)
npm run build    # 构建
npm start        # 生产模式
```

---

## ❓ 常见问题

### Q1: 我应该选择哪种方式？

**A:**
- **个人使用/测试** → 选择方式1（仅需前端，配置Gemini）
- **企业/团队使用** → 选择方式2（启动后端，支持多种AI服务）

### Q2: 方式1只能用Gemini吗？

**A:** 是的。方式1是前端直接调用，只有Gemini支持从浏览器直接调用。
其他AI服务商（DeepSeek、硅基流动等）需要后端代理（方式2）。

### Q3: 后端启动失败怎么办？

```bash
# 检查端口是否被占用
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# 更改端口
# 编辑 backend/.env
PORT=3002
```

### Q4: 前端无法连接后端？

```bash
# 检查后端是否运行
curl http://localhost:3001/api/health

# 检查前端配置
# 确保 .env 文件中有：
VITE_API_BASE_URL=http://localhost:3001
```

### Q5: Gemini前端直接调用安全吗？

**A:** 安全。
- API密钥存储在您自己的浏览器
- 仅用于直接调用Google API
- 不会发送到其他服务器
- 您完全控制自己的密钥

---

## 💡 推荐组合

### 个人/学习
- **AI服务：** Gemini（前端直接调用）
- **成本：** 免费额度很大
- **配置：** 5分钟搞定

### 小团队
- **AI服务：** DeepSeek（后端代理）
- **成本：** 非常便宜（¥1/百万tokens）
- **配置：** 需要部署后端

### 大企业
- **AI服务：** 多个服务商（备用）
- **成本：** 统一结算，可控
- **配置：** 完整部署 + 监控

---

## 📚 更多文档

- **完整架构说明：** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **详细部署指南：** [BACKEND_DEPLOYMENT_GUIDE.md](./BACKEND_DEPLOYMENT_GUIDE.md)
- **原项目README：** [README.md](./README.md)

---

## 🎉 开始使用

**准备好了吗？**

**个人用户：** 获取Gemini密钥 → 启动前端 → 配置密钥 → 开始生成 🚀

**企业用户：** 启动后端 → 配置后端密钥 → 启动前端 → 选择AI服务 → 开始生成 🚀

---

**技术支持：** jasonbai 13510420462
**版权归属：** Jasonbai 老师
