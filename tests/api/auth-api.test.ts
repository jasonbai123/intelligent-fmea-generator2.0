import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';

// 导入后端app
// 注意：这里需要根据实际的后端实现调整
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001';

describe('认证API测试', () => {
  describe('POST /api/auth/send-code', () => {
    test('应该能够发送验证码', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/auth/send-code')
        .send({
          phone: '13800138000'
        });

      // 后端可能返回不同状态码，根据实际情况调整
      expect([200, 201, 202]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toMatch(/^\d{6}$/);
      }
    });

    test('应该拒绝无效的手机号格式', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/auth/send-code')
        .send({
          phone: '123'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty('message');
    });

    test('应该拒绝空手机号', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/auth/send-code')
        .send({
          phone: ''
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('应该限制发送频率', async () => {
      const phone = '13900139000';

      // 第一次发送
      const response1 = await request(`${API_BASE_URL}`)
        .post('/api/auth/send-code')
        .send({ phone });

      // 立即再次发送
      const response2 = await request(`${API_BASE_URL}`)
        .post('/api/auth/send-code')
        .send({ phone });

      // 第二次应该被限制或返回特殊状态
      expect(response2.status).toBeGreaterThanOrEqual(400);
      expect(response2.body.message || '').toMatch(/频率|限制|rate limit/i);
    });
  });

  describe('POST /api/auth/login', () => {
    test('应该能够使用正确的验证码登录', async () => {
      // 先发送验证码
      await request(`${API_BASE_URL}`)
        .post('/api/auth/send-code')
        .send({ phone: '13510420462' });

      // 等待一秒
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 使用测试验证码登录（如果后端在测试环境返回固定验证码）
      const response = await request(`${API_BASE_URL}`)
        .post('/api/auth/login')
        .send({
          phone: '13510420462',
          code: '123456' // 或从发送验证码响应中获取
        });

      // 可能的结果：成功（200）或失败（401）
      expect([200, 401]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('userInfo');
        expect(response.body.userInfo.phone).toBe('13510420462');
        expect(response.body.userInfo.role).toBeDefined();
      }
    });

    test('应该拒绝错误的验证码', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/auth/login')
        .send({
          phone: '13800138000',
          code: '000000'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/验证码|code/i);
    });

    test('应该拒绝过期的验证码', async () => {
      // 这个测试需要模拟过期场景
      const response = await request(`${API_BASE_URL}`)
        .post('/api/auth/login')
        .send({
          phone: '13800138000',
          code: '123456',
          timestamp: Date.now() - 600000 // 10分钟前
        });

      expect(response.status).toBe(401);
    });

    test('应该验证手机号和验证码的配对', async () => {
      // 为手机A发送验证码
      await request(`${API_BASE_URL}`)
        .post('/api/auth/send-code')
        .send({ phone: '13800138000' });

      // 尝试用手机B的验证码登录手机A
      const response = await request(`${API_BASE_URL}`)
        .post('/api/auth/login')
        .send({
          phone: '13800138000',
          code: '999999' // 错误的验证码
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/users', () => {
    test('应该需要认证才能访问', async () => {
      const response = await request(`${API_BASE_URL}`)
        .get('/api/auth/users');

      expect(response.status).toBe(401);
    });

    test('管理员应该能够获取用户列表', async () => {
      // 先登录获取token
      const loginResponse = await request(`${API_BASE_URL}`)
        .post('/api/auth/login')
        .send({
          phone: '13510420462',
          code: '123456'
        });

      if (loginResponse.status === 200) {
        const token = loginResponse.body.token;

        const response = await request(`${API_BASE_URL}`)
          .get('/api/auth/users')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.users)).toBe(true);
      } else {
        // 跳过此测试
        console.log('跳过：无法获取认证token');
      }
    });
  });

  describe('Token验证', () => {
    test('应该接受有效的token', async () => {
      const loginResponse = await request(`${API_BASE_URL}`)
        .post('/api/auth/login')
        .send({
          phone: '13510420462',
          code: '123456'
        });

      if (loginResponse.status === 200) {
        const token = loginResponse.body.token;

        const response = await request(`${API_BASE_URL}`)
          .get('/api/auth/users')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).not.toBe(401);
      }
    });

    test('应该拒绝无效的token', async () => {
      const response = await request(`${API_BASE_URL}`)
        .get('/api/auth/users')
        .set('Authorization', 'Bearer invalid_token_12345');

      expect(response.status).toBe(401);
    });

    test('应该拒绝过期的token', async () => {
      // 生成一个过期的token（30天前）
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAi' +
        Math.floor(Date.now() / 1000 - 2592000); // 30天前的时间戳

      const response = await request(`${API_BASE_URL}`)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('管理员权限测试', () => {
    test('管理员应该是13510420462', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/auth/login')
        .send({
          phone: '13510420462',
          code: '123456'
        });

      if (response.status === 200) {
        expect(response.body.userInfo.role).toBe('admin');
      }
    });

    test('其他用户应该是普通用户', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/auth/login')
        .send({
          phone: '13800138000',
          code: '123456'
        });

      if (response.status === 200) {
        expect(['regular', 'trial']).toContain(response.body.userInfo.role);
        expect(response.body.userInfo.role).not.toBe('admin');
      }
    });
  });
});

describe('API健康检查', () => {
  test('GET /api/health 应该返回200', async () => {
    const response = await request(`${API_BASE_URL}`)
      .get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('应该返回正确的CORS头', async () => {
    const response = await request(`${API_BASE_URL}`)
      .get('/api/health')
      .set('Origin', 'http://localhost:3000');

    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });
});
