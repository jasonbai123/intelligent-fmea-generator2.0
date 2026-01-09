// Cloudflare KV数据存储实现

// 键前缀常量，用于区分不同类型的数据
const KEY_PREFIXES = {
  USER: 'user:',
  VERIFICATION_CODE: 'code:',
  PROJECT: 'project:',
  PROJECT_VERSIONS: 'versions:',
  COMMENT: 'comment:',
  ACTIVITY: 'activity:',
  ADMIN_PHONE: '13510420462'
};

class KVDB {
  constructor(dataKV) {
    this.kv = dataKV;
    this.ADMIN_PHONE = KEY_PREFIXES.ADMIN_PHONE;
    // 管理员用户将在第一次使用时异步初始化
    this.adminInitialized = false;
  }

  async initAdminUser() {
    try {
      const adminKey = `${KEY_PREFIXES.USER}${this.ADMIN_PHONE}`;
      const existingAdmin = await this.kv.get(adminKey);
      if (!existingAdmin) {
        const adminUser = {
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

  // 用户相关方法
  async getUser(phone) {
    try {
      // 如果是管理员手机号且尚未初始化，则先初始化
      if (phone === this.ADMIN_PHONE && !this.adminInitialized) {
        await this.initAdminUser();
        this.adminInitialized = true;
      }
      
      const userKey = `${KEY_PREFIXES.USER}${phone}`;
      const userData = await this.kv.get(userKey);
      return userData ? JSON.parse(userData) : undefined;
    } catch (error) {
      console.error('获取用户失败:', error);
      return undefined;
    }
  }

  async getAllUsers() {
    try {
      const userKeys = await this.kv.list({
        prefix: KEY_PREFIXES.USER
      });
      
      const users = [];
      for (const key of userKeys.keys) {
        const userData = await this.kv.get(key.name);
        if (userData) {
          const user = JSON.parse(userData);
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

  async saveUser(user) {
    try {
      const userKey = `${KEY_PREFIXES.USER}${user.phone}`;
      await this.kv.put(userKey, JSON.stringify(user));
    } catch (error) {
      console.error('保存用户失败:', error);
      throw error;
    }
  }

  async deleteUser(phone) {
    try {
      if (phone === this.ADMIN_PHONE) {
        return false;
      }
      const userKey = `${KEY_PREFIXES.USER}${phone}`;
      await this.kv.delete(userKey);
      return true;
    } catch (error) {
      console.error('删除用户失败:', error);
      return false;
    }
  }

  async updateUserExpiration(phone, expiresAt) {
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

  async convertTrialToRegular(phone) {
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

  // 验证码相关方法
  async getVerificationCode(phone) {
    try {
      const codeKey = `${KEY_PREFIXES.VERIFICATION_CODE}${phone}`;
      const codeData = await this.kv.get(codeKey);
      return codeData ? JSON.parse(codeData) : undefined;
    } catch (error) {
      console.error('获取验证码失败:', error);
      return undefined;
    }
  }

  async saveVerificationCode(phone, code) {
    try {
      const codeKey = `${KEY_PREFIXES.VERIFICATION_CODE}${phone}`;
      // 设置验证码时也设置过期时间
      await this.kv.put(codeKey, JSON.stringify(code), {
        expirationTtl: 5 * 60 // 5分钟后自动过期
      });
    } catch (error) {
      console.error('保存验证码失败:', error);
      throw error;
    }
  }

  async deleteVerificationCode(phone) {
    try {
      const codeKey = `${KEY_PREFIXES.VERIFICATION_CODE}${phone}`;
      await this.kv.delete(codeKey);
      return true;
    } catch (error) {
      console.error('删除验证码失败:', error);
      return false;
    }
  }

  async getAllVerificationCodes() {
    try {
      const codeKeys = await this.kv.list({
        prefix: KEY_PREFIXES.VERIFICATION_CODE
      });
      
      const codes = [];
      for (const key of codeKeys.keys) {
        const codeData = await this.kv.get(key.name);
        if (codeData) {
          const code = JSON.parse(codeData);
          codes.push({
            phone: key.name.replace(KEY_PREFIXES.VERIFICATION_CODE, ''),
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

  // 项目相关方法
  async createProject(project) {
    try {
      const projectKey = `${KEY_PREFIXES.PROJECT}${project.id}`;
      await this.kv.put(projectKey, JSON.stringify(project));
      
      // 初始化项目的版本、评论和活动列表
      const versionsKey = `${KEY_PREFIXES.PROJECT_VERSIONS}${project.id}`;
      const commentsKey = `${KEY_PREFIXES.COMMENT}${project.id}`;
      const activitiesKey = `${KEY_PREFIXES.ACTIVITY}${project.id}`;
      
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

  async getProject(id) {
    try {
      const projectKey = `${KEY_PREFIXES.PROJECT}${id}`;
      const projectData = await this.kv.get(projectKey);
      return projectData ? JSON.parse(projectData) : undefined;
    } catch (error) {
      console.error('获取项目失败:', error);
      return undefined;
    }
  }

  async getAllProjects() {
    try {
      const projectKeys = await this.kv.list({
        prefix: KEY_PREFIXES.PROJECT
      });
      
      const projects = [];
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

  async getProjectsByUser(userId) {
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

  async updateProject(id, updates) {
    try {
      const project = await this.getProject(id);
      if (!project) return false;
      
      const updatedProject = {
        ...project,
        ...updates,
        updatedAt: Date.now()
      };
      
      const projectKey = `${KEY_PREFIXES.PROJECT}${id}`;
      await this.kv.put(projectKey, JSON.stringify(updatedProject));
      return true;
    } catch (error) {
      console.error('更新项目失败:', error);
      return false;
    }
  }

  async deleteProject(id) {
    try {
      const projectKey = `${KEY_PREFIXES.PROJECT}${id}`;
      const versionsKey = `${KEY_PREFIXES.PROJECT_VERSIONS}${id}`;
      const commentsKey = `${KEY_PREFIXES.COMMENT}${id}`;
      const activitiesKey = `${KEY_PREFIXES.ACTIVITY}${id}`;
      
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

  async addCollaborator(projectId, userId) {
    try {
      const project = await this.getProject(projectId);
      if (!project) return false;
      
      if (!project.collaborators.includes(userId)) {
        project.collaborators.push(userId);
        const projectKey = `${KEY_PREFIXES.PROJECT}${projectId}`;
        await this.kv.put(projectKey, JSON.stringify(project));
        return true;
      }
      return false;
    } catch (error) {
      console.error('添加协作者失败:', error);
      return false;
    }
  }

  async removeCollaborator(projectId, userId) {
    try {
      const project = await this.getProject(projectId);
      if (!project) return false;
      
      const index = project.collaborators.indexOf(userId);
      if (index > -1) {
        project.collaborators.splice(index, 1);
        const projectKey = `${KEY_PREFIXES.PROJECT}${projectId}`;
        await this.kv.put(projectKey, JSON.stringify(project));
        return true;
      }
      return false;
    } catch (error) {
      console.error('移除协作者失败:', error);
      return false;
    }
  }

  // 版本相关方法
  async createVersion(version) {
    try {
      const versionsKey = `${KEY_PREFIXES.PROJECT_VERSIONS}${version.projectId}`;
      const versionsData = await this.kv.get(versionsKey);
      const versions = versionsData ? JSON.parse(versionsData) : [];
      versions.push(version);
      await this.kv.put(versionsKey, JSON.stringify(versions));
    } catch (error) {
      console.error('创建版本失败:', error);
      throw error;
    }
  }

  async getProjectVersions(projectId) {
    try {
      const versionsKey = `${KEY_PREFIXES.PROJECT_VERSIONS}${projectId}`;
      const versionsData = await this.kv.get(versionsKey);
      return versionsData ? JSON.parse(versionsData) : [];
    } catch (error) {
      console.error('获取项目版本失败:', error);
      return [];
    }
  }

  async getVersion(projectId, version) {
    try {
      const versions = await this.getProjectVersions(projectId);
      return versions.find(v => v.version === version);
    } catch (error) {
      console.error('获取版本失败:', error);
      return undefined;
    }
  }

  // 评论相关方法
  async createComment(projectId, comment) {
    try {
      const commentsKey = `${KEY_PREFIXES.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      const comments = commentsData ? JSON.parse(commentsData) : [];
      comments.push(comment);
      await this.kv.put(commentsKey, JSON.stringify(comments));
    } catch (error) {
      console.error('创建评论失败:', error);
      throw error;
    }
  }

  async getProjectComments(projectId) {
    try {
      const commentsKey = `${KEY_PREFIXES.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      return commentsData ? JSON.parse(commentsData) : [];
    } catch (error) {
      console.error('获取项目评论失败:', error);
      return [];
    }
  }

  async updateComment(projectId, commentId, updates) {
    try {
      const commentsKey = `${KEY_PREFIXES.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      const comments = commentsData ? JSON.parse(commentsData) : [];
      
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

  async deleteComment(projectId, commentId) {
    try {
      const commentsKey = `${KEY_PREFIXES.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      const comments = commentsData ? JSON.parse(commentsData) : [];
      
      const filteredComments = comments.filter(c => c.id !== commentId);
      if (filteredComments.length === comments.length) return false;
      
      await this.kv.put(commentsKey, JSON.stringify(filteredComments));
      return true;
    } catch (error) {
      console.error('删除评论失败:', error);
      return false;
    }
  }

  async addReply(projectId, commentId, reply) {
    try {
      const commentsKey = `${KEY_PREFIXES.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      const comments = commentsData ? JSON.parse(commentsData) : [];
      
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

  // 活动日志相关方法
  async logActivity(projectId, activity) {
    try {
      const activitiesKey = `${KEY_PREFIXES.ACTIVITY}${projectId}`;
      const activitiesData = await this.kv.get(activitiesKey);
      const activities = activitiesData ? JSON.parse(activitiesData) : [];
      activities.push(activity);
      await this.kv.put(activitiesKey, JSON.stringify(activities));
    } catch (error) {
      console.error('记录活动失败:', error);
      throw error;
    }
  }

  async getProjectActivities(projectId) {
    try {
      const activitiesKey = `${KEY_PREFIXES.ACTIVITY}${projectId}`;
      const activitiesData = await this.kv.get(activitiesKey);
      return activitiesData ? JSON.parse(activitiesData) : [];
    } catch (error) {
      console.error('获取项目活动失败:', error);
      return [];
    }
  }

  async getUserActivities(userId) {
    try {
      const activityKeys = await this.kv.list({
        prefix: KEY_PREFIXES.ACTIVITY
      });
      
      const allActivities = [];
      for (const key of activityKeys.keys) {
        const activitiesData = await this.kv.get(key.name);
        if (activitiesData) {
          const activities = JSON.parse(activitiesData);
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

// 导出KVDB类
export default KVDB;
