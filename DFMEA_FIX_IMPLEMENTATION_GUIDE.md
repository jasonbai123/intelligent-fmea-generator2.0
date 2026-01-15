# DFMEA 表格修复实施指南

## 🎯 目标

根据 AIAG & VDA 第一版 DFMEA 模板，修复当前表格结构的以下问题：

1. **Step 3**：DFMEA 应该只有 2列（当前有3列）
2. **Step 5**：DFMEA 应该有 7列（当前只有5列，缺少 S 和 RPN）
3. **添加 RPN 自动计算**：RPN = O × D × S

---

## 📋 需要修改的文件

### 1. `components/FmeaTable.tsx`

这是主要需要修改的文件。由于文件很大（742行），我会分步骤说明。

#### 修改1：Step 3 列定义（第100-111行）

**当前代码**：
```typescript
step3: {
  title: 'Step 3 - Functional Analysis (功能分析)',
  col1: isDfmea
    ? '1. Next Higher Level Function\nand Requirement\n1.上一级功能及要求'
    : '...',
  col2: isDfmea
    ? '2. Focus Element Function and\nRequirement\n2.关注要素功能及要求'
    : '...',
  col3: isDfmea
    ? '3. Next Lower Level Function\nand Requirement\n3.下一级功能及要求'  // ❌ DFMEA 不应该有这一列
    : '...',
},
```

**修复后**：
```typescript
step3: {
  title: 'Step 3 - Functional Analysis (功能分析)',
  col1: isDfmea
    ? '1. Next Higher Level Function\nand Requirement\n1.上一较高级别功能及要求'
    : '1. Function of Process Item\n1.过程项的功能\nFunction of System, Subsystem, Part Element or Process\n系统、子系统、零件要素或过程的功能',
  col2: isDfmea
    ? '2. Focus Element Function and\nRequirement\n2.关注要素功能及要求'
    : '2. Function of Process Step\n2.过程步骤的功能和产品特性\nFunction of Focus Element and Product Characteristic\n(Value/Attributes)\n(量值为可选顶)',
  // DFMEA 只有 2 列，PFMEA 有 3 列
  ...(isDfmea ? {} : {
    col3: '3. Function of Work Element\n3.过程工作要素的功能和过程特性\nFunction of Work Element and Process Characteristic\n过程工作要素的功能和过程特性',
  })
},
```

#### 修改2：Step 5 列定义（第121-128行）

**当前代码**：
```typescript
step5: {
  title: 'Step 5 - Risk Analysis (风险分析)',
  col1: 'Current Prevention Control (PC)\n当前失效起因的预防控制 (PC)',
  col2: 'Occ.\n(O)',
  col3: 'Current Detection Control (DC)\n对失效起因或失效模式的当前探测控制 (DC)',
  col4: 'Det.\n(D)',
  col5: 'AP',
},
```

**修复后**：
```typescript
step5: {
  title: 'Step 5 - Risk Analysis (风险分析)',
  col1: isDfmea
    ? 'Current Prevention Controls (PC)\nof FC\n当前预防控制 (PC)'
    : 'Current Prevention Control (PC)\n当前失效起因的预防控制 (PC)',
  col2: isDfmea
    ? 'Current Detection Controls (DC)\nof FC or FM\n当前探测控制 (DC)'
    : 'Current Detection Control (DC)\n对失效起因或失效模式的当前探测控制 (DC)',
  col3: 'Occ.\n(O)',
  col4: 'Det.\n(D)',
  ...(isDfmea ? {
    col5: 'Severity\n(S)',
    col6: 'RPN\n(O×D×S)',
    col7: 'AP'
  } : {
    col5: 'AP'
  })
},
```

#### 修改3：添加 RPN 计算函数（在第46行之后添加）

```typescript
// RPN 计算函数
const calculateRPN = (row: any): number => {
  const o = Number(row.s5_occurrence) || 1;
  const d = Number(row.s5_detection) || 1;
  const s = Number(row.s4_severity) || 1;
  return o * d * s;
};

const calculateAPFromRPN = (rpn: number): string => {
  if (rpn <= 80) return 'L';
  if (rpn <= 200) return 'M';
  return 'H';
};
```

