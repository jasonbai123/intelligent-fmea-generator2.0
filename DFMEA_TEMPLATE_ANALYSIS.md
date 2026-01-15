# DFMEA 模板对比分析报告

## 📋 关键发现

根据 AIAG & VDA 第一版 DFMEA 模板规格与当前实现的对比，发现以下**关键差异**需要修复：

---

## ❌ 问题1：Step 3 列数量不匹配

### 模板要求（2列）：
- 1. Next Higher Level Function and Requirement（上一较高级别功能和要求）
- 2. Focus Element Function and Requirement（关注要素功能和要求）

### 当前实现（3列）：
```typescript
step3: {
  col1: '1. Next Higher Level Function and Requirement...',
  col2: '2. Focus Element Function and Requirement...',
  col3: '3. Next Lower Level Function and Requirement...' // ❌ 模板中没有这一列！
}
```

**影响**：DFMEA 生成的数据会有 `s3_func_element` 字段，但模板中没有对应的列。

---

## ❌ 问题2：Step 5 缺少 RPN 列

### 模板要求（7列）：
1. Current Prevention Controls (PC) of FC
2. Current Detection Controls (DC) of FC or FM
3. Occurrence (O)
4. Detection (D)
5. Severity (S)
6. **Risk Priority Number (RPN)** ← 当前缺失！
7. DFMEA AP

### 当前实现（5列）：
```typescript
step5: {
  col1: 'Current Prevention Control (PC)',
  col2: 'Occ. (O)',
  col3: 'Current Detection Control (DC)',
  col4: 'Det. (D)',
  col5: 'AP', // ❌ 这里应该是 S, RPN, AP 三列
}
```

**缺失**：
- Severity (S) 列
- RPN（风险优先数）列
- RPN 自动计算逻辑（RPN = O × D × S）

---

## ✅ 符合模板的部分

### Step 2（结构分析）✅
- 3列结构正确
- 列名正确

### Step 4（失效分析）✅
- 4列结构正确（包含 S 列）
- 列名正确

### Step 6（优化）✅
- 11列结构正确
- 包含 S/O/D/AP 重新评估

---

## 🔧 需要修复的代码

### 修复1：FmeaTable.tsx - Step 3 列定义

**当前代码（第100-110行）**：
```typescript
step3: {
  title: 'Step 3 - Functional Analysis (功能分析)',
  col1: isDfmea
    ? '1. Next Higher Level Function\nand Requirement\n1.上一较高级别功能及要求'
    : '...',
  col2: isDfmea
    ? '2. Focus Element Function and\nRequirement\n2.关注要素功能及要求'
    : '...',
  col3: isDfmea
    ? '3. Next Lower Level Function\nand Requirement\n3.下一较高级别功能及要求' // ❌ 删除
    : '...',
}
```

**应该改为**：
```typescript
step3: {
  title: 'Step 3 - Functional Analysis (功能分析)',
  col1: isDfmea
    ? '1. Next Higher Level Function\nand Requirement\n1.上一较高级别功能及要求'
    : '1. Function of Process Item...',
  col2: isDfmea
    ? '2. Focus Element Function and\nRequirement\n2.关注要素功能及要求'
    : '2. Function of Process Step...',
  // ❌ DFMEA 删除 col3，但 PFMEA 保留 col3
}
```

**关键**：DFMEA 只有 2 列，PFMEA 有 3 列！

---

### 修复2：FmeaTable.tsx - Step 5 列定义

**当前代码（第121-128行）**：
```typescript
step5: {
  title: 'Step 5 - Risk Analysis (风险分析)',
  col1: 'Current Prevention Control (PC)\n当前失效起因的预防控制 (PC)',
  col2: 'Occ.\n(O)',
  col3: 'Current Detection Control (DC)\n对失效起因或失效模式的当前探测控制 (DC)',
  col4: 'Det.\n(D)',
  col5: 'AP', // ❌ 缺少 S, RPN
}
```

