# 🔧 Cloudflare Workers 环境变量配置详细步骤

**目标**: 配置后端API密钥，使智谱AI、DeepSeek、硅基流动等服务商可以正常使用

---

## 📋 准备工作

### 您需要的API密钥：

```
1. 智谱AI (GLM):
   ZHIPU_API_KEY=07c3e7a8023146cabb10afcb1e087090.QHAsSKJL0Zadrnnt

2. DeepSeek:
   DEEPSEEK_API_KEY=sk-fd39b3a22c0d4c82b84bf99f42e212c8

3. 硅基流动:
   SILICONFLOW_API_KEY=sk-aadvzzhiqcwvmdhabmahpoipajjmcqzmlrlrciplfksudtza
```

---

## 🚀 详细配置步骤

### 步骤1: 登录Cloudflare

1. **打开浏览器，访问**:
   ```
   https://dash.cloudflare.com/
   ```

2. **登录您的账号**
   - 输入邮箱/密码
   - 或使用Google账号登录

---

### 步骤2: 进入Workers & Pages

1. **在左侧菜单中找到**
   - 点击 "Workers & Pages"
   - 通常在左侧栏靠下位置

2. **选择Workers标签**
   - 点击 "Workers" 标签（不是Pages）
   - 图标是橙色的六边形

---

### 步骤3: 找到您的Worker

1. **查找后端Worker**
   - 应该看到名称为 `fmea-backend` 的Worker
   - 或类似 `intelligent-fmea-backend` 的名称

2. **点击进入Worker详情**
   - 点击Worker名称
   - 进入Worker管理页面

---

### 步骤4: 进入设置页面

1. **找到设置选项**
   - 点击顶部的 "Settings" (设置) 标签
   - 通常在 "Overview"、"Resources"、"Triggers" 旁边

2. **进入环境变量设置**
   - 在左侧菜单中找到 "Variables and Secrets"
   - 或 "环境变量" (中文界面)
   - 点击进入

---

### 步骤5: 添加环境变量

您会看到一个页面，有两个部分：
- **Environment Variables** (环境变量) - 明文显示
- **Secrets** (密钥) - 加密存储（推荐用于生产环境）

#### 方式A: 使用Environment Variables（简单，用于测试）

1. **点击 "Add variable"** (添加变量) 按钮

2. **添加第一个变量**:
   - **Variable name (变量名)**: 输入 `ZHIPU_API_KEY`
   - **Value (值)**: 输入 `07c3e7a8023146cabb10afcb1e087090.QHAsSKJL0Zadrnnt`
   - 点击 "Save" 或 "添加"

3. **添加第二个变量**:
   - 再次点击 "Add variable"
   - **Variable name**: 输入 `DEEPSEEK_API_KEY`
   - **Value**: 输入 `sk-fd39b3a22c0d4c82b84bf99f42e212c8`
   - 点击 "Save"

4. **添加第三个变量**:
   - 再次点击 "Add variable"
   - **Variable name**: 输入 `SILICONFLOW_API_KEY`
   - **Value**: 输入 `sk-aadvzzhiqcwvmdhabmahpoipajjmcqzmlrlrciplfksudtza`
   - 点击 "Save"

#### 方式B: 使用Secrets（推荐，生产环境）

如果看到 "Add secret" 按钮：

1. **点击 "Add secret"** (添加密钥)

2. **会弹出一个输入框**
   - 输入密钥名称: `ZHIPU_API_KEY`
   - 按回车

3. **粘贴密钥值**
   - 粘贴: `07c3e7a8023146cabb10afcb1e087090.QHAsSKJL0Zadrnnt`
   - 按回车确认

4. **重复上述步骤**
   - 添加 `DEEPSEEK_API_KEY`
   - 添加 `SILICONFLOW_API_KEY`

---

### 步骤6: 保存并部署

1. **保存设置**
   - 页面底部可能有 "Save" 按钮
   - 点击保存

2. **重新部署Worker**
   - 返回Worker详情页
   - 点击 "Deployments" (部署) 标签
   - 点击右上角 "Deploy" (部署) 按钮
   - 等待部署完成（通常几秒钟）

3. **确认部署成功**
   - 看到 "Success" 或绿色勾号
   - 或状态变为 "Active"

---

## ✅ 验证配置

### 检查环境变量是否生效

1. **返回环境变量页面**
   - Settings → Variables and Secrets

2. **确认三个变量都在列表中**
   - ✅ ZHIPU_API_KEY
   - ✅ DEEPSEEK_API_KEY
   - ✅ SILICONFLOW_API_KEY

3. **在应用中测试**

#### 测试智谱AI:

