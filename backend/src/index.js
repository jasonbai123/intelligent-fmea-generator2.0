import KVDB from './utils/db';
import AuthHandlers from './handlers/auth';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const db = new KVDB(env.DATA);
    const authHandlers = new AuthHandlers(db);

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), { headers });
    }

    if (url.pathname === '/api/auth/send-code' && request.method === 'POST') {
      return authHandlers.handleSendCode(request);
    }

    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      return authHandlers.handleLogin(request);
    }

    if (url.pathname === '/api/users' && request.method === 'GET') {
      return authHandlers.handleGetUsers(request);
    }

    if (url.pathname.startsWith('/api/users/') && request.method === 'PUT') {
      const parts = url.pathname.split('/');
      const phone = parts[3];
      const action = parts[4];

      if (action === 'expiration') {
        return authHandlers.handleUpdateUserExpiration(request);
      }

      if (action === 'convert') {
        return authHandlers.handleConvertTrialToRegular(request);
      }
    }

    if (url.pathname.startsWith('/api/users/') && request.method === 'DELETE') {
      return authHandlers.handleDeleteUser(request);
    }

    return new Response(JSON.stringify({ message: 'Not Found' }), {
      status: 404,
      headers
    });
  }
};