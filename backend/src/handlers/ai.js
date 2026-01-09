class AIHandlers {
  constructor(env) {
    this.env = env;
    this.AI_PROVIDERS = {
      claude: {
        name: 'Claude (Anthropic)',
        endpoint: 'https://api.anthropic.com/v1/messages',
        apiKey: env?.ANTHROPIC_API_KEY,
        model: 'claude-3-5-sonnet-20241022'
      },
      deepseek: {
        name: 'DeepSeek',
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        apiKey: env?.DEEPSEEK_API_KEY,
        model: 'deepseek-chat'
      },
      gemini: {
        name: 'Google Gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        apiKey: env?.GEMINI_API_KEY,
        model: 'gemini-2.0-flash'
      },
      volcengine: {
        name: '火山引擎',
        endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        apiKey: env?.VOLCENGINE_API_KEY,
        model: 'doubao-pro-32k'
      },
      siliconflow: {
        name: '硅基流动',
        endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
        apiKey: env?.SILICONFLOW_API_KEY,
        model: 'Qwen/Qwen2.5-72B-Instruct'
      },
      glm: {
        name: '智谱AI (GLM)',
        endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        apiKey: env?.GLM_API_KEY,
        model: 'glm-4'
      }
    };
  }

  createResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  async handleAIRequest(provider, request) {
    try {
      const providerConfig = this.AI_PROVIDERS[provider];

      if (!providerConfig) {
        return this.createResponse({ message: `不支持的AI服务提供商: ${provider}` }, 400);
      }

      const body = await request.json();
      const { messages, model, temperature, max_tokens, apiKey: frontendApiKey } = body;

      // 优先使用前端传过来的API KEY，如果没有则使用后端环境变量中的KEY
      const apiKey = frontendApiKey || providerConfig.apiKey;

      if (!apiKey) {
        return this.createResponse({
          message: `API密钥未配置。请在前端"AI API设置"中输入您的${providerConfig.name} API密钥，或联系管理员配置后端默认密钥。`
        }, 400);
      }

      if (!messages || !Array.isArray(messages)) {
        return this.createResponse({ message: '请提供有效的消息数组' }, 400);
      }

      let requestBody;
      let headers = {
        'Content-Type': 'application/json'
      };
      let endpoint = providerConfig.endpoint;

      if (provider === 'claude') {
        headers['anthropic-version'] = '2023-06-01';
        headers['x-api-key'] = apiKey;
        requestBody = {
          model: model || providerConfig.model,
          max_tokens: max_tokens || 4096,
          messages: messages,
          temperature: temperature || 0.7
        };
      } else if (provider === 'gemini') {
        const geminiModel = model || providerConfig.model;
        endpoint = `${providerConfig.endpoint}/${geminiModel}:generateContent`;
        const geminiMessages = messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }]
        }));
        requestBody = {
          contents: geminiMessages,
          generationConfig: {
            temperature: temperature || 0.7,
            maxOutputTokens: max_tokens || 4096
          }
        };
      } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
        requestBody = {
          model: model || providerConfig.model,
          messages: messages,
          temperature: temperature || 0.7,
          max_tokens: max_tokens || 4096
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error(`${providerConfig.name} API错误:`, errorData);
        return this.createResponse({ 
          message: `${providerConfig.name} API调用失败`, 
          error: errorData 
        }, response.status);
      }

      const data = await response.json();
      
      let result;
      if (provider === 'claude') {
        result = {
          content: data.content[0].text,
          usage: data.usage,
          model: data.model
        };
      } else if (provider === 'gemini') {
        result = {
          content: data.candidates[0].content.parts[0].text,
          usage: data.usageMetadata,
          model: providerConfig.model
        };
      } else {
        result = {
          content: data.choices[0].message.content,
          usage: data.usage,
          model: data.model
        };
      }

      return this.createResponse(result);
    } catch (error) {
      console.error('AI请求失败:', error);
      return this.createResponse({ message: 'AI请求失败', error: error.message }, 500);
    }
  }

  async handleGetProviders(request) {
    try {
      const providers = Object.entries(this.AI_PROVIDERS).map(([key, config]) => ({
        id: key,
        name: config.name,
        model: config.model,
        configured: !!config.apiKey
      }));
      
      return this.createResponse({ providers });
    } catch (error) {
      console.error('获取AI服务提供商失败:', error);
      return this.createResponse({ message: '获取AI服务提供商失败' }, 500);
    }
  }
}

export default AIHandlers;