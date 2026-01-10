export enum FmeaType {
  DFMEA = 'DFMEA',
  PFMEA = 'PFMEA',
}

export interface FmeaRow {
  id: string;

  s2_item: string; 
  s2_step: string; 
  s2_element: string; 

  s3_func_item: string; 
  s3_func_step: string; 
  s3_func_element: string; 

  s4_effect: string; 
  s4_severity: number; 
  s4_mode: string; 
  s4_cause: string; 

  s5_prev_control: string; 
  s5_occurrence: number; 
  s5_det_control: string; 
  s5_detection: number; 
  s5_ap: string; 

  s6_prev_action: string;
  s6_det_action: string;
  s6_resp_person: string;
  s6_target_date: string;
  
  s6_status?: string;
  s6_action_taken?: string;
  s6_completion_date?: string;
  s6_severity_new?: number;
  s6_occurrence_new?: number;
  s6_detection_new?: number;
  s6_ap_new?: string;
  
  remarks?: string;

  [key: string]: any;
}

export interface FmeaAnalysisResult {
  title: string;
  type: FmeaType;
  rows: FmeaRow[];
}

export interface GenerationRequest {
  type: FmeaType;
  textContext: string;
  imageBase64?: string;
  mimeType?: string;
  settings?: AiSettings;
}

export enum AiProvider {
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
  ZHIPU = 'zhipu',
  SILICONFLOW = 'siliconflow',
  DOUBAO = 'doubao',
  CLAUDE = 'claude'
}

export interface AiSettings {
  provider: AiProvider;
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: AiProvider.GEMINI,
  modelName: 'gemini-2.5-pro-preview-03625', // 使用正确的 Gemini 2.5 Pro 预览版模型名称
  apiKey: '',
  baseUrl: '',
};

export enum ChatRole {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  isUpdate?: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  TRIAL = 'trial',
  REGULAR = 'regular'
}

export interface UserInfo {
  id: string;
  phone: string;
  role: UserRole;
  createdAt: number;
  expiresAt: number;
  isTrial: boolean;
  trialDays?: number;
}

export interface AuthToken {
  token: string;
  userInfo: UserInfo;
  expiresAt: number;
}

export enum ProjectStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  APPROVED = 'approved',
  ARCHIVED = 'archived'
}

export interface FmeaProject {
  id: string;
  title: string;
  type: FmeaType;
  data: FmeaAnalysisResult;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  status: ProjectStatus;
  collaborators: string[];
  currentVersion: number;
  description?: string;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: number;
  data: FmeaAnalysisResult;
  createdBy: string;
  createdAt: number;
  comment: string;
}

export enum CommentType {
  GENERAL = 'general',
  ROW = 'row',
  CELL = 'cell'
}

export interface CommentReply {
  id: string;
  commentId: string;
  author: string;
  authorName: string;
  content: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  projectId: string;
  type: CommentType;
  author: string;
  authorName: string;
  content: string;
  resolved: boolean;
  createdAt: number;
  updatedAt: number;
  replies: CommentReply[];
}

export interface CollaborationActivity {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: number;
}

// ============================================================
// STEP 7: Documentation of Results (AIAG VDA FMEA)
// ============================================================

export interface FmeaDocumentation {
  fmeaId: string;
  completionChecklist: FMEACompletionChecklist;
  executiveSummary: string;
  topRisks: TopRiskItem[];
  metrics: FmeaMetrics;
  reviewHistory: ReviewRecord[];
  approval: ApprovalRecord | null;
  archivalInfo: ArchivalMetadata;
  createdAt: number;
  updatedAt: number;
}

export interface FMEACompletionChecklist {
  allHighPrioritiesAddressed: boolean;
  responsiblePersonAssigned: boolean;
  targetDatesSet: boolean;
  actionsDocumented: boolean;
  reviewCompleted: boolean;
  approvalObtained: boolean;
  checkedBy: string;
  checkedDate: number;
  notes?: string;
}

