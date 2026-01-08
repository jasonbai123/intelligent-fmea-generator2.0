import express from 'express';
import { db } from '../utils/db';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateCommentRequest,
  CreateReplyRequest,
  FmeaProject,
  ProjectVersion,
  Comment,
  CollaborationActivity,
  ProjectStatus,
  CommentType
} from '../types';

const router = express.Router();

// 项目管理路由

// 创建项目
router.post('/projects', (req, res) => {
  try {
    const { userId, userName } = req.headers;
    const { title, type, description }: CreateProjectRequest = req.body;

    if (!userId || !userName) {
      return res.status(401).json({ message: '未授权访问' });
    }

    if (!title || !type) {
      return res.status(400).json({ message: '项目标题和类型不能为空' });
    }

    const project: FmeaProject = {
      id: `project_${Date.now()}`,
      title,
      type,
      data: {
        type,
        projectName: title,
        projectDescription: description || '',
        analysisDate: Date.now(),
        rows: [],
        criteria: {}
      },
      createdBy: userId as string,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: ProjectStatus.DRAFT,
      collaborators: [],
      currentVersion: 1,
      description
    };

    db.createProject(project);

    // 记录活动日志
    db.logActivity(project.id, {
      id: `activity_${Date.now()}`,
      projectId: project.id,
      userId: userId as string,
      userName: userName as string,
      action: '创建项目',
      details: `创建了项目 "${title}"`,
      timestamp: Date.now()
    });

    return res.status(201).json(project);
  } catch (error) {
    console.error('创建项目失败:', error);
    return res.status(500).json({ message: '创建项目失败' });
  }
});

// 获取所有项目
router.get('/projects', (req, res) => {
  try {
    const { userId } = req.headers;

    if (!userId) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const projects = db.getProjectsByUser(userId as string);
    return res.status(200).json(projects);
  } catch (error) {
    console.error('获取项目列表失败:', error);
    return res.status(500).json({ message: '获取项目列表失败' });
  }
});

// 获取单个项目
router.get('/projects/:id', (req, res) => {
  try {
    const { userId } = req.headers;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    if (project.createdBy !== userId && !project.collaborators.includes(userId as string)) {
      return res.status(403).json({ message: '无权访问此项目' });
    }

    return res.status(200).json(project);
  } catch (error) {
    console.error('获取项目详情失败:', error);
    return res.status(500).json({ message: '获取项目详情失败' });
  }
});

// 更新项目
router.put('/projects/:id', (req, res) => {
  try {
    const { userId, userName } = req.headers;
    const { id } = req.params;
    const updates: UpdateProjectRequest = req.body;

    if (!userId || !userName) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    if (project.createdBy !== userId && !project.collaborators.includes(userId as string)) {
      return res.status(403).json({ message: '无权修改此项目' });
    }

    const success = db.updateProject(id, updates);
    if (!success) {
      return res.status(400).json({ message: '更新项目失败' });
    }

    // 记录活动日志
    const updateDetails = Object.keys(updates).map(key => {
      const value = updates[key as keyof UpdateProjectRequest];
      return `${key}: ${value}`;
    }).join(', ');

    db.logActivity(id, {
      id: `activity_${Date.now()}`,
      projectId: id,
      userId: userId as string,
      userName: userName as string,
      action: '更新项目',
      details: `更新了项目 "${project.title}": ${updateDetails}`,
      timestamp: Date.now()
    });

    const updatedProject = db.getProject(id);
    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error('更新项目失败:', error);
    return res.status(500).json({ message: '更新项目失败' });
  }
});

// 删除项目
router.delete('/projects/:id', (req, res) => {
  try {
    const { userId, userName } = req.headers;
    const { id } = req.params;

    if (!userId || !userName) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 只有创建者可以删除项目
    if (project.createdBy !== userId) {
      return res.status(403).json({ message: '只有项目创建者可以删除项目' });
    }

    const success = db.deleteProject(id);
    if (!success) {
      return res.status(400).json({ message: '删除项目失败' });
    }

    return res.status(200).json({ message: '项目删除成功' });
  } catch (error) {
    console.error('删除项目失败:', error);
    return res.status(500).json({ message: '删除项目失败' });
  }
});

