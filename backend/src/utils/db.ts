import { UserInfo, UserRole, VerificationCode } from '../types';

class InMemoryDB {
  private users: Map<string, UserInfo> = new Map();
  private verificationCodes: Map<string, VerificationCode> = new Map();
  private readonly ADMIN_PHONE = '13510420462';

  constructor() {
    // 初始化管理员用户
    this.users.set(this.ADMIN_PHONE, {
      id: 'admin',
      phone: this.ADMIN_PHONE,
      role: UserRole.ADMIN,
      createdAt: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
      isTrial: false
    });
  }

  // 用户相关方法
  getUser(phone: string): UserInfo | undefined {
    return this.users.get(phone);
  }

  getAllUsers(): UserInfo[] {
    return Array.from(this.users.values()).filter(user => user.phone !== this.ADMIN_PHONE);
  }

  saveUser(user: UserInfo): void {
    this.users.set(user.phone, user);
  }

  deleteUser(phone: string): boolean {
    if (phone === this.ADMIN_PHONE) {
      return false;
    }
    return this.users.delete(phone);
  }

  updateUserExpiration(phone: string, expiresAt: number): boolean {
    const user = this.getUser(phone);
    if (user && user.phone !== this.ADMIN_PHONE) {
      user.expiresAt = expiresAt;
      this.saveUser(user);
      return true;
    }
    return false;
  }

  convertTrialToRegular(phone: string): boolean {
    const user = this.getUser(phone);
    if (user && user.isTrial && user.phone !== this.ADMIN_PHONE) {
      user.role = UserRole.REGULAR;
      user.isTrial = false;
      delete user.trialDays;
      this.saveUser(user);
      return true;
    }
    return false;
  }

  // 验证码相关方法
  getVerificationCode(phone: string): VerificationCode | undefined {
    return this.verificationCodes.get(phone);
  }

  saveVerificationCode(phone: string, code: VerificationCode): void {
    this.verificationCodes.set(phone, code);
  }

  deleteVerificationCode(phone: string): boolean {
    return this.verificationCodes.delete(phone);
  }
}

export const db = new InMemoryDB();
