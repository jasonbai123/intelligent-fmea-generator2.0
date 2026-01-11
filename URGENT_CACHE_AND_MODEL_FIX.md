# 🚨 紧急修复：缓存和模型名称问题

## ❌ 当前错误分析

您看到两个问题：

### 问题1：浏览器使用了旧版本缓存
```
index-tuk4XzLu.js  ← 这是旧版本！
```

### 问题2：模型名称不正确
```
models/gemini-2.5-pro-preview is not found
```

**原因**：
- 浏览器缓存了旧版本的JavaScript文件
- 您选择的模型名称 `gemini-2.5-pro-preview` 不存在
- 正确的模型名称应该是 `gemini-2.5-pro-preview-03625`

---

## ✅ 解决方案

### 第1步：强制清除浏览器缓存（必须！）

**方法1：使用无痕模式（最可靠）**

1. **关闭所有浏览器窗口**

2. **打开无痕窗口**
   ```
   Chrome/Edge: 按 Ctrl + Shift + N
   ```

3. **在无痕窗口中打开应用**
   ```
   https://intelligent-fmea-generator2.pages.dev
   ```

**方法2：强制清除缓存**

1. 按 `Ctrl + Shift + Delete`
2. 勾选以下选项：
   - ✅ 缓存的图片和文件
   - ✅ Cookie 和其他网站数据
3. 时间范围选择：**"全部时间"**
4. 点击 **"清除数据"**
5. 重启浏览器

---

### 第2步：选择正确的模型

清除缓存后，在 AI 设置中选择：

**推荐模型（按优先级）**：

1. **gemini-1.5-pro** ← 最稳定，推荐使用
   - 完全支持所有功能
   - 质量高，速度快
   - 免费额度充足

2. **gemini-2.5-pro-preview-03625** ← 最新版本
   - 最强大的模型
   - 质量最高
   - 速度稍慢

3. **gemini-1.5-flash** ← 最快
   - 速度最快
   - 质量稍低
   - 适合快速测试

**❌ 不要选择**：
- `gemini-2.5-pro-preview`（不存在的模型）
- `gemini-2.0-flash-exp`（已废弃）
- `gemini-2.0-flash`（已废弃）

---

### 第3步：配置新的 API Key

1. **访问 Google AI Studio 生成新的 API Key**
   ```
   https://aistudio.google.com/app/apikey
   ```

2. **创建新的 API Key**
   - 点击 "Create API Key"
   - 复制生成的 API Key

3. **在应用中配置**
   - 服务商：**Google Gemini**
   - 模型：**gemini-1.5-pro**（推荐）
   - API 密钥：**输入新生成的 API Key**
   - 点击 **"保存设置"**

---

### 第4步：验证新版本

按 F12 打开开发者工具，确认加载的是新版本：

**应该看到**：
```
index-D7_bGbWj.js  ← 这是新版本！
```

**不应该看到**：
```
index-tuk4XzLu.js  ← 这是旧版本
```

---

### 第5步：测试生成

使用以下测试内容：

```
电动汽车动力电池系统，包含：
- 锂离子电池包（400V，60kWh）
- 电池管理系统（BMS）：SOC监控、均衡管理、热管理
- 液冷热管理系统：温度控制、循环泵、散热器
- 高压安全系统：继电器、熔断器、预充电电路
- 充电接口：AC充电（7kW）、DC快充（60kW）
```

点击 **"开始 DFMEA 分析"**

---

## 🎯 预期结果

**成功标志**：
- ✅ 生成成功，无错误
- ✅ Console 显示：`Generating FMEA using provider: gemini`
- ✅ 内容为**全中文**
- ✅ 所有字段完整
- ✅ S/O/D/AP 评分正确
- ✅ 可以连续多次生成

---

## 💡 为什么会出现这些问题？

### 问题1：缓存问题

浏览器会缓存 JavaScript 文件以提高加载速度。但是：
- 旧版本的代码还存在缓存中
- 新版本的代码包含重要修复
- 不清除缓存会继续使用旧代码

**我们的解决方案**：
- 使用哈希文件名（`index-D7_bGbWj.js`）
- 每次构建生成新的哈希值
- 强制浏览器加载新文件

### 问题2：模型名称

Google Gemini 的模型名称经常更新：
- `gemini-2.0-flash` 已废弃
- `gemini-2.5-pro-preview` 不存在
- 正确的名称是 `gemini-2.5-pro-preview-03625`

**我们的建议**：
- 使用 `gemini-1.5-pro`（最稳定）
- 或 `gemini-2.5-pro-preview-03625`（最新）

---

## 🔄 如果仍然失败

### 检查清单

- [ ] 使用了**无痕模式**或清除了全部缓存
- [ ] 看到的新版本文件名：`index-D7_bGbWj.js`
- [ ] 选择了正确的模型：`gemini-1.5-pro` 或 `gemini-2.5-pro-preview-03625`
- [ ] 输入了**新生成的** API Key
- [ ] API Key 格式正确（以 `AIza` 开头）

### 常见错误

**错误1：仍然看到 index-tuk4XzLu.js**
- 缓存未清除
- 使用无痕模式

**错误2：Model not found**
- 检查模型名称拼写
- 使用推荐的模型

**错误3：API key leaked**
- 生成新的 API Key
- 不要复用旧的密钥

---

## 📝 关于 CDN Tailwind 警告

```
cdn.tailwindcss.com should not be used in production
```

这个警告不影响功能，但建议：
- 当前可以忽略（为了快速测试）
- 后续可以安装 Tailwind CSS 作为 PostCSS 插件
- 不影响 FMEA 生成功能

---

## 🚀 立即执行

**请按照以下顺序操作**：

1. ✅ **关闭所有浏览器窗口**
2. ✅ **打开无痕窗口**（Ctrl + Shift + N）
3. ✅ **访问应用**（在无痕窗口中）
4. ✅ **配置 AI 设置**
   - 服务商：Google Gemini
   - 模型：gemini-1.5-pro
   - API 密钥：新生成的密钥
5. ✅ **测试生成**
6. ✅ **告诉我结果**

---

**现在请执行上述步骤，然后告诉我是否成功！** 🎯
