import { UserInfo, UserRole, VerificationCode, FmeaProject, ProjectVersion, Comment, CollaborationActivity } from '../types';

class InMemoryDB {
  private users: Map<string, UserInfo> = new Map();
  private verificationCodes: Map<string, VerificationCode> = new Map();
  private projects: Map<string, FmeaProject> = new Map();
  private projectVersions: Map<string, ProjectVersion[]> = new Map();
  private comments: Map<string, Comment[]> = new Map();
  private activities: Map<string, CollaborationActivity[]> = new Map();
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

  // 项目相关方法
  createProject(project: FmeaProject): void {
    this.projects.set(project.id, project);
    this.projectVersions.set(project.id, []);
    this.comments.set(project.id, []);
    this.activities.set(project.id, []);
  }

  getProject(id: string): FmeaProject | undefined {
    return this.projects.get(id);
  }

  getAllProjects(): FmeaProject[] {
    return Array.from(this.projects.values());
  }

  getProjectsByUser(userId: string): FmeaProject[] {
    return Array.from(this.projects.values()).filter(
      project => project.createdBy === userId || project.collaborators.includes(userId)
    );
  }

  updateProject(id: string, updates: Partial<FmeaProject>): boolean {
    const project = this.projects.get(id);
    if (!project) return false;
    
    Object.assign(project, updates, { updatedAt: Date.now() });
    this.projects.set(id, project);
    return true;
  }

  deleteProject(id: string): boolean {
    this.projectVersions.delete(id);
    this.comments.delete(id);
    this.activities.delete(id);
    return this.projects.delete(id);
  }

  addCollaborator(projectId: string, userId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;
    
    if (!project.collaborators.includes(userId)) {
      project.collaborators.push(userId);
      this.projects.set(projectId, project);
      return true;
    }
    return false;
  }

  removeCollaborator(projectId: string, userId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;
    
    const index = project.collaborators.indexOf(userId);
    if (index > -1) {
      project.collaborators.splice(index, 1);
      this.projects.set(projectId, project);
      return true;
    }
    return false;
  }

  // 版本相关方法
  createVersion(version: ProjectVersion): void {
    const versions = this.projectVersions.get(version.projectId) || [];
    versions.push(version);
    this.projectVersions.set(version.projectId, versions);
  }

  getProjectVersions(projectId: string): ProjectVersion[] {
    return this.projectVersions.get(projectId) || [];
  }

  getVersion(projectId: string, version: number): ProjectVersion | undefined {
    const versions = this.projectVersions.get(projectId) || [];
    return versions.find(v => v.version === version);
  }

  // 评论相关方法
  createComment(projectId: string, comment: Comment): void {
    const comments = this.comments.get(projectId) || [];
    comments.push(comment);
    this.comments.set(projectId, comments);
  }

  getProjectComments(projectId: string): Comment[] {
    return this.comments.get(projectId) || [];
  }

  updateComment(projectId: string, commentId: string, updates: Partial<Comment>): boolean {
    const comments = this.comments.get(projectId);
    if (!comments) return false;
    
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return false;
    
    Object.assign(comment, updates, { updatedAt: Date.now() });
    this.comments.set(projectId, comments);
    return true;
  }

  deleteComment(projectId: string, commentId: string): boolean {
    const comments = this.comments.get(projectId);
    if (!comments) return false;
    
    const index = comments.findIndex(c => c.id === commentId);
    if (index > -1) {
      comments.splice(index, 1);
      this.comments.set(projectId, comments);
      return true;
    }
    return false;
  }

  addReply(projectId: string, commentId: string, reply: any): boolean {
    const comments = this.comments.get(projectId);
    if (!comments) return false;
    
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return false;
    
    comment.replies.push(reply);
    this.comments.set(projectId, comments);
    return true;
  }

  // 活动日志相关方法
  logActivity(projectId: string, activity: CollaborationActivity): void {
    const activities = this.activities.get(projectId) || [];
    activities.push(activity);
    this.activities.set(projectId, activities);
  }

  getProjectActivities(projectId: string): CollaborationActivity[] {
    return this.activities.get(projectId) || [];
  }

  getUserActivities(userId: string): CollaborationActivity[] {
    const allActivities: CollaborationActivity[] = [];
    for (const activities of this.activities.values()) {
      allActivities.push(...activities.filter(a => a.userId === userId));
    }
    return allActivities.sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const db = new InMemoryDB();
