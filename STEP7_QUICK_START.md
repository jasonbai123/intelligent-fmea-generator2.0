# Step 7 快速开始指南

## 🚀 5分钟快速集成

### 方法1: 最简单的方式 - 在现有页面添加按钮

打开你的FMEA表格组件（如`FmeaTable.tsx`），添加一个"Step 7"按钮：

```tsx
import React, { useState } from 'react';
import { FmeaStep7Documentation } from './components/FmeaStep7Documentation';

export const YourFmeaComponent = () => {
  const [showStep7, setShowStep7] = useState(false);
  const [fmeaData, setFmeaData] = useState({
    title: '我的FMEA项目',
    type: 'DFMEA',
    rows: [/* 你的FMEA数据 */]
  });

  return (
    <div>
      {/* 你的现有内容 */}
      <h1>FMEA分析</h1>
      {/* ... */}

      {/* 添加Step 7按钮 */}
      <button
        onClick={() => setShowStep7(true)}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-bold"
      >
        📋 Step 7 - 结果文件化
      </button>

      {/* Step 7弹窗 */}
      {showStep7 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto">
          <div className="min-h-screen bg-white">
            {/* 关闭按钮 */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Step 7 - 结果文件化</h2>
              <button
                onClick={() => setShowStep7(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                关闭
              </button>
            </div>

            {/* Step 7组件 */}
            <div className="p-6">
              <FmeaStep7Documentation
                fmeaData={fmeaData}
                currentUser="Your Name"
                onSave={(documentation) => {
                  console.log('保存Step 7数据:', documentation);
                  // 在这里保存到你的后端或localStorage
                  alert('✅ Step 7数据已保存！');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

就这么简单！✨

---

## 📚 使用步骤

### Step 1: 准备FMEA数据

确保你的FMEA数据包含必要的字段：

```typescript
const fmeaData = {
  title: "电动汽车电池包 DFMEA",
  type: "DFMEA", // 或 "PFMEA"
  rows: [
    {
      id: "row-1",
      // Step 2: 结构分析
      s2_item: "电池系统",
      s2_step: "电池包",
      s2_element: "电池模块",

      // Step 3: 功能分析
      s3_func_item: "提供动力",
      s3_func_step: "存储能量",
      s3_func_element: "输出电压",

      // Step 4: 失效分析
      s4_effect: "车辆无法启动",
      s4_severity: 9,
      s4_mode: "电池过热",
      s4_cause: "冷却系统故障",

      // Step 5: 风险分析
      s5_prev_control: "温度传感器监控",
      s5_occurrence: 7,
      s5_det_control: "热敏电阻",
      s5_detection: 6,
      s5_ap: "H", // 系统会自动计算

      // Step 6: 优化
      s6_prev_action: "增加冷却系统冗余",
      s6_det_action: "增加温度报警",
      s6_resp_person: "张工程师",
      s6_target_date: "2025-02-15",
      s6_status: "Open",
      s6_action_taken: "",
      s6_completion_date: ""
    }
    // ... 更多行
  ]
};
```

### Step 2: 使用Step 7组件

```tsx
<FmeaStep7Documentation
  fmeaData={fmeaData}
  currentUser="张三"
  aiSettings={{
    provider: 'zhipu',
    modelName: 'glm-4-plus',
    apiKey: 'your-api-key'
  }}
  onSave={(documentation) => {
    // 保存到你的存储系统
    localStorage.setItem('fmea-doc', JSON.stringify(documentation));
  }}
/>
```

### Step 3: 完成检查清单

系统会自动验证：
- ✅ 所有高优先级(H)项目是否已处理
- ✅ 责任人是否已分配
- ✅ 目标日期是否已设定
- ✅ 措施是否已记录
- ✅ 评审是否完成
- ✅ 批准是否获得

### Step 4: 生成执行摘要

1. 点击"AI优化"按钮使用GLM-4-Plus生成专业摘要
2. 或使用自动生成的模板
3. 根据需要编辑内容
4. 导出为Markdown文件

### Step 5: 评审和批准

1. 添加评审意见和决策
2. 提交批准请求（初步/中间/最终）
3. 获得批准后完成FMEA流程

---

## 🎨 实际效果展示

### 1. 完成检查清单

```
┌─────────────────────────────────────────┐
│ Step 7 - 完成检查清单                   │
├─────────────────────────────────────────┤
│ FMEA 指标概览                           │
│ ┌─────┬─────┬─────┬─────┐              │
│ │总数 │  H  │  M  │完成率│              │
│ │ 15  │  3  │  7  │ 67% │              │
│ └─────┴─────┴─────┴─────┘              │
│                                          │
│ ✅ 所有高优先级(H)项目已采取措施         │
│ ✅ 责任人已分配                          │
│ ⚠️  目标日期已设定                      │
│ ✅ 措施已完整记录                        │
│                                          │
│ 完成度: 83%                              │
└─────────────────────────────────────────┘
```

### 2. 执行摘要

```
# 电动汽车电池包 DFMEA 执行摘要

