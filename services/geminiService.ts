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
  const standardName = isDfmea ? "DFMEA标准 (AIAG & VDA 第一版)" : "PFMEA标准 (AIAG & VDA 第一版)";

  return `
    # 角色定义
    你是一位资深的主任质量工程师和FMEA专家，拥有AIAG-VDA认证资格。

    # 任务目标
    生成一份**深度、专业且全面**的 ${type} 报告，严格遵循JSON格式。

    # 多语言支持说明
    本系统支持以下5种语言：
    - **中文（简体）** - 当前默认输出语言
    - **English** - 英文
    - **Deutsch** - 德文
    - **Русский** - 俄语
    - **Tiếng Việt** - 越南文

    **重要：当前输出必须使用简体中文（zh-CN）**

    ================================================================
    *** 评分与AP逻辑（关键 - 严格遵守）***
    ================================================================
    你必须应用 **${standardName}** 进行所有评分：

    1. **S / O / D 评分（整数 1-10）**：
       - **严重度（S）**：评估对最终用户/工厂的影响。（10=安全/法规不符，1=无影响）。
       - **频度（O）**：评估失效原因发生的概率。（10=极高，1=已预防）。
       - **探测度（D）**：评估探测成熟度。（10=无法探测，1=已验证）。

    2. **AP（措施优先级）- 必须是 "H"、"M" 或 "L"**：
       - **格式规则**：'s5_ap' 和 's6_ap_new' 字段必须是单个字母："H"、"M" 或 "L"。
       - **禁止事项**：不要输出数字（如 3、5）。不要输出单词（如 "High"）。
       - **逻辑表（AIAG & VDA 第一版）**：
         - **H（高优先级）**：
            - S=9-10 且（O+D为中/高）。
            - S=7-8 且（O为高 或 D为高）。
         - **M（中优先级）**：
            - S=9-10 且（O+D为低）。
            - S=4-6 且（O为高）。
         - **L（低优先级）**：
            - S=1-3（通常为L，无论O/D如何）。
            - S=4-10 且（O为低 且 D为低）。
       - **自检**：如果你指定 S=10, O=10, D=10，AP必须是"H"。如果S=2，AP必须是"L"。

    ================================================================
    *** 数据内容要求（关键）***
    ================================================================

    1. **禁止通用废话**：
       - 禁止使用："坏了"、"不工作"、"操作员失误"、"质量差"。
       - 必须使用："应力集中导致的疲劳断裂"、"气压下降导致扭矩<5Nm"。

    2. **严格逻辑链（"金三角"）**：
       - **${isDfmea ? 'S4 原因（设计缺陷）' : 'S4 原因（过程变量）'}** -> 导致 -> **S4 失效模式（产品不合格）** -> 导致 -> **S4 后果（对最终用户/工厂的影响）**。

    ${!isDfmea ? `
    3. **PFMEA 过程流程图结构（最关键 - 严格遵守）**：

       ⚠️ **必须按照制造过程流程图来生成数据！**

       PFMEA 必须反映实际的制造过程步骤，每个步骤对应流程图中的一个操作：

       **步骤2（过程项目）**：
       - **s2_item（项目）**：具体的零件/组件名称
       - **s2_step（过程步骤/操作）**：按照流程图顺序的制造工序
         *示例*："上料"、"定位夹紧"、"机械加工"、"检测"、"下料"
       - **s2_element（工作要素）**：该步骤中的具体操作要素

       **步骤3（功能要求）**：
       - **s3_func_item（过程项目功能）**：该工序对产品实现的功能，必须包含三个层次：
         *格式*："工厂内部: [本工序功能]\\n下游工厂: [对下工序的价值]\\n最终用户: [最终产品功能]"
         *示例*："工厂内部: 将轴承压入壳体至规定深度\\n下游工厂: 提供可装配的组件\\n最终用户: 确保车窗正常升降"

       - **s3_func_step（过程步骤功能）**：该操作步骤要达成的目标
         *示例*："提供稳定的压入力，确保轴承位置准确"

       - **s3_func_element（工作要素功能）**：4M要素（人机料法）的功能
         *示例*："机器: 液压机提供压力；工装: 夹具保证位置"

       **步骤4（失效信息）**：
       - **s4_effect（失效后果）**：必须包含三个层次
         *格式*："工厂内部: [本工序后果]\\n下游工厂: [影响下工序]\\n最终用户: [最终产品后果]"
         *示例*："工厂内部: 轴承位置偏移，需要返工\\n下游工厂: 无法装配，线体停工\\n最终用户: 车窗异响，功能失效"

       - **s4_mode（失效模式）**：该工序可能出现的产品缺陷
         *示例*："轴承压入深度不足"、"位置偏移"、"压入力过大"

       - **s4_cause（失效原因）**：导致缺陷的过程变量（4M）
         *示例*："气压不足（机器）"、"工装磨损（材料）"、"操作员失误（人员）"

       **步骤5（现行控制）**：
       - **s5_prev_control（现行预防控制）**：防止失效原因发生的措施
         *PFMEA重点*：防错装置、定期维护、工艺参数控制
       - **s5_det_control（现行探测控制）**：探测失效模式的方法
         *PFMEA重点*：在线检测、自动测量、统计过程控制

    ` : `
    3. **DFMEA 特定结构**：
       - **s2_item/s2_step/s2_element**：系统 → 子系统 → 组件
       - **s3_func_item**：描述系统/子系统的高层次功能
       - **s4_effect**：描述对最终用户和法规合规性的影响
    `}

    4. **真实控制措施（步骤5）**：
       - **预防（PC）**：防错（Poka-Yoke）、导向销、PLC互锁。（不能只是"培训"）。
       - **探测（DC）**：相机视觉（AOI）、扭矩传感器、X射线。（不能只是"目视检查"）。

    5. **步骤2和3完整性（强制要求）**：
       - 确保步骤2和步骤3的所有列都已填充。不要留空"工作要素功能"或"过程项目功能"。
       - **必须填充的字段**：s2_item、s2_step、s2_element、s3_func_item、s3_func_step、s3_func_element、s4_mode、s4_cause、s4_effect、s5_ap、s5_pc、s5_dc等。

    ================================================================
    *** 关键警告（违反将导致数据被拒绝）***
    ================================================================

    ⚠️ **所有字段都必须有内容！禁止空字符串！**
    - s2_item: 必须填写项目名称
    - s2_step: 必须填写过程/系统步骤
    - s2_element: 必须填写工作要素/组件
    - s3_func_item: 必须填写完整的项目功能描述
    - s3_func_step: 必须填写步骤的功能
    - s3_func_element: 必须填写工作要素的功能
    - s4_effect: 必须填写失效后果
    - s4_severity: 必须填写1-10的整数
    - s4_mode: 必须填写失效模式
    - s4_cause: 必须填写失效原因
    - s5_prev_control: 必须填写现行预防控制
    - s5_occurrence: 必须填写1-10的整数
    - s5_det_control: 必须填写现行探测控制
    - s5_detection: 必须填写1-10的整数
    - s5_ap: 必须填写H/M/L之一

    ❌ **禁止输出空字符串""或null**
    ❌ **禁止输出"未定义"、"待填写"、"N/A"等占位符**
    ✅ **每个字段都必须有具体、专业的内容**

    ================================================================
    *** 输出格式 ***
    ================================================================
    1. **语言**：仅使用专业简体中文（zh-CN）。
    2. **格式**：**严格RFC8259 JSON格式**。键名用双引号。无尾随逗号。
    3. **数量**：提供 **20+ 行高度详细的数据**。
    4. **质量**：每行数据的所有字段都必须完整填充，不允许有空字段。
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

// --- HELPER: ENSURE ALL FIELDS ARE POPULATED ---
const ensureFieldsPopulated = (rows: any[], type: FmeaType): any[] => {
  return rows.map((row, index) => {
    // Helper to get a value or provide a default
    const getValue = (value: any, defaultValue: any) => {
      if (value === undefined || value === null || value === "") {
        console.warn(`Empty field detected, using default: ${defaultValue}`);
        return defaultValue;
      }
      return value;
    };

    // Helper to get function description based on type
    const getFunctionDefault = (fieldType: string, rowIndex: number) => {
      const rowNum = rowIndex + 1;
      switch(fieldType) {
        case 's2_item':
          return type === FmeaType.DFMEA ? `系统组件 ${rowNum}` : `过程项目 ${rowNum}`;
        case 's2_step':
          return type === FmeaType.DFMEA ? `设计步骤 ${rowNum}` : `制造步骤 ${rowNum}`;
        case 's2_element':
          return type === FmeaType.DFMEA ? `子系统 ${rowNum}` : `工作要素 ${rowNum}`;
        case 's3_func_item':
          return type === FmeaType.DFMEA
            ? `系统级功能：实现核心功能需求 ${rowNum}`
            : `工厂内部: 完成工序${rowNum}\n下游工厂: 为下游提供组件\n最终用户: 满足最终用户功能需求`;
        case 's3_func_step':
          return `步骤${rowNum}的功能：执行关键操作`;
        case 's3_func_element':
          return type === FmeaType.DFMEA
            ? `组件${rowNum}的功能：提供关键性能`
            : `工作要素${rowNum}的功能：确保过程稳定`;
        case 's4_effect':
          return `失效后果：功能部分或完全丧失\n工厂内部: 需要返工或报废\n下游工厂: 影响后续工序\n最终用户: 产品性能下降，客户不满`;
        case 's5_prev_control':
          return type === FmeaType.DFMEA ? '设计验证' : '过程防错';
        case 's5_det_control':
          return type === FmeaType.DFMEA ? '仿真分析' : '自动检测';
        default:
          return `待定义${rowNum}`;
      }
    };

    return {
      ...row,
      // Step 2 fields (always required)
      s2_item: getValue(row.s2_item, getFunctionDefault('s2_item', index)),
      s2_step: getValue(row.s2_step, getFunctionDefault('s2_step', index)),
      s2_element: getValue(row.s2_element, getFunctionDefault('s2_element', index)),

      // Step 3 fields (always required)
      s3_func_item: getValue(row.s3_func_item, getFunctionDefault('s3_func_item', index)),
      s3_func_step: getValue(row.s3_func_step, getFunctionDefault('s3_func_step', index)),
      s3_func_element: getValue(row.s3_func_element, getFunctionDefault('s3_func_element', index)),

      // Step 4 fields (always required)
      s4_effect: getValue(row.s4_effect, getFunctionDefault('s4_effect', index)),
      s4_severity: getValue(row.s4_severity, 5),
      s4_mode: getValue(row.s4_mode, `失效模式${index + 1}`),
      s4_cause: getValue(row.s4_cause, `潜在原因${index + 1}`),

      // Step 5 fields (always required)
      s5_prev_control: getValue(row.s5_prev_control, getFunctionDefault('s5_prev_control', index)),
      s5_occurrence: getValue(row.s5_occurrence, 5),
      s5_det_control: getValue(row.s5_det_control, getFunctionDefault('s5_det_control', index)),
      s5_detection: getValue(row.s5_detection, 5),
      s5_ap: getValue(row.s5_ap, 'M'),

      // Step 6 fields (optional, but provide defaults if empty)
      s6_status: getValue(row.s6_status, 'Open'),
      s6_prev_action: getValue(row.s6_prev_action, ''),
      s6_det_action: getValue(row.s6_det_action, ''),
      s6_resp_person: getValue(row.s6_resp_person, ''),
      s6_target_date: getValue(row.s6_target_date, ''),
      s6_action_taken: getValue(row.s6_action_taken, ''),
      s6_completion_date: getValue(row.s6_completion_date, ''),
      s6_severity_new: getValue(row.s6_severity_new, row.s4_severity || 5),
      s6_occurrence_new: getValue(row.s6_occurrence_new, row.s5_occurrence || 5),
      s6_detection_new: getValue(row.s6_detection_new, row.s5_detection || 5),
      s6_ap_new: getValue(row.s6_ap_new, row.s5_ap || 'M'),
      remarks: getValue(row.remarks, ''),
    };
  });
};

// --- MOCK DATA GENERATOR (无API密钥时的模拟模式) ---
const generateMockFmeaData = (type: FmeaType, textContext: string): FmeaAnalysisResult => {
  const isDfmea = type === FmeaType.DFMEA;

  // 从输入中提取产品名称（如果有的话）
  let productName = "示例产品";
  if (textContext) {
    const lines = textContext.split('\n');
    if (lines[0] && lines[0].trim()) {
      productName = lines[0].trim().substring(0, 50);
    }
  }

  const mockRows = [
    {
      id: `row-${Date.now()}-1`,
      s2_item: "系统/总成", s2_step: productName + "总成", s2_element: "子系统",
      s3_func_item: `为最终用户提供${productName}的核心功能`, s3_func_step: "实现产品功能", s3_func_element: "支撑结构",
      s4_effect: `产品完全失效，无法实现预期功能\n工厂内部: 功能完全丧失\n下游工厂: 无法进行后续装配\n最终用户: 产品无法使用，严重不满`,
      s4_severity: 10,
      s4_mode: "功能丧失",
      s4_cause: "关键元器件失效",
      s5_prev_control: "设计验证", s5_occurrence: 5, s5_det_control: "功能测试", s5_detection: 4, s5_ap: "H",
      s6_prev_action: "优化元器件选型，提高冗余度", s6_det_action: "增加故障检测机制", s6_resp_person: "张工程师", s6_target_date: "2024-02-01", s6_status: "Open", s6_action_taken: "", s6_completion_date: "", s6_severity_new: 8, s6_occurrence_new: 4, s6_detection_new: 3, s6_ap_new: "M", remarks: "高优先级项目"
    },
    {
      id: `row-${Date.now()}-2`,
      s2_item: "系统/总成", s2_step: productName + "总成", s2_element: "控制模块",
      s3_func_item: "控制产品运行状态", s3_func_step: "信号处理与输出", s3_func_element: "微控制器",
      s4_effect: "性能下降，功能部分受限\n工厂内部: 需要返工\n下游工厂: 装配效率降低\n最终用户: 产品性能不佳，客户投诉",
      s4_severity: 7,
      s4_mode: "性能退化",
      s4_cause: "软件算法缺陷",
      s5_prev_control: "代码审查", s5_occurrence: 4, s5_det_control: "单元测试", s5_detection: 3, s5_ap: "M",
      s6_prev_action: "优化软件算法", s6_det_action: "增加集成测试", s6_resp_person: "李工程师", s6_target_date: "2024-02-15", s6_status: "Open", s6_action_taken: "", s6_completion_date: "", s6_severity_new: 5, s6_occurrence_new: 3, s6_detection_new: 2, s6_ap_new: "L", remarks: ""
    },
    {
      id: `row-${Date.now()}-3`,
      s2_item: "系统/总成", s2_step: productName + "总成", s2_element: "电源模块",
      s3_func_item: "提供稳定电力供应", s3_func_step: "电压转换与分配", s3_func_element: "DC-DC转换器",
      s4_effect: "间歇性故障，时好时坏\n工厂内部: 测试困难\n下游工厂: 质量不稳定\n最终用户: 使用体验差，退货",
      s4_severity: 6,
      s4_mode: "间歇性运作",
      s4_cause: "元器件参数漂移",
      s5_prev_control: "元器件筛选", s5_occurrence: 5, s5_det_control: "老化测试", s5_detection: 5, s5_ap: "M",
      s6_prev_action: "改进元器件质量控制", s6_det_action: "加强入厂检验", s6_resp_person: "王工程师", s6_target_date: "2024-01-30", s6_status: "In Progress", s6_action_taken: "已联系新供应商", s6_completion_date: "", s6_severity_new: 4, s6_occurrence_new: 4, s6_detection_new: 3, s6_ap_new: "L", remarks: "供应商变更中"
    },
    {
      id: `row-${Date.now()}-4`,
      s2_item: "系统/总成", s2_step: productName + "总成", s2_element: "结构组件",
      s3_func_item: "提供机械支撑和保护", s3_func_step: "承受外部载荷", s3_func_element: "外壳",
      s4_effect: "外观缺陷，但不影响功能\n工厂内部: 需要返修\n下游工厂: 无影响\n最终用户: 满意度下降",
      s4_severity: 3,
      s4_mode: "外观缺陷",
      s4_cause: "注塑工艺参数不当",
      s5_prev_control: "工艺参数优化", s5_occurrence: 4, s5_det_control: "外观检查", s5_detection: 2, s5_ap: "L",
      s6_prev_action: "优化注塑参数", s6_det_action: "增加首件检验", s6_resp_person: "赵工程师", s6_target_date: "2024-01-20", s6_status: "Completed", s6_action_taken: "已调整参数，效果良好", s6_completion_date: "2024-01-18", s6_severity_new: 2, s6_occurrence_new: 2, s6_detection_new: 1, s6_ap_new: "L", remarks: "已解决"
    },
    {
      id: `row-${Date.now()}-5`,
      s2_item: "系统/总成", s2_step: productName + "总成", s2_element: "连接接口",
      s3_func_item: "实现外部设备连接", s3_func_step: "数据传输", s3_func_element: "连接器",
      s4_effect: "连接不稳定，数据传输失败\n工厂内部: 需要返工\n下游工厂: 装配困难\n最终用户: 功能受限，抱怨",
      s4_severity: 5,
      s4_mode: "信号丢失",
      s4_cause: "连接器接触不良",
      s5_prev_control: "优选供应商", s5_occurrence: 3, s5_det_action: "信号检测", s5_detection: 3, s5_ap: "M",
      s6_prev_action: "更换连接器供应商", s6_det_action: "增加信号完整性测试", s6_resp_person: "刘工程师", s6_target_date: "2024-02-10", s6_status: "Open", s6_action_taken: "", s6_completion_date: "", s6_severity_new: 4, s6_occurrence_new: 2, s6_detection_new: 2, s6_ap_new: "L", remarks: ""
    },
    {
      id: `row-${Date.now()}-6`,
      s2_item: "子系统", s2_step: "驱动模块", s2_element: "电机",
      s3_func_item: "提供动力输出", s3_func_step: "电能转换为机械能", s3_func_element: "转子组件",
      s4_effect: "电机不转，功能完全丧失\n工厂内部: 100%不良\n下游工厂: 无法装配\n最终用户: 产品无法使用",
      s4_severity: 10,
      s4_mode: "无法启动",
      s4_cause: "电机线圈开路",
      s5_prev_control: "供应商认证", s5_occurrence: 2, s5_det_control: "导通测试", s5_detection: 2, s5_ap: "M",
      s6_prev_action: "加强供应商质量管理", s6_det_action: "增加100%导通测试", s6_resp_person: "陈工程师", s6_target_date: "2024-01-25", s6_status: "Open", s6_action_taken: "", s6_completion_date: "", s6_severity_new: 7, s6_occurrence_new: 2, s6_detection_new: 2, s6_ap_new: "M", remarks: "供应商整改中"
    },
    {
      id: `row-${Date.now()}-7`,
      s2_item: "子系统", s2_step: "驱动模块", s2_element: "传动机构",
      s3_func_item: "传递动力", s3_func_step: "扭矩传递", s3_func_element: "齿轮组",
      s4_effect: "噪音过大，用户不满意\n工厂内部: 需要返工\n下游工厂: 无影响\n最终用户: 投诉噪音",
      s4_severity: 4,
      s4_mode: "异常噪音",
      s4_cause: "齿轮啮合不良",
      s5_prev_control: "设计评审", s5_occurrence: 4, s5_det_control: "噪音测试", s5_detection: 3, s5_ap: "L",
      s6_prev_action: "优化齿轮参数", s6_det_action: "加强噪音检测", s6_resp_person: "张工程师", s6_target_date: "2024-02-05", s6_status: "Open", s6_action_taken: "", s6_completion_date: "", s6_severity_new: 3, s6_occurrence_new: 3, s6_detection_new: 2, s6_ap_new: "L", remarks: ""
    },
    {
      id: `row-${Date.now()}-8`,
      s2_item: "子系统", s2_step: "控制模块", s2_element: "传感器",
      s3_func_item: "检测工作状态", s3_func_step: "信号采集", s3_func_element: "温度传感器",
      s4_effect: "温度检测不准，可能过热\n工厂内部: 测试困难\n下游工厂: 无影响\n最终用户: 潜在安全风险",
      s4_severity: 8,
      s4_mode: "测量偏差",
      s4_cause: "传感器精度不足",
      s5_prev_control: "元器件选型", s5_occurrence: 5, s5_det_control: "校准测试", s5_detection: 4, s5_ap: "M",
      s6_prev_action: "更换高精度传感器", s6_det_action: "增加定期校准", s6_resp_person: "李工程师", s6_target_date: "2024-01-28", s6_status: "Open", s6_action_taken: "", s6_completion_date: "", s6_severity_new: 6, s6_occurrence_new: 4, s6_detection_new: 3, s6_ap_new: "M", remarks: "安全相关"
    },
    {
      id: `row-${Date.now()}-9`,
      s2_item: "子系统", s2_step: "控制模块", s2_element: "主控芯片",
      s3_func_item: "数据处理与控制", s3_func_step: "算法执行", s3_func_element: "MCU",
      s4_effect: "程序跑飞，功能异常\n工厂内部: 需要重启\n下游工厂: 无影响\n最终用户: 产品死机",
      s4_severity: 9,
      s4_mode: "软件崩溃",
      s4_cause: "软件bug",
      s5_prev_control: "代码审查", s5_occurrence: 3, s5_det_control: "压力测试", s5_detection: 4, s5_ap: "H",
      s6_prev_action: "修复软件bug", s6_det_action: "增加异常处理", s6_resp_person: "王工程师", s6_target_date: "2024-01-22", s6_status: "Completed", s6_action_taken: "已发布补丁", s6_completion_date: "2024-01-20", s6_severity_new: 5, s6_occurrence_new: 2, s6_detection_new: 2, s6_ap_new: "L", remarks: "已修复"
    },
    {
      id: `row-${Date.now()}-10`,
      s2_item: "零部件", s2_step: "电源电路", s2_element: "电容",
      s3_func_item: "滤波储能", s3_func_step: "电压平滑", s3_func_element: "电解电容",
      s4_effect: "电路纹波大，干扰其他模块\n工厂内部: 性能测试不通过\n下游工厂: 无影响\n最终用户: 功能异常",
      s4_severity: 5,
      s4_mode: "电压波动",
      s4_cause: "电容值衰减",
      s5_prev_control: "降额设计", s5_occurrence: 4, s5_det_control: "纹波测试", s5_detection: 3, s5_ap: "M",
      s6_prev_action: "增大电容容量", s6_det_action: "加强寿命测试", s6_resp_person: "赵工程师", s6_target_date: "2024-02-08", s6_status: "Open", s6_action_taken: "", s6_completion_date: "", s6_severity_new: 4, s6_occurrence_new: 3, s6_detection_new: 2, s6_ap_new: "L", remarks: ""
    }
  ];

  return {
    title: `${productName} - ${isDfmea ? 'DFMEA' : 'PFMEA'}分析报告（模拟数据）`,
    type: type,
    rows: mockRows
  };
};

// --- GEMINI IMPLEMENTATION ---
const generateWithGemini = async (request: GenerationRequest, apiKey?: string, model?: string) => {
  // Use provided key or fallback to env
  const finalApiKey = apiKey || process.env.API_KEY;

  // DEBUG: Log API key status
  console.log('[DEBUG] Gemini API Key Status:', {
    hasApiKeyFromParams: !!apiKey,
    hasApiKeyFromEnv: !!process.env.API_KEY,
    apiKeyLength: finalApiKey?.length,
    apiKeyPrefix: finalApiKey?.substring(0, 10) + '...'
  });

  // ✅ 模拟模式：如果没有API密钥或密钥无效，使用模拟数据
  if (!finalApiKey || finalApiKey === 'PLACEHOLDER_API_KEY' || finalApiKey.length < 20) {
    console.warn('⚠️ API密钥未配置，使用模拟数据模式');
    console.log('💡 提示：请在"AI API设置"中配置真实的API密钥以使用AI生成');
    const mockData = generateMockFmeaData(request.type, request.textContext);
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    return JSON.stringify(mockData);
  }

  const ai = new GoogleGenAI({ apiKey: finalApiKey });

  // 修复模型名称：移除 'models/' 前缀（如果存在）
  let modelName = model || "gemini-2.0-flash-exp";
  if (modelName.startsWith('models/')) {
    modelName = modelName.replace('models/', '');
  }

  console.log('[DEBUG] Calling Gemini API:', {
    model: modelName,
    textLength: request.textContext?.length,
    hasImage: !!request.imageBase64
  });

  const systemInstruction = getSystemInstruction(request.type);

  // 为 PFMEA 添加明确的前缀说明
  let userPrompt = request.textContext;
  if (request.type === FmeaType.PFMEA) {
    userPrompt = `【PFMEA 要求 - 必须按照过程流程图生成】

请基于以下制造过程描述，生成 PFMEA 报告。

⚠️ 关键要求：
1. 必须按照**制造过程流程图**的工序顺序来生成
2. 每一行数据对应流程图中的一个操作步骤
3. s2_step 字段必须包含具体的制造工序名称（如：上料、加工、检测、装配等）
4. s3_func_item 必须描述该工序的功能（包含工厂内部/下游工厂/最终用户三个层次）
5. s4_cause 必须分析4M要素（人机料法）

${request.textContext}`;
  }

  const parts: any[] = [{ text: userPrompt }];
  if (request.imageBase64 && request.mimeType) {
    parts.push({
      inlineData: {
        data: request.imageBase64,
        mimeType: request.mimeType,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: fmeaSchemaStructure as Schema, // Cast for compatibility
        temperature: 0.6,
        maxOutputTokens: 8192,
      },
    });

    console.log('[DEBUG] Gemini API Response received');
    return response.text;
  } catch (error: any) {
    console.error('[DEBUG] Gemini API Error:', error);
    // 如果API调用失败，自动切换到模拟数据模式
    console.warn('⚠️ API调用失败，切换到模拟数据模式');
    const mockData = generateMockFmeaData(request.type, request.textContext);
    return JSON.stringify(mockData);
  }
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

  console.log(`[DEBUG] ${provider} API Config:`, {
    hasApiKey: !!settings?.apiKey,
    apiKeyLength: settings?.apiKey?.length || 0,
    apiKeyPrefix: settings?.apiKey?.substring(0, 8) + '...',
    hasBaseUrl: !!settings?.baseUrl,
    baseUrl: settings?.baseUrl,
    modelName: settings?.modelName
  });

  if (!settings?.apiKey) throw new Error(`${provider} API Key is required.`);
  if (!settings?.baseUrl) throw new Error(`${provider} Base URL is required.`);

  // ✅ 如果API密钥看起来是占位符或太短，使用模拟数据
  if (settings.apiKey.length < 20 || settings.apiKey === 'sk-...') {
    console.warn(`⚠️ ${provider} API密钥未配置或无效，使用模拟数据模式`);
    const mockData = generateMockFmeaData(request.type, request.textContext);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return JSON.stringify(mockData);
  }

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

  // 为 PFMEA 添加明确的前缀说明
  let userPrompt = request.textContext;
  if (request.type === FmeaType.PFMEA) {
    userPrompt = `【PFMEA 要求 - 必须按照过程流程图生成】

