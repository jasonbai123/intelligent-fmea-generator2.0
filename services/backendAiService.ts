import { FmeaType, FmeaAnalysisResult, GenerationRequest, AiProvider, AiSettings } from '../types';
import { API_ENDPOINTS } from '../config/api';

// 导入前端直接调用服务（用于绕过后端）
import { generateFmeaAnalysisDirect as generateDirect } from './frontendAiService';
import { updateFmeaViaChatDirect as updateDirect } from './frontendAiService';

// Temporarily disabled Google Generative AI import due to compatibility issues
// import { GoogleGenerativeAI } from '@google/genai';

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
 * 前端直接调用 Gemini API（使用前端配置的 API KEY）
 * TEMPORARILY DISABLED - Using mock response instead
 */
const generateWithGeminiDirect = async (
  messages: any[],
  request: GenerationRequest
): Promise<FmeaAnalysisResult> => {
  // TODO: Fix Google Generative AI import issue
  // For now, returning a mock response

  const mockResponse: FmeaAnalysisResult = {
    title: request.type === FmeaType.DFMEA ? '设计FMEA分析 (演示)' : '过程FMEA分析 (演示)',
    type: request.type,
    rows: [
      {
        id: `row-${Date.now()}-0`,
        s2_item: '系统',
        s2_step: '电池包',
        s2_element: '电池模块',
        s3_func_item: '提供动力',
        s3_func_step: '存储能量',
        s3_func_element: '输出电压',
        s4_effect: '车辆无法启动',
        s4_severity: 9,
        s4_mode: '电池过热',
        s4_cause: '冷却系统故障',
        s5_prev_control: '温度传感器监控',
        s5_occurrence: 7,
        s5_det_control: '热敏电阻',
        s5_detection: 6,
        s5_ap: 'H',
        s6_prev_action: '增加冷却系统冗余',
        s6_det_action: '增加温度报警',
        s6_resp_person: '张工程师',
        s6_target_date: '2025-02-15',
        s6_status: 'Open',
        remarks: '示例数据 - 请使用后端AI服务'
      }
    ]
  };

  return mockResponse;
};

/**
 * 前端直接调用 Gemini API（用于聊天更新）
 * TEMPORARILY DISABLED
 */
const updateFmeaViaChatGemini = async (
  currentFmea: FmeaAnalysisResult,
  messages: any[],
  settings: AiSettings
): Promise<{ text: string; updatedFmea?: FmeaAnalysisResult }> => {
  // TODO: Implement with fixed Google Generative AI import
  return {
    text: 'AI聊天功能暂时禁用。请使用后端AI服务。'
  };
};

export const generateFmeaAnalysis = async (request: GenerationRequest): Promise<FmeaAnalysisResult> => {
  const provider = request.settings?.provider || AiProvider.GEMINI;
  const systemInstruction = getSystemInstruction(request.type);

  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: request.textContext }
  ];

  // Gemini 使用前端直接调用（使用前端配置的 API KEY）
  if (provider === AiProvider.GEMINI && request.settings?.apiKey) {
    return generateWithGeminiDirect(messages, request);
  }

  // 前端直连模式：支持智谱AI、硅基流动、DeepSeek等（如果提供了API Key）
  if (request.settings?.apiKey &&
      (provider === AiProvider.ZHIPU ||
       provider === AiProvider.SILICONFLOW ||
       provider === AiProvider.DEEPSEEK)) {
    try {
      console.log(`🔵 使用前端直连模式: ${provider}`);
      console.log('API Key:', request.settings.apiKey ? '已配置 (长度: ' + request.settings.apiKey.length + ')' : '未配置');
      console.log('模型:', request.settings?.modelName);
      const result = await generateDirect(request);
      console.log('✅ 前端直连成功');
      return result;
    } catch (directError) {
      console.error('❌ 前端直连失败，详细错误:', directError);
      console.error('错误类型:', directError.constructor.name);
      console.error('错误消息:', directError.message);
      console.error('错误堆栈:', directError.stack);

      // 显示用户友好的错误提示
      const errorMessage = `前端直连${provider}失败：\n\n${directError.message}\n\n请检查：\n1. API Key是否正确\n2. 网络连接是否正常\n3. 浏览器控制台(F12)查看详细错误\n\n错误详情已输出到控制台`;
      alert(errorMessage);

      // 不继续尝试后端代理，直接抛出错误让用户知道具体问题
      throw directError;
    }
  }

  // 其他服务商使用后端代理（使用后端环境变量中的 KEY）
  try {
    const response = await fetch(API_ENDPOINTS.ai.chat(provider), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature: request.settings?.temperature || 0.7,
        max_tokens: request.settings?.maxTokens || 8192,
        model: request.settings?.modelName
        // 不再传递 apiKey，让后端使用自己的环境变量
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      throw new Error(`AI API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    let jsonText = '';

    if (data.choices && data.choices[0] && data.choices[0].message) {
      jsonText = data.choices[0].message.content;
    } else if (data.content && data.content[0] && data.content[0].text) {
      jsonText = data.content[0].text;
    } else if (typeof data === 'string') {
      jsonText = data;
    } else {
      console.error('Unexpected response format:', data);
      throw new Error('Unexpected response format from AI API');
    }

    if (!jsonText) {
      throw new Error('Empty response from AI');
    }

    const jsonResult = cleanAndParseJson(jsonText);

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

export const updateFmeaViaChat = async (
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

  // Gemini 使用前端直接调用（使用前端配置的 API KEY）
  if (settings.provider === AiProvider.GEMINI && settings.apiKey) {
    return updateFmeaViaChatGemini(currentFmea, messages, settings);
  }

  // 前端直连模式：支持智谱AI、硅基流动、DeepSeek等（如果提供了API Key）
  if (settings.apiKey &&
      (settings.provider === AiProvider.ZHIPU ||
       settings.provider === AiProvider.SILICONFLOW ||
       settings.provider === AiProvider.DEEPSEEK)) {
    try {
      return await updateDirect(currentFmea, userMessage, settings);
    } catch (directError) {
      console.warn('前端直连失败，尝试使用后端代理:', directError);
      // 继续尝试后端代理
    }
  }

  // 其他服务商使用后端代理（使用后端环境变量中的 KEY）
  try {
    const response = await fetch(API_ENDPOINTS.ai.chat(settings.provider), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature: 0.7,
        max_tokens: 4096,
        model: settings.modelName
        // 不再传递 apiKey，让后端使用自己的环境变量
      })
    });

    if (!response.ok) {
      throw new Error(`AI API Error: ${response.status}`);
    }

    const data = await response.json();

    let responseText = '';

    if (data.choices && data.choices[0] && data.choices[0].message) {
      responseText = data.choices[0].message.content;
    } else if (data.content && data.content[0] && data.content[0].text) {
      responseText = data.content[0].text;
    } else if (typeof data === 'string') {
      responseText = data;
    }

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
