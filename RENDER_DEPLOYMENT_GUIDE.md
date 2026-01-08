# Render部署后端完整指南

## 第一步：在GitHub上创建后端仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角的 **"+"** 按钮，选择 **"New repository"**
3. 填写仓库信息：
   - **Repository name**: `intelligent-fmea-generator-backend`
   - **Description**: `FMEA Generator Backend API`
   - **Public/Private**: 选择 **Public**（Render免费版需要公开仓库）
   - 不要勾选任何初始化选项
4. 点击 **"Create repository"**

5. 在创建的仓库页面，复制仓库的URL（格式：`https://github.com/你的用户名/intelligent-fmea-generator-backend.git`）

6. 在本地终端执行以下命令（替换YOUR_USERNAME为你的GitHub用户名）：

```bash
cd backend
git remote add origin https://github.com/YOUR_USERNAME/intelligent-fmea-generator-backend.git
git branch -M main
git push -u origin main
```

## 第二步：在Render上创建账户并部署

1. 访问 [Render](https://render.com)
2. 点击 **"Sign Up"** 或 **"Sign In"**（可以使用GitHub账户登录）
3. 登录后，点击右上角的 **"New +"** 按钮
4. 选择 **"Web Service"**

5. 配置Web Service：
   - **Name**: `fmea-generator-backend`
   - **Region**: 选择离你最近的区域（如 Singapore 或 Oregon）
   - **Branch**: `main`
   - **Root Directory**: 留空
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

6. 点击 **"Advanced"** 展开：
   - **Environment Variables**（点击添加）：
     - `NODE_ENV`: `production`
     - `PORT`: `3001`

7. 点击 **"Create Web Service"**

8. 等待部署完成（通常需要2-5分钟）

9. 部署成功后，你会看到类似这样的URL：
   ```
   https://fmea-generator-backend.onrender.com
   ```

## 第三步：测试后端API

在浏览器中访问以下URL测试后端是否正常运行：

```
https://fmea-generator-backend.onrender.com/api/health
```

你应该看到类似这样的响应：
```json
{
  "status": "ok",
  "timestamp": "2026-01-09T12:00:00.000Z"
}
```

## 第四步：更新前端API配置

1. 打开前端项目中的 `.env` 文件
2. 将 `VITE_API_BASE_URL` 更新为你的Render后端URL：

```env
VITE_API_BASE_URL=https://fmea-generator-backend.onrender.com
```

## 第五步：重新构建和部署前端

```bash
# 在前端项目根目录执行
npm run build
git add .
git commit -m "Update API endpoint to Render backend"
git push origin master
```

## 第六步：测试完整功能

1. 访问你的GitHub Pages网站：
   ```
   https://jasonbai123.github.io/intelligent-fmea-generator2.0/
   ```

2. 测试验证码功能：
   - 输入手机号
   - 点击"发送验证码"
   - 应该能成功接收验证码

## 常见问题解决

### 问题1：部署失败
- 检查Render的部署日志
- 确保package.json中的scripts正确
- 确保Procfile存在且格式正确

### 问题2：API调用失败
- 检查CORS配置（后端已配置为允许所有来源）
- 确保前端API地址正确
- 检查后端是否正常运行

### 问题3：验证码无法接收
- 确保后端部署成功
- 检查前端API配置是否正确
- 查看浏览器控制台错误信息

## 注意事项

1. **Render免费版限制**：
   - 每月750小时的免费运行时间
   - 服务在15分钟无活动后会休眠
   - 重新激活需要30-60秒

2. **数据持久化**：
   - 当前使用内存存储，服务重启后数据会丢失
   - 如需持久化，可以添加数据库（如MongoDB、PostgreSQL）

3. **安全性**：
   - 生产环境应该设置具体的CORS来源
   - 添加API密钥验证
   - 实现用户认证和授权

## 下一步优化建议

1. 添加数据库（MongoDB Atlas免费版）
2. 实现真正的短信验证码发送（如阿里云短信服务）
3. 添加用户认证中间件
4. 实现日志记录和监控
5. 添加API速率限制