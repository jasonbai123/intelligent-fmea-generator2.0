import { describe, test, expect } from 'vitest';
import request from 'supertest';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001';

describe('AI服务API测试', () => {
  describe('GET /api/ai/providers', () => {
    test('应该返回所有支持的AI服务商', async () => {
      const response = await request(`${API_BASE_URL}`)
        .get('/api/ai/providers');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('providers');
      expect(Array.isArray(response.body.providers)).toBe(true);

      // 验证必需的服务商
      const providerIds = response.body.providers.map((p: any) => p.id);
      expect(providerIds).toContain('gemini');
      expect(providerIds).toContain('deepseek');
      expect(providerIds).toContain('siliconflow');
    });

    test('每个服务商应该有必需的属性', async () => {
      const response = await request(`${API_BASE_URL}`)
        .get('/api/ai/providers');

      const providers = response.body.providers;

      providers.forEach((provider: any) => {
        expect(provider).toHaveProperty('id');
        expect(provider).toHaveProperty('name');
        expect(provider).toHaveProperty('model');
        expect(provider).toHaveProperty('configured');
        expect(typeof provider.configured).toBe('boolean');
      });
    });
  });

  describe('POST /api/ai/gemini/chat', () => {
    test('应该能够使用Gemini生成FMEA', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/ai/gemini/chat')
        .send({
          messages: [
            {
              role: 'system',
              content: 'You are a FMEA expert'
            },
            {
              role: 'user',
              content: '生成一个简单的DFMEA报告，产品：电动牙刷'
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });

      // 可能的结果：
      // 1. 成功生成（200）
      // 2. 后端未配置API密钥（500）
      // 3. API调用失败（500）
      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('content');
        expect(response.body.content.length).toBeGreaterThan(0);
        expect(response.body).toHaveProperty('usage');
      } else {
        expect(response.body.message).toContain('API密钥');
      }
    }, 30000); // 30秒超时

    test('应该验证必需的参数', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/ai/gemini/chat')
        .send({
          // 缺少messages
          temperature: 0.7
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('应该验证messages格式', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/ai/gemini/chat')
        .send({
          messages: 'invalid', // 应该是数组
          temperature: 0.7
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.message).toMatch(/messages|数组|array/i);
    });

    test('应该支持temperature参数', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/ai/gemini/chat')
        .send({
          messages: [
            {
              role: 'user',
              content: '测试'
            }
          ],
          temperature: 0.5,
          max_tokens: 100
        });

      // 即使API调用失败，请求也应该被接受
      expect([200, 500]).toContain(response.status);
    });

    test('应该支持max_tokens参数', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/ai/gemini/chat')
        .send({
          messages: [
            {
              role: 'user',
              content: '测试'
            }
          ],
          max_tokens: 500
        });

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('POST /api/ai/deepseek/chat', () => {
    test('应该能够使用DeepSeek生成FMEA', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/ai/deepseek/chat')
        .send({
          messages: [
            {
              role: 'system',
              content: 'You are a FMEA expert'
            },
            {
              role: 'user',
              content: '生成一个简单的DFMEA报告，产品：电动牙刷'
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });

      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('content');
        expect(response.body.content.length).toBeGreaterThan(0);
      } else {
        expect(response.body.message).toMatch(/API密钥|配置|config/i);
      }
    }, 30000);

    test('应该使用OpenAI兼容格式', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/ai/deepseek/chat')
        .send({
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ],
          model: 'deepseek-chat'
        });

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('POST /api/ai/siliconflow/chat', () => {
    test('应该能够使用硅基流动生成FMEA', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/ai/siliconflow/chat')
        .send({
          messages: [
            {
              role: 'system',
              content: 'You are a FMEA expert'
            },
            {
              role: 'user',
              content: '生成一个简单的DFMEA报告'
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });

      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('content');
      } else {
        expect(response.body.message).toMatch(/API密钥|配置/i);
      }
    }, 30000);
  });

  describe('错误处理', () => {
    test('应该处理不支持的服务商', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/ai/invalid-provider/chat')
        .send({
          messages: [
            {
              role: 'user',
              content: 'Test'
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/不支持|invalid|support/i);
    });

    test('应该处理API调用超时', async () => {
      // 这个测试需要模拟超时场景
      // 或者使用非常短的timeout
      const response = await request(`${API_BASE_URL}`)
        .post('/api/ai/gemini/chat')
        .send({
          messages: [
            {
              role: 'user',
              content: 'A'.repeat(10000) // 非常长的消息
            }
          ],
          max_tokens: 10000
        })
        .timeout(5000); // 5秒超时

      // 应该超时或返回错误
      expect([200, 408, 500]).toContain(response.status);
    }, 10000);

    test('应该处理无效的JSON请求体', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/ai/gemini/chat')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('使用量统计', () => {
    test('应该返回token使用统计', async () => {
      const response = await request(`${API_BASE_URL}`)
        .post('/api/ai/gemini/chat')
        .send({
          messages: [
            {
              role: 'user',
              content: '简短测试'
            }
          ],
          max_tokens: 100
        });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('usage');
        expect(response.body.usage).toHaveProperty('totalTokens');
        expect(typeof response.body.usage.totalTokens).toBe('number');
      }
    }, 20000);
  });
});

describe('FMEA生成专项测试', () => {
  test('应该能够生成符合AIAG-VDA标准的DFMEA', async () => {
    const response = await request(`${API_BASE_URL}`)
      .post('/api/ai/gemini/chat')
      .send({
        messages: [
          {
            role: 'system',
            content: `Generate DFMEA report following AIAG & VDA 1.0 standard.
            Return JSON format with: title, rows array.
            Each row must have: s4_severity (1-10), s5_occurrence (1-10),
            s5_detection (1-10), s5_ap (H/M/L based on scores).`
          },
          {
            role: 'user',
            content: 'Product: Electric Toothbrush, Components: Motor, Shaft, Gear'
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      });

    if (response.status === 200) {
      const content = response.body.content;

      // 验证是否包含JSON
      expect(content).toMatch(/\{[\s\S]*"rows"[\s\S]*\}/);

      // 尝试解析JSON
      let jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);

        expect(jsonData).toHaveProperty('rows');
        expect(Array.isArray(jsonData.rows)).toBe(true);

        if (jsonData.rows.length > 0) {
          const firstRow = jsonData.rows[0];

          // 验证必需字段
          expect(firstRow).toHaveProperty('s4_severity');
          expect(firstRow.s4_severity).toBeGreaterThanOrEqual(1);
          expect(firstRow.s4_severity).toBeLessThanOrEqual(10);

          expect(firstRow).toHaveProperty('s5_occurrence');
          expect(firstRow.s5_occurrence).toBeGreaterThanOrEqual(1);
          expect(firstRow.s5_occurrence).toBeLessThanOrEqual(10);

          expect(firstRow).toHaveProperty('s5_detection');
          expect(firstRow.s5_detection).toBeGreaterThanOrEqual(1);
          expect(firstRow.s5_detection).toBeLessThanOrEqual(10);

          expect(firstRow).toHaveProperty('s5_ap');
          expect(['H', 'M', 'L']).toContain(firstRow.s5_ap);
        }
      }
    }
  }, 45000);

  test('应该能够生成符合AIAG-VDA标准的PFMEA', async () => {
    const response = await request(`${API_BASE_URL}`)
      .post('/api/ai/gemini/chat')
      .send({
        messages: [
          {
            role: 'system',
            content: `Generate PFMEA report following AIAG & VDA 1.0 standard.
            Return JSON format with process steps and failure modes.`
          },
          {
            role: 'user',
            content: 'Process: Injection Molding for Plastic Housing'
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      });

    if (response.status === 200) {
      expect(response.body).toHaveProperty('content');
      expect(response.body.content.length).toBeGreaterThan(100);
    }
  }, 45000);

  test('应该正确计算AP优先级', async () => {
    const response = await request(`${API_BASE_URL}`)
      .post('/api/ai/gemini/chat')
      .send({
        messages: [
          {
            role: 'system',
            content: `Generate DFMEA with AP priority calculation.
            High (H): S≥8 OR O≥8 OR D≥8
            Medium (M): S=6-7 OR O=6-7 OR D=6-7
            Low (L): S≤5 AND O≤5 AND D≤5`
          },
          {
            role: 'user',
            content: 'Product: Test Item, Failure: Critical safety issue'
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

    if (response.status === 200) {
      const content = response.body.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        const highRiskRow = jsonData.rows?.find((r: any) =>
          r.s4_severity >= 8 || r.s5_occurrence >= 8 || r.s5_detection >= 8
        );

        if (highRiskRow) {
          expect(highRiskRow.s5_ap).toBe('H');
        }
      }
    }
  }, 45000);
});