export interface TopRiskItem {
  rowId: string;
  s: number;
  o: number;
  d: number;
  ap: string;
  failureMode: string;
  failureEffect: string;
  rank: number;
  requiresImmediateAction: boolean;
}

export interface FmeaMetrics {
  totalRows: number;
  highAPCount: number;
  mediumAPCount: number;
  lowAPCount: number;
  completionRate: number; // 0-100
  averageActionCycle: number; // in days
  actionsCompleted: number;
  actionsPending: number;
  overdueActions: number;
}

export interface ReviewRecord {
  reviewId: string;
  reviewType: 'peer' | 'management' | 'supplier' | 'customer' | 'external';
  reviewer: string;
  reviewerName: string;
  reviewDate: number;
  comments: ReviewComment[];
  decisions: ReviewDecision[];
  status: 'pending' | 'approved' | 'rejected' | 'conditional';
  attachmentUrls?: string[];
}

export interface ReviewComment {
  id: string;
  author: string;
  authorName: string;
  content: string;
  timestamp: number;
  resolved: boolean;
}

export interface ReviewDecision {
  category: string;
  decision: 'approve' | 'reject' | 'conditional';
  condition?: string;
  reason: string;
}

export interface ApprovalRecord {
  approverName: string;
  approverRole: string;
  approvalDate: number;
  signature: string; // Base64 encoded signature
  validUntil: number;
  conditions?: string[];
  approvalLevel: 'preliminary' | 'interim' | 'final';
}

export interface ArchivalMetadata {
  version: string;
  status: 'draft' | 'submitted' | 'approved' | 'obsolete';
  archivedBy: string;
  archivedDate: number;
  retentionPeriod: number; // in days
  nextReviewDate: number;
  documentNumber: string;
  distributionList: string[];
}

// ============================================================
// AP Validation and Calculation
// ============================================================

export interface APValidationRule {
  ruleCode: string;
  description: string;
  check: (s: number, o: number, d: number, currentAP: string) => boolean;
  expectedAP: (s: number, o: number, d: number) => string;
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
}

export interface APValidationResult {
  isValid: boolean;
  currentAP: string;
  expectedAP: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  rule: string;
  message: string;
  severity: number; // S, O, or D
  value: number;
  threshold: number;
}

export interface ValidationWarning {
  rule: string;
  message: string;
  recommendation: string;
}

// ============================================================
// Structure Visualization (Step 2 Enhancement)
// ============================================================

export interface StructureVisualization {
  fmeaId: string;
  type: 'DFMEA' | 'PFMEA';
  diagramType: 'block' | 'structure-tree' | 'process-flow';
  elements: StructureElement[];
  connections: StructureConnection[];
  metadata: DiagramMetadata;
  createdAt: number;
  updatedAt: number;
}

export interface StructureElement {
  id: string;
  name: string;
  type: ElementType;
  level: number;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  properties: Record<string, any>;
  style?: ElementStyle;
}

export type ElementType =
  | 'system' | 'subsystem' | 'component' | 'external' // DFMEA
  | 'operation' | 'transport' | 'storage' | 'inspection' | 'decision'; // PFMEA

export interface ElementStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  fontSize?: number;
  icon?: string;
}

export interface StructureConnection {
  id: string;
  from: string;
  to: string;
  type: ConnectionType;
  label?: string;
  bidirectional: boolean;
  style?: ConnectionStyle;
}

export type ConnectionType =
  | 'information' // DFMEA: 信息流
  | 'energy'      // DFMEA: 能量流
  | 'material'    // DFMEA: 物质流
  | 'flow';       // PFMEA: 过程流向

export interface ConnectionStyle {
  lineColor?: string;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  arrowStart?: boolean;
  arrowEnd?: boolean;
}

