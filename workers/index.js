/**
 * FMEA AI API 代理服务器
 * 部署在 Cloudflare Workers
 * 解决前端直接调用AI API的CORS问题
 */

export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 路由处理
    if (path === '/api/ai/chat') {
      return handleAIChat(request);
    } else if (path === '/api/ai/providers') {
      return handleGetProviders();
    } else if (path === '/api/health') {
      return handleHealth();
    } else {
      return new Response('Not Found', { status: 404 });
    }
  }
};

/**
 * 处理AI聊天请求（支持所有AI服务商）
 */
async function handleAIChat(request) {
  try {
    const body = await request.json();

    const {
      provider,
      model,
      messages,
      apiKey,
      baseUrl,
      temperature = 0.7,
      max_tokens = 4096
    } = body;

    // 验证必要参数
    if (!provider || !messages || !Array.isArray(messages)) {
      return jsonResponse({
        error: 'Missing required parameters: provider, messages'
      }, 400);
    }

    if (!apiKey) {
      return jsonResponse({
        error: 'API Key is required'
      }, 400);
    }

    // 根据不同的provider调用不同的API
    let result;
    switch (provider) {
      case 'gemini':
        result = await callGeminiAPI(model, messages, apiKey);
        break;

      case 'deepseek':
      case 'siliconflow':
      case 'zhipu':
      case 'doubao':
      case 'claude':
        result = await callOpenAICompatibleAPI(baseUrl, model, messages, apiKey, temperature, max_tokens);
        break;

      default:
        return jsonResponse({
          error: `Unsupported provider: ${provider}`
        }, 400);
    }

    return jsonResponse(result);

  } catch (error) {
    console.error('Error handling AI chat:', error);
    return jsonResponse({
      error: error.message || 'Internal server error'
    }, 500);
  }
}

/**
 * 调用 Google Gemini API
 */
async function callGeminiAPI(model, messages, apiKey) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // 转换消息格式
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseFormat: { type: 'json_object' }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    usage: data.usageMetadata || {}
  };
}

/**
 * 调用 OpenAI 兼容的 API (DeepSeek, 硅基流动, 智谱AI, 豆包, Claude)
 */
async function callOpenAICompatibleAPI(baseUrl, model, messages, apiKey, temperature, maxTokens) {
  const apiUrl = `${baseUrl}/chat/completions`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  return {
    text: data.choices?.[0]?.message?.content || '',
    usage: data.usage || {}
  };
}

/**
 * 获取支持的AI服务商列表
 */
function handleGetProviders() {
  return jsonResponse({
    providers: [
      {
        id: 'gemini',
        name: 'Google Gemini',
        baseUrl: '',
        defaultModel: 'gemini-2.0-flash',
        requiresBaseUrl: false
      },
      {
        id: 'deepseek',
        name: 'DeepSeek (深度求索)',
        baseUrl: 'https://api.deepseek.com',
        defaultModel: 'deepseek-chat',
        requiresBaseUrl: true
      },
      {
        id: 'siliconflow',
        name: '硅基流动',
        baseUrl: 'https://api.siliconflow.cn/v1',
        defaultModel: 'deepseek-ai/DeepSeek-V3',
        requiresBaseUrl: true
      },
      {
        id: 'zhipu',
        name: '智谱AI (GLM)',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        defaultModel: 'glm-4-plus',
        requiresBaseUrl: true
      },
      {
        id: 'doubao',
        name: '豆包 (火山引擎)',
        baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        defaultModel: 'ep-20241223123456-xxxxx',
        requiresBaseUrl: true
      },
      {
        id: 'claude',
        name: 'Anthropic Claude',
        baseUrl: 'https://api.anthropic.com/v1',
        defaultModel: 'claude-3-5-sonnet-20241022',
        requiresBaseUrl: true
      }
    ]
  });
}

/**
 * 健康检查
 */
function handleHealth() {
  return jsonResponse({
    status: 'ok',
    timestamp: Date.now(),
    service: 'FMEA AI Proxy'
  });
}

/**
 * 返回JSON响应
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

/**
 * 处理CORS预检请求
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
