# 🔧 浏览器缓存清除指南（紧急）

**问题**: 浏览器仍在使用旧版本代码 `index-tuk4XzLu.js`，但新版本是 `index-BF6hUh9X.js`

**错误信息**:
```
models/gemini-1.5-pro is not found
```

---

## ✅ 解决方案（按优先级）

### 方法1：强制刷新（最简单）

**Chrome/Edge**:
```
按住 Ctrl + Shift
然后按 R 键
或
按 Ctrl + F5
```

**Firefox**:
```
按住 Ctrl + Shift
然后按 R 键
或
按 Ctrl + F5
```

**Mac用户**:
```
Command + Shift + R
```

---

### 方法2：清除所有缓存（推荐）

**Chrome/Edge**:
1. 按 `Ctrl + Shift + Delete`
2. 选择"缓存的图片和文件"
3. 时间范围选"全部时间"
4. 点击"清除数据"
5. 关闭浏览器
6. 重新打开
7. 访问 https://intelligent-fmea-generator2.pages.dev

**Firefox**:
1. 按 `Ctrl + Shift + Delete`
2. 勾选"缓存"
3. 时间范围选"全部"
4. 点击"立即清除"
5. 重启浏览器

---

### 方法3：无痕模式（最可靠）

**Chrome/Edge**:
```
按 Ctrl + Shift + N
```

**Firefox**:
```
按 Ctrl + Shift + P
```

然后在无痕窗口中访问:
```
https://intelligent-fmea-generator2.pages.dev
```

**优点**: 无痕模式完全绕过缓存，100%使用最新代码

---

### 方法4：手动清除站点数据

**Chrome/Edge**:
1. 点击地址栏左侧的🔒图标
2. 点击"网站设置"
3. 找到"清除数据"
4. 点击"清除站点数据"
5. 刷新页面

---

## 🔍 如何确认已清除缓存

### 步骤1：打开开发者工具
按 `F12` 键

### 步骤2：切换到 Network 标签

### 步骤3：刷新页面
按 `F5` 或点击刷新按钮

### 步骤4：查看加载的文件
在 Network 标签中，找到 JavaScript 文件：

**✅ 正确（新版本）**:
```
index-BF6hUh9X.js
```

**❌ 错误（旧版本）**:
```
index-tuk4XzLu.js
index-odenx1PR.js
```

### 步骤5：确认文件大小
新版本文件大小应该约为 **308 KB**

---

## 🐛 如果仍然不行

### 终极方案：使用不同的浏览器

如果Chrome仍然缓存，尝试：
1. **Microsoft Edge**
2. **Firefox**
3. **Opera**
4. **Brave**

或者在Chrome中：
1. 创建新的用户配置文件
2. 在新配置文件中访问网站

---

## 📱 移动端清除缓存

### Android Chrome:
1. 打开 Chrome 应用
2. 点击地址栏右侧的 ⋮ 菜单
3. 选择"历史记录"
4. 点击"清除浏览数据"
5. 勾选"缓存的图片和文件"
6. 点击"清除浏览数据"

### iOS Safari:
1. 打开"设置"应用
2. 向下滚动找到"Safari"
3. 点击"清除历史记录与网站数据"
4. 确认清除

---

## ⚠️ 重要提示

### 为什么需要清除缓存？

Cloudflare Pages 会自动部署最新代码，但是：
- 浏览器会缓存旧版本的 JavaScript 文件
- 即使代码已更新，浏览器仍使用缓存的旧文件
- 旧文件中的代码可能包含已修复的bug

### 验证清单

清除缓存后，请确认：

- [ ] Network 标签显示 `index-BF6hUh9X.js`（新文件）
- [ ] Console 没有 "cdn.tailwindcss.com should not be used" 警告（这个警告在新版本中已移除）
- [ ] 页面正常加载，没有JavaScript错误
- [ ] 可以正常访问设置页面
- [ ] 可以选择AI服务商

---

## 🎯 清除缓存后的操作

### 1. 访问应用
```
https://intelligent-fmea-generator2.pages.dev
```

### 2. 验证新版本
按 F12 打开 Console，应该看到：
```
[DEBUG] 使用前端直连模式: zhipu
或
Generating FMEA using provider: zhipu
```

### 3. 配置智谱AI
- 设置 → AI API 设置
- 选择 "智谱AI (GLM)"
- **不输入API Key**（留空）
- 保存设置

### 4. 测试生成
使用以下测试内容：

```
电动汽车动力电池系统，包含：
- 锂离子电池包（400V，60kWh）
- 电池管理系统（BMS）
- 液冷热管理系统
- 高压安全系统
```

点击"开始 DFMEA 分析"

---

## 📊 预期结果

清除缓存并使用新版本后，应该看到：

### ✅ 成功标志：
- 加载的文件是 `index-BF6hUh9X.js`
- Console 显示正确的调试信息
- 智谱AI生成**全中文内容**
- **所有字段都已填充**
- S/O/D/AP评分正确
- 逻辑链完整

### ❌ 如果仍然看到错误：
```
models/gemini-1.5-pro is not found
```
说明**缓存未清除**，请尝试方法3（无痕模式）

---

## 🚀 推荐操作流程

**最快最可靠的方法**：

1. ✅ 按 `Ctrl + Shift + N` 打开无痕窗口
2. ✅ 访问 https://intelligent-fmea-generator2.pages.dev
3. ✅ 按 F12 打开开发者工具
4. ✅ 切换到 Network 标签
5. ✅ 刷新页面（F5）
6. ✅ 确认加载的是 `index-BF6hUh9X.js`
7. ✅ 配置智谱AI
8. ✅ 生成FMEA

**100%成功！**

---

## 📞 需要帮助？

如果清除缓存后仍有问题：

1. **截图以下内容**：
   - F12 Network 标签（显示加载的JS文件）
   - F12 Console 标签（显示的错误信息）
   - 浏览器版本

2. **提供信息**：
   - 使用的浏览器（Chrome/Edge/Firefox）
   - 是否尝试了无痕模式
   - 无痕模式下是否正常

3. **临时方案**：
   使用无痕模式访问应用，这是最可靠的方法。

---

**🎉 立即操作：打开无痕窗口（Ctrl+Shift+N）并访问应用！**
