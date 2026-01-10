# 🔑 Cloudflare Workers 后端 API 密钥配置指南

## 问题描述

错误提示：
```
智谱AI (GLM) API密钥未配置。请联系管理员在后端环境变量中配置。
```

## 解决方案

### 方案A：通过 Cloudflare Dashboard 配置（推荐）

#### 步骤1：登录 Cloudflare
1. 访问 https://dash.cloudflare.com/
2. 登录您的账号

#### 步骤2：找到您的 Worker
1. 点击左侧菜单 "Workers & Pages"
2. 在 "Workers" 标签下找到 `fmea-backend`（或您的 Worker 名称）
3. 点击进入 Worker 详情页

#### 步骤3：配置环境变量
1. 点击 "Settings" (设置) 标签
2. 找到 "Variables and Secrets" (变量和密钥) 部分
3. 点击 "Add variable" (添加变量)

#### 步骤4：添加以下环境变量

**智谱 AI (GLM)**:
```
变量名: ZHIPU_API_KEY
值: your_zhipu_api_key_here
```

**硅基流动**:
```
变量名: SILICONFLOW_API_KEY
值: your_siliconflow_api_key_here
```

**DeepSeek** (可选):
```
变量名: DEEPSEEK_API_KEY
值: your_deepseek_api_key_here
```

**火山引擎/豆包** (可选):
```
变量名: VOLCENGINE_API_KEY
值: your_volcengine_api_key_here
```

**Claude** (可选):
```
变量名: ANTHROPIC_API_KEY
值: your_anthropic_api_key_here
```

**Gemini** (可选):
```
变量名: GEMINI_API_KEY
值: your_gemini_api_key_here
```

#### 步骤5：保存并重新部署
1. 点击 "Save and deploy" (保存并部署)
2. 等待部署完成（通常几秒钟）

---

### 方案B：通过 Wrangler CLI 配置

#### 1. 安装 Wrangler CLI（如果未安装）
```bash
npm install -g wrangler
```

#### 2. 登录 Cloudflare
```bash
wrangler login
```

#### 3. 配置环境变量
创建或编辑 `wrangler.toml` 文件：

```toml
name = "fmea-backend"
main = "backend/src/index.js"
compatibility_date = "2024-01-01"

[vars]
# 环境变量（明文，用于测试环境）
ZHIPU_API_KEY = "your_zhipu_api_key_here"
SILICONFLOW_API_KEY = "your_siliconflow_api_key_here"
DEEPSEEK_API_KEY = "your_deepseek_api_key_here"
VOLCENGINE_API_KEY = "your_volcengine_api_key_here"
```

#### 4. 部署
```bash
wrangler deploy backend/src/index.js
```

---

### 方案C：使用 Secrets（生产环境推荐）

对于生产环境，建议使用加密的 Secrets 而非普通环境变量：

#### 通过 Dashboard
1. 进入 Worker Settings → "Variables and Secrets"
2. 点击 "Add secret" 而非 "Add variable"
3. Secrets 是加密的，且在日志中会自动隐藏

#### 通过 CLI
```bash
# 设置加密密钥
wrangler secret put ZHIPU_API_KEY
# 粘贴您的 API Key

wrangler secret put SILICONFLOW_API_KEY
# 粘贴您的 API Key
```

---

## 获取 API Keys

### 智谱 AI (GLM)
1. 访问: https://open.bigmodel.cn/
2. 注册/登录
3. 进入 "API Key" 页面
4. 创建新的 API Key
5. 复制 API Key

**支持的模型**:
- `glm-4-plus` (最新最强)
- `glm-4-0520`
- `glm-4`
- `glm-3-turbo`

### 硅基流动
1. 访问: https://siliconflow.cn/
2. 注册/登录
3. 进入 API 密钥管理
4. 创建新的 API Key
5. 复制 API Key

**支持的模型**:
- `Qwen/Qwen2.5-72B-Instruct` (通义千问)
- `deepseek-ai/DeepSeek-V2.5`
- `THUDM/glm-4-9b-chat`

### DeepSeek
1. 访问: https://platform.deepseek.com/
2. 注册/登录
3. 创建 API Key
4. 复制 API Key

### 火山引擎 (豆包)
1. 访问: https://console.volcengine.com/ark
2. 注册/登录
3. 创建 API Key

---

## 验证配置

配置完成后，测试后端 API：

### 测试智谱 AI
```bash
curl -X POST https://fmea-backend.baipj123.workers.dev/api/ai/zhipu/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "你好"}
    ],
    "model": "glm-4-plus",
    "temperature": 0.7
  }'
```

**预期成功响应**:
```json
{
  "content": "你好！我是智谱AI的助手...",
  "usage": {...},
  "model": "glm-4-plus"
}
```

**预期错误（如果未配置）**:
```json
{
  "message": "智谱AI (GLM) API密钥未配置。请联系管理员在后端环境变量中配置。"
}
```

---

## 常见问题

### Q1: 配置后仍然提示未配置
**原因**: 缓存或部署未生效
**解决**:
1. 等待 1-2 分钟让部署生效
2. 刷新浏览器页面
3. 检查环境变量名称是否正确（区分大小写）

### Q2: 不知道 Cloudflare 账号
**原因**: 可能不是您部署的
**解决**:
- 联系部署者配置
- 或使用方案2（前端直连模式，仅支持 Gemini）

### Q3: 没有权限访问 Cloudflare Dashboard
**原因**: 需要管理员权限
**解决**: 联系项目管理员或部署者

### Q4: API Key 格式错误
**原因**: 复制时可能包含多余空格或换行符
**解决**:
1. 重新复制 API Key
2. 确保没有前后空格
3. 确保没有特殊字符

---

## 方案2：使用前端直连模式（仅 Gemini）

如果无法配置后端，可以临时使用 Gemini 的前端直连模式：

1. 打开应用
2. 进入"设置" → "AI API 设置"
3. 选择 "Google Gemini"
4. **输入您的 Gemini API Key**
5. 选择模型（推荐 "Gemini 2.5 Pro"）
6. 点击"保存设置"

这种方式：
- ✅ 不需要后端配置
- ✅ API Key 存储在浏览器本地
- ❌ 仅支持 Gemini
- ❌ 需要自己获取 Gemini API Key

---

## 推荐配置

### 开发/测试环境
使用普通环境变量（wrangler.toml 或 Dashboard Variables）

### 生产环境
使用加密 Secrets（wrangler secret 或 Dashboard Secrets）

---

**配置完成后，等待 1-2 分钟让部署生效，然后重新测试功能。**

🎉 **配置成功后，您就可以正常使用所有 AI 服务商了！**
