import { Router } from 'itty-router';

// 导入KV数据库和认证处理器
import KVDB from './utils/db';
import AuthHandlers from './handlers/auth';

// Cloudflare Workers环境变量和绑定
// @ts-ignore - Cloudflare Workers运行时会自动提供这些绑定
globalThis.env = globalThis.env || {};

// 创建路由器
const router = Router();

// 创建KV数据库实例
const db = new KVDB(globalThis.env.DATA);

// 创建认证处理器实例
const authHandlers = new AuthHandlers(db);

// 健康检查
router.get('/api/health', (req) => {
  return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
});

// 认证相关路由
router.post('/api/auth/send-code', authHandlers.handleSendCode.bind(authHandlers));
router.post('/api/auth/login', authHandlers.handleLogin.bind(authHandlers));
router.get('/api/auth/users', authHandlers.handleGetUsers.bind(authHandlers));
router.put('/api/auth/users/:phone/expire', authHandlers.handleUpdateUserExpiration.bind(authHandlers));
router.put('/api/auth/users/:phone/convert', authHandlers.handleConvertTrialToRegular.bind(authHandlers));
router.delete('/api/auth/users/:phone', authHandlers.handleDeleteUser.bind(authHandlers));

// 处理OPTIONS请求
router.options('*', authHandlers.handleOptions.bind(authHandlers));

// 根路径
router.get('/', (req) => {
  return new Response(JSON.stringify({
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
      }
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
});

// 404处理
router.all('*', () => new Response(JSON.stringify({ message: 'Not Found' }), {
  status: 404,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
}));

// Cloudflare Workers入口点
export default {
  fetch: router.handle
};
