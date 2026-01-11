export enum FmeaType {
  DFMEA = 'dfmea',
  PFMEA = 'pfmea'
}

export interface FmeaRow {
  id?: string;
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
  s6_status: string;
  remarks: string;
}

export interface FmeaAnalysisResult {
  title: string;
  type: FmeaType;
  rows: FmeaRow[];
}

export interface GenerationRequest {
  type: FmeaType;
  textContext: string;
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
  apiKey: string;
  baseUrl: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: AiProvider.GEMINI,
  apiKey: '',
  baseUrl: '',
  modelName: 'gemini-2.0-flash',
  temperature: 0.7,
  maxTokens: 8192
};

export enum ChatRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

export interface AuthToken {
  token: string;
  userInfo: UserInfo;
  expiresAt: number;
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

export enum ProjectStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
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
  version: string;
  data: FmeaAnalysisResult;
  createdBy: string;
  createdAt: number;
  comment?: string;
}

export enum CommentType {
  GENERAL = 'general',
  ROW = 'row',
  CELL = 'cell'
}

export interface Comment {
  id: string;
  projectId: string;
  type: CommentType;
  rowId?: string;
  field?: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  resolved: boolean;
  replies: CommentReply[];
  likes?: number;
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: number;
}

export interface ViewState {
  GENERATOR: 'GENERATOR';
  COLLABORATION: 'COLLABORATION';
  SETTINGS: 'SETTINGS';
  ABOUT: 'ABOUT';
}