#### 修改4：更新表格渲染（HTML部分）

由于表格是条件渲染的，需要更新 Step 3 和 Step 5 的列显示。

**Step 3 列头（第654-657行）**：
```tsx
{/* S3 */}
<th className="p-1 border-r border-fuchsia-100 bg-fuchsia-50 whitespace-pre-wrap">{headers.step3.col1}</th>
<th className="p-1 border-r border-fuchsia-100 bg-fuchsia-50 whitespace-pre-wrap">{headers.step3.col2}</th>
{!isDfmea && <th className="p-1 border-r border-fuchsia-200 bg-fuchsia-50 whitespace-pre-wrap">{headers.step3.col3}</th>}
```

**Step 5 列头（第663-668行）**：
```tsx
{/* S5 */}
<th className="p-1 border-r border-lime-200 bg-lime-100 whitespace-pre-wrap">{headers.step5.col1}</th>
<th className="p-1 border-r border-lime-200 text-black font-bold bg-lime-300">{headers.step5.col2}</th>
<th className="p-1 border-r border-lime-200 bg-lime-100 whitespace-pre-wrap">{headers.step5.col3}</th>
<th className="p-1 border-r border-lime-200 text-black font-bold bg-lime-300">{headers.step5.col4}</th>
{isDfmea && <th className="p-1 border-r border-lime-200 text-black font-bold bg-lime-300">{headers.step5.col5}</th>}
{isDfmea && <th className="p-1 border-r border-lime-300 font-bold bg-blue-200">{headers.step5.col6}</th>}
<th className="p-1 border-r border-lime-300 font-bold bg-yellow-300">{isDfmea ? headers.step5.col7 : headers.step5.col5}</th>
```

**Step 3 数据单元格（第699-701行）**：
```tsx
<td className="p-1 border-r border-slate-100 align-top text-slate-600 bg-blue-50/10 whitespace-pre-wrap break-words">{row.s3_func_item}</td>
<td className="p-1 border-r border-slate-100 align-top text-slate-600 bg-blue-50/10 whitespace-pre-wrap break-words">{row.s3_func_step}</td>
{!isDfmea && <td className="p-1 border-r border-slate-300 align-top text-slate-600 bg-blue-50/10 whitespace-pre-wrap break-words">{row.s3_func_element}</td>}
```

**Step 5 数据单元格（第708-714行）**：
```tsx
<td className="p-1 border-r border-slate-100 align-top text-[10px] text-slate-600 bg-amber-50/10 whitespace-pre-wrap break-words">{row.s5_prev_control}</td>
<td className="p-1 border-r border-slate-100 align-top text-center font-bold text-orange-700 bg-amber-50/20">{row.s5_occurrence}</td>
<td className="p-1 border-r border-slate-100 align-top text-[10px] text-slate-600 bg-amber-50/10 whitespace-pre-wrap break-words">{row.s5_det_control}</td>
<td className="p-1 border-r border-slate-100 align-top text-center font-bold text-blue-700 bg-amber-50/20">{row.s5_detection}</td>
{isDfmea && <td className="p-1 border-r border-slate-100 align-top text-center font-bold text-red-700 bg-amber-50/20">{row.s4_severity}</td>}
{isDfmea && <td className="p-1 border-r border-slate-100 align-top text-center font-bold text-purple-700 bg-blue-100">{calculateRPN(row)}</td>}
<td className="p-1 border-r border-slate-300 align-top text-center bg-amber-50/10">
  <ApBadge value={isDfmea ? calculateAPFromRPN(calculateRPN(row)) : row.s5_ap} />
</td>
```

#### 修改5：Excel 导出更新（第183-193行）

需要调整列宽度以适应 DFMEA 的额外列。

