# 🧪 API连接测试指南

## 📋 快速测试步骤

### 方法1：使用测试工具（推荐）

1. **打开测试页面**
   ```
   在浏览器中打开: tests/api-connection-test.html
   ```

2. **输入 API Keys**
   - 智谱AI (GLM): `07c3e7a8023146cabb10afcb1e087090.QHAsSKJL0Zadrnnt`
   - 硅基流动: `sk-aadvzzhiqcwvmdhabmahpoipajjmcqzmlrlrciplfksudtza`
   - DeepSeek: `sk-fd39b3a22c0d4c82b84bf99f42e212c8`
   - Gemini: `AIzaSyAyMnqsJezkGvD7bomSaKeGVGW3hfiyKVA`

3. **点击测试按钮**
   - 逐个点击每个服务商的"测试"按钮
   - 或点击"测试所有配置的服务商"

4. **查看结果**
   - ✅ 绿色 = 成功
   - ❌ 红色 = 失败
   - 查看详细的错误信息

---

### 方法2：在应用中测试

1. **启动应用**
   ```bash
   npm run dev
   ```

2. **打开浏览器**
   ```
   http://localhost:5173
   ```

3. **进入设置**
   - 点击侧边栏 "设置"
   - 进入 "AI API 设置"

4. **配置服务商**

   #### 测试智谱AI (GLM)
   - 选择: "智谱AI (GLM)"
   - 输入API Key: `07c3e7a8023146cabb10afcb1e087090.QHAsSKJL0Zadrnnt`
   - 模型: `glm-4-plus` (自动填充)
   - 点击: "保存设置"
   - 输入简单描述如"测试手机"
   - 点击: "开始 DFMEA 分析"
   - 查看是否成功生成

   #### 测试硅基流动
   - 选择: "硅基流动"
   - 输入API Key: `sk-aadvzzhiqcwvmdhabmahpoipajjmcqzmlrlrciplfksudtza`
   - 模型: `Qwen/Qwen2.5-72B-Instruct` (自动填充)
   - 点击: "保存设置"
   - 输入简单描述如"测试手机"
   - 点击: "开始 DFMEA 分析"
   - 查看是否成功生成

   #### 测试DeepSeek
   - 选择: "DeepSeek"
   - 输入API Key: `sk-fd39b3a22c0d4c82b84bf99f42e212c8`
   - 模型: `deepseek-chat` (自动填充)
   - 点击: "保存设置"
   - 输入简单描述如"测试手机"
   - 点击: "开始 DFMEA 分析"
   - 查看是否成功生成

   #### 测试Gemini
   - 选择: "Google Gemini"
   - 输入API Key: `AIzaSyAyMnqsJezkGvD7bomSaKeGVGW3hfiyKVA`
   - 模型: `Gemini 2.5 Pro (最新推荐)`
   - 点击: "保存设置"
   - 输入简单描述如"测试手机"
   - 点击: "开始 DFMEA 分析"
   - 查看是否成功生成

---

## 🔍 可能遇到的问题

### 问题1: CORS错误

**错误信息**:
```
Access to fetch at '...' has been blocked by CORS policy
```

**原因**: 浏览器阻止跨域请求

**解决方案**:
1. 某些API服务商可能不支持浏览器直接调用
2. 尝试使用后端代理模式
3. 或使用CORS代理

---

### 问题2: API Key无效

**错误信息**:
```
API错误 (401): {"error":{"message":"Invalid API key"}}
```

**原因**: API Key错误或已过期

**解决方案**:
1. 检查API Key是否正确复制（没有多余空格）
2. 访问服务商官网重新生成API Key
3. 确认API Key已激活

---

### 问题3: 模型不存在

**错误信息**:
```
API错误 (404): {"error":{"message":"Model not found"}}
```

**原因**: 模型名称错误

**解决方案**:
1. 使用默认模型（自动填充）
2. 或访问服务商官网查看可用模型列表

---

### 问题4: 配额超限

**错误信息**:
```
API错误 (429): {"error":{"message":"Quota exceeded"}}
```

**原因**: API调用次数超过限制

**解决方案**:
1. 等待配额重置
2. 升级账户套餐
3. 使用其他服务商

---

## 🛠️ 调试步骤

### 1. 打开浏览器开发者工具

- **Chrome/Edge**: 按 `F12` 或 `Ctrl+Shift+I`
- **Firefox**: 按 `F12` 或 `Ctrl+Shift+I`

### 2. 切换到 Console 标签

查看错误日志

### 3. 切换到 Network 标签

查看API请求和响应：
- 找到API请求（通常以 `open.bigmodel.cn` 或 `api.siliconflow.cn` 开头）
- 点击查看详情
- 查看 Request Headers（确认API Key已发送）
- 查看 Response（查看错误信息）

---

## 📊 预期结果

### 成功的响应

**智谱AI (GLM)**:
```json
{
  "model": "glm-4-plus",
  "choices": [{
    "message": {
      "content": "你好！我是智谱AI的助手..."
    }
  }],
  "usage": {
    "total_tokens": 42
  }
}
```

**硅基流动**:
```json
{
  "model": "Qwen/Qwen2.5-72B-Instruct",
  "choices": [{
    "message": {
      "content": "你好！我是AI助手..."
    }
  }],
  "usage": {
    "total_tokens": 38
  }
}
```

**DeepSeek**:
```json
{
  "model": "deepseek-chat",
  "choices": [{
    "message": {
      "content": "你好！我是DeepSeek..."
    }
  }],
  "usage": {
    "total_tokens": 35
  }
}
```

**Gemini**:
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "你好！我是Gemini..."
      }]
    }
  }],
  "usageMetadata": {
    "totalTokenCount": 40
  }
}
```

---

## 💡 提示

1. **首次使用**: 建议先使用测试工具验证API Keys
2. **简单测试**: 使用简单描述如"测试手机"快速验证
3. **查看日志**: 应用中的Console会显示详细错误信息
4. **保存配置**: 成功后API Key会保存在浏览器localStorage
5. **定期更换**: 建议定期更换API Key以保护安全

---

## 📞 获取帮助

如果仍然无法使用，请提供：

1. **错误信息截图**
   - 浏览器Console中的错误
   - Network标签中的API响应
   - 应用中显示的错误提示

2. **配置信息**
   - 使用的是哪个服务商
   - 使用的模型名称
   - 浏览器类型和版本

3. **测试结果**
   - 测试工具中的结果
   - 或应用中的错误信息

这将帮助我们更快地定位和解决问题！

---

**祝测试顺利！** 🚀