## 项目概述
本设计FMEA分析涵盖 15 个潜在失效模式...

## 风险分布
| 优先级 | 数量 | 占比 |
| 🔴 高 (H) | 3 | 20.0% |
| 🟡 中 (M) | 7 | 46.7% |
| 🟢 低 (L) | 5 | 33.3% |

## 关键发现
1. 🔴 电池过热
   - S=9, O=7, D=6 | AP=H
   - 需要立即采取行动

## 措施状态
- ✅ 已完成: 8 项
- 🔄 进行中: 5 项
- ⚠️ 逾期: 2 项
```

### 3. 评审批准

```
┌─────────────────────────────────────────┐
│ 评审历史                                 │
├─────────────────────────────────────────┤
│ [管理层评审] 张工程师  2025-01-10       │
│ "建议增加冷却系统冗余设计"              │
│                                          │
│ [同行评审] 李工程师  2025-01-09         │
│ "风险评估合理，同意发布"                │
│                                          │
│ 批准状态: ✅ 最终批准                    │
│ 批准人: 质量经理                        │
│ 批准日期: 2025-01-10                    │
└─────────────────────────────────────────┘
```

---

## 🔧 高级配置

### 自定义AP验证规则

```typescript
import { AP_VALIDATION_RULES } from './utils/apValidation';

// 添加自定义规则
AP_VALIDATION_RULES.push({
  ruleCode: 'CUSTOM_RULE',
  description: '我的自定义规则',
  check: (s, o, d, currentAP) => {
    // 你的验证逻辑
    return true;
  },
  expectedAP: (s, o, d) => 'H',
  errorMessage: '自定义错误消息',
  severity: 'error'
});
```

### 自定义指标计算

```typescript
import { calculateFmeaMetrics } from './utils/apValidation';

const metrics = calculateFmeaMetrics(fmeaData.rows);

console.log(metrics);
// {
//   totalRows: 15,
//   highAPCount: 3,
//   mediumAPCount: 7,
//   lowAPCount: 5,
//   completionRate: 67,
//   actionsCompleted: 8,
//   actionsPending: 5,
//   overdueActions: 2
// }
```

---

## 💾 数据持久化示例

### 使用LocalStorage

```typescript
const handleSave = (documentation: FmeaDocumentation) => {
  // 保存到localStorage
  localStorage.setItem(
    `fmea-doc-${fmeaData.id}`,
    JSON.stringify(documentation)
  );

  // 或保存到IndexedDB（适合大数据）
  // 或发送到后端API
};

// 读取保存的数据
const loadDocumentation = (fmeaId: string) => {
  const saved = localStorage.getItem(`fmea-doc-${fmeaId}`);
  return saved ? JSON.parse(saved) : null;
};
```

### 使用后端API

```typescript
const handleSave = async (documentation: FmeaDocumentation) => {
  try {
    const response = await fetch(`/api/fmea/${fmeaId}/documentation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(documentation)
    });

    if (response.ok) {
      alert('✅ 保存成功！');
    } else {
      alert('❌ 保存失败');
    }
  } catch (error) {
    console.error('保存错误:', error);
    alert('❌ 网络错误');
  }
};
```

---

## 🎯 常见问题

### Q1: AP不自动计算怎么办？

**A**: 检查以下几点：
1. S/O/D值是否在1-10范围内
2. 组件是否正确接收了`fmeaData` prop
3. 查看浏览器控制台是否有错误

### Q2: 如何集成到现有路由？

**A**: 在路由配置中添加：
```typescript
{
  path: '/fmea/:id/step7',
  element: <FmeAStep7Page />
}
```

### Q3: 能否同时支持多个FMEA项目？

**A**: 可以！每个`FmeaStep7Documentation`实例都是独立的：
```typescript
{fmeaProjects.map(project => (
  <FmeaStep7Documentation
    key={project.id}
    fmeaData={project.data}
    onSave={(doc) => saveDoc(project.id, doc)}
  />
))}
```

### Q4: 如何自定义检查清单项目？

**A**: 编辑`FmeaStep7Checklist.tsx`，修改`FMEACompletionChecklist`接口和对应的UI。

---

## 📞 获取帮助

- **技术文档**: 查看`FMEA_TECHNICAL_REQUIREMENTS.md`
- **集成指南**: 查看`docs/STEP7_INTEGRATION_GUIDE.md`
- **开发进度**: 查看`DEVELOPMENT_PROGRESS.md`
- **联系方式**: Jasonbai (13510420462)

---

## 🎉 开始使用

现在就开始使用Step 7功能吧！

```bash
# 1. 安装依赖（如果需要）
npm install

# 2. 启动开发服务器
npm run dev

# 3. 在浏览器中打开
# http://localhost:5173

# 4. 找到你的FMEA页面
# 5. 点击"Step 7 - 结果文件化"按钮
# 6. 开始使用！
```

祝您使用愉快！🚀