**当前代码**：
```typescript
ws.columns = [
  { width: 15 }, // A (History)
  { width: 25 }, { width: 25 }, { width: 25 }, // B-D (S2)
  { width: 30 }, { width: 30 }, { width: 30 }, // E-G (S3)
  { width: 35 }, { width: 4 }, { width: 35 }, { width: 35 }, // H-K (S4)
  { width: 30 }, { width: 4 }, { width: 30 }, { width: 4 }, { width: 5 }, // L-P (S5)
  { width: 25 }, { width: 25 }, { width: 15 }, { width: 12 }, { width: 10 }, { width: 30 }, { width: 12 }, { width: 4 }, { width: 4 }, { width: 4 }, { width: 4 }, { width: 20 }, // Q-AB (S6)
  ...customColumns.map(() => ({ width: 15 }))
];
```

**修复后**：
```typescript
// 根据类型调整列宽度
const dfmeaColumns = [
  { width: 15 }, // A (History)
  { width: 25 }, { width: 25 }, { width: 25 }, // B-D (S2)
  { width: 30 }, { width: 30 }, // E-F (S3) - DFMEA 只有 2 列
  { width: 35 }, { width: 4 }, { width: 35 }, { width: 35 }, // H-K (S4)
  { width: 30 }, { width: 30 }, { width: 4 }, { width: 30 }, { width: 4 }, { width: 4 }, { width: 5 }, // L-Q (S5) - DFMEA 7 列
  { width: 25 }, { width: 25 }, { width: 15 }, { width: 12 }, { width: 10 }, { width: 30 }, { width: 12 }, { width: 4 }, { width: 4 }, { width: 4 }, { width: 4 }, { width: 20 }, // R-AC (S6)
  ...customColumns.map(() => ({ width: 15 }))
];

const pfmeaColumns = [
  { width: 15 }, // A (History)
  { width: 25 }, { width: 25 }, { width: 25 }, // B-D (S2)
  { width: 30 }, { width: 30 }, { width: 30 }, // E-G (S3)
  { width: 35 }, { width: 4 }, { width: 35 }, { width: 35 }, // H-K (S4)
  { width: 30 }, { width: 4 }, { width: 30 }, { width: 4 }, { width: 5 }, // L-P (S5)
  { width: 25 }, { width: 25 }, { width: 15 }, { width: 12 }, { width: 10 }, { width: 30 }, { width: 12 }, { width: 4 }, { width: 4 }, { width: 4 }, { width: 4 }, { width: 20 }, // Q-AB (S6)
  ...customColumns.map(() => ({ width: 15 }))
];

ws.columns = isDfmea ? dfmeaColumns : pfmeaColumns;
const totalCols = isDfmea ? 29 : 28; // DFMEA 多一列（RPN）
```

#### 修改6：Excel 表头合并（第283-289行）

需要根据 DFMEA/PFMEA 调整列合并范围。

```typescript
const steps = [
  { title: headers.step2.title, start: 2, end: isDfmea ? 4 : 4, color: cPink },
  { title: headers.step3.title, start: isDfmea ? 5 : 5, end: isDfmea ? 6 : 7, color: cPink }, // DFMEA 2列，PFMEA 3列
  { title: headers.step4.title, start: isDfmea ? 7 : 8, end: isDfmea ? 10 : 11, color: cPink },
  { title: headers.step5.title, start: isDfmea ? 11 : 12, end: isDfmea ? 17 : 16, color: cGreen }, // DFMEA 7列，PFMEA 5列
  { title: headers.step6.title, start: isDfmea ? 18 : 17, end: isDfmea ? 29 : 28, color: cWhite },
];
```

#### 修改7：Excel 数据导出（第347-381行）

需要根据 DFMEA/PFMEA 调整数据行。