// 添加协作者
router.post('/projects/:id/collaborators', (req, res) => {
  try {
    const { userId, userName } = req.headers;
    const { id } = req.params;
    const { collaboratorId } = req.body;

    if (!userId || !userName) {
      return res.status(401).json({ message: '未授权访问' });
    }

    if (!collaboratorId) {
      return res.status(400).json({ message: '协作者ID不能为空' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 只有创建者可以添加协作者
    if (project.createdBy !== userId) {
      return res.status(403).json({ message: '只有项目创建者可以添加协作者' });
    }

    const success = db.addCollaborator(id, collaboratorId);
    if (!success) {
      return res.status(400).json({ message: '添加协作者失败，可能已存在' });
    }

    // 记录活动日志
    db.logActivity(id, {
      id: `activity_${Date.now()}`,
      projectId: id,
      userId: userId as string,
      userName: userName as string,
      action: '添加协作者',
      details: `添加了协作者 ${collaboratorId}`,
      timestamp: Date.now()
    });

    const updatedProject = db.getProject(id);
    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error('添加协作者失败:', error);
    return res.status(500).json({ message: '添加协作者失败' });
  }
});

// 移除协作者
router.delete('/projects/:id/collaborators/:collaboratorId', (req, res) => {
  try {
    const { userId, userName } = req.headers;
    const { id, collaboratorId } = req.params;

    if (!userId || !userName) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 只有创建者可以移除协作者
    if (project.createdBy !== userId) {
      return res.status(403).json({ message: '只有项目创建者可以移除协作者' });
    }

    const success = db.removeCollaborator(id, collaboratorId);
    if (!success) {
      return res.status(400).json({ message: '移除协作者失败' });
    }

    // 记录活动日志
    db.logActivity(id, {
      id: `activity_${Date.now()}`,
      projectId: id,
      userId: userId as string,
      userName: userName as string,
      action: '移除协作者',
      details: `移除了协作者 ${collaboratorId}`,
      timestamp: Date.now()
    });

    const updatedProject = db.getProject(id);
    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error('移除协作者失败:', error);
    return res.status(500).json({ message: '移除协作者失败' });
  }
});

// 版本管理路由

// 创建版本
router.post('/projects/:id/versions', (req, res) => {
  try {
    const { userId, userName } = req.headers;
    const { id } = req.params;
    const { comment } = req.body;

    if (!userId || !userName) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    if (project.createdBy !== userId && !project.collaborators.includes(userId as string)) {
      return res.status(403).json({ message: '无权创建版本' });
    }

    const version: ProjectVersion = {
      id: `version_${Date.now()}`,
      projectId: id,
      version: project.currentVersion + 1,
      data: JSON.parse(JSON.stringify(project.data)),
      createdBy: userId as string,
      createdAt: Date.now(),
      comment: comment || `版本 ${project.currentVersion + 1}`
    };

    db.createVersion(version);

    // 更新项目当前版本
    db.updateProject(id, { currentVersion: version.version });

    // 记录活动日志
    db.logActivity(id, {
      id: `activity_${Date.now()}`,
      projectId: id,
      userId: userId as string,
      userName: userName as string,
      action: '创建版本',
      details: `创建了版本 ${version.version}: ${comment}`,
      timestamp: Date.now()
    });

    return res.status(201).json(version);
  } catch (error) {
    console.error('创建版本失败:', error);
    return res.status(500).json({ message: '创建版本失败' });
  }
});

// 获取项目所有版本
router.get('/projects/:id/versions', (req, res) => {
  try {
    const { userId } = req.headers;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    if (project.createdBy !== userId && !project.collaborators.includes(userId as string)) {
      return res.status(403).json({ message: '无权访问此项目' });
    }

    const versions = db.getProjectVersions(id);
    return res.status(200).json(versions);
  } catch (error) {
    console.error('获取版本列表失败:', error);
    return res.status(500).json({ message: '获取版本列表失败' });
  }
});

// 恢复到指定版本
router.post('/projects/:id/versions/:version/restore', (req, res) => {
  try {
    const { userId, userName } = req.headers;
    const { id, version } = req.params;
    const versionNumber = parseInt(version);

    if (!userId || !userName) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    if (project.createdBy !== userId && !project.collaborators.includes(userId as string)) {
      return res.status(403).json({ message: '无权恢复版本' });
    }

    const versionData = db.getVersion(id, versionNumber);
    if (!versionData) {
      return res.status(404).json({ message: '版本不存在' });
    }

    // 恢复数据
    db.updateProject(id, {
      data: JSON.parse(JSON.stringify(versionData.data)),
      currentVersion: versionNumber
    });

    // 记录活动日志
    db.logActivity(id, {
      id: `activity_${Date.now()}`,
      projectId: id,
      userId: userId as string,
      userName: userName as string,
      action: '恢复版本',
      details: `恢复到版本 ${versionNumber}`,
      timestamp: Date.now()
    });

    const updatedProject = db.getProject(id);
    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error('恢复版本失败:', error);
    return res.status(500).json({ message: '恢复版本失败' });
  }
});

// 评论管理路由

// 创建评论
router.post('/projects/:id/comments', (req, res) => {
  try {
    const { userId, userName } = req.headers;
    const { id } = req.params;
    const { type, rowId, field, content }: CreateCommentRequest = req.body;

    if (!userId || !userName) {
      return res.status(401).json({ message: '未授权访问' });
    }

    if (!content) {
      return res.status(400).json({ message: '评论内容不能为空' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    if (project.createdBy !== userId && !project.collaborators.includes(userId as string)) {
      return res.status(403).json({ message: '无权添加评论' });
    }

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      projectId: id,
      type: type || CommentType.GENERAL,
      rowId,
      field,
      content,
      author: userId as string,
      authorName: userName as string,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      resolved: false,
      replies: []
    };

    db.createComment(id, comment);

    // 记录活动日志
    db.logActivity(id, {
      id: `activity_${Date.now()}`,
      projectId: id,
      userId: userId as string,
      userName: userName as string,
      action: '添加评论',
      details: `添加了评论: ${content.substring(0, 50)}...`,
      timestamp: Date.now()
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.error('创建评论失败:', error);
    return res.status(500).json({ message: '创建评论失败' });
  }
});

// 获取项目所有评论
router.get('/projects/:id/comments', (req, res) => {
  try {
    const { userId } = req.headers;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    if (project.createdBy !== userId && !project.collaborators.includes(userId as string)) {
      return res.status(403).json({ message: '无权访问此项目' });
    }

    const comments = db.getProjectComments(id);
    return res.status(200).json(comments);
  } catch (error) {
    console.error('获取评论列表失败:', error);
    return res.status(500).json({ message: '获取评论列表失败' });
  }
});

// 更新评论
router.put('/projects/:id/comments/:commentId', (req, res) => {
  try {
    const { userId } = req.headers;
    const { id, commentId } = req.params;
    const { content, resolved } = req.body;

    if (!userId) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    if (project.createdBy !== userId && !project.collaborators.includes(userId as string)) {
      return res.status(403).json({ message: '无权修改评论' });
    }

    const success = db.updateComment(id, commentId, { content, resolved });
    if (!success) {
      return res.status(400).json({ message: '更新评论失败' });
    }

    const comments = db.getProjectComments(id);
    const updatedComment = comments.find(c => c.id === commentId);
    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error('更新评论失败:', error);
    return res.status(500).json({ message: '更新评论失败' });
  }
});

// 删除评论
router.delete('/projects/:id/comments/:commentId', (req, res) => {
  try {
    const { userId } = req.headers;
    const { id, commentId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    if (project.createdBy !== userId && !project.collaborators.includes(userId as string)) {
      return res.status(403).json({ message: '无权删除评论' });
    }

    const success = db.deleteComment(id, commentId);
    if (!success) {
      return res.status(400).json({ message: '删除评论失败' });
    }

    return res.status(200).json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论失败:', error);
    return res.status(500).json({ message: '删除评论失败' });
  }
});

// 添加回复
router.post('/projects/:id/comments/:commentId/replies', (req, res) => {
  try {
    const { userId, userName } = req.headers;
    const { id, commentId } = req.params;
    const { content }: CreateReplyRequest = req.body;

    if (!userId || !userName) {
      return res.status(401).json({ message: '未授权访问' });
    }

    if (!content) {
      return res.status(400).json({ message: '回复内容不能为空' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    if (project.createdBy !== userId && !project.collaborators.includes(userId as string)) {
      return res.status(403).json({ message: '无权添加回复' });
    }

    const reply = {
      id: `reply_${Date.now()}`,
      content,
      author: userId as string,
      authorName: userName as string,
      createdAt: Date.now()
    };

    const success = db.addReply(id, commentId, reply);
    if (!success) {
      return res.status(400).json({ message: '添加回复失败' });
    }

    const comments = db.getProjectComments(id);
    const updatedComment = comments.find(c => c.id === commentId);
    return res.status(201).json(updatedComment);
  } catch (error) {
    console.error('添加回复失败:', error);
    return res.status(500).json({ message: '添加回复失败' });
  }
});

// 活动日志路由

// 获取项目活动日志
router.get('/projects/:id/activities', (req, res) => {
  try {
    const { userId } = req.headers;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    if (project.createdBy !== userId && !project.collaborators.includes(userId as string)) {
      return res.status(403).json({ message: '无权访问此项目' });
    }

    const activities = db.getProjectActivities(id);
    return res.status(200).json(activities);
  } catch (error) {
    console.error('获取活动日志失败:', error);
    return res.status(500).json({ message: '获取活动日志失败' });
  }
});

// 获取用户活动日志
router.get('/activities', (req, res) => {
  try {
    const { userId } = req.headers;

    if (!userId) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const activities = db.getUserActivities(userId as string);
    return res.status(200).json(activities);
  } catch (error) {
    console.error('获取用户活动日志失败:', error);
    return res.status(500).json({ message: '获取用户活动日志失败' });
  }
});

export default router;