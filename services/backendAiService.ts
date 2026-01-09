import { FmeaType, FmeaAnalysisResult, GenerationRequest, AiProvider, AiSettings } from '../types';
import { API_ENDPOINTS } from '../config/api';

const getSystemInstruction = (type: FmeaType) => {
  const isDfmea = type === FmeaType.DFMEA;
  const standardName = isDfmea ? "DFMEA Criteria (AIAG & VDA 1st Edition)" : "PFMEA Criteria (AIAG & VDA 1st Edition)";
  
  return `
    Role: You are a **Senior Principal Quality Engineer & FMEA Master** (AIAG-VDA Certified).
    
    Task: Generate a **Deep, Technical, and Exhaustive** ${type} report in strict JSON format.
    
    ================================================================
    *** SCORING & AP LOGIC (CRITICAL - STRICT COMPLIANCE) ***
    ================================================================
    You MUST apply the **${standardName}** for all scoring:
    
    - **Severity (S)**: 1-10 scale. 10 = Most Severe (Safety/Regulatory Non-Compliance). 1 = Minor.
    - **Occurrence (O)**: 1-10 scale. 10 = Very High (Almost Certain). 1 = Very Low (Almost Impossible).
    - **Detection (D)**: 1-10 scale. 10 = Very Low (Almost Certain to Miss). 1 = Very High (Almost Certain to Detect).
    
    **AP (Action Priority) Logic:**
    - **High Priority**: S ≥ 8 OR O ≥ 8 OR D ≥ 8
    - Medium Priority: S = 6-7 OR O = 6-7 OR D = 6-7
    - Low Priority: S ≤ 5 AND O ≤ 5 AND D ≤ 5
    
    ================================================================
    *** OUTPUT FORMAT (STRICT JSON) ***
    ================================================================
    Return ONLY a valid JSON object with this structure:
    {
      "title": "Project Name",
      "rows": [
        {
          "s2_item": "Item",
          "s2_step": "Step",
          "s2_element": "Element",
          "s3_func_item": "Function Item",
          "s3_func_step": "Function Step",
          "s3_func_element": "Function Element",
          "s4_effect": "Failure Effect",
          "s4_severity": 9,
          "s4_mode": "Failure Mode",
          "s4_cause": "Failure Cause",
          "s5_prev_control": "Prevention Control",
          "s5_occurrence": 7,
          "s5_det_control": "Detection Control",
          "s5_detection": 6,
          "s5_ap": "H",
          "s6_prev_action": "Preventive Action",
          "s6_det_action": "Detective Action",
          "s6_resp_person": "Responsible Person",
          "s6_target_date": "2024-01-01",
          "s6_status": "Open",
          "remarks": "Additional notes"
        }
      ]
    }
    
    ================================================================
    *** QUALITY REQUIREMENTS ***
    ================================================================
    1. Generate at least 8-12 comprehensive failure modes
    2. Each failure mode must have detailed causes and effects
    3. Controls must be specific and actionable
    4. Scores must be realistic and justified
    5. AP calculation must be accurate based on S/O/D scores
    6. Include preventive and detective actions for high AP items
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

export const generateFmeaAnalysis = async (request: GenerationRequest): Promise<FmeaAnalysisResult> => {
  const provider = request.settings?.provider || AiProvider.GEMINI;
  const systemInstruction = getSystemInstruction(request.type);
  
  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: request.textContext }
  ];

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
        model: request.settings?.modelName,
        apiKey: request.settings?.apiKey // 将前端的API KEY传递给后端
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
        model: settings.modelName,
        apiKey: settings.apiKey // 将前端的API KEY传递给后端
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