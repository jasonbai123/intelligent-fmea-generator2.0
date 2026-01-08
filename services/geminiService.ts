import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FmeaType, FmeaAnalysisResult, GenerationRequest, AiProvider, ChatMessage, ChatRole, AiSettings } from "../types";

// FMEA Response Schema Definition (Unified for all providers)
// Note: For OpenAI providers, this will be passed as a JSON schema or instructions
const fmeaSchemaStructure = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Name of the project" },
    rows: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          s2_item: { type: Type.STRING }, s2_step: { type: Type.STRING }, s2_element: { type: Type.STRING },
          s3_func_item: { type: Type.STRING }, s3_func_step: { type: Type.STRING }, s3_func_element: { type: Type.STRING },
          s4_effect: { type: Type.STRING }, s4_severity: { type: Type.INTEGER }, s4_mode: { type: Type.STRING }, s4_cause: { type: Type.STRING },
          s5_prev_control: { type: Type.STRING }, s5_occurrence: { type: Type.INTEGER }, s5_det_control: { type: Type.STRING }, s5_detection: { type: Type.INTEGER }, s5_ap: { type: Type.STRING },
          s6_prev_action: { type: Type.STRING }, s6_det_action: { type: Type.STRING }, s6_resp_person: { type: Type.STRING }, s6_target_date: { type: Type.STRING },
          s6_status: { type: Type.STRING }, s6_action_taken: { type: Type.STRING }, s6_completion_date: { type: Type.STRING },
          s6_severity_new: { type: Type.INTEGER }, s6_occurrence_new: { type: Type.INTEGER }, s6_detection_new: { type: Type.INTEGER }, s6_ap_new: { type: Type.STRING },
          remarks: { type: Type.STRING },
        },
        // Updated required fields: Explicitly require ALL Step 2 & Step 3 fields to prevent empty columns
        required: [
          "s2_item", "s2_step", "s2_element",
          "s3_func_item", "s3_func_step", "s3_func_element",
          "s4_effect", "s4_severity", "s4_mode", "s4_cause",
          "s5_occurrence", "s5_detection", "s5_ap",
          "s6_status"
        ]
      },
    },
  },
  required: ["title", "rows"],
};

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
    
    1. **S / O / D Scores (Integers 1-10)**:
       - **Severity (S)**: Assess impact on end user/plant. (10=Safety/Regulatory, 1=No effect).
       - **Occurrence (O)**: Assess cause probability. (10=Extremely high, 1=Prevented).
       - **Detection (D)**: Assess detection maturity. (10=No detection, 1=Proven).

    2. **AP (Action Priority) - MUST BE "H", "M", or "L"**:
       - **FORMAT RULE**: The 's5_ap' and 's6_ap_new' fields MUST be a single letter: "H", "M", or "L".
       - **FORBIDDEN**: Do NOT output numbers (e.g., 3, 5). Do NOT output words (e.g., "High").
       - **LOGIC TABLE (AIAG & VDA 1st Ed)**:
         - **H (High Priority)**: 
            - S=9-10 AND (O+D are moderate/high).
            - S=7-8 AND (O is high OR D is high).
         - **M (Medium Priority)**:
            - S=9-10 AND (O+D are low).
            - S=4-6 AND (O is high).
         - **L (Low Priority)**:
            - S=1-3 (Usually L regardless of O/D).
            - S=4-10 AND (O is low AND D is low).
       - *Self-Correction*: If you assign S=10, O=10, D=10, AP MUST be "H". If S=2, AP MUST be "L".

    ================================================================
    *** DATA CONTENT REQUIREMENTS (CRITICAL) ***
    ================================================================

    1. **NO GENERIC FLUFF**: 
       - FORBIDDEN: "Broken", "Doesn't work", "Operator mistake", "Bad quality".
       - REQUIRED: "Fatigue fracture due to stress concentration", "Torque < 5Nm due to air pressure drop".
    
    2. **STRICT LOGIC CHAIN (The "Golden Circle"):**
       - **${isDfmea ? 'S4 Cause (Design Deficiency)' : 'S4 Cause (Process Variable)'}** -> LEADS TO -> **S4 Mode (Product Non-Conformance)** -> LEADS TO -> **S4 Effect (Impact on End User/Plant)**.

    ${!isDfmea ? `
    3. **PFMEA SPECIFIC STRUCTURE (MANDATORY FOR STEP 3 & 4):**
       - **s3_func_item (Function of Process Item)**: You MUST describe functions at three levels using this exact format:
         *Format*: "工厂内部: [Internal Function]\\n下游工厂: [Ship-to Function]\\n最终用户: [Vehicle Function]"
         *Example*: "工厂内部: 将轴安装至壳体\\n下游工厂: 将电机安装至车门\\n最终用户: 升降车窗"
       
       - **s4_effect (Failure Effects)**: You MUST describe effects at three levels using this exact format:
         *Format*: "工厂内部: [Internal Effect]\\n下游工厂: [Ship-to Effect]\\n最终用户: [End User Effect]"
         *Example*: "工厂内部: 无法安装，线停工\\n下游工厂: 无法装配到车门\\n最终用户: 车窗无法升降，丧失功能"
         
       - **s3_func_element (Function of Work Element)**: MUST describe the function of the 4M element (Machine/Man/etc.).
         *Example*: "机器: 提供恒定压力将轴承压入"
    ` : `
    3. **DFMEA SPECIFIC STRUCTURE:**
       - **s3_func_item**: Describe the high-level function of the System/Subsystem.
       - **s4_effect**: Describe the effect on the End User and Regulatory Compliance.
    `}

    4. **REALISTIC CONTROLS (Step 5):**
       - **Prevention (PC)**: Poka-Yoke, Guide pins, PLC Interlocks. (NOT just "Training").
       - **Detection (DC)**: Camera Vision (AOI), Torque Transducer, X-Ray. (NOT just "Visual Inspection").

    5. **STEP 2 & 3 COMPLETENESS:**
       - Ensure ALL columns in Step 2 and Step 3 are filled. Do not leave "Function of Work Element" or "Function of Process Item" blank.

    ================================================================
    *** OUTPUT FORMAT ***
    ================================================================
    1. **Language**: Professional Simplified Chinese (zh-CN) ONLY.
    2. **Format**: **STRICT RFC8259 JSON**. Keys double-quoted. NO trailing commas.
    3. **Quantity**: Provide **20+ highly detailed rows**.
  `;
};

// --- HELPER: ROBUST JSON PARSER ---
const cleanAndParseJson = (text: string) => {
  if (!text) throw new Error("Received empty response from AI");

  // 1. Initial cleanup
  let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
  cleanText = cleanText.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  // 2. Try Standard Parse
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // 3. Common Fix: Trailing Commas
    // Regex matches a comma followed by whitespace and then a closing brace or bracket
    let fixedText = cleanText.replace(/,(\s*[}\]])/g, '$1');

    try {
      return JSON.parse(fixedText);
    } catch (e2) {
      // 4. Backtrack Recovery Strategy (Handle Truncation)
      // If the JSON is truncated, it likely ends abruptly. We try to find the last valid object closure.
      console.warn("JSON parse failed, attempting backtrack recovery for truncated data...");

      // Find where "rows" starts
      const rowsMatch = fixedText.match(/"rows"\s*:\s*\[/);
      if (!rowsMatch || rowsMatch.index === undefined) {
           throw new Error(`AI Response Structure Error: Could not find 'rows' array. Response: ${fixedText.substring(0, 100)}...`);
      }
      
      const arrayStartIndex = rowsMatch.index + rowsMatch[0].length;
      
      // Collect all '}' indices after the array start
      // These are potential end points for the last valid row
      const closingBraces: number[] = [];
      for (let i = arrayStartIndex; i < fixedText.length; i++) {
          if (fixedText[i] === '}') closingBraces.push(i);
      }
      
      // Try recovering from the last valid object backwards
      // We try the last 50 closing braces to be safe (in case of many small objects)
      const candidates = closingBraces.reverse().slice(0, 50);
      
      for (const braceIndex of candidates) {
          // Construct a hypothetical valid JSON string
          // We take everything up to this brace, then close the array and the root object
          // Syntax: { "title": "...", "rows": [ {obj}, {obj} ] }
          const attemptJson = fixedText.substring(0, braceIndex + 1) + "]}";
          
          try {
              // formatting fix for the attempt (just in case we introduced a trailing comma before the ]})
              const finalAttempt = attemptJson.replace(/,(\s*[}\]])/g, '$1');
              const data = JSON.parse(finalAttempt);
              
              if (data.rows && Array.isArray(data.rows) && data.rows.length > 0) {
                   data.title = (data.title || "Analysis") + " (Recovered/Truncated)";
                   console.log(`Successfully recovered ${data.rows.length} rows using backtrack strategy.`);
                   return data;
              }
          } catch (err) {
              // invalid attempt, continue to previous brace
          }
      }

      // If recovery fails, throw original error with context
      const snippet = fixedText.substring(Math.max(0, fixedText.length - 200));
      throw new Error(`AI 返回的数据格式有误，且无法自动修复 (JSON Parse Error)。\n可能原因：生成内容过长导致截断位置特殊。\n结尾片段: ...${snippet}`);
    }
  }
};

// --- GEMINI IMPLEMENTATION ---
const generateWithGemini = async (request: GenerationRequest, apiKey?: string, model?: string) => {
  // Use provided key or fallback to env
  const finalApiKey = apiKey || process.env.API_KEY;
  if (!finalApiKey) throw new Error("API Key for Gemini is missing.");

  const ai = new GoogleGenAI({ apiKey: finalApiKey });
  const modelName = model || "gemini-2.0-flash";

  const systemInstruction = getSystemInstruction(request.type);
  
  const parts: any[] = [{ text: request.textContext }];
  if (request.imageBase64 && request.mimeType) {
    parts.push({
      inlineData: {
        data: request.imageBase64,
        mimeType: request.mimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts: parts },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: fmeaSchemaStructure as Schema, // Cast for compatibility
      temperature: 0.6, // Slightly increased for more varied "causes" but kept constrained by system prompt
      maxOutputTokens: 8192,
    },
  });

  return response.text;
};

// --- ANTHROPIC IMPLEMENTATION (Claude) ---
const generateWithAnthropic = async (request: GenerationRequest) => {
  const settings = request.settings;
  if (!settings?.apiKey) throw new Error(`Claude API Key is required.`);
  if (!settings?.baseUrl) throw new Error(`Claude Base URL is required.`);

  const systemInstruction = getSystemInstruction(request.type) + `
    \n\nIMPORTANT: You must return PURE JSON. Do not include markdown code blocks.
    The response should start with { and end with }.
  `;

  const messages: any[] = [
    { 
      role: "user", 
      content: [] 
    }
  ];

  // Add text content
  messages[0].content.push({ type: "text", text: request.textContext });

  // Add image content if available
  if (request.imageBase64 && request.mimeType) {
    messages[0].content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: request.mimeType,
        data: request.imageBase64,
      }
    });
  }

  const endpoint = settings.baseUrl.endsWith('/messages') ? settings.baseUrl : `${settings.baseUrl}/messages`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-api-key": settings.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "dangerously-allow-browser": "true" // Required for some proxies, though official API blocks CORS
      },
      body: JSON.stringify({
        model: settings.modelName,
        max_tokens: 8192,
        system: systemInstruction,
        messages: messages,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API Request Failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract text from content array
    const contentBlock = data.content?.find((c: any) => c.type === 'text');
    return contentBlock?.text || "{}";

  } catch (e: any) {
    console.error("Anthropic API Error:", e);
    throw e;
  }
};

// --- OPENAI COMPATIBLE IMPLEMENTATION (DeepSeek, Zhipu, SiliconFlow, Doubao) ---
const generateWithOpenAICompatible = async (request: GenerationRequest, provider: AiProvider) => {
  const settings = request.settings;
  if (!settings?.apiKey) throw new Error(`${provider} API Key is required.`);
  if (!settings?.baseUrl) throw new Error(`${provider} Base URL is required.`);

  const systemInstruction = getSystemInstruction(request.type) + `
    \n\nIMPORTANT: You must return PURE JSON matching this structure:
    {
      "title": "string",
      "rows": [ { ...FMEA Row Fields... } ]
    }
    Do not include markdown code blocks (like \`\`\`json). Just the JSON string.
    Ensure keys are double-quoted. No trailing commas.
    Ensure you generate a MASSIVE amount of rows (50+) by being extremely detailed.
  `;

  const messages: any[] = [
    { role: "system", content: systemInstruction },
    { role: "user", content: request.textContext }
  ];

  // Note: Most standard OpenAI-compatible endpoints strictly accept text in 'content'.
  // Multimodal support varies. For simplicity in this implementation, if an image is present,
  // we add a text note. Real multimodal support for Zhipu/DeepSeek would require specific payload adjustments.
  if (request.imageBase64) {
    messages[1].content += "\n\n[Note: User provided an image input, but strictly text-based analysis is performed for this provider.]";
  }

  try {
    // Handle path cleaning for BaseURL
    let baseUrl = settings.baseUrl.replace(/\/$/, "");
    if (!baseUrl.endsWith("/v1") && !baseUrl.includes("/api/")) {
       // Heuristic: Append /v1 if it looks like a root domain, unless it's a specific known pattern
    }
    // Specific fix for some providers if needed, otherwise assume user provided correct base
    const endpoint = `${baseUrl}/chat/completions`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.modelName,
        messages: messages,
        temperature: 0.5,
        max_tokens: 8192,
        stream: false,
        response_format: { type: "json_object" } // Supported by DeepSeek-V3, GLM-4, etc.
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "{}";

  } catch (e: any) {
    // If json_object is not supported by a specific model, fallback logic might be needed, 
    // but most target providers (DeepSeek V3, GLM-4) support it.
    console.error("OpenAI Compatible API Error:", e);
    throw e;
  }
};

