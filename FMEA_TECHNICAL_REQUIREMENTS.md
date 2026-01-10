# FMEA系统技术方案增强文档
## 基于AIAG VDA FMEA 1.0和SAE J1739-2021标准

**文档版本**: 1.0
**创建日期**: 2025-01-10
**适用标准**: AIAG VDA FMEA Handbook 1st Edition (2019), SAE J1739-2021
**项目负责人**: Jasonbai

---

## 📋 目录

1. [当前系统现状分析](#当前系统现状分析)
2. [标准要求概览](#标准要求概览)
3. [差距分析](#差距分析)
4. [新增功能需求](#新增功能需求)
5. [技术实现方案](#技术实现方案)
6. [开发路线图](#开发路线图)
7. [参考资源](#参考资源)

---

## 🔍 当前系统现状分析

### 已实现功能（✓）

#### 核心功能
- ✅ **DFMEA和PFMEA支持**：支持设计FMEA和过程FMEA两种类型
- ✅ **六步法框架**：实现AIAG VDA六步法（注意：标准是7步）
- ✅ **Step 1 - 规划和准备**：
  - 项目基本信息表单（公司名称、地点、顾客、车型等）
  - 跨职能团队设置
  - 保密等级选择
  - FMEA ID编号生成

- ✅ **Step 2 - 结构分析**：
  - 三层级结构（上一级、关注要素、下一级/4M类型）
  - 支持DFMEA和PFMEA的不同结构

- ✅ **Step 3 - 功能分析**：
  - 功能和要求描述
  - 三层级功能映射

- ✅ **Step 4 - 失效分析**：
  - 失效影响（FE）
  - 失效模式（FM）
  - 失效起因（FC）
  - 严重度评分（S: 1-10）

- ✅ **Step 5 - 风险分析**：
  - 当前预防控制（PC）
  - 频度评分（O: 1-10）
  - 当前探测控制（DC）
  - 探测度评分（D: 1-10）
  - 行动优先级（AP: H/M/L）

- ✅ **Step 6 - 优化**：
  - 预防措施
  - 探测措施
  - 责任人、目标日期
  - 措施状态、采取的措施
  - 完成日期
  - 重新评分（S/O/D/AP）

#### 技术特性
- ✅ **AI驱动生成**：支持多种AI模型（Gemini, GLM-4-Plus, DeepSeek等）
- ✅ **双语界面**：中英双语表头和说明
- ✅ **导出功能**：Excel (.xlsx)、PDF (打印)、JSON格式
- ✅ **响应式设计**：支持桌面和移动端
- ✅ **颜色编码**：AP优先级颜色标记（H=红, M=黄, L=绿）

---

## 📚 标准要求概览

### AIAG VDA FMEA 1st Edition (2019) - 七步法

根据[AIAG-VDA 7-Step DFMEA Process](https://qualitytrainingportal.com/resources/fmea-resource-center/aiag-vda-fmea/aiag-vda-seven-step-dfmea/)：

| 步骤 | 名称 | 描述 | 必需工具 |
|------|------|------|----------|
| **Step 1** | Planning and Preparation | 定义范围、团队、包含/排除内容 | 项目范围表、5T法 |
| **Step 2** | Structure Analysis | 可视化系统或过程结构 | **方块图/边界图**、结构树、过程流程图 |
| **Step 3** | Function Analysis | 识别和描述要素功能 | 功能网、功能矩阵 |
| **Step 4** | Failure Analysis | 识别失效模式和失效链 | 失效链、失效网络 |
| **Step 5** | Risk Analysis | 评估和优先排序风险 | AP矩阵、SOD评分表 |
| **Step 6** | Optimization | 定义降低风险措施 | 措施跟踪表 |
| **Step 7** | **Documentation of Results** | **结果文件化和沟通** | **FMEA报告、管理层评审** |

### SAE J1739-2021 关键要求

- **持续改进**：FMEA是活的文档，需要持续更新
- **变更管理**：任何设计/过程变更都需要触发FMEA评审
- **供应链整合**：与供应商的FMEA协同
- **数据驱动决策**：基于历史数据和现场反馈
- **时间节点**：在APQP的关键时间点完成FMEA

---

## ❌ 差距分析

### 1. 缺少Step 7（结果文件化）

**标准要求**：
- FMEA完成后的正式报告
- 管理层评审和批准
- 沟通机制（干系人通知）
- 文件分发和存档
- 经验教训总结

**当前状态**：❌ **完全缺失**

**影响**：
- 无法完成FMEA闭环
- 缺少正式批准流程
- 难以追溯FMEA状态
- 管理层缺乏可见性

---

### 2. Step 2结构分析可视化工具不足

**标准要求**：
根据[Process Flow - Structure Tree & Block Diagram in FMEA](https://quasist.com/fmea/process-flow-structure-tree-block-diagram-in-fmea/)：

- **方块图/边界图（Block Diagram）** - DFMEA必需
  - 系统边界定义
  - 内部和外部接口
  - 信息/能量/物质流动

- **过程流程图（Process Flow Diagram）** - PFMEA必需
  - 过程步骤可视化
  - 运输、存储、检验点

- **结构树（Structure Tree）**
  - 层级关系可视化
  - 展开/折叠功能

**当前状态**：⚠️ **仅有文本输入，无可视化图形**

**影响**：
- 难以理解系统关系
- 易遗漏接口失效
- 不符合标准推荐的图形化方法
- AI生成质量受限于输入方式

---

### 3. AP（行动优先级）逻辑不完整

**标准要求**（AIAG VDA）：

| S | O | D | AP | 行动要求 |
|---|---|---|----|---------|
| ≥8 | ANY | ANY | **H** | 必须降低 |
| ANY | ≥8 | ANY | **H** | 必须降低 |
| ANY | ANY | ≥8 | **H** | 必须降低 |
| 6-7 | 6-7 | 6-7 | **M** | 降低至可接受 |
| ≤5 | ≤5 | ≤5 | **L** | 可接受 |

**当前状态**：⚠️ **部分实现，但可能不够精确**

**需要改进**：
- 自动计算AP并高亮
- AP与措施状态的联动验证
- AP降低的验证逻辑

---

### 4. 项目管理和协作功能缺失

**标准要求**：
- 跨职能团队协作
- FMEA评审历史记录
- 变更管理（谁改了什么、何时）
- 版本控制
- 并发编辑锁定

**当前状态**：❌ **完全缺失**

---

### 5. AI生成的标准化和质量控制

**问题**：
- AI可能生成不符合标准的内容
- 缺少AI输出的验证机制
- 没有历史数据学习
- 缺少模板库

**需要改进**：
- 标准化提示词工程
- AI输出验证规则
- 常见失效模式库
- 行业最佳实践模板

---

## 🚀 新增功能需求

### Phase 1: 核心标准合规（高优先级）

#### 1.1 实现Step 7 - 结果文件化

**需求ID**: FMEA-7-001
**优先级**: 🔴 P0（必须）

**功能点**：

1. **FMEA完成检查清单**
   ```typescript
   interface FMEACompletionChecklist {
     allHighPrioritiesAddressed: boolean;  // 所有H优先级已处理
     responsiblePersonAssigned: boolean;   // 责任人已分配
     targetDatesSet: boolean;              // 目标日期已设定
     actionsDocumented: boolean;           // 措施已记录
     reviewCompleted: boolean;             // 评审已完成
     approvalObtained: boolean;            // 批准已获得
   }
   ```

2. **FMEA摘要报告**
   - 自动生成执行摘要
   - Top 10高风险项目
   - 改进措施统计
   - 完成度指标

3. **管理层评审界面**
   - 评审准备材料包
   - 评审意见记录
   - 电子签名批准
   - 批准历史追踪

4. **干系人通知**
   - 邮件通知功能
   - 评论和反馈收集
   - 待办事项跟踪

5. **文件归档**
   - PDF/A格式长期存档
   - 版本标签（Draft, Review, Approved, Obsolete）
   - 检索和报告生成

---

#### 1.2 结构分析可视化工具

**需求ID**: FMEA-2-VIS
**优先级**: 🔴 P0（必须）

**功能点**：

1. **方块图编辑器（DFMEA）**
   - 拖拽式界面
   - 系统边界定义
   - 内部/外部元素区分
   - 接口连接（信息流、能量流、物质流）
   - 导出为PNG/SVG

   **数据结构**：
   ```typescript
   interface BlockDiagram {
     elements: BlockElement[];
     connections: Connection[];
     boundary: Boundary;
   }

   interface BlockElement {
     id: string;
     name: string;
     type: 'system' | 'subsystem' | 'component' | 'external';
     level: number;
     position: { x: number; y: number };
   }

   interface Connection {
     from: string;
     to: string;
     type: 'information' | 'energy' | 'material';
   }
   ```

2. **过程流程图编辑器（PFMEA）**
   - 过程步骤节点
   - 决策点（菱形）
   - 连接点和流向
   - 运输、存储、检验符号
   - 并行路径支持

3. **结构树视图**
   - 层级树形展示
   - 展开/折叠
   - 拖拽重组
   - 与表格数据联动

4. **AI辅助生成**
   - 从文本描述自动生成方块图
   - 智能推荐结构层级
   - 接口关系推断

---

#### 1.3 增强的AP矩阵和验证

**需求ID**: FMEA-5-AP
**优先级**: 🟡 P1（高）

**功能点**：

1. **自动AP计算**
   - 实时计算AP
   - S/O/D输入时立即更新
   - 颜色编码（H=红, M=黄, L=绿）

2. **AP验证规则**
   ```typescript
   interface APValidation {
     rule: string;
     check: (s: number, o: number, d: number, ap: string) => boolean;
     errorMessage: string;
   }

   const AP_RULES: APValidation[] = [
     {
       rule: 'HIGH_S',
       check: (s, o, d, ap) => s >= 8 ? ap === 'H' : true,
       errorMessage: 'S≥8时，AP必须为H'
     },
     {
       rule: 'HIGH_O',
       check: (s, o, d, ap) => o >= 8 ? ap === 'H' : true,
       errorMessage: 'O≥8时，AP必须为H'
     },
     {
       rule: 'HIGH_D',
       check: (s, o, d, ap) => d >= 8 ? ap === 'H' : true,
       errorMessage: 'D≥8时，AP必须为H'
     },
     {
       rule: 'LOW_ALL',
       check: (s, o, d, ap) => s <= 5 && o <= 5 && d <= 5 ? ap === 'L' : true,
       errorMessage: 'S≤5且O≤5且D≤5时，AP应为L'
     }
   ];
   ```

3. **AP降低验证**
   - 措施实施后AP必须降低或保持
   - 如果AP升高，需要说明原因
   - 重新评分与措施有效性关联

---

### Phase 2: 协作和工作流增强（中优先级）

#### 2.1 变更管理系统

**需求ID**: FMEA-CM-001
**优先级**: 🟡 P1（高）

**功能点**：

1. **变更请求**
   - 变更类型分类（设计变更、过程变更、供应商变更等）
   - 变更影响评估
   - 受影响的FMEA项目自动识别

2. **变更评审流程**
   - 变更评审委员会（Crb）
   - 评审意见记录
   - 批准/拒绝工作流
   - 实施状态跟踪

3. **变更历史**
   - 完整的变更日志
   - Before/After对比
   - 变更原因追溯
   - 时间轴视图

---

#### 2.2 团队协作功能

**需求ID**: FMEA-COLL-001
**优先级**: 🟡 P1（高）

**功能点**：

1. **实时协作**
   - 多用户同时编辑
   - 光标位置显示
   - 冲突检测和解决
   - 编辑锁定机制

2. **评论和讨论**
   - 单元格级别评论
   - @提及功能
   - 讨论串
   - 解决状态跟踪

3. **任务分配**
   - 措施责任人分配
   - 自动提醒
   - 逾期预警
   - 完成确认

4. **团队仪表板**
   - 我的FMEA项目
   - 待处理的任务
   - 评审请求
   - 活动流

---

### Phase 3: AI增强和自动化（中优先级）

#### 3.1 标准化提示词库

**需求ID**: FMEA-AI-PROMPT
**优先级**: 🟡 P1（高）

**功能点**：

1. **行业模板库**
   - 汽车行业DFMEA模板
   - 汽车行业PFMEA模板
   - 电子行业模板
   - 机械行业模板
   - 可自定义模板

2. **失效模式知识库**
   - 常见失效模式数据库
   - 历史FMEA数据学习
   - 相似项目推荐
   - 失效模式分类（SAE J1739附录）

3. **评分指导助手**
   - S/O/D评分准则查询
   - 交互式评分向导
   - 评分合理性检查
   - 与历史数据对比

---

#### 3.2 AI质量验证

**需求ID**: FMEA-AI-VAL
**优先级**: 🟢 P2（中）

**功能点**：

1. **内容一致性检查**
   - 失效链完整性（FE→FM→FC）
   - 功能与失效模式对应
   - 控制措施与失效起因匹配
   - AP计算正确性

2. **标准符合性验证**
   - AIAG VDA六步法完整性
   - 必填字段检查
   - 格式规范验证
   - 术语一致性

3. **改进建议**
   - 高AP项目优先级排序
   - 措施有效性预测
   - 成本效益分析
   - 时间估算

---

### Phase 4: 报告和分析（中优先级）

#### 4.1 高级分析功能

**需求ID**: FMEA-ANA-001
**优先级**: 🟢 P2（中）

**功能点**：

1. **风险分布分析**
   - AP分布图（饼图）
   - S/O/D热力图
   - Top 20风险瀑布图
   - 风险趋势图

2. **措施效果分析**
   - AP降低率统计
   - 措施完成率
   - 平均措施周期
   - 责任部门绩效

3. **跨项目分析**
   - 多FMEA项目对比
   - 系统性失效识别
   - 供应商风险评估
   - 知识复用

---

#### 4.2 报告中心

**需求ID**: FMEA-RPT-001
**优先级**: 🟢 P2（中）

**功能点**：

1. **标准报告模板**
   - AIAG VDA FMEA报告
   - SAE J1739 FMEA报告
   - 管理层摘要报告
   - 供应商FMEA报告

2. **自定义报告**
   - 拖拽式报告设计器
   - 自定义字段选择
   - 条件格式化
   - 多语言支持

3. **报告调度**
   - 定期自动生成
   - 邮件自动发送
   - 报告订阅
   - 归档和版本管理

---

### Phase 5: 集成和扩展（低优先级）

#### 5.1 PLM系统集成

**需求ID**: FMEA-INT-PLM
**优先级**: 🔵 P3（低）

**功能点**：
- 与Teamcenter/Windchill/Siemens集成
- BOM自动同步
- CAD模型关联
- ECR/ECO联动

#### 5.2 ERP系统集成

**需求ID**: FMEA-INT-ERP
**优先级**: 🔵 P3（低）

**功能点**：
- SAP/Oracle集成
- 供应商主数据
- 质量记录关联
- 成本数据集成

---

## 🛠️ 技术实现方案

### 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      FMEA Application                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                              │
│  ├── FMEA Table Component (已实现)                          │
│  ├── Step 7: Documentation Component (新增)                 │
│  ├── Structure Visualization Component (新增)               │
│  ├── Collaboration Component (新增)                         │
│  └── Analytics Dashboard (新增)                             │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand/Redux)                           │
│  ├── FMEA Data Store                                        │
│  ├── Collaboration Store                                    │
│  └── UI State Store                                         │
├─────────────────────────────────────────────────────────────┤
│  Backend Services (Cloudflare Workers)                      │
│  ├── AI Service (已实现)                                    │
│  ├── FMEA CRUD API (增强)                                   │
│  ├── Collaboration API (新增)                               │
│  ├── File Storage API (新增)                                │
│  └── Version Control API (新增)                             │
├─────────────────────────────────────────────────────────────┤
│  Data Storage                                                │
│  ├── Cloudflare D1 (SQLite)                                 │
│  ├── Cloudflare R2 (File Storage)                           │
│  └── Cloudflare KV (Configuration)                          │
├─────────────────────────────────────────────────────────────┤
│  AI Services                                                 │
│  ├── GLM-4-Plus (智谱AI)                                    │
│  ├── Gemini 2.0 Flash                                       │
│  ├── DeepSeek                                               │
│  └── Claude (可选)                                          │
└─────────────────────────────────────────────────────────────┘
```

---

### 数据模型扩展

```typescript
// ========== 扩展 types.ts ==========

// Step 7: Documentation
interface FmeaDocumentation {
  fmeaId: string;
  completionChecklist: FMEACompletionChecklist;
  executiveSummary: string;
  topRisks: TopRiskItem[];
  metrics: FmeaMetrics;
  reviewHistory: ReviewRecord[];
  approval: ApprovalRecord;
  archivalInfo: ArchivalMetadata;
}

interface FMEACompletionChecklist {
  allHighPrioritiesAddressed: boolean;
  responsiblePersonAssigned: boolean;
  targetDatesSet: boolean;
  actionsDocumented: boolean;
  reviewCompleted: boolean;
  approvalObtained: boolean;
  checkedBy: string;
  checkedDate: Date;
}

interface TopRiskItem {
  rowId: string;
  s: number;
  o: number;
  d: number;
  ap: string;
  failureMode: string;
  failureEffect: string;
  rank: number;
}

interface FmeaMetrics {
  totalRows: number;
  highAPCount: number;
  mediumAPCount: number;
  lowAPCount: number;
  completionRate: number;
  averageActionCycle: number; // days
}

interface ReviewRecord {
  reviewId: string;
  reviewType: 'peer' | 'management' | 'supplier' | 'customer';
  reviewer: string;
  reviewDate: Date;
  comments: Comment[];
  decisions: ReviewDecision[];
  status: 'pending' | 'approved' | 'rejected' | 'conditional';
}

interface ApprovalRecord {
  approverName: string;
  approverRole: string;
  approvalDate: Date;
  signature: string; // Digital signature
  validUntil: Date;
  conditions?: string[];
}

// Structure Visualization
interface StructureVisualization {
  fmeaId: string;
  type: 'DFMEA' | 'PFMEA';
  diagramType: 'block' | 'structure-tree' | 'process-flow';
  elements: StructureElement[];
  connections: StructureConnection[];
  metadata: DiagramMetadata;
}

interface StructureElement {
  id: string;
  name: string;
  type: ElementType;
  level: number;
  position: { x: number; y: number };
  properties: Record<string, any>;
}

type ElementType =
  | 'system' | 'subsystem' | 'component' | 'external' // DFMEA
  | 'operation' | 'transport' | 'storage' | 'inspection' | 'decision'; // PFMEA

interface StructureConnection {
  id: string;
  from: string;
  to: string;
  type: 'information' | 'energy' | 'material' | 'flow';
  label?: string;
  bidirectional: boolean;
}

interface DiagramMetadata {
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  version: number;
  bounds: { width: number; height: number };
}

// Collaboration
interface FmeaCollaboration {
  fmeaId: string;
  collaborators: Collaborator[];
  comments: Comment[];
  editHistory: EditRecord[];
  locks: EditLock[];
  activityStream: ActivityItem[];
}

interface Collaborator {
  userId: string;
  userName: string;
  role: 'owner' | 'editor' | 'reviewer' | 'viewer';
  permissions: Permission[];
  lastActive: Date;
}

interface Comment {
  id: string;
  parentId?: string; // For threaded discussions
  authorId: string;
  authorName: string;
  targetCell: string; // e.g., "row-5-s4_mode"
  content: string;
  mentions: string[];
  createdAt: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

interface EditRecord {
  recordId: string;
  userId: string;
  userName: string;
  timestamp: Date;
  changes: CellChange[];
  reason?: string;
}

interface CellChange {
  rowId: string;
  field: string;
  oldValue: any;
  newValue: any;
}

interface EditLock {
  rowId: string;
  field: string;
  lockedBy: string;
  lockedAt: Date;
  expiresAt: Date;
}

interface ActivityItem {
  id: string;
  type: 'edit' | 'comment' | 'mention' | 'assignment' | 'approval';
  actor: string;
  action: string;
  target: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Change Management
interface ChangeRequest {
  changeId: string;
  fmeaId: string;
  changeType: ChangeType;
  requester: string;
  requestDate: Date;
  description: string;
  impactAssessment: ImpactAssessment;
  affectedRows: string[];
  reviewBoard: string[];
  reviewDecisions: ReviewDecision[];
  implementation: ImplementationPlan;
  status: ChangeStatus;
}

type ChangeType =
  | 'design_change'
  | 'process_change'
  | 'supplier_change'
  | 'customer_requirement'
  | 'regulatory_update'
  | 'corrective_action';

interface ImpactAssessment {
  scope: string;
  riskImpact: boolean;
  costImpact: boolean;
  scheduleImpact: boolean;
  qualityImpact: boolean;
  newFailureModes: string[];
  modifiedControls: string[];
}

interface ReviewDecision {
  reviewer: string;
  decision: 'approve' | 'reject' | 'conditional';
  comments: string;
  conditions?: string[];
  decisionDate: Date;
}

interface ImplementationPlan {
  plannedStartDate: Date;
  plannedCompletionDate: Date;
  actualStartDate?: Date;
  actualCompletionDate?: Date;
  responsible: string[];
  verificationMethod: string;
}

type ChangeStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'implementing'
  | 'implemented'
  | 'verified'
  | 'closed';

// AI Quality Validation
interface ValidationReport {
  reportId: string;
  fmeaId: string;
  validationDate: Date;
  validator: 'ai' | 'human';
  overallScore: number; // 0-100
  findings: ValidationFinding[];
  recommendations: string[];
  passed: boolean;
}

interface ValidationFinding {
  findingId: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  category: ValidationCategory;
  description: string;
  affectedRows: string[];
  suggestion?: string;
}

type ValidationCategory =
  | 'consistency'
  | 'completeness'
  | 'compliance'
  | 'logic'
  | 'scoring'
  | 'terminology';
```

---

### 前端组件设计

#### Step 7: 文档化组件

```typescript
// components/FmeaStep7Documentation.tsx

interface FmeaStep7DocumentationProps {
  fmeaData: FmeaAnalysisResult;
  onSave: (documentation: FmeaDocumentation) => void;
}

export const FmeaStep7Documentation: React.FC<FmeaStep7DocumentationProps> = ({
  fmeaData,
  onSave
}) => {
  return (
    <div className="space-y-6">
      {/* 1. 完成检查清单 */}
      <CompletionChecklistSection
        fmeaData={fmeaData}
      />

      {/* 2. 执行摘要 */}
      <ExecutiveSummarySection
        fmeaData={fmeaData}
        aiGenerated={true}
      />

      {/* 3. Top风险清单 */}
      <TopRisksSection
        fmeaData={fmeaData}
        maxItems={10}
      />

      {/* 4. 指标仪表板 */}
      <MetricsDashboard
        fmeaData={fmeaData}
      />

      {/* 5. 评审历史 */}
      <ReviewHistorySection
        fmeaData={fmeaData}
      />

      {/* 6. 批准流程 */}
      <ApprovalSection
        fmeaData={fmeaData}
        onApprove={(approval) => {/* ... */}}
      />

      {/* 7. 文件导出和分发 */}
      <DistributionSection
        fmeaData={fmeaData}
      />
    </div>
  );
};
```

#### 结构可视化组件

```typescript
// components/StructureDiagramEditor.tsx

interface StructureDiagramEditorProps {
  type: 'DFMEA' | 'PFMEA';
  diagramType: 'block' | 'process-flow' | 'structure-tree';
  data: StructureVisualization;
  onChange: (data: StructureVisualization) => void;
  aiSuggestion?: boolean;
}

export const StructureDiagramEditor: React.FC<StructureDiagramEditorProps> = ({
  type,
  diagramType,
  data,
  onChange,
  aiSuggestion = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="flex h-full">
      {/* 工具栏 */}
      <DiagramToolbar
        diagramType={diagramType}
        onAddElement={/* ... */}
        onAutoLayout={/* ... */}
        onAIGenerate={/* ... */}
      />

      {/* 画布区域 */}
      <div className="flex-1 relative">
        <DiagramCanvas
          ref={canvasRef}
          elements={data.elements}
          connections={data.connections}
          onDrag={/* ... */}
          onConnect={/* ... */}
          onSelect={/* ... */}
        />

        {/* 属性面板 */}
        {selectedElement && (
          <ElementPropertiesPanel
            element={selectedElement}
            onChange={/* ... */}
          />
        )}
      </div>

      {/* AI建议面板 */}
      {aiSuggestion && (
        <AISuggestionPanel
          currentStructure={data}
          onAcceptSuggestion={/* ... */}
        />
      )}
    </div>
  );
};
```

---

### API设计

#### 新增端点

```typescript
// backend/src/api/fmea-documentation.ts

// Step 7相关
GET    /api/fmea/:id/documentation          // 获取文档化数据
POST   /api/fmea/:id/documentation          // 保存文档化数据
GET    /api/fmea/:id/documentation/checklist // 获取检查清单
POST   /api/fmea/:id/documentation/approve  // 提交批准
GET    /api/fmea/:id/documentation/reviews  // 获取评审历史

// 结构可视化
GET    /api/fmea/:id/structure              // 获取结构图
POST   /api/fmea/:id/structure              // 保存结构图
POST   /api/fmea/:id/structure/ai-generate  // AI生成结构图
GET    /api/fmea/:id/structure/export       // 导出图片

// 协作
GET    /api/fmea/:id/collaborators          // 获取协作者
POST   /api/fmea/:id/collaborators          // 添加协作者
DELETE /api/fmea/:id/collaborators/:userId  // 移除协作者
GET    /api/fmea/:id/comments               // 获取评论
POST   /api/fmea/:id/comments               // 添加评论
GET    /api/fmea/:id/activity               // 获取活动流
WebSocket /ws/fmea/:id/realtime             // 实时协作

// 变更管理
GET    /api/fmea/:id/changes                // 获取变更历史
POST   /api/fmea/:id/changes                // 创建变更请求
GET    /api/changes/:changeId               // 获取变更详情
POST   /api/changes/:changeId/review        // 提交评审决策
POST   /api/changes/:changeId/implement     // 标记实施状态

// AI验证
POST   /api/fmea/:id/validate               // AI验证FMEA
GET    /api/fmea/:id/validation-report      // 获取验证报告
POST   /api/fmea/:id/optimize               // AI优化建议

// 分析
GET    /api/fmea/:id/analytics              // 获取分析数据
GET    /api/fmea/:id/analytics/trends       // 获取趋势数据
POST   /api/reports/generate                // 生成报告
GET    /api/reports/:reportId               // 获取报告
```

---

## 📅 开发路线图

### Sprint 1-2: Step 7 实现和基础增强（4周）

**目标**: 实现核心标准合规功能

- ✅ Week 1-2: Step 7 - 结果文件化
  - 完成检查清单组件
  - 执行摘要生成
  - 评审历史界面
  - 批准流程

- ✅ Week 3-4: AP矩阵增强
  - 自动计算和验证
  - AP降低验证逻辑
  - 颜色编码改进

**交付物**:
- Step 7完整功能
- AP计算准确性100%
- 单元测试覆盖率>80%

---

### Sprint 3-4: 结构可视化工具（4周）

**目标**: 实现结构分析图形化工具

- ✅ Week 5-6: 方块图编辑器（DFMEA）
  - 拖拽式画布
  - 元素库
  - 连接线绘制
  - 导出功能

- ✅ Week 7-8: 过程流程图编辑器（PFMEA）
  - 过程步骤节点
  - 决策点支持
  - 符号库
  - AI辅助生成

**交付物**:
- 方块图/流程图编辑器
- AI生成建议功能
- SVG/PNG导出

---

### Sprint 5-6: 协作和变更管理（4周）

**目标**: 实现团队协作功能

- ✅ Week 9-10: 实时协作
  - WebSocket实时通信
  - 编辑锁机制
  - 评论系统
  - 活动流

- ✅ Week 11-12: 变更管理
  - 变更请求工作流
  - 评审流程
  - 变更历史

**交付物**:
- 实时协作功能
- 变更管理系统
- 权限控制

---

### Sprint 7-8: AI增强（4周）

**目标**: 提升AI生成质量

- ✅ Week 13-14: 提示词工程
  - 行业模板库
  - 失效模式知识库
  - 标准化提示词

- ✅ Week 15-16: AI验证
  - 内容一致性检查
  - 标准符合性验证
  - 改进建议引擎

**交付物**:
- 模板库（5+行业）
- AI验证准确率>90%
- 评分向导

---

### Sprint 9-10: 分析和报告（4周）

**目标**: 实现高级分析功能

- ✅ Week 17-18: 分析仪表板
  - 风险分布图
  - 措施效果分析
  - 趋势图

- ✅ Week 19-20: 报告中心
  - 标准报告模板
  - 自定义报告设计器
  - 报告调度

**交付物**:
- 分析仪表板
- 报告生成器
- 导出格式增强

---

### Sprint 11-12: 集成和优化（4周）

**目标**: 系统集成和性能优化

- ✅ Week 21-22: PLM/ERP集成
  - API对接
  - 数据同步
  - 单点登录

- ✅ Week 23-24: 优化和测试
  - 性能优化
  - 压力测试
  - 用户验收测试
  - 文档完善

**交付物**:
- PLM集成模块
- 性能报告
- 完整文档

---

## 📊 成功指标

### 功能指标
- ✅ 100%符合AIAG VDA FMEA 1.0标准要求
- ✅ 100%符合SAE J1739-2021标准要求
- ✅ Step 1-7全部实现并可用
- ✅ 结构可视化工具支持DFMEA和PFMEA
- ✅ 实时协作支持≥10用户同时编辑

### 质量指标
- ✅ 单元测试覆盖率 ≥ 85%
- ✅ E2E测试覆盖率 ≥ 70%
- ✅ AI生成内容准确率 ≥ 90%
- ✅ 系统可用性 ≥ 99.5%
- ✅ 页面加载时间 ≤ 2秒

### 用户指标
- ✅ 用户满意度 ≥ 4.5/5.0
- ✅ FMEA完成效率提升 ≥ 50%
- ✅ 错误率降低 ≥ 60%
- ✅ 培训时间减少 ≥ 40%

---

## 🔗 参考资源

### 标准文档
1. [AIAG & VDA FMEA Handbook (1st Edition, 2019)](https://www.aiag.org/)
2. [SAE J1739:2021 - Potential Failure Mode and Effects Analysis](https://www.sae.org/)
3. [AIAG-VDA FMEA Errata (June 2020)](https://www.aiag.org/docs/default-source/training-and-resources/errata-documents/aiag-vda-fmea-handbook-errata-june-2020.pdf)

### 技术资源
1. [AIAG-VDA 7-Step DFMEA Process](https://qualitytrainingportal.com/resources/fmea-resource-center/aiag-vda-fmea/aiag-vda-seven-step-dfmea/)
2. [Process Flow - Structure Tree & Block Diagram in FMEA](https://quasist.com/fmea/process-flow-structure-tree-block-diagram-in-fmea/)
3. [Understanding the 7-Step VDA-AIAG FMEA Process](https://www.enco-software.com/understanding-the-7-step-fmea-process-a-guide-to-vda-aiag-alignment/)
4. [AIAG & VDA FMEA Overview](https://quality-one.com/aiag-vda-fmea/)

### 最佳实践
1. [DFMEAs with the New AIAG/VDA FMEA Handbook](https://publicacoes.riqual.org/wp-content/uploads/2021/06/icqem_20_514_525.pdf)
2. [AIAG-VDA Process-FMEA Training](https://fmea-training.com/fmea-training/aiag-vda-process-fmea/)
3. [FMEA according to AIAG-VDA](https://group.qualityfox.info/en/education_system/fmea-according-to-aiag-vda/)

### 开源工具参考
1. [React Flow](https://reactflow.dev/) - 结构图可视化库
2. [JointJS](https://www.jointjs.com/) - 图形编辑库
3. [Fabric.js](https://fabricjs.com/) - Canvas绘图库
4. [Konva.js](https://konvajs.org/) - 2D Canvas框架

---

## 📝 附录

### A. 术语表

| 术语 | 英文 | 定义 |
|------|------|------|
| 失效模式 | Failure Mode (FM) | 故障的表现形式 |
| 失效影响 | Failure Effect (FE) | 失效对上一级或最终用户的影响 |
| 失效起因 | Failure Cause (FC) | 导致失效发生的根本原因 |
| 严重度 | Severity (S) | 失效影响的严重程度（1-10） |
| 频度 | Occurrence (O) | 失效发生的频率（1-10） |
| 探测度 | Detection (D) | 失效被探测出的难度（1-10） |
| 行动优先级 | Action Priority (AP) | 基于S/O/D的风险优先级（H/M/L） |
| 预防控制 | Prevention Control (PC) | 预防失效起因发生的措施 |
| 探测控制 | Detection Control (DC) | 探测失效起因或失效模式的措施 |

### B. AP矩阵快速参考

```
                    S (严重度)
              1-5   6-7   8-10
         ┌──────┬──────┬──────┐
    8-10 │   H  │   H  │   H  │
    O    ├──────┼──────┼──────┤
 (频度) 6-7  │   M  │   M  │   H  │
         ├──────┼──────┼──────┤
    1-5  │   L  │   M  │   H  │
         └──────┴──────┴──────┘

注：当D≥8时，AP至少为M
```

### C. 技术栈总结

**前端**:
- React 18 + TypeScript
- Tailwind CSS
- React Flow (结构图)
- Konva.js (Canvas)
- Zustand (状态管理)
- React Query (数据获取)

**后端**:
- Cloudflare Workers
- Cloudflare D1 (数据库)
- Cloudflare R2 (文件存储)
- WebSocket (实时协作)

**AI服务**:
- 智谱AI GLM-4-Plus
- Google Gemini 2.0 Flash
- DeepSeek
- Anthropic Claude (可选)

**测试**:
- Vitest (单元测试)
- Playwright (E2E测试)
- MSW (API Mock)

---

**文档结束**

---

**联系方式**:
- 技术负责人: Jasonbai
- 联系方式: 13510420462
- 版权所有 © 2025 Intelligent FMEA Generator Project
