var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/itty-router/index.mjs
var t = /* @__PURE__ */ __name(({ base: e = "", routes: t2 = [], ...r2 } = {}) => ({ __proto__: new Proxy({}, { get: /* @__PURE__ */ __name((r3, o2, a, s) => (r4, ...c) => t2.push([o2.toUpperCase?.(), RegExp(`^${(s = (e + r4).replace(/\/+(\/|$)/g, "$1")).replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>*))").replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))").replace(/\./g, "\\.").replace(/(\/?)\*/g, "($1.*)?")}/*$`), c, s]) && a, "get") }), routes: t2, ...r2, async fetch(e2, ...o2) {
  let a, s, c = new URL(e2.url), n = e2.query = { __proto__: null };
  for (let [e3, t3] of c.searchParams) n[e3] = n[e3] ? [].concat(n[e3], t3) : t3;
  e: try {
    for (let t3 of r2.before || []) if (null != (a = await t3(e2.proxy ?? e2, ...o2))) break e;
    t: for (let [r3, n2, l, i] of t2) if ((r3 == e2.method || "ALL" == r3) && (s = c.pathname.match(n2))) {
      e2.params = s.groups || {}, e2.route = i;
      for (let t3 of l) if (null != (a = await t3(e2.proxy ?? e2, ...o2))) break t;
    }
  } catch (t3) {
    if (!r2.catch) throw t3;
    a = await r2.catch(t3, e2.proxy ?? e2, ...o2);
  }
  try {
    for (let t3 of r2.finally || []) a = await t3(a, e2.proxy ?? e2, ...o2) ?? a;
  } catch (t3) {
    if (!r2.catch) throw t3;
    a = await r2.catch(t3, e2.proxy ?? e2, ...o2);
  }
  return a;
} }), "t");
var r = /* @__PURE__ */ __name((e = "text/plain; charset=utf-8", t2) => (r2, o2 = {}) => {
  if (void 0 === r2 || r2 instanceof Response) return r2;
  const a = new Response(t2?.(r2) ?? r2, o2.url ? void 0 : o2);
  return a.headers.set("content-type", e), a;
}, "r");
var o = r("application/json; charset=utf-8", JSON.stringify);
var p = r("text/plain; charset=utf-8", String);
var f = r("text/html");
var u = r("image/jpeg");
var h = r("image/png");
var g = r("image/webp");