// --- CHAT WITH FMEA IMPLEMENTATION ---
export const updateFmeaViaChat = async (
  currentFmea: FmeaAnalysisResult,
  userMessage: string,
  settings: AiSettings
): Promise<{ text: string, updatedFmea?: FmeaAnalysisResult }> => {
  
  // Construct a prompt that includes the current data
  const systemInstruction = `
    You are an intelligent FMEA Assistant. You are currently viewing a JSON-based FMEA report.
    
    Current Report Title: "${currentFmea.title}"
    Current Type: ${currentFmea.type}
    Current Data (JSON):
    ${JSON.stringify(currentFmea)}

    **User Request:** "${userMessage}"

    **Task:**
    1. Analyze the user's request.
    2. If the user wants to **MODIFY** the report:
       - You MUST return the **ENTIRE UPDATED JSON** object.
       - Support: Adding rows, deleting rows, modifying text/scores.
       - **Adding Columns:** If the user wants to add a column (e.g. "Add a column for 'Cost'"), simply add a new key-value pair (e.g., "cost": "...") to the row objects in the JSON. The frontend will automatically detect and render new keys as columns.
       - **CRITICAL**: When updating scores, ensure 's5_ap' and 's6_ap_new' remain "H", "M", or "L" according to AIAG-VDA logic.
       - Wrap the JSON in \`\`\`json ... \`\`\` code blocks.
       - Ensure the structure matches the original schema, but feel free to add new keys if requested.
       - Do not summarize the rest of the data; keep existing rows unless asked to delete.
    
    3. If the user just has a **QUESTION** (e.g., "Explain why this severity is 10"), just answer in plain text. Do NOT return JSON.

    4. **Response Format:**
       - If modifying: Provide a brief explanation of what you changed, followed by the \`\`\`json ... \`\`\` block.
       - If answering: Just provide the text answer.
  `;

  // We use the same generation function logic but with a specific prompt context
  // For simplicity, we reuse 'generateWithGemini' style logic but adapt it here for chat.
  // We'll treat it as a single turn generation for now to ensure we inject the full JSON state context every time.
  
  try {
    let responseText = "";
    
    // Choose provider (using the simplified provider logic from above)
    // NOTE: Reusing the same connection logic as 'generateFmeaAnalysis' but with new prompt.
    // For brevity, we implement a direct call pattern here or reuse the internal helpers if we refactored.
    // Since we didn't refactor helpers to be public, we duplicate the call logic slightly or use a generic 'chat' wrapper.
    
    // Use the generic logic based on provider
    const requestPayload: GenerationRequest = {
        type: currentFmea.type,
        textContext: systemInstruction, // We pass the whole instruction as context
        settings: settings
    };

    // We can't reuse generateFmeaAnalysis because it enforces JSON output via schema.
    // We need a free-form response that MIGHT contain JSON.
    
    if (settings.provider === AiProvider.GEMINI) {
        const ai = new GoogleGenAI({ apiKey: settings.apiKey || process.env.API_KEY || "" });
        // Fixed: Use ai.models.generateContent instead of getGenerativeModel
        const response = await ai.models.generateContent({
            model: settings.modelName || "gemini-2.0-flash",
            contents: systemInstruction
        });
        // Fixed: Use response.text
        responseText = response.text || "";
    } else {
        // Fallback to OpenAI compatible for others
         // Construct standard messages
        const messages = [{ role: "user", content: systemInstruction }];
        
        let baseUrl = settings.baseUrl.replace(/\/$/, "");
        if (!baseUrl.endsWith("/v1") && !baseUrl.includes("/api/")) {
             // Heuristic fix
        }
        const endpoint = `${baseUrl}/chat/completions`;
        
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${settings.apiKey}` },
            body: JSON.stringify({
                model: settings.modelName,
                messages: messages,
                temperature: 0.5,
                max_tokens: 8192,
                stream: false
            })
        });
        const data = await response.json();
        responseText = data.choices?.[0]?.message?.content || "";
    }

    // Parse Response
    // Check for JSON block
    const jsonMatch = responseText.match(/```json([\s\S]*?)```/);
    let updatedFmea: FmeaAnalysisResult | undefined;
    let replyText = responseText;

    if (jsonMatch) {
        try {
            const rawJson = jsonMatch[1].trim();
            // Use our robust parser
            const parsed = cleanAndParseJson(rawJson);
            
            // Validate minimal structure
            if (parsed.rows && Array.isArray(parsed.rows)) {
                updatedFmea = {
                    title: parsed.title || currentFmea.title,
                    type: currentFmea.type,
                    rows: parsed.rows
                };
                // Remove the JSON from the text shown to user to keep it clean
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

export const generateFmeaAnalysis = async (request: GenerationRequest): Promise<FmeaAnalysisResult> => {
  const provider = request.settings?.provider || AiProvider.GEMINI;
  let jsonText: string | undefined = "";

  console.log(`Generating FMEA using provider: ${provider}`);

  try {
    if (provider === AiProvider.GEMINI) {
      jsonText = await generateWithGemini(request, request.settings?.apiKey, request.settings?.modelName);
    } else if (provider === AiProvider.CLAUDE) {
      jsonText = await generateWithAnthropic(request);
    } else {
      jsonText = await generateWithOpenAICompatible(request, provider);
    }

    if (!jsonText) throw new Error("Empty response from AI.");

    // Use robust parser instead of simple parse
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
    console.error("FMEA Generation Error:", error);
    throw error;
  }
};