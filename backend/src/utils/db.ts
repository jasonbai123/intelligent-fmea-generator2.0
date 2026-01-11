interface KVNamespace {
  get(key: string, options?: any): Promise<string | null>;
  put(key: string, value: string, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>;
}

interface User {
  id: string;
  phone: string;
  role: 'ADMIN' | 'REGULAR' | 'TRIAL';
  createdAt: number;
  expiresAt: number;
  isTrial?: boolean;
  trialDays?: number;
}

interface VerificationCode {
  code: string;
  expiresAt: number;
  createdAt: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  collaborators: string[];
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  data?: any;
}

interface ProjectVersion {
  projectId: string;
  version: string;
  data: any;
  createdBy: string;
  createdAt: number;
  description?: string;
}

interface Comment {
  id: string;
  projectId: string;
  type: 'general' | 'row' | 'cell';
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

interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}

interface Activity {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: string;
  details: any;
  timestamp: number;
}

enum KeyPrefix {
  USER = 'user:',
  VERIFICATION_CODE = 'code:',
  PROJECT = 'project:',
  PROJECT_VERSIONS = 'versions:',
  COMMENT = 'comment:',
  ACTIVITY = 'activity:'
}

class KVDB {
  private kv: KVNamespace;
  private ADMIN_PHONE: string;
  private adminInitialized: boolean;

  constructor(dataKV: KVNamespace) {
    this.kv = dataKV;
    this.ADMIN_PHONE = '13510420462';
    this.adminInitialized = false;
  }

  private async initAdminUser(): Promise<void> {
    try {
      const adminKey = `${KeyPrefix.USER}${this.ADMIN_PHONE}`;
      const existingAdmin = await this.kv.get(adminKey);
      if (!existingAdmin) {
        const adminUser: User = {
          id: 'admin',
          phone: this.ADMIN_PHONE,
          role: 'ADMIN',
          createdAt: Date.now(),
          expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
          isTrial: false
        };
        await this.kv.put(adminKey, JSON.stringify(adminUser));
      }
    } catch (error) {
      console.error('初始化管理员用户失败:', error);
    }
  }

  async getUser(phone: string): Promise<User | undefined> {
    try {
      if (phone === this.ADMIN_PHONE && !this.adminInitialized) {
        await this.initAdminUser();
        this.adminInitialized = true;
      }
      
      const userKey = `${KeyPrefix.USER}${phone}`;
      const userData = await this.kv.get(userKey);
      return userData ? JSON.parse(userData) : undefined;
    } catch (error) {
      console.error('获取用户失败:', error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const userKeys = await this.kv.list({
        prefix: KeyPrefix.USER
      });
      
      const users: User[] = [];
      for (const key of userKeys.keys) {
        const userData = await this.kv.get(key.name);
        if (userData) {
          const user: User = JSON.parse(userData);
          if (user.phone !== this.ADMIN_PHONE) {
            users.push(user);
          }
        }
      }
      return users;
    } catch (error) {
      console.error('获取所有用户失败:', error);
      return [];
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      const userKey = `${KeyPrefix.USER}${user.phone}`;
      await this.kv.put(userKey, JSON.stringify(user));
    } catch (error) {
      console.error('保存用户失败:', error);
      throw error;
    }
  }

  async deleteUser(phone: string): Promise<boolean> {
    try {
      if (phone === this.ADMIN_PHONE) {
        return false;
      }
      const userKey = `${KeyPrefix.USER}${phone}`;
      await this.kv.delete(userKey);
      return true;
    } catch (error) {
      console.error('删除用户失败:', error);
      return false;
    }
  }

  async updateUserExpiration(phone: string, expiresAt: number): Promise<boolean> {
    try {
      if (phone === this.ADMIN_PHONE) {
        return false;
      }
      const user = await this.getUser(phone);
      if (user) {
        user.expiresAt = expiresAt;
        await this.saveUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新用户过期时间失败:', error);
      return false;
    }
  }

  async convertTrialToRegular(phone: string): Promise<boolean> {
    try {
      if (phone === this.ADMIN_PHONE) {
        return false;
      }
      const user = await this.getUser(phone);
      if (user && user.isTrial) {
        user.role = 'REGULAR';
        user.isTrial = false;
        delete user.trialDays;
        await this.saveUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('转换用户类型失败:', error);
      return false;
    }
  }

  async getVerificationCode(phone: string): Promise<VerificationCode | undefined> {
    try {
      const codeKey = `${KeyPrefix.VERIFICATION_CODE}${phone}`;
      const codeData = await this.kv.get(codeKey);
      return codeData ? JSON.parse(codeData) : undefined;
    } catch (error) {
      console.error('获取验证码失败:', error);
      return undefined;
    }
  }

  async saveVerificationCode(phone: string, code: VerificationCode): Promise<void> {
    try {
      const codeKey = `${KeyPrefix.VERIFICATION_CODE}${phone}`;
      await this.kv.put(codeKey, JSON.stringify(code), {
        expirationTtl: 5 * 60
      });
    } catch (error) {
      console.error('保存验证码失败:', error);
      throw error;
    }
  }

  async deleteVerificationCode(phone: string): Promise<boolean> {
    try {
      const codeKey = `${KeyPrefix.VERIFICATION_CODE}${phone}`;
      await this.kv.delete(codeKey);
      return true;
    } catch (error) {
      console.error('删除验证码失败:', error);
      return false;
    }
  }

  async getAllVerificationCodes(): Promise<Array<{ phone: string; code: string; expiresAt: number; createdAt: number }>> {
    try {
      const codeKeys = await this.kv.list({
        prefix: KeyPrefix.VERIFICATION_CODE
      });
      
      const codes: Array<{ phone: string; code: string; expiresAt: number; createdAt: number }> = [];
      for (const key of codeKeys.keys) {
        const codeData = await this.kv.get(key.name);
        if (codeData) {
          const code: VerificationCode = JSON.parse(codeData);
          codes.push({
            phone: key.name.replace(KeyPrefix.VERIFICATION_CODE, ''),
            code: code.code,
            expiresAt: code.expiresAt,
            createdAt: Date.now()
          });
        }
      }
      return codes;
    } catch (error) {
      console.error('获取所有验证码失败:', error);
      return [];
    }
  }

  async createProject(project: Project): Promise<void> {
    try {
      const projectKey = `${KeyPrefix.PROJECT}${project.id}`;
      await this.kv.put(projectKey, JSON.stringify(project));
      
      const versionsKey = `${KeyPrefix.PROJECT_VERSIONS}${project.id}`;
      const commentsKey = `${KeyPrefix.COMMENT}${project.id}`;
      const activitiesKey = `${KeyPrefix.ACTIVITY}${project.id}`;
      
      await Promise.all([
        this.kv.put(versionsKey, JSON.stringify([])),
        this.kv.put(commentsKey, JSON.stringify([])),
        this.kv.put(activitiesKey, JSON.stringify([]))
      ]);
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  }

  async getProject(id: string): Promise<Project | undefined> {
    try {
      const projectKey = `${KeyPrefix.PROJECT}${id}`;
      const projectData = await this.kv.get(projectKey);
      return projectData ? JSON.parse(projectData) : undefined;
    } catch (error) {
      console.error('获取项目失败:', error);
      return undefined;
    }
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      const projectKeys = await this.kv.list({
        prefix: KeyPrefix.PROJECT
      });
      
      const projects: Project[] = [];
      for (const key of projectKeys.keys) {
        const projectData = await this.kv.get(key.name);
        if (projectData) {
          projects.push(JSON.parse(projectData));
        }
      }
      return projects;
    } catch (error) {
      console.error('获取所有项目失败:', error);
      return [];
    }
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    try {
      const allProjects = await this.getAllProjects();
      return allProjects.filter(
        project => project.createdBy === userId || project.collaborators.includes(userId)
      );
    } catch (error) {
      console.error('获取用户项目失败:', error);
      return [];
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<boolean> {
    try {
      const project = await this.getProject(id);
      if (!project) return false;
      
      const updatedProject: Project = {
        ...project,
        ...updates,
        updatedAt: Date.now()
      };
      
      const projectKey = `${KeyPrefix.PROJECT}${id}`;
      await this.kv.put(projectKey, JSON.stringify(updatedProject));
      return true;
    } catch (error) {
      console.error('更新项目失败:', error);
      return false;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      const projectKey = `${KeyPrefix.PROJECT}${id}`;
      const versionsKey = `${KeyPrefix.PROJECT_VERSIONS}${id}`;
      const commentsKey = `${KeyPrefix.COMMENT}${id}`;
      const activitiesKey = `${KeyPrefix.ACTIVITY}${id}`;
      
      await Promise.all([
        this.kv.delete(projectKey),
        this.kv.delete(versionsKey),
        this.kv.delete(commentsKey),
        this.kv.delete(activitiesKey)
      ]);
      
      return true;
    } catch (error) {
      console.error('删除项目失败:', error);
      return false;
    }
  }

  async addCollaborator(projectId: string, userId: string): Promise<boolean> {
    try {
      const project = await this.getProject(projectId);
      if (!project) return false;
      
      if (!project.collaborators.includes(userId)) {
        project.collaborators.push(userId);
        const projectKey = `${KeyPrefix.PROJECT}${projectId}`;
        await this.kv.put(projectKey, JSON.stringify(project));
        return true;
      }
      return false;
    } catch (error) {
      console.error('添加协作者失败:', error);
      return false;
    }
  }

  async removeCollaborator(projectId: string, userId: string): Promise<boolean> {
    try {
      const project = await this.getProject(projectId);
      if (!project) return false;
      
      const index = project.collaborators.indexOf(userId);
      if (index > -1) {
        project.collaborators.splice(index, 1);
        const projectKey = `${KeyPrefix.PROJECT}${projectId}`;
        await this.kv.put(projectKey, JSON.stringify(project));
        return true;
      }
      return false;
    } catch (error) {
      console.error('移除协作者失败:', error);
      return false;
    }
  }

  async createVersion(version: ProjectVersion): Promise<void> {
    try {
      const versionsKey = `${KeyPrefix.PROJECT_VERSIONS}${version.projectId}`;
      const versionsData = await this.kv.get(versionsKey);
      const versions: ProjectVersion[] = versionsData ? JSON.parse(versionsData) : [];
      versions.push(version);
      await this.kv.put(versionsKey, JSON.stringify(versions));
    } catch (error) {
      console.error('创建版本失败:', error);
      throw error;
    }
  }

  async getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
    try {
      const versionsKey = `${KeyPrefix.PROJECT_VERSIONS}${projectId}`;
      const versionsData = await this.kv.get(versionsKey);
      return versionsData ? JSON.parse(versionsData) : [];
    } catch (error) {
      console.error('获取项目版本失败:', error);
      return [];
    }
  }

  async getVersion(projectId: string, version: string): Promise<ProjectVersion | undefined> {
    try {
      const versions = await this.getProjectVersions(projectId);
      return versions.find(v => v.version === version);
    } catch (error) {
      console.error('获取版本失败:', error);
      return undefined;
    }
  }

  async createComment(projectId: string, comment: Comment): Promise<void> {
    try {
      const commentsKey = `${KeyPrefix.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      const comments: Comment[] = commentsData ? JSON.parse(commentsData) : [];
      comments.push(comment);
      await this.kv.put(commentsKey, JSON.stringify(comments));
    } catch (error) {
      console.error('创建评论失败:', error);
      throw error;
    }
  }

  async getProjectComments(projectId: string): Promise<Comment[]> {
    try {
      const commentsKey = `${KeyPrefix.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      return commentsData ? JSON.parse(commentsData) : [];
    } catch (error) {
      console.error('获取项目评论失败:', error);
      return [];
    }
  }

  async updateComment(projectId: string, commentId: string, updates: Partial<Comment>): Promise<boolean> {
    try {
      const commentsKey = `${KeyPrefix.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      const comments: Comment[] = commentsData ? JSON.parse(commentsData) : [];
      
      const commentIndex = comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) return false;
      
      comments[commentIndex] = {
        ...comments[commentIndex],
        ...updates,
        updatedAt: Date.now()
      };
      
      await this.kv.put(commentsKey, JSON.stringify(comments));
      return true;
    } catch (error) {
      console.error('更新评论失败:', error);
      return false;
    }
  }

  async deleteComment(projectId: string, commentId: string): Promise<boolean> {
    try {
      const commentsKey = `${KeyPrefix.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      const comments: Comment[] = commentsData ? JSON.parse(commentsData) : [];
      
      const filteredComments = comments.filter(c => c.id !== commentId);
      if (filteredComments.length === comments.length) return false;
      
      await this.kv.put(commentsKey, JSON.stringify(filteredComments));
      return true;
    } catch (error) {
      console.error('删除评论失败:', error);
      return false;
    }
  }

  async addReply(projectId: string, commentId: string, reply: CommentReply): Promise<boolean> {
    try {
      const commentsKey = `${KeyPrefix.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      const comments: Comment[] = commentsData ? JSON.parse(commentsData) : [];
      
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return false;
      
      if (!comment.replies) {
        comment.replies = [];
      }
      comment.replies.push(reply);
      
      await this.kv.put(commentsKey, JSON.stringify(comments));
      return true;
    } catch (error) {
      console.error('添加回复失败:', error);
      return false;
    }
  }

  async logActivity(projectId: string, activity: Activity): Promise<void> {
    try {
      const activitiesKey = `${KeyPrefix.ACTIVITY}${projectId}`;
      const activitiesData = await this.kv.get(activitiesKey);
      const activities: Activity[] = activitiesData ? JSON.parse(activitiesData) : [];
      activities.push(activity);
      await this.kv.put(activitiesKey, JSON.stringify(activities));
    } catch (error) {
      console.error('记录活动失败:', error);
      throw error;
    }
  }

  async getProjectActivities(projectId: string): Promise<Activity[]> {
    try {
      const activitiesKey = `${KeyPrefix.ACTIVITY}${projectId}`;
      const activitiesData = await this.kv.get(activitiesKey);
      return activitiesData ? JSON.parse(activitiesData) : [];
    } catch (error) {
      console.error('获取项目活动失败:', error);
      return [];
    }
  }

  async getUserActivities(userId: string): Promise<Activity[]> {
    try {
      const activityKeys = await this.kv.list({
        prefix: KeyPrefix.ACTIVITY
      });
      
      const allActivities: Activity[] = [];
      for (const key of activityKeys.keys) {
        const activitiesData = await this.kv.get(key.name);
        if (activitiesData) {
          const activities: Activity[] = JSON.parse(activitiesData);
          allActivities.push(...activities.filter(a => a.userId === userId));
        }
      }
      return allActivities.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('获取用户活动失败:', error);
      return [];
    }
  }
}

export default KVDB;
export type { User, VerificationCode, Project, ProjectVersion, Comment, CommentReply, Activity };
