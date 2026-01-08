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

export interface VerificationCode {
  code: string;
  expiresAt: number;
}

export interface SendCodeRequest {
  phone: string;
}

export interface LoginRequest {
  phone: string;
  code: string;
}

export enum FmeaType {
  DFMEA = 'dfmea',
  PFMEA = 'pfmea'
}

export interface FmeaRow {
  id: string;
  itemFunction: string;
  failureMode: string;
  failureEffect: string;
  severity: number;
  failureCause: string;
  occurrence: number;
  currentControls: string;
  detection: number;
  rpn: number;
  recommendedActions: string;
  responsibility: string;
  actionResults: string;
  updatedSeverity: number;
  updatedOccurrence: number;
  updatedDetection: number;
  updatedRpn: number;
}

export interface FmeaAnalysisResult {
  type: FmeaType;
  projectName: string;
  projectDescription: string;
  analysisDate: number;
  rows: FmeaRow[];
  criteria: any;
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

export interface Comment {
  id: string;
  projectId: string;
  type: CommentType;
  rowId?: string;
  field?: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
  resolved: boolean;
  replies: CommentReply[];
}

export interface CommentReply {
  id: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: number;
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

export interface CreateProjectRequest {
  title: string;
  type: FmeaType;
  description?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  collaborators?: string[];
}

export interface CreateCommentRequest {
  type: CommentType;
  rowId?: string;
  field?: string;
  content: string;
}

export interface CreateReplyRequest {
  content: string;
}