1. **打开FMEA应用**
   ```
   https://intelligent-fmea-generator2.pages.dev
   ```

2. **进入设置**
   - 点击侧边栏 "设置"
   - 进入 "AI API 设置"

3. **选择智谱AI**
   - 选择 "智谱AI (GLM)"
   - **不要输入API Key**（留空）
   - 模型会自动填充为 `glm-4-plus`
   - 点击 "保存设置"

4. **生成FMEA**
   - 输入产品描述
   - 点击 "开始 DFMEA 分析"
   - 应该成功生成

---

## 🔍 故障排查

### 问题1: 找不到Workers & Pages

**可能原因**:
- 账号没有创建Worker
- 权限不足

**解决**:
1. 确认账号是您自己的
2. 确认有Cloudflare Workers权限
3. 或联系账号管理员

---

### 问题2: 找不到fmea-backend Worker

**可能原因**:
- Worker名称不同
- Worker还没创建

**解决**:
1. 查看所有Worker列表
2. 找到名称包含 "fmea" 或 "backend" 的Worker
3. 如果没有，需要先创建Worker

---

### 问题3: 添加变量后仍然报错

**检查清单**:
- [ ] 是否保存了设置？
- [ ] 是否重新部署了Worker？
- [ ] 变量名是否完全正确（区分大小写）？
- [ ] API Key是否完整（没有多余空格）？
- [ ] 是否清除了浏览器缓存（Ctrl+F5）？

---

### 问题4: 没有Cloudflare Workers访问权限

**解决方案**:
- 联系项目管理员或部署者
- 请他们配置这些环境变量
- 或使用Gemini 2.0 Flash（不需要后端）

---

## 📸 界面参考（中文版）

如果您的Cloudflare界面是中文：

### 中文界面路径：
```
Cloudflare Dashboard
  ↓
Workers & Pages (Workers 和页面)
  ↓
Workers (Workers 标签)
  ↓
选择 Worker: fmea-backend
  ↓
Settings (设置)
  ↓
Variables (变量) 或 Environment Variables (环境变量)
  ↓
Add variable (添加变量)
```

### 变量填写示例：
```
变量名: ZHIPU_API_KEY
值: 07c3e7a8023146cabb10afcb1e087090.QHAsSKJL0Zadrnnt
```

---

## 🎯 完成后的效果

配置成功后，您应该看到：

```
环境变量列表:
✅ ZHIPU_API_KEY •••• (部分隐藏)
✅ DEEPSEEK_API_KEY •••• (部分隐藏)
✅ SILICONFLOW_API_KEY •••• (部分隐藏)
```

在应用中测试：

```
智谱AI (GLM):
- 状态: ✅ 可用
- API Key: 不需要输入（后端配置）
- 模型: glm-4-plus

DeepSeek:
- 状态: ✅ 可用
- API Key: 不需要输入（后端配置）
- 模型: deepseek-chat

硅基流动:
- 状态: ✅ 可用
- API Key: 不需要输入（后端配置）
- 模型: Qwen/Qwen2.5-72B-Instruct
```

---

## 📞 需要帮助？

### 如果遇到问题：

1. **截图界面**
   - Cloudflare Dashboard页面
   - Workers列表
   - 环境变量页面

2. **提供信息**
   - 是否能看到Workers & Pages？
   - 是否有fmea-backend Worker？
   - 是否看到 "Add variable" 按钮？

3. **错误信息**
   - 弹出的错误提示
   - 浏览器Console日志

### 替代方案

如果无法配置Cloudflare Workers：

**使用Gemini 2.0 Flash**（不需要后端）:
1. 设置 → AI API 设置
2. 选择 "Google Gemini"
3. 选择 "Gemini 2.0 Flash (快速)"
4. 输入API Key: `AIzaSyAyMnqsJezkGvD7bomSaKeGVGW3hfiyKVA`
5. 保存并使用

---

## 📝 快速复制（环境变量名和值）

```bash
# 变量名: 值
ZHIPU_API_KEY=07c3e7a8023146cabb10afcb1e087090.QHAsSKJL0Zadrnnt
DEEPSEEK_API_KEY=sk-fd39b3a22c0d4c82b84bf99f42e212c8
SILICONFLOW_API_KEY=sk-aadvzzhiqcwvmdhabmahpoipajjmcqzmlrlrciplfksudtza
```

**注意**:
- 变量名必须完全一致（区分大小写）
- 值前面没有 `=` 号
- 值不要有引号
- 值不要有多余空格

---

**配置完成后，请刷新浏览器并测试！** 🚀

**如果还有问题，请提供Cloudflare Dashboard的截图，我会进一步指导！**
