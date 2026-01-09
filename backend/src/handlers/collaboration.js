class CollaborationHandlers {
  constructor(db) {
    this.db = db;
  }

  async handleGetProjects(request) {
    try {
      const { userId } = this.parseHeaders(request);
      
      if (!userId) {
        return new Response(JSON.stringify({ message: '未授权访问' }), {
          status: 401,
          headers: this.getHeaders()
        });
      }

      const projects = await this.db.getProjectsByUser(userId);
      return new Response(JSON.stringify(projects), {
        status: 200,
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('获取项目列表失败:', error);
      return new Response(JSON.stringify({ message: '获取项目列表失败' }), {
        status: 500,
        headers: this.getHeaders()
      });
    }
  }

  async handleGetProject(request, projectId) {
    try {
      const { userId } = this.parseHeaders(request);
      
      if (!userId) {
        return new Response(JSON.stringify({ message: '未授权访问' }), {
          status: 401,
          headers: this.getHeaders()
        });
      }

      const project = await this.db.getProject(projectId);
      if (!project) {
        return new Response(JSON.stringify({ message: '项目不存在' }), {
          status: 404,
          headers: this.getHeaders()
        });
      }

      if (project.createdBy !== userId && !project.collaborators.includes(userId)) {
        return new Response(JSON.stringify({ message: '无权访问此项目' }), {
          status: 403,
          headers: this.getHeaders()
        });
      }

      return new Response(JSON.stringify(project), {
        status: 200,
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('获取项目详情失败:', error);
      return new Response(JSON.stringify({ message: '获取项目详情失败' }), {
        status: 500,
        headers: this.getHeaders()
      });
    }
  }

  async handleCreateProject(request) {
    try {
      const { userId, userName } = this.parseHeaders(request);
      const body = await request.json();
      const { title, type, description } = body;

      if (!userId || !userName) {
        return new Response(JSON.stringify({ message: '未授权访问' }), {
          status: 401,
          headers: this.getHeaders()
        });
      }

      if (!title || !type) {
        return new Response(JSON.stringify({ message: '项目标题和类型不能为空' }), {
          status: 400,
          headers: this.getHeaders()
        });
      }

      const project = {
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
        createdBy: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'draft',
        collaborators: [],
        currentVersion: 1,
        description
      };

      await this.db.createProject(project);

      await this.db.logActivity(project.id, {
        id: `activity_${Date.now()}`,
        projectId: project.id,
        userId,
        userName,
        action: '创建项目',
        details: `创建了项目 "${title}"`,
        timestamp: Date.now()
      });

      return new Response(JSON.stringify(project), {
        status: 201,
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('创建项目失败:', error);
      return new Response(JSON.stringify({ message: '创建项目失败' }), {
        status: 500,
        headers: this.getHeaders()
      });
    }
  }

  async handleUpdateProject(request, projectId) {
    try {
      const { userId, userName } = this.parseHeaders(request);
      const updates = await request.json();

      if (!userId || !userName) {
        return new Response(JSON.stringify({ message: '未授权访问' }), {
          status: 401,
          headers: this.getHeaders()
        });
      }

      const project = await this.db.getProject(projectId);
      if (!project) {
        return new Response(JSON.stringify({ message: '项目不存在' }), {
          status: 404,
          headers: this.getHeaders()
        });
      }

      if (project.createdBy !== userId && !project.collaborators.includes(userId)) {
        return new Response(JSON.stringify({ message: '无权修改此项目' }), {
          status: 403,
          headers: this.getHeaders()
        });
      }

      const success = await this.db.updateProject(projectId, updates);
      if (!success) {
        return new Response(JSON.stringify({ message: '更新项目失败' }), {
          status: 400,
          headers: this.getHeaders()
        });
      }

      await this.db.logActivity(projectId, {
        id: `activity_${Date.now()}`,
        projectId,
        userId,
        userName,
        action: '更新项目',
        details: `更新了项目 "${project.title}"`,
        timestamp: Date.now()
      });

      const updatedProject = await this.db.getProject(projectId);
      return new Response(JSON.stringify(updatedProject), {
        status: 200,
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('更新项目失败:', error);
      return new Response(JSON.stringify({ message: '更新项目失败' }), {
        status: 500,
        headers: this.getHeaders()
      });
    }
  }

  async handleDeleteProject(request, projectId) {
    try {
      const { userId, userName } = this.parseHeaders(request);

      if (!userId || !userName) {
        return new Response(JSON.stringify({ message: '未授权访问' }), {
          status: 401,
          headers: this.getHeaders()
        });
      }

      const project = await this.db.getProject(projectId);
      if (!project) {
        return new Response(JSON.stringify({ message: '项目不存在' }), {
          status: 404,
          headers: this.getHeaders()
        });
      }

      if (project.createdBy !== userId) {
        return new Response(JSON.stringify({ message: '只有项目创建者可以删除项目' }), {
          status: 403,
          headers: this.getHeaders()
        });
      }

      const success = await this.db.deleteProject(projectId);
      if (!success) {
        return new Response(JSON.stringify({ message: '删除项目失败' }), {
          status: 400,
          headers: this.getHeaders()
        });
      }

      return new Response(JSON.stringify({ message: '项目删除成功' }), {
        status: 200,
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('删除项目失败:', error);
      return new Response(JSON.stringify({ message: '删除项目失败' }), {
        status: 500,
        headers: this.getHeaders()
      });
    }
  }

  async handleGetVersions(request, projectId) {
    try {
      const { userId } = this.parseHeaders(request);

      if (!userId) {
        return new Response(JSON.stringify({ message: '未授权访问' }), {
          status: 401,
          headers: this.getHeaders()
        });
      }

      const project = await this.db.getProject(projectId);
      if (!project) {
        return new Response(JSON.stringify({ message: '项目不存在' }), {
          status: 404,
          headers: this.getHeaders()
        });
      }

      if (project.createdBy !== userId && !project.collaborators.includes(userId)) {
        return new Response(JSON.stringify({ message: '无权访问此项目' }), {
          status: 403,
          headers: this.getHeaders()
        });
      }

      const versions = await this.db.getProjectVersions(projectId);
      return new Response(JSON.stringify(versions), {
        status: 200,
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('获取版本列表失败:', error);
      return new Response(JSON.stringify({ message: '获取版本列表失败' }), {
        status: 500,
        headers: this.getHeaders()
      });
    }
  }

  async handleRestoreVersion(request, projectId, version) {
    try {
      const { userId, userName } = this.parseHeaders(request);
      const versionNumber = parseInt(version);

      if (!userId || !userName) {
        return new Response(JSON.stringify({ message: '未授权访问' }), {
          status: 401,
          headers: this.getHeaders()
        });
      }

      const project = await this.db.getProject(projectId);
      if (!project) {
        return new Response(JSON.stringify({ message: '项目不存在' }), {
          status: 404,
          headers: this.getHeaders()
        });
      }

      if (project.createdBy !== userId && !project.collaborators.includes(userId)) {
        return new Response(JSON.stringify({ message: '无权恢复版本' }), {
          status: 403,
          headers: this.getHeaders()
        });
      }

      const versionData = await this.db.getVersion(projectId, versionNumber);
      if (!versionData) {
        return new Response(JSON.stringify({ message: '版本不存在' }), {
          status: 404,
          headers: this.getHeaders()
        });
      }

      await this.db.updateProject(projectId, {
        data: JSON.parse(JSON.stringify(versionData.data)),
        currentVersion: versionNumber
      });

      await this.db.logActivity(projectId, {
        id: `activity_${Date.now()}`,
        projectId,
        userId,
        userName,
        action: '恢复版本',
        details: `恢复到版本 ${versionNumber}`,
        timestamp: Date.now()
      });

      const updatedProject = await this.db.getProject(projectId);
      return new Response(JSON.stringify(updatedProject), {
        status: 200,
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('恢复版本失败:', error);
      return new Response(JSON.stringify({ message: '恢复版本失败' }), {
        status: 500,
        headers: this.getHeaders()
      });
    }
  }

  async handleGetComments(request, projectId) {
    try {
      const { userId } = this.parseHeaders(request);

      if (!userId) {
        return new Response(JSON.stringify({ message: '未授权访问' }), {
          status: 401,
          headers: this.getHeaders()
        });
      }

      const project = await this.db.getProject(projectId);
      if (!project) {
        return new Response(JSON.stringify({ message: '项目不存在' }), {
          status: 404,
          headers: this.getHeaders()
        });
      }

      if (project.createdBy !== userId && !project.collaborators.includes(userId)) {
        return new Response(JSON.stringify({ message: '无权访问此项目' }), {
          status: 403,
          headers: this.getHeaders()
        });
      }

      const comments = await this.db.getProjectComments(projectId);
      return new Response(JSON.stringify(comments), {
        status: 200,
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('获取评论列表失败:', error);
      return new Response(JSON.stringify({ message: '获取评论列表失败' }), {
        status: 500,
        headers: this.getHeaders()
      });
    }
  }

  async handleCreateComment(request, projectId) {
    try {
      const { userId, userName } = this.parseHeaders(request);
      const body = await request.json();
      const { type, rowId, field, content } = body;

      if (!userId || !userName) {
        return new Response(JSON.stringify({ message: '未授权访问' }), {
          status: 401,
          headers: this.getHeaders()
        });
      }

      if (!content) {
        return new Response(JSON.stringify({ message: '评论内容不能为空' }), {
          status: 400,
          headers: this.getHeaders()
        });
      }

      const project = await this.db.getProject(projectId);
      if (!project) {
        return new Response(JSON.stringify({ message: '项目不存在' }), {
          status: 404,
          headers: this.getHeaders()
        });
      }

      if (project.createdBy !== userId && !project.collaborators.includes(userId)) {
        return new Response(JSON.stringify({ message: '无权添加评论' }), {
          status: 403,
          headers: this.getHeaders()
        });
      }

      const comment = {
        id: `comment_${Date.now()}`,
        projectId,
        type: type || 'general',
        rowId,
        field,
        content,
        author: userId,
        authorName: userName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        resolved: false,
        replies: []
      };

      await this.db.createComment(projectId, comment);

      await this.db.logActivity(projectId, {
        id: `activity_${Date.now()}`,
        projectId,
        userId,
        userName,
        action: '添加评论',
        details: `添加了评论: ${content.substring(0, 50)}...`,
        timestamp: Date.now()
      });

      return new Response(JSON.stringify(comment), {
        status: 201,
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('创建评论失败:', error);
      return new Response(JSON.stringify({ message: '创建评论失败' }), {
        status: 500,
        headers: this.getHeaders()
      });
    }
  }

  async handleUpdateComment(request, projectId, commentId) {
    try {
      const { userId } = this.parseHeaders(request);
      const body = await request.json();
      const { content, resolved } = body;

      if (!userId) {
        return new Response(JSON.stringify({ message: '未授权访问' }), {
          status: 401,
          headers: this.getHeaders()
        });
      }

      const project = await this.db.getProject(projectId);
      if (!project) {
        return new Response(JSON.stringify({ message: '项目不存在' }), {
          status: 404,
          headers: this.getHeaders()
        });
      }

      if (project.createdBy !== userId && !project.collaborators.includes(userId)) {
        return new Response(JSON.stringify({ message: '无权修改评论' }), {
          status: 403,
          headers: this.getHeaders()
        });
      }

      const success = await this.db.updateComment(projectId, commentId, { content, resolved });
      if (!success) {
        return new Response(JSON.stringify({ message: '更新评论失败' }), {
          status: 400,
          headers: this.getHeaders()
        });
      }

      const comments = await this.db.getProjectComments(projectId);
      const updatedComment = comments.find(c => c.id === commentId);
      return new Response(JSON.stringify(updatedComment), {
        status: 200,
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('更新评论失败:', error);
      return new Response(JSON.stringify({ message: '更新评论失败' }), {
        status: 500,
        headers: this.getHeaders()
      });
    }
  }

  async handleDeleteComment(request, projectId, commentId) {
    try {
      const { userId } = this.parseHeaders(request);

      if (!userId) {
        return new Response(JSON.stringify({ message: '未授权访问' }), {
          status: 401,
          headers: this.getHeaders()
        });
      }

      const project = await this.db.getProject(projectId);
      if (!project) {
        return new Response(JSON.stringify({ message: '项目不存在' }), {
          status: 404,
          headers: this.getHeaders()
        });
      }

      if (project.createdBy !== userId && !project.collaborators.includes(userId)) {
        return new Response(JSON.stringify({ message: '无权删除评论' }), {
          status: 403,
          headers: this.getHeaders()
        });
      }

      const success = await this.db.deleteComment(projectId, commentId);
      if (!success) {
        return new Response(JSON.stringify({ message: '删除评论失败' }), {
          status: 400,
          headers: this.getHeaders()
        });
      }

      return new Response(JSON.stringify({ message: '评论删除成功' }), {
        status: 200,
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('删除评论失败:', error);
      return new Response(JSON.stringify({ message: '删除评论失败' }), {
        status: 500,
        headers: this.getHeaders()
      });
    }
  }

  async handleAddReply(request, projectId, commentId) {
    try {
      const { userId, userName } = this.parseHeaders(request);
      const body = await request.json();
      const { content } = body;

      if (!userId || !userName) {
        return new Response(JSON.stringify({ message: '未授权访问' }), {
          status: 401,
          headers: this.getHeaders()
        });
      }

      if (!content) {
        return new Response(JSON.stringify({ message: '回复内容不能为空' }), {
          status: 400,
          headers: this.getHeaders()
        });
      }

      const project = await this.db.getProject(projectId);
      if (!project) {
        return new Response(JSON.stringify({ message: '项目不存在' }), {
          status: 404,
          headers: this.getHeaders()
        });
      }

      if (project.createdBy !== userId && !project.collaborators.includes(userId)) {
        return new Response(JSON.stringify({ message: '无权添加回复' }), {
          status: 403,
          headers: this.getHeaders()
        });
      }

      const reply = {
        id: `reply_${Date.now()}`,
        content,
        author: userId,
        authorName: userName,
        createdAt: Date.now()
      };

      const success = await this.db.addReply(projectId, commentId, reply);
      if (!success) {
        return new Response(JSON.stringify({ message: '添加回复失败' }), {
          status: 400,
          headers: this.getHeaders()
        });
      }

      const comments = await this.db.getProjectComments(projectId);
      const updatedComment = comments.find(c => c.id === commentId);
      return new Response(JSON.stringify(updatedComment), {
        status: 201,
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('添加回复失败:', error);
      return new Response(JSON.stringify({ message: '添加回复失败' }), {
        status: 500,
        headers: this.getHeaders()
      });
    }
  }

  parseHeaders(request) {
    const userId = request.headers.get('userId');
    const userName = request.headers.get('userName');
    return { userId, userName };
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, userId, userName'
    };
  }
}

export default CollaborationHandlers;
