# 🔧 本地测试指南

## ❌ 问题

Cloudflare Pages 网站无法访问（连接被重置）。

---

## ✅ 解决方案：本地测试

### 方法1：使用 Python 本地服务器

1. **打开命令行**（在项目目录）

2. **运行本地服务器**：
   ```bash
   python -m http.server 8080 --directory docs
   ```

3. **打开浏览器访问**：
   ```
   http://localhost:8080
   ```

4. **测试功能**：
   - 配置 Gemini API Key
   - 测试 FMEA 生成

---

### 方法2：使用 Vite 开发服务器

1. **运行开发服务器**：
   ```bash
   npm run dev
   ```

2. **打开浏览器访问**：
   ```
   http://localhost:3000
   ```

3. **测试功能**

---

### 方法3：等待 Cloudflare 恢复

可能的原因：
- Cloudflare CDN 正在更新
- DNS 传播延迟
- 网络连接问题

**建议**：
1. 等待 5-10 分钟
2. 然后重试：https://intelligent-fmea-generator2.pages.dev
3. 或使用临时 URL：https://ce96a290.intelligent-fmea-generator2.pages.dev

---

## 🎯 现在请执行

### 推荐方案：本地测试

1. **打开命令行**
   ```
   Win + R
   输入: cmd
   回车
   ```

2. **进入项目目录**：
   ```bash
   cd C:\Users\abc05\Downloads\intelligent-fmea-generator
   ```

3. **启动本地服务器**：
   ```bash
   python -m http.server 8080 --directory docs
   ```

4. **打开浏览器**：
   ```
   http://localhost:8080
   ```

5. **配置 Gemini API Key**
   - 点击设置 → AI API 设置
   - 服务商：Google Gemini
   - 模型：gemini-1.5-pro
   - API Key：输入您的密钥
   - 保存

6. **测试生成**
   - 输入：电动汽车动力电池系统
   - 点击：开始 DFMEA 分析

---

## ✅ 成功后

如果本地测试成功，说明：
- ✅ 代码构建正确
- ✅ 功能正常
- ❌ Cloudflare Pages 网络问题

**下一步**：
1. 使用本地版本继续测试
2. 或等待 Cloudflare 恢复
3. 我可以帮您部署到其他平台

---

## 📢 请告诉我

1. 本地测试是否成功？
2. 如果成功，我可以帮您部署到其他平台
3. 如果失败，请告诉我错误信息