**应该改为**：
```typescript
step5: {
  title: 'Step 5 - Risk Analysis (风险分析)',
  col1: isDfmea
    ? 'Current Prevention Controls (PC) of FC\n当前预防控制 (PC)'
    : 'Current Prevention Control (PC)\n当前失效起因的预防控制 (PC)',
  col2: isDfmea
    ? 'Current Detection Controls (DC) of FC or FM\n当前探测控制 (DC)'
    : 'Current Detection Control (DC)\n对失效起因或失效模式的当前探测控制 (DC)',
  col3: 'Occ.\n(O)',
  col4: 'Det.\n(D)',
  col5: isDfmea ? 'Severity\n(S)' : 'AP', // DFMEA 添加 S 列
  col6: isDfmea ? 'RPN' : undefined, // DFMEA 添加 RPN 列
  col7: isDfmea ? 'AP' : undefined, // DFMEA 添加 AP 列
}
```

---

### 修复3：添加 RPN 自动计算

在表格渲染和数据生成时，需要自动计算 RPN：

```typescript
const calculateRPN = (occurrence: number, detection: number, severity: number): number => {
  return occurrence * detection * severity;
};

const calculateAP = (rpn: number): string => {
  if (rpn <= 80) return 'L';
  if (rpn <= 200) return 'M';
  return 'H';
};
```

---

### 修复4：Excel 导出中的列宽度

需要调整列宽度以适应新的列结构（DFMEA 7列 vs PFMEA 5列）。

---

## 📊 修复后的完整列结构

### DFMEA（共 28 列）

| 步骤 | 列数 | 列名 |
|------|------|------|
| Step 1 | 1 | History/Change |
| Step 2 | 3 | Next Higher Level, Focus Element, Next Lower Level |
| Step 3 | 2 | Next Higher Level Function, Focus Element Function |
| Step 4 | 4 | Failure Effects (FE) + S, Failure Mode (FM), Failure Cause (FC) |
| Step 5 | 7 | PC, DC, O, D, S, RPN, AP |
| Step 6 | 11 | Prevention Action, Detection Action, Responsible Person, Target Date, Status, Action Taken, Completion Date, S, O, D, AP, Remarks |

### PFMEA（共 28 列）

| 步骤 | 列数 | 列名 |
|------|------|------|
| Step 1 | 1 | History/Change |
| Step 2 | 3 | Process Item, Process Step, Work Element |
| Step 3 | 3 | Process Item Function, Process Step Function, Work Element Function |
| Step 4 | 4 | Failure Effects (FE) + S, Failure Mode (FM), Failure Cause (FC) |
| Step 5 | 5 | PC, O, DC, D, AP |
| Step 6 | 12 | 同 DFMEA |

---

## 🎯 修复优先级

1. **高优先级**（立即修复）：
   - ✅ Step 3 列结构（DFMEA 2列，PFMEA 3列）
   - ✅ Step 5 列结构（添加 S, RPN, AP）
   - ✅ RPN 自动计算

2. **中优先级**（后续优化）：
   - 颜色编码优化
   - 列宽度调整
   - 数据验证增强

---

## 📝 测试计划

修复后需要测试：

1. **DFMEA 生成测试**：
   - 验证 Step 3 只有 2 列
   - 验证 Step 5 有 7 列（包括 RPN）
   - 验证 RPN = O × D × S 自动计算
   - 验证 AP 根据 RPN 自动确定（L/M/H）

2. **PFMEA 生成测试**：
   - 确保 PFMEA 不受影响
   - 验证 Step 3 仍然有 3 列
   - 验证 Step 5 仍然有 5 列

3. **Excel 导出测试**：
   - 验证导出的 Excel 文件格式正确
   - 验证列宽度合适

---

## 🚀 下一步

1. 修改 `FmeaTable.tsx` 中的列定义
2. 修改 Excel 导出逻辑
3. 添加 RPN 计算功能
4. 更新数据验证逻辑
5. 测试 DFMEA 和 PFMEA 生成
6. 部署新版本

---

**📢 准备开始修复！**
