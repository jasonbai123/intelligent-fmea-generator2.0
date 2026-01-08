import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import collaborationRoutes from './routes/collaboration';

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
app.use('/api/collaboration', collaborationRoutes);

// 根路径路由
app.get('/', (req, res) => {
  res.status(200).json({
    message: '智能FMEA生成器后端API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        sendCode: 'POST /api/auth/send-code',
        login: 'POST /api/auth/login',
        users: 'GET /api/auth/users',
        updateExpiration: 'PUT /api/auth/users/:phone/expire',
        convertAccount: 'PUT /api/auth/users/:phone/convert',
        deleteUser: 'DELETE /api/auth/users/:phone'
      },
      collaboration: {
        projects: {
          create: 'POST /api/collaboration/projects',
          list: 'GET /api/collaboration/projects',
          get: 'GET /api/collaboration/projects/:id',
          update: 'PUT /api/collaboration/projects/:id',
          delete: 'DELETE /api/collaboration/projects/:id',
          addCollaborator: 'POST /api/collaboration/projects/:id/collaborators',
          removeCollaborator: 'DELETE /api/collaboration/projects/:id/collaborators/:collaboratorId',
          createVersion: 'POST /api/collaboration/projects/:id/versions',
          getVersions: 'GET /api/collaboration/projects/:id/versions',
          restoreVersion: 'POST /api/collaboration/projects/:id/versions/:version/restore',
          createComment: 'POST /api/collaboration/projects/:id/comments',
          getComments: 'GET /api/collaboration/projects/:id/comments',
          updateComment: 'PUT /api/collaboration/projects/:id/comments/:commentId',
          deleteComment: 'DELETE /api/collaboration/projects/:id/comments/:commentId',
          addReply: 'POST /api/collaboration/projects/:id/comments/:commentId/replies',
          getActivities: 'GET /api/collaboration/projects/:id/activities'
        },
        activities: {
          getUserActivities: 'GET /api/collaboration/activities'
        }
      }
    }
  });
});

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('API 端点:');
  console.log('  - 健康检查: http://localhost:3001/api/health');
  console.log('  - 认证相关:');
  console.log('    * 发送验证码: POST http://localhost:3001/api/auth/send-code');
  console.log('    * 登录: POST http://localhost:3001/api/auth/login');
  console.log('    * 获取用户列表: GET http://localhost:3001/api/auth/users');
  console.log('    * 更新账户有效期: PUT http://localhost:3001/api/auth/users/:phone/expire');
  console.log('    * 转换账户类型: PUT http://localhost:3001/api/auth/users/:phone/convert');
  console.log('    * 删除用户: DELETE http://localhost:3001/api/auth/users/:phone');
  console.log('  - 协作功能:');
  console.log('    * 项目管理: POST/GET/PUT/DELETE http://localhost:3001/api/collaboration/projects');
  console.log('    * 协作者管理: POST/DELETE http://localhost:3001/api/collaboration/projects/:id/collaborators');
  console.log('    * 版本管理: POST/GET http://localhost:3001/api/collaboration/projects/:id/versions');
  console.log('    * 评论管理: POST/GET/PUT/DELETE http://localhost:3001/api/collaboration/projects/:id/comments');
  console.log('    * 活动日志: GET http://localhost:3001/api/collaboration/projects/:id/activities');
  console.log('    * 用户活动: GET http://localhost:3001/api/collaboration/activities');
});