```typescript
data.rows.forEach((row, idx) => {
  const r = 9 + idx;

  let rowData;
  if (isDfmea) {
    // DFMEA: Step 3 只有 2 列，Step 5 有 7 列（包含 S 和 RPN）
    const rpn = (Number(row.s5_occurrence) || 1) * (Number(row.s5_detection) || 1) * (Number(row.s4_severity) || 1);
    rowData = [
      idx + 1,
      row.s2_item, row.s2_step, row.s2_element,
      row.s3_func_item, row.s3_func_step, // 只有 2 列
      row.s4_effect, row.s4_severity, row.s4_mode, row.s4_cause,
      row.s5_prev_control, row.s5_det_control, row.s5_occurrence, row.s5_detection, row.s4_severity, rpn, row.s5_ap,
      row.s6_prev_action, row.s6_det_action, row.s6_resp_person, row.s6_target_date, row.s6_status, row.s6_action_taken, row.s6_completion_date,
      row.s6_severity_new, row.s6_occurrence_new, row.s6_detection_new, row.s6_ap_new, row.remarks,
      ...customColumns.map(col => row[col] || '')
    ];
  } else {
    // PFMEA: 保持原有逻辑
    rowData = [
      idx + 1,
      row.s2_item, row.s2_step, row.s2_element,
      row.s3_func_item, row.s3_func_step, row.s3_func_element,
      row.s4_effect, row.s4_severity, row.s4_mode, row.s4_cause,
      row.s5_prev_control, row.s5_occurrence, row.s5_det_control, row.s5_detection, row.s5_ap,
      row.s6_prev_action, row.s6_det_action, row.s6_resp_person, row.s6_target_date, row.s6_status, row.s6_action_taken, row.s6_completion_date,
      row.s6_severity_new, row.s6_occurrence_new, row.s6_detection_new, row.s6_ap_new, row.remarks,
      ...customColumns.map(col => row[col] || '')
    ];
  }

  const currentRow = ws.getRow(r);
  currentRow.values = rowData;
  // ... 其余代码保持不变
});
```

---

## 📊 修改总结

### DFMEA vs PFMEA 列数对比

| 步骤 | DFMEA（修复后） | PFMEA（保持不变） |
|------|----------------|-------------------|
| Step 1 | 1列 | 1列 |
| Step 2 | 3列 | 3列 |
| Step 3 | **2列** ✅ | 3列 |
| Step 4 | 4列 | 4列 |
| Step 5 | **7列** ✅ | 5列 |
| Step 6 | 12列 | 12列 |
| **总计** | **29列** | 28列 |

---

## ⚠️ 注意事项

1. **确保 PFMEA 不受影响**：所有修改都必须使用 `isDfmea` 条件判断
2. **RPN 计算**：只在 DFMEA 中显示和计算
3. **向后兼容**：确保已有的数据可以正常显示
4. **测试充分**：修改后需要测试 DFMEA 和 PFMEA 两种类型

---

## 🚀 实施步骤

1. ✅ 备份当前代码
2. ⏳ 修改 `components/FmeaTable.tsx`
3. ⏳ 本地测试 DFMEA 生成
4. ⏳ 本地测试 PFMEA 生成
5. ⏳ 构建：`npm run build`
6. ⏳ 部署到 Cloudflare Pages
7. ⏳ 在线测试两种类型

---

## 📝 测试用例

### DFMEA 测试
1. 生成一个 DFMEA 报告
2. 验证 Step 3 只有 2 列
3. 验证 Step 5 有 7 列（包含 S 和 RPN）
4. 验证 RPN = O × D × S 计算正确
5. 验证 AP 根据 RPN 自动确定

### PFMEA 测试
1. 生成一个 PFMEA 报告
2. 验证 Step 3 有 3 列
3. 验证 Step 5 有 5 列
4. 验证所有数据正常显示
5. 验证不受 DFMEA 修改影响

---

## 💡 建议

由于这是一个复杂的结构性修改，建议：

1. **分步实施**：先修改列定义，再添加 RPN 计算
2. **充分测试**：每个修改后都要测试
3. **保留回退**：保留原代码备份，以便回退
4. **文档更新**：修改后更新相关文档

---

**📢 这是一个大型修改，需要谨慎实施。建议在有充足时间的情况下进行，并确保有完整的备份。**