export interface DiagramMetadata {
  createdBy: string;
  createdAt: number;
  lastModifiedBy: string;
  lastModified: number;
  version: number;
  bounds: { width: number; height: number };
  zoom: number;
  pan: { x: number; y: number };
  gridSize?: number;
  snapToGrid?: boolean;
}

// ============================================================
// Collaboration Features (Future Enhancement)
// ============================================================

export interface FmeaCollaboration {
  fmeaId: string;
  collaborators: Collaborator[];
  comments: CollaborationComment[];
  editHistory: EditRecord[];
  locks: EditLock[];
  activityStream: ActivityItem[];
}

export interface Collaborator {
  userId: string;
  userName: string;
  email: string;
  role: CollaboratorRole;
  permissions: Permission[];
  lastActive: number;
  status: 'active' | 'inactive' | 'pending';
}

export type CollaboratorRole = 'owner' | 'editor' | 'reviewer' | 'viewer';

export type Permission =
  | 'view'
  | 'edit'
  | 'comment'
  | 'approve'
  | 'delete'
  | 'share'
  | 'export'
  | 'admin';

export interface CollaborationComment {
  id: string;
  parentId?: string; // For threaded discussions
  authorId: string;
  authorName: string;
  targetCell: string; // e.g., "row-5-s4_mode"
  content: string;
  mentions: string[];
  createdAt: number;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: number;
}

export interface EditRecord {
  recordId: string;
  userId: string;
  userName: string;
  timestamp: number;
  changes: CellChange[];
  reason?: string;
}

export interface CellChange {
  rowId: string;
  field: string;
  oldValue: any;
  newValue: any;
}

export interface EditLock {
  rowId: string;
  field: string;
  lockedBy: string;
  lockedAt: number;
  expiresAt: number;
}

export interface ActivityItem {
  id: string;
  type: 'edit' | 'comment' | 'mention' | 'assignment' | 'approval' | 'share';
  actor: string;
  action: string;
  target: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// ============================================================
// Change Management (Future Enhancement)
// ============================================================

export interface ChangeRequest {
  changeId: string;
  fmeaId: string;
  changeType: ChangeType;
  requester: string;
  requestDate: number;
  description: string;
  impactAssessment: ImpactAssessment;
  affectedRows: string[];
  reviewBoard: string[];
  reviewDecisions: ReviewDecision[];
  implementation: ImplementationPlan;
  status: ChangeStatus;
  createdAt: number;
  updatedAt: number;
}

export type ChangeType =
  | 'design_change'
  | 'process_change'
  | 'supplier_change'
  | 'customer_requirement'
  | 'regulatory_update'
  | 'corrective_action';

export interface ImpactAssessment {
  scope: string;
  riskImpact: boolean;
  costImpact: boolean;
  scheduleImpact: boolean;
  qualityImpact: boolean;
  newFailureModes: string[];
  modifiedControls: string[];
  estimatedCost: number;
  estimatedTime: number; // in days
}

export interface ImplementationPlan {
  plannedStartDate: number;
  plannedCompletionDate: number;
  actualStartDate?: number;
  actualCompletionDate?: number;
  responsible: string[];
  verificationMethod: string;
  acceptanceCriteria: string[];
}

export type ChangeStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'implementing'
  | 'implemented'
  | 'verified'
  | 'closed';

// ============================================================
// AI Validation (Future Enhancement)
// ============================================================

export interface ValidationReport {
  reportId: string;
  fmeaId: string;
  validationDate: number;
  validator: 'ai' | 'human';
  overallScore: number; // 0-100
  findings: ValidationFinding[];
  recommendations: string[];
  passed: boolean;
  summary: string;
}

export interface ValidationFinding {
  findingId: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  category: ValidationCategory;
  description: string;
  affectedRows: string[];
  suggestion?: string;
  autoFixable: boolean;
}

export type ValidationCategory =
  | 'consistency'
  | 'completeness'
  | 'compliance'
  | 'logic'
  | 'scoring'
  | 'terminology'
  | 'structure';
