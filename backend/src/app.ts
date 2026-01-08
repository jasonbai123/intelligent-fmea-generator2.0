import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// 配置CORS
app.use(cors({
  origin: '*', // 在生产环境中应该设置具体的前端域名
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 配置路由
app.use('/api/auth', authRoutes);

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('API 端点:');
  console.log('  - 健康检查: http://localhost:3001/api/health');
  console.log('  - 发送验证码: POST http://localhost:3001/api/auth/send-code');
  console.log('  - 登录: POST http://localhost:3001/api/auth/login');
  console.log('  - 获取用户列表: GET http://localhost:3001/api/auth/users');
  console.log('  - 更新账户有效期: PUT http://localhost:3001/api/auth/users/:phone/expire');
  console.log('  - 转换账户类型: PUT http://localhost:3001/api/auth/users/:phone/convert');
  console.log('  - 删除用户: DELETE http://localhost:3001/api/auth/users/:phone');
});