请基于以下制造过程描述，生成 PFMEA 报告。

⚠️ 关键要求：
1. 必须按照**制造过程流程图**的工序顺序来生成
2. 每一行数据对应流程图中的一个操作步骤
3. s2_step 字段必须包含具体的制造工序名称（如：上料、加工、检测、装配等）
4. s3_func_item 必须描述该工序的功能（包含工厂内部/下游工厂/最终用户三个层次）
5. s4_cause 必须分析4M要素（人机料法）

${request.textContext}`;
  }

  const messages: any[] = [
    { role: "system", content: systemInstruction },
    { role: "user", content: userPrompt }
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

    console.log(`[DEBUG] Calling ${provider} API:`, {
      endpoint: endpoint.replace(/\/chat\/completions$/, '/...'), // 隐藏完整URL出于安全
      model: settings.modelName,
      textLength: request.textContext?.length
    });

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

    console.log(`[DEBUG] ${provider} API Response:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] ${provider} API Error Response:`, errorText);

      // CORS错误时自动切换到模拟数据
      if (response.status === 0 || errorText.includes('CORS') || errorText.includes('fetch')) {
        console.warn(`⚠️ ${provider} API CORS错误，切换到模拟数据模式`);
        console.log(`💡 说明：${provider}不支持从浏览器直接调用（CORS限制）`);
        console.log(`💡 解决方案：`);
        console.log(`   1. 使用Google Gemini（✅ 支持浏览器直接调用）`);
        console.log(`   2. 或部署后端代理服务`);
        const mockData = generateMockFmeaData(request.type, request.textContext);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return JSON.stringify(mockData);
      }

      throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`[DEBUG] ${provider} API Response received successfully`);
    return data.choices?.[0]?.message?.content || "{}";

  } catch (e: any) {
    console.error(`[DEBUG] ${provider} API Exception:`, e.message, e.name);

    // CORS或网络错误时，自动切换到模拟数据
    if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
      console.warn(`⚠️ ${provider} API网络错误（通常是CORS跨域问题）`);
      console.log(`💡 这不是配置问题，而是浏览器安全限制`);
      console.log(`💡 ${provider} API服务器不允许从浏览器直接调用`);
      console.log(`💡 切换到模拟数据模式...`);
      const mockData = generateMockFmeaData(request.type, request.textContext);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return JSON.stringify(mockData);
    }

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

    // Ensure all fields are populated (no empty fields)
    const rowsWithValidatedFields = ensureFieldsPopulated(jsonResult.rows || [], request.type);

    const rowsWithIds = rowsWithValidatedFields.map((row: any, index: number) => ({
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