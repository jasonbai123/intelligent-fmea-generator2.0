import { FmeaType, FmeaAnalysisResult, GenerationRequest, AiProvider, AiSettings } from '../types';

/**
 * 清理并解析 JSON 字符串
 */
const cleanAndParseJson = (jsonString: string): any => {
  let cleaned = jsonString.trim();

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Cleaned JSON string:', cleaned);
    throw new Error('Failed to parse AI response as JSON');
  }
};

/**
 * 前端直接调用 AI 服务（不经过后端）
 * 支持直接在浏览器中调用多个 AI 服务商的 API
 */

const getSystemInstruction = (type: FmeaType) => {
  const isDfmea = type === FmeaType.DFMEA;
  const standardName = isDfmea ? "DFMEA Criteria (AIAG & VDA 1st Edition)" : "PFMEA Criteria (AIAG & VDA 1st Edition)";

  return `
    # 角色定义
    你是一位资深的主任质量工程师和FMEA专家，拥有AIAG-VDA认证资格。

    # 任务
    根据提供的产品描述，生成一份**深度、技术性且详尽的**${type}报告。

    # 重要约束
    1. **必须使用中文输出所有内容**
    2. **必须严格遵循JSON格式**
    3. **必须填充所有字段，不能留空**

    # 评分标准（AIAG & VDA 第一版）

    ## 严重度 (Severity, S) - 1-10分
    - 10: 安全/法规不符（无预警）
    - 9: 安全/法规不符（有预警）
    - 8: 严重功能丧失（客户极度不满）
    - 7: 主要功能降低（客户不满）
    - 6: 主要功能降低（客户有些不满）
    - 5: 主要功能降低（客户有些可察觉）
    - 4: 次要功能降低（客户有些不满意）
    - 3: 次要功能降低（客户有些可察觉）
    - 2: 极小影响
    - 1: 无影响

    ## 发生度 (Occurrence, O) - 1-10分
    - 10: 几乎必然（>1/2）
    - 9: 很高（1/3）
    - 8: 高（1/8）
    - 7: 中等高（1/20）
    - 6: 中等（1/80）
    - 5: 中等（1/400）
    - 4: 低（1/2000）
    - 3: 很低（1/15000）
    - 2: 极低（1/150000）
    - 1: 几乎不可能（<1/1500000）

    ## 探测度 (Detection, D) - 1-10分
    - 10: 几乎不可能探测
    - 9: 极低的探测概率
    - 8: 很低的探测概率
    - 7: 低探测概率
    - 6: 中等探测概率
    - 5: 中等偏高探测概率
    - 4: 高探测概率
    - 3: 很高探测概率
    - 2: 极高探测概率
    - 1: 几乎确定能探测

    # 行动优先级 (AP) 逻辑
    - **H (高优先级)**: S ≥ 8 或 O ≥ 8 或 D ≥ 8
    - **M (中优先级)**: S = 6-7 或 O = 6-7 或 D = 6-7
    - **L (低优先级)**: S ≤ 5 且 O ≤ 5 且 D ≤ 5

    # 输出格式（严格的JSON）
    请**仅返回**有效的JSON对象，不要包含任何其他文本、markdown标记或解释：

    \`\`\`json
    {
      "title": "项目名称（中文）",
      "rows": [
        {
          "s2_item": "系统/项目名称",
          "s2_step": "步骤名称",
          "s2_element": "元素名称",
          "s3_func_item": "功能项目",
          "s3_func_step": "功能步骤",
          "s3_func_element": "功能元素",
          "s4_effect": "故障影响（详细描述）",
          "s4_severity": 9,
          "s4_mode": "故障模式（具体描述）",
          "s4_cause": "故障原因（根本原因分析）",
          "s5_prev_control": "预防控制（现有措施）",
          "s5_occurrence": 7,
          "s5_det_control": "探测控制（现有检测方法）",
          "s5_detection": 6,
          "s5_ap": "H",
          "s6_prev_action": "预防措施（针对高风险必须填写）",
          "s6_det_action": "探测措施（针对高风险必须填写）",
          "s6_resp_person": "负责人",
          "s6_target_date": "2025-02-15",
          "s6_status": "Open",
          "remarks": "备注说明"
        }
      ]
    }
    \`\`\`

    # 质量要求（严格执行）
    1. **生成8-12个全面的失效模式**
    2. **每个失效模式必须包含**:
       - 详细的故障原因（至少2-3个）
       - 清晰的故障影响
       - 具体的预防和探测控制
       - 准确的S/O/D评分（1-10）
       - 正确的AP优先级（H/M/L）
    3. **对于高优先级（H）的项目，必须提供**:
       - 具体的预防措施（s6_prev_action）
       - 具体的探测措施（s6_det_action）
       - 明确的负责人（s6_resp_person）
       - 合理的目标日期（s6_target_date）
    4. **所有评分必须符合AIAG-VDA标准**
    5. **所有内容必须用中文书写**
    6. **不要省略任何字段**
    7. **日期格式必须是YYYY-MM-DD**

    # 产品描述
    ${isDfmea ? '这是一个设计FMEA（DFMEA），请关注产品设计相关的失效模式。' : '这是一个过程FMEA（PFMEA），请关注制造过程相关的失效模式。'}
  `;
};

