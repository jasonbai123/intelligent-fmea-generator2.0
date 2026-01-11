# 🔧 API Key 编码错误修复

## ❌ 当前错误

```
TypeError: Failed to execute 'append' on 'Headers':
String contains non ISO-8859-1 code point.
```

## 🔍 原因分析

这个错误说明：
1. **仍在使用旧版本缓存**：`index-tuk4XzLu.js`
2. **API Key 编码问题**：API Key 中包含了非标准字符

---

## ✅ 解决方案

### 第1步：强制清除所有缓存

**方法A：使用无痕模式（最可靠）**

1. **完全关闭所有 Chrome/Edge 窗口**

2. **按 Ctrl + Shift + N** 打开无痕窗口

3. **在无痕窗口中访问**：
   ```
   https://intelligent-fmea-generator2.pages.dev
   ```

**方法B：硬清除缓存**

1. 按 `Ctrl + Shift + Delete`
2. 选择以下选项：
   - ✅ Cookie 和其他网站数据
   - ✅ 缓存的图片和文件
   - ✅ 密码和其他登录数据
3. 时间范围：**"所有时间"**
4. 点击 **"清除数据"**
5. **重启浏览器**

---

### 第2步：正确复制 API Key

1. **访问 Google AI Studio**：
   ```
   https://aistudio.google.com/app/apikey
   ```

2. **创建新的 API Key**（如果没有）
   - 点击 "Create API Key"
   - 复制密钥

3. **正确复制 API Key**：
   - 点击 API Key 旁边的复制按钮
   - **不要手动选择和复制**
   - **不要包含任何空格**
   - **不要包含引号**

**正确的 API Key 格式**：
```
AIzaSyAbC1234567890xyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890
```

**错误的格式**：
```
❌ "AIzaSy..."  （有引号）
❌ AIzaSy...     （有前后空格）
❌ AIza Sy...     （中间有空格）
```

---

### 第3步：验证新版本加载

清除缓存后，按 **F12** 打开开发者工具：

1. 切换到 **Network** 标签
2. 刷新页面
3. 查找 **JS** 文件
4. **必须看到**：`index-D7_bGbWj.js` ✅
5. **不应该看到**：`index-tuk4XzLu.js` ❌

---

### 第4步：配置 AI 设置

1. 点击左侧 **"设置"** → **"AI API 设置"**

2. **选择服务商**：
   ```
   Google Gemini
   ```

3. **选择模型**（推荐）：
   ```
   gemini-1.5-pro
   ```

4. **输入 API Key**：
   - **直接粘贴**（Ctrl + V）
   - **不要手动输入**
   - 确保没有额外空格

5. 点击 **"保存设置"**

---

### 第5步：测试生成

**测试内容**：
```
电动汽车动力电池系统
```

点击 **"开始 DFMEA 分析"**

---

## 🔍 API Key 检查清单

在粘贴 API Key 之前，请检查：

- [ ] API Key 以 `AIza` 开头
- [ ] 长度约 39 个字符
- [ ] 只包含字母和数字
- [ ] 没有引号（" "）
- [ ] 没有前导空格
- [ ] 没有尾随空格
- [ ] 没有换行符
- [ ] 是通过复制按钮获取的

---

## 💡 如何正确复制 API Key

### ✅ 正确方法

1. 在 Google AI Studio 页面
2. 找到 API Key 旁边的 **复制图标** 📋
3. 点击复制图标
4. 在应用中按 `Ctrl + V` 粘贴

### ❌ 错误方法

1. ❌ 用鼠标手动选择文本
2. ❌ 可能选中了额外的空格或字符
3. ❌ 手动输入（容易出错）

---

## 🚨 如果仍然看到 index-tuk4XzLu.js

这说明缓存没有清除成功。请尝试：

### 方案1：完全重置浏览器

1. **关闭所有浏览器窗口**
2. **打开任务管理器**（Ctrl + Shift + Esc）
3. **结束所有 Chrome/Edge 进程**
4. **重新打开浏览器**
5. **使用无痕模式**（Ctrl + Shift + N）

### 方案2：使用不同的浏览器

如果使用 Chrome，尝试 Edge：
1. 打开 Edge 浏览器
2. 按 `Ctrl + Shift + N`（无痕模式）
3. 访问应用
4. 配置并测试

### 方案3：等待 DNS 缓存更新

有时 CDN 需要时间更新：
- 等待 5-10 分钟
- 然后重新测试

---

## 📋 完整操作流程

### 立即执行：

1. **关闭所有浏览器窗口** ❌

2. **打开无痕窗口**（Ctrl + Shift + N）🔒

3. **访问应用**：
   ```
   https://intelligent-fmea-generator2.pages.dev
   ```

4. **按 F12 打开开发者工具** 🛠️

5. **切换到 Network 标签** 📊

6. **刷新页面**（F5）🔄

7. **确认文件名**：
   - 看到 `index-D7_bGbWj.js` ✅ 继续
   - 看到 `index-tuk4XzLu.js` ❌ 返回步骤1

8. **生成新的 API Key**：
   ```
   https://aistudio.google.com/app/apikey
   ```

9. **配置 AI 设置**：
   - 服务商：Google Gemini
   - 模型：gemini-1.5-pro
   - API Key：粘贴新密钥

10. **测试生成** 🎯

---

## 🎯 成功标志

配置正确后，您应该看到：

- ✅ Console 显示：`Generating FMEA using provider: gemini`
- ✅ 没有 `index-tuk4XzLu.js` 错误
- ✅ 没有 API Key 编码错误
- ✅ 生成成功
- ✅ 全中文输出
- ✅ 所有字段完整

---

## 💬 如果仍然失败

请告诉我：

1. **F12 Network 标签中显示的文件名是什么？**
   - `index-D7_bGbWj.js` 或 `index-tuk4XzLu.js`？

2. **API Key 是如何复制的？**
   - 使用了复制按钮？
   - 还是手动选择？

3. **完整的错误信息**（从 Console 复制）

4. **截图**（如果可能）

---

**🔑 现在请：**
1. 完全关闭浏览器
2. 使用无痕模式
3. 验证文件名
4. 重新配置 API Key
5. 告诉我结果！
