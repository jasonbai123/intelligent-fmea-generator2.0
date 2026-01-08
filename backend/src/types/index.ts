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