/**
 * 直接调用智谱 AI (GLM) API
 */
const callZhipuAI = async (messages: any[], settings: AiSettings) => {
  const endpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

  const requestBody = {
    model: settings.modelName || 'glm-4-plus',
    messages: messages.map(msg => ({
      role: msg.role === 'system' ? 'system' : msg.role,
      content: msg.content
    })),
    temperature: settings.temperature || 0.7,
    max_tokens: settings.maxTokens || 8192
  };

  console.log('📤 发送请求到智谱AI:', endpoint);
  console.log('📦 请求体:', JSON.stringify(requestBody, null, 2));
  console.log('🔑 API Key (前10位):', settings.apiKey?.substring(0, 10) + '...');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  console.log('📥 响应状态:', response.status, response.statusText);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error('❌ 智谱AI API错误详情:', errorData);
    throw new Error(`智谱AI API错误 (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log('✅ 智谱AI响应成功，数据:', data);

  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    model: data.model
  };
};

/**
 * 直接调用硅基流动 API
 */
const callSiliconFlow = async (messages: any[], settings: AiSettings) => {
  const endpoint = 'https://api.siliconflow.cn/v1/chat/completions';

  const requestBody = {
    model: settings.modelName || 'Qwen/Qwen2.5-72B-Instruct',
    messages: messages,
    temperature: settings.temperature || 0.7,
    max_tokens: settings.maxTokens || 8192
  };

  console.log('📤 发送请求到硅基流动:', endpoint);
  console.log('📦 请求体:', JSON.stringify(requestBody, null, 2));
  console.log('🔑 API Key (前10位):', settings.apiKey?.substring(0, 10) + '...');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  console.log('📥 响应状态:', response.status, response.statusText);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error('❌ 硅基流动API错误详情:', errorData);
    throw new Error(`硅基流动API错误 (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log('✅ 硅基流动响应成功，数据:', data);

  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    model: data.model
  };
};

/**
 * 直接调用 DeepSeek API
 */
const callDeepSeek = async (messages: any[], settings: AiSettings) => {
  const endpoint = 'https://api.deepseek.com/v1/chat/completions';

  const requestBody = {
    model: settings.modelName || 'deepseek-chat',
    messages: messages,
    temperature: settings.temperature || 0.7,
    max_tokens: settings.maxTokens || 8192
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`DeepSeek API错误 (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    model: data.model
  };
};

/**
 * 直接调用 Google Gemini API
 */
const callGemini = async (messages: any[], settings: AiSettings) => {
  const modelName = settings.modelName || 'gemini-2.0-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${settings.apiKey}`;

  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const requestBody = {
    contents: userMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })),
    systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
    generationConfig: {
      temperature: settings.temperature || 0.7,
      maxOutputTokens: settings.maxTokens || 8192
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Gemini API错误 (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();

  return {
    content: data.candidates[0].content.parts[0].text,
    usage: data.usageMetadata,
    model: modelName
  };
};

/**
 * 直接调用 Anthropic Claude API
 */
const callClaude = async (messages: any[], settings: AiSettings) => {
  const endpoint = 'https://api.anthropic.com/v1/messages';

  const systemMessage = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const requestBody = {
    model: settings.modelName || 'claude-3-5-sonnet-20241022',
    max_tokens: settings.maxTokens || 8192,
    system: systemMessage ? systemMessage.content : undefined,
    messages: chatMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    temperature: settings.temperature || 0.7
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Claude API错误 (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();

  return {
    content: data.content[0].text,
    usage: data.usage,
    model: data.model
  };
};

/**
 * 直接调用火山引擎豆包 API
 */
const callDoubao = async (messages: any[], settings: AiSettings) => {
  const endpoint = `${settings.baseUrl || 'https://ark.cn-beijing.volces.com/api/v3'}/chat/completions`;

  const requestBody = {
    model: settings.modelName || 'doubao-pro-32k',
    messages: messages,
    temperature: settings.temperature || 0.7,
    max_tokens: settings.maxTokens || 8192
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`豆包 API错误 (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    model: data.model
  };
};

/**
 * 前端直接调用 AI 服务生成 FMEA 分析
 */
export const generateFmeaAnalysisDirect = async (request: GenerationRequest): Promise<FmeaAnalysisResult> => {
  const provider = request.settings?.provider || AiProvider.GEMINI;
  const settings = request.settings;

  if (!settings || !settings.apiKey) {
    throw new Error('请先在设置中配置 API 密钥');
  }

  const systemInstruction = getSystemInstruction(request.type);

  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: request.textContext }
  ];

  let result;

  try {
    switch (provider) {
      case AiProvider.GEMINI:
        result = await callGemini(messages, settings);
        break;

      case AiProvider.CLAUDE:
        result = await callClaude(messages, settings);
        break;

      case AiProvider.DOUBAO:
        result = await callDoubao(messages, settings);
        break;

      case AiProvider.ZHIPU:
        result = await callZhipuAI(messages, settings);
        break;

      case AiProvider.SILICONFLOW:
        result = await callSiliconFlow(messages, settings);
        break;

      case AiProvider.DEEPSEEK:
        result = await callDeepSeek(messages, settings);
        break;

      default:
        throw new Error(`暂不支持直接调用 ${provider}`);
    }

    if (!result || !result.content) {
      throw new Error('AI 返回空响应');
    }

    const jsonResult = cleanAndParseJson(result.content);

    const rowsWithIds = (jsonResult.rows || []).map((row: any, index: number) => ({
      ...row,
      id: `row-${Date.now()}-${index}`,
    }));

    return {
      title: jsonResult.title || `${request.type} Analysis`,
      type: request.type,
      rows: rowsWithIds,
    };

  } catch (error) {
    console.error('FMEA Generation Error:', error);
    throw error;
  }
};

/**
 * 前端直接调用 AI 服务更新 FMEA（聊天模式）
 */
export const updateFmeaViaChatDirect = async (
  currentFmea: FmeaAnalysisResult,
  userMessage: string,
  settings: AiSettings
): Promise<{ text: string; updatedFmea?: FmeaAnalysisResult }> => {
  const systemInstruction = `
    You are an FMEA expert helping to modify an existing FMEA analysis.

    Current FMEA Data:
    ${JSON.stringify(currentFmea, null, 2)}

    User Request: ${userMessage}

    Instructions:
    - Analyze the user's request carefully
    - If they want to modify data, provide the updated JSON in a code block
    - If they have questions, provide helpful answers
    - Be concise and specific
    - Follow the same JSON structure as the original FMEA
  `;

  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: userMessage }
  ];

  if (!settings.apiKey) {
    throw new Error('请先在设置中配置 API 密钥');
  }

  let result;

  try {
    switch (settings.provider) {
      case AiProvider.GEMINI:
        result = await callGemini(messages, settings);
        break;

      case AiProvider.CLAUDE:
        result = await callClaude(messages, settings);
        break;

      case AiProvider.DOUBAO:
        result = await callDoubao(messages, settings);
        break;

      case AiProvider.ZHIPU:
        result = await callZhipuAI(messages, settings);
        break;

      case AiProvider.SILICONFLOW:
        result = await callSiliconFlow(messages, settings);
        break;

      case AiProvider.DEEPSEEK:
        result = await callDeepSeek(messages, settings);
        break;

      default:
        throw new Error(`暂不支持直接调用 ${settings.provider}`);
    }

    const responseText = result.content;

    const jsonMatch = responseText.match(/```json([\s\S]*?)```/);
    let updatedFmea: FmeaAnalysisResult | undefined;
    let replyText = responseText;

    if (jsonMatch) {
      try {
        const rawJson = jsonMatch[1].trim();
        const parsed = cleanAndParseJson(rawJson);

        if (parsed.rows && Array.isArray(parsed.rows)) {
          updatedFmea = {
            title: parsed.title || currentFmea.title,
            type: currentFmea.type,
            rows: parsed.rows
          };
          replyText = responseText.replace(/```json[\s\S]*?```/, "").trim();
          if (!replyText) replyText = "已根据您的要求更新了报表。";
        }
      } catch (e) {
        console.error("Failed to parse JSON from chat response", e);
        replyText += "\n\n(AI 尝试修改数据，但在解析返回的 JSON 时出错。)";
      }
    }

    return { text: replyText, updatedFmea };

  } catch (error) {
    console.error("Chat Error", error);
    throw error;
  }
};