// src/utils/db.js
var KEY_PREFIXES = {
  USER: "user:",
  VERIFICATION_CODE: "code:",
  PROJECT: "project:",
  PROJECT_VERSIONS: "versions:",
  COMMENT: "comment:",
  ACTIVITY: "activity:",
  ADMIN_PHONE: "13510420462"
};
var KVDB = class {
  static {
    __name(this, "KVDB");
  }
  constructor(dataKV) {
    this.kv = dataKV;
    this.ADMIN_PHONE = KEY_PREFIXES.ADMIN_PHONE;
    this.adminInitialized = false;
  }
  async initAdminUser() {
    try {
      const adminKey = `${KEY_PREFIXES.USER}${this.ADMIN_PHONE}`;
      const existingAdmin = await this.kv.get(adminKey);
      if (!existingAdmin) {
        const adminUser = {
          id: "admin",
          phone: this.ADMIN_PHONE,
          role: "ADMIN",
          createdAt: Date.now(),
          expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1e3,
          isTrial: false
        };
        await this.kv.put(adminKey, JSON.stringify(adminUser));
      }
    } catch (error) {
      console.error("\u521D\u59CB\u5316\u7BA1\u7406\u5458\u7528\u6237\u5931\u8D25:", error);
    }
  }
  // 用户相关方法
  async getUser(phone) {
    try {
      if (phone === this.ADMIN_PHONE && !this.adminInitialized) {
        await this.initAdminUser();
        this.adminInitialized = true;
      }
      const userKey = `${KEY_PREFIXES.USER}${phone}`;
      const userData = await this.kv.get(userKey);
      return userData ? JSON.parse(userData) : void 0;
    } catch (error) {
      console.error("\u83B7\u53D6\u7528\u6237\u5931\u8D25:", error);
      return void 0;
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
      console.error("\u83B7\u53D6\u6240\u6709\u7528\u6237\u5931\u8D25:", error);
      return [];
    }
  }
  async saveUser(user) {
    try {
      const userKey = `${KEY_PREFIXES.USER}${user.phone}`;
      await this.kv.put(userKey, JSON.stringify(user));
    } catch (error) {
      console.error("\u4FDD\u5B58\u7528\u6237\u5931\u8D25:", error);
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
      console.error("\u5220\u9664\u7528\u6237\u5931\u8D25:", error);
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
      console.error("\u66F4\u65B0\u7528\u6237\u8FC7\u671F\u65F6\u95F4\u5931\u8D25:", error);
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
        user.role = "REGULAR";
        user.isTrial = false;
        delete user.trialDays;
        await this.saveUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("\u8F6C\u6362\u7528\u6237\u7C7B\u578B\u5931\u8D25:", error);
      return false;
    }
  }
  // 验证码相关方法
  async getVerificationCode(phone) {
    try {
      const codeKey = `${KEY_PREFIXES.VERIFICATION_CODE}${phone}`;
      const codeData = await this.kv.get(codeKey);
      return codeData ? JSON.parse(codeData) : void 0;
    } catch (error) {
      console.error("\u83B7\u53D6\u9A8C\u8BC1\u7801\u5931\u8D25:", error);
      return void 0;
    }
  }
  async saveVerificationCode(phone, code) {
    try {
      const codeKey = `${KEY_PREFIXES.VERIFICATION_CODE}${phone}`;
      await this.kv.put(codeKey, JSON.stringify(code), {
        expirationTtl: 5 * 60
        // 5分钟后自动过期
      });
    } catch (error) {
      console.error("\u4FDD\u5B58\u9A8C\u8BC1\u7801\u5931\u8D25:", error);
      throw error;
    }
  }
  async deleteVerificationCode(phone) {
    try {
      const codeKey = `${KEY_PREFIXES.VERIFICATION_CODE}${phone}`;
      await this.kv.delete(codeKey);
      return true;
    } catch (error) {
      console.error("\u5220\u9664\u9A8C\u8BC1\u7801\u5931\u8D25:", error);
      return false;
    }
  }
  // 项目相关方法
  async createProject(project) {
    try {
      const projectKey = `${KEY_PREFIXES.PROJECT}${project.id}`;
      await this.kv.put(projectKey, JSON.stringify(project));
      const versionsKey = `${KEY_PREFIXES.PROJECT_VERSIONS}${project.id}`;
      const commentsKey = `${KEY_PREFIXES.COMMENT}${project.id}`;
      const activitiesKey = `${KEY_PREFIXES.ACTIVITY}${project.id}`;
      await Promise.all([
        this.kv.put(versionsKey, JSON.stringify([])),
        this.kv.put(commentsKey, JSON.stringify([])),
        this.kv.put(activitiesKey, JSON.stringify([]))
      ]);
    } catch (error) {
      console.error("\u521B\u5EFA\u9879\u76EE\u5931\u8D25:", error);
      throw error;
    }
  }
  async getProject(id) {
    try {
      const projectKey = `${KEY_PREFIXES.PROJECT}${id}`;
      const projectData = await this.kv.get(projectKey);
      return projectData ? JSON.parse(projectData) : void 0;
    } catch (error) {
      console.error("\u83B7\u53D6\u9879\u76EE\u5931\u8D25:", error);
      return void 0;
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
      console.error("\u83B7\u53D6\u6240\u6709\u9879\u76EE\u5931\u8D25:", error);
      return [];
    }
  }
  async getProjectsByUser(userId) {
    try {
      const allProjects = await this.getAllProjects();
      return allProjects.filter(
        (project) => project.createdBy === userId || project.collaborators.includes(userId)
      );
    } catch (error) {
      console.error("\u83B7\u53D6\u7528\u6237\u9879\u76EE\u5931\u8D25:", error);
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
      console.error("\u66F4\u65B0\u9879\u76EE\u5931\u8D25:", error);
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
      console.error("\u5220\u9664\u9879\u76EE\u5931\u8D25:", error);
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
      console.error("\u6DFB\u52A0\u534F\u4F5C\u8005\u5931\u8D25:", error);
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
      console.error("\u79FB\u9664\u534F\u4F5C\u8005\u5931\u8D25:", error);
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
      console.error("\u521B\u5EFA\u7248\u672C\u5931\u8D25:", error);
      throw error;
    }
  }
  async getProjectVersions(projectId) {
    try {
      const versionsKey = `${KEY_PREFIXES.PROJECT_VERSIONS}${projectId}`;
      const versionsData = await this.kv.get(versionsKey);
      return versionsData ? JSON.parse(versionsData) : [];
    } catch (error) {
      console.error("\u83B7\u53D6\u9879\u76EE\u7248\u672C\u5931\u8D25:", error);
      return [];
    }
  }
  async getVersion(projectId, version) {
    try {
      const versions = await this.getProjectVersions(projectId);
      return versions.find((v) => v.version === version);
    } catch (error) {
      console.error("\u83B7\u53D6\u7248\u672C\u5931\u8D25:", error);
      return void 0;
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
      console.error("\u521B\u5EFA\u8BC4\u8BBA\u5931\u8D25:", error);
      throw error;
    }
  }
  async getProjectComments(projectId) {
    try {
      const commentsKey = `${KEY_PREFIXES.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      return commentsData ? JSON.parse(commentsData) : [];
    } catch (error) {
      console.error("\u83B7\u53D6\u9879\u76EE\u8BC4\u8BBA\u5931\u8D25:", error);
      return [];
    }
  }
  async updateComment(projectId, commentId, updates) {
    try {
      const commentsKey = `${KEY_PREFIXES.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      const comments = commentsData ? JSON.parse(commentsData) : [];
      const commentIndex = comments.findIndex((c) => c.id === commentId);
      if (commentIndex === -1) return false;
      comments[commentIndex] = {
        ...comments[commentIndex],
        ...updates,
        updatedAt: Date.now()
      };
      await this.kv.put(commentsKey, JSON.stringify(comments));
      return true;
    } catch (error) {
      console.error("\u66F4\u65B0\u8BC4\u8BBA\u5931\u8D25:", error);
      return false;
    }
  }
  async deleteComment(projectId, commentId) {
    try {
      const commentsKey = `${KEY_PREFIXES.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      const comments = commentsData ? JSON.parse(commentsData) : [];
      const filteredComments = comments.filter((c) => c.id !== commentId);
      if (filteredComments.length === comments.length) return false;
      await this.kv.put(commentsKey, JSON.stringify(filteredComments));
      return true;
    } catch (error) {
      console.error("\u5220\u9664\u8BC4\u8BBA\u5931\u8D25:", error);
      return false;
    }
  }
  async addReply(projectId, commentId, reply) {
    try {
      const commentsKey = `${KEY_PREFIXES.COMMENT}${projectId}`;
      const commentsData = await this.kv.get(commentsKey);
      const comments = commentsData ? JSON.parse(commentsData) : [];
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return false;
      if (!comment.replies) {
        comment.replies = [];
      }
      comment.replies.push(reply);
      await this.kv.put(commentsKey, JSON.stringify(comments));
      return true;
    } catch (error) {
      console.error("\u6DFB\u52A0\u56DE\u590D\u5931\u8D25:", error);
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
      console.error("\u8BB0\u5F55\u6D3B\u52A8\u5931\u8D25:", error);
      throw error;
    }
  }
  async getProjectActivities(projectId) {
    try {
      const activitiesKey = `${KEY_PREFIXES.ACTIVITY}${projectId}`;
      const activitiesData = await this.kv.get(activitiesKey);
      return activitiesData ? JSON.parse(activitiesData) : [];
    } catch (error) {
      console.error("\u83B7\u53D6\u9879\u76EE\u6D3B\u52A8\u5931\u8D25:", error);
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
          allActivities.push(...activities.filter((a) => a.userId === userId));
        }
      }
      return allActivities.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("\u83B7\u53D6\u7528\u6237\u6D3B\u52A8\u5931\u8D25:", error);
      return [];
    }
  }
};
var db_default = KVDB;

// src/utils/codeGenerator.ts
var generateVerificationCode = /* @__PURE__ */ __name(() => {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}, "generateVerificationCode");

// src/handlers/auth.js
var AuthHandlers = class {
  static {
    __name(this, "AuthHandlers");
  }
  constructor(kvDB) {
    this.db = kvDB;
  }
  // 辅助函数：解析请求体
  async parseRequestBody(request) {
    try {
      return await request.json();
    } catch (error) {
      return null;
    }
  }
  // 辅助函数：创建JSON响应
  createResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  // 处理OPTIONS请求
  handleOptions() {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  // 发送验证码
  async handleSendCode(request) {
    if (request.method === "OPTIONS") {
      return this.handleOptions();
    }
    try {
      const body = await this.parseRequestBody(request);
      const { phone } = body;
      if (!phone || phone.length !== 11) {
        return this.createResponse({ message: "\u8BF7\u8F93\u5165\u6709\u6548\u768411\u4F4D\u624B\u673A\u53F7" }, 400);
      }
      if (phone === "13510420462") {
        return this.createResponse({ message: "\u7BA1\u7406\u5458\u8D26\u6237\u8BF7\u76F4\u63A5\u767B\u5F55" }, 400);
      }
      const code = generateVerificationCode();
      await this.db.saveVerificationCode(phone, {
        code,
        expiresAt: Date.now() + 5 * 60 * 1e3
      });
      console.log(`[\u6D4B\u8BD5] \u624B\u673A\u53F7 ${phone} \u7684\u9A8C\u8BC1\u7801: ${code}`);
      return this.createResponse({
        message: "\u9A8C\u8BC1\u7801\u53D1\u9001\u6210\u529F",
        code: false ? void 0 : code
        // 生产环境不返回验证码
      });
    } catch (error) {
      console.error("\u53D1\u9001\u9A8C\u8BC1\u7801\u5931\u8D25:", error);
      return this.createResponse({ message: "\u53D1\u9001\u9A8C\u8BC1\u7801\u5931\u8D25" }, 500);
    }
  }
  // 登录
  async handleLogin(request) {
    if (request.method === "OPTIONS") {
      return this.handleOptions();
    }
    try {
      const body = await this.parseRequestBody(request);
      const { phone, code } = body;
      if (!phone || phone.length !== 11) {
        return this.createResponse({ message: "\u8BF7\u8F93\u5165\u6709\u6548\u768411\u4F4D\u624B\u673A\u53F7" }, 400);
      }
      if (!code || code.length !== 6) {
        return this.createResponse({ message: "\u8BF7\u8F93\u51656\u4F4D\u9A8C\u8BC1\u7801" }, 400);
      }
      const ADMIN_PHONE = "13510420462";
      if (phone === ADMIN_PHONE) {
        if (code !== "888888") {
          return this.createResponse({ message: "\u7BA1\u7406\u5458\u9A8C\u8BC1\u7801\u9519\u8BEF" }, 401);
        }
        const adminUser = await this.db.getUser(ADMIN_PHONE);
        if (!adminUser) {
          return this.createResponse({ message: "\u7BA1\u7406\u5458\u7528\u6237\u4E0D\u5B58\u5728" }, 500);
        }
        const adminToken = {
          token: `admin_${Date.now()}`,
          userInfo: adminUser,
          expiresAt: adminUser.expiresAt
        };
        return this.createResponse(adminToken);
      }
      const savedCodeData = await this.db.getVerificationCode(phone);
      if (!savedCodeData) {
        return this.createResponse({ message: "\u9A8C\u8BC1\u7801\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6" }, 401);
      }
      const { code: savedCode, expiresAt } = savedCodeData;
      if (Date.now() > expiresAt) {
        await this.db.deleteVerificationCode(phone);
        return this.createResponse({ message: "\u9A8C\u8BC1\u7801\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6" }, 401);
      }
      if (code !== savedCode) {
        return this.createResponse({ message: "\u9A8C\u8BC1\u7801\u9519\u8BEF" }, 401);
      }
      await this.db.deleteVerificationCode(phone);
      let user = await this.db.getUser(phone);
      if (!user) {
        user = {
          id: `user_${Date.now()}`,
          phone,
          role: "TRIAL",
          createdAt: Date.now(),
          expiresAt: Date.now() + 15 * 24 * 60 * 60 * 1e3,
          isTrial: true,
          trialDays: 15
        };
        await this.db.saveUser(user);
      }
      if (Date.now() > user.expiresAt) {
        return this.createResponse({ message: "\u8D26\u6237\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458" }, 403);
      }
      const token = {
        token: `token_${Date.now()}`,
        userInfo: user,
        expiresAt: user.expiresAt
      };
      return this.createResponse(token);
    } catch (error) {
      console.error("\u767B\u5F55\u5931\u8D25:", error);
      return this.createResponse({ message: "\u767B\u5F55\u5931\u8D25" }, 500);
    }
  }
  // 获取用户列表
  async handleGetUsers(request) {
    if (request.method === "OPTIONS") {
      return this.handleOptions();
    }
    try {
      const users = await this.db.getAllUsers();
      return this.createResponse(users);
    } catch (error) {
      console.error("\u83B7\u53D6\u7528\u6237\u5217\u8868\u5931\u8D25:", error);
      return this.createResponse({ message: "\u83B7\u53D6\u7528\u6237\u5217\u8868\u5931\u8D25" }, 500);
    }
  }
  // 更新用户过期时间
  async handleUpdateUserExpiration(request) {
    if (request.method === "OPTIONS") {
      return this.handleOptions();
    }
    try {
      const url = new URL(request.url);
      const phone = url.pathname.split("/").pop();
      const body = await this.parseRequestBody(request);
      const { days } = body;
      if (!phone || phone.length !== 11) {
        return this.createResponse({ message: "\u65E0\u6548\u7684\u624B\u673A\u53F7" }, 400);
      }
      if (!days || isNaN(Number(days)) || Number(days) <= 0) {
        return this.createResponse({ message: "\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5929\u6570" }, 400);
      }
      const user = await this.db.getUser(phone);
      if (!user) {
        return this.createResponse({ message: "\u7528\u6237\u4E0D\u5B58\u5728" }, 404);
      }
      const expiresAt = Date.now() + Number(days) * 24 * 60 * 60 * 1e3;
      const success = await this.db.updateUserExpiration(phone, expiresAt);
      if (!success) {
        return this.createResponse({ message: "\u66F4\u65B0\u5931\u8D25" }, 500);
      }
      const updatedUser = await this.db.getUser(phone);
      return this.createResponse({
        message: "\u8D26\u6237\u6709\u6548\u671F\u66F4\u65B0\u6210\u529F",
        user: updatedUser
      });
    } catch (error) {
      console.error("\u66F4\u65B0\u8D26\u6237\u6709\u6548\u671F\u5931\u8D25:", error);
      return this.createResponse({ message: "\u66F4\u65B0\u8D26\u6237\u6709\u6548\u671F\u5931\u8D25" }, 500);
    }
  }
  // 将试用账户转换为普通账户
  async handleConvertTrialToRegular(request) {
    if (request.method === "OPTIONS") {
      return this.handleOptions();
    }
    try {
      const url = new URL(request.url);
      const phone = url.pathname.split("/").pop();
      if (!phone || phone.length !== 11) {
        return this.createResponse({ message: "\u65E0\u6548\u7684\u624B\u673A\u53F7" }, 400);
      }
      const success = await this.db.convertTrialToRegular(phone);
      if (!success) {
        return this.createResponse({ message: "\u8F6C\u6362\u5931\u8D25\uFF0C\u8BE5\u7528\u6237\u53EF\u80FD\u4E0D\u662F\u8BD5\u7528\u8D26\u6237\u6216\u4E0D\u5B58\u5728" }, 400);
      }
      const updatedUser = await this.db.getUser(phone);
      return this.createResponse({
        message: "\u8D26\u6237\u8F6C\u6362\u6210\u529F",
        user: updatedUser
      });
    } catch (error) {
      console.error("\u8F6C\u6362\u8D26\u6237\u7C7B\u578B\u5931\u8D25:", error);
      return this.createResponse({ message: "\u8F6C\u6362\u8D26\u6237\u7C7B\u578B\u5931\u8D25" }, 500);
    }
  }
  // 删除用户
  async handleDeleteUser(request) {
    if (request.method === "OPTIONS") {
      return this.handleOptions();
    }
    try {
      const url = new URL(request.url);
      const phone = url.pathname.split("/").pop();
      if (!phone || phone.length !== 11) {
        return this.createResponse({ message: "\u65E0\u6548\u7684\u624B\u673A\u53F7" }, 400);
      }
      const success = await this.db.deleteUser(phone);
      if (!success) {
        return this.createResponse({ message: "\u5220\u9664\u5931\u8D25\uFF0C\u8BE5\u7528\u6237\u53EF\u80FD\u4E0D\u5B58\u5728\u6216\u4E3A\u7BA1\u7406\u5458" }, 400);
      }
      return this.createResponse({ message: "\u7528\u6237\u5220\u9664\u6210\u529F" });
    } catch (error) {
      console.error("\u5220\u9664\u7528\u6237\u5931\u8D25:", error);
      return this.createResponse({ message: "\u5220\u9664\u7528\u6237\u5931\u8D25" }, 500);
    }
  }
};
var auth_default = AuthHandlers;

// src/index.js
globalThis.env = globalThis.env || {};
var router = t();
var db = new db_default(globalThis.env.DATA);
var authHandlers = new auth_default(db);
router.get("/api/health", (req) => {
  return new Response(JSON.stringify({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
});
router.post("/api/auth/send-code", authHandlers.handleSendCode.bind(authHandlers));
router.post("/api/auth/login", authHandlers.handleLogin.bind(authHandlers));
router.get("/api/auth/users", authHandlers.handleGetUsers.bind(authHandlers));
router.put("/api/auth/users/:phone/expire", authHandlers.handleUpdateUserExpiration.bind(authHandlers));
router.put("/api/auth/users/:phone/convert", authHandlers.handleConvertTrialToRegular.bind(authHandlers));
router.delete("/api/auth/users/:phone", authHandlers.handleDeleteUser.bind(authHandlers));
router.options("*", authHandlers.handleOptions.bind(authHandlers));
router.get("/", (req) => {
  return new Response(JSON.stringify({
    message: "\u667A\u80FDFMEA\u751F\u6210\u5668\u540E\u7AEFAPI",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      auth: {
        sendCode: "POST /api/auth/send-code",
        login: "POST /api/auth/login",
        users: "GET /api/auth/users",
        updateExpiration: "PUT /api/auth/users/:phone/expire",
        convertAccount: "PUT /api/auth/users/:phone/convert",
        deleteUser: "DELETE /api/auth/users/:phone"
      }
    }
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
});
router.all("*", () => new Response(JSON.stringify({ message: "Not Found" }), {
  status: 404,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  }
}));
var src_default = {
  fetch: router.handle
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-ILvSMX/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-ILvSMX/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
