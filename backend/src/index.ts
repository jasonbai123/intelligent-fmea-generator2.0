import KVDB from './utils/db';
import AuthHandlers from './handlers/auth';
import CollaborationHandlers from './handlers/collaboration';
import AIHandlers from './handlers/ai';
import type { Env } from './types/cloudflare';

interface Request extends globalThis.Request {
  headers: Headers;
}

interface ResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://intelligent-fmea-generator2.pages.dev'
];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'false',
    'Access-Control-Max-Age': '86400'
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const db = new KVDB(env.FMEA_DATA);
    const authHandlers = new AuthHandlers(db);
    const collabHandlers = new CollaborationHandlers(db);
    const aiHandlers = new AIHandlers(env);

    const headers = getCorsHeaders(request);

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

    if (url.pathname === '/api/auth/verification-codes' && request.method === 'GET') {
      return authHandlers.handleGetAllVerificationCodes(request);
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

    if (url.pathname === '/api/collaboration/projects' && request.method === 'GET') {
      return collabHandlers.handleGetProjects(request);
    }

    if (url.pathname === '/api/collaboration/projects' && request.method === 'POST') {
      return collabHandlers.handleCreateProject(request);
    }

    if (url.pathname.match(/^\/api\/collaboration\/projects\/[^/]+$/) && request.method === 'GET') {
      const parts = url.pathname.split('/');
      const projectId = parts[4];
      return collabHandlers.handleGetProject(request, projectId);
    }

    if (url.pathname.match(/^\/api\/collaboration\/projects\/[^/]+$/) && request.method === 'PUT') {
      const parts = url.pathname.split('/');
      const projectId = parts[4];
      return collabHandlers.handleUpdateProject(request, projectId);
    }

    if (url.pathname.match(/^\/api\/collaboration\/projects\/[^/]+$/) && request.method === 'DELETE') {
      const parts = url.pathname.split('/');
      const projectId = parts[4];
      return collabHandlers.handleDeleteProject(request, projectId);
    }

    if (url.pathname.match(/^\/api\/collaboration\/projects\/[^/]+\/versions$/) && request.method === 'GET') {
      const parts = url.pathname.split('/');
      const projectId = parts[4];
      return collabHandlers.handleGetVersions(request, projectId);
    }

    if (url.pathname.match(/^\/api\/collaboration\/projects\/[^/]+\/versions\/[^/]+\/restore$/) && request.method === 'POST') {
      const parts = url.pathname.split('/');
      const projectId = parts[4];
      const version = parts[6];
      return collabHandlers.handleRestoreVersion(request, projectId, version);
    }

    if (url.pathname.match(/^\/api\/collaboration\/projects\/[^/]+\/comments$/) && request.method === 'GET') {
      const parts = url.pathname.split('/');
      const projectId = parts[4];
      return collabHandlers.handleGetComments(request, projectId);
    }

    if (url.pathname.match(/^\/api\/collaboration\/projects\/[^/]+\/comments$/) && request.method === 'POST') {
      const parts = url.pathname.split('/');
      const projectId = parts[4];
      return collabHandlers.handleCreateComment(request, projectId);
    }

    if (url.pathname.match(/^\/api\/collaboration\/projects\/[^/]+\/comments\/[^/]+$/) && request.method === 'PUT') {
      const parts = url.pathname.split('/');
      const projectId = parts[4];
      const commentId = parts[6];
      return collabHandlers.handleUpdateComment(request, projectId, commentId);
    }

    if (url.pathname.match(/^\/api\/collaboration\/projects\/[^/]+\/comments\/[^/]+$/) && request.method === 'DELETE') {
      const parts = url.pathname.split('/');
      const projectId = parts[4];
      const commentId = parts[6];
      return collabHandlers.handleDeleteComment(request, projectId, commentId);
    }

    if (url.pathname.match(/^\/api\/collaboration\/projects\/[^/]+\/comments\/[^/]+\/replies$/) && request.method === 'POST') {
      const parts = url.pathname.split('/');
      const projectId = parts[4];
      const commentId = parts[6];
      return collabHandlers.handleAddReply(request, projectId, commentId);
    }

    if (url.pathname === '/api/ai/providers' && request.method === 'GET') {
      return aiHandlers.handleGetProviders(request);
    }

    if (url.pathname.match(/^\/api\/ai\/[^/]+\/chat$/) && request.method === 'POST') {
      const parts = url.pathname.split('/');
      const provider = parts[3];
      return aiHandlers.handleAIRequest(provider, request);
    }

    return new Response(JSON.stringify({ message: 'Not Found' }), {
      status: 404,
      headers
    });
  }
};
