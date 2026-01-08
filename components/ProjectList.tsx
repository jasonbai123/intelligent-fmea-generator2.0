import React, { useState, useEffect } from 'react';
import { Plus, Folder, Calendar, Users, MoreVertical, Trash2, Edit } from 'lucide-react';
import { FmeaProject, FmeaType, ProjectStatus } from '../types';

interface ProjectListProps {
  onSelectProject: (project: FmeaProject) => void;
  onCreateProject: () => void;
}

export default function ProjectList({ onSelectProject, onCreateProject }: ProjectListProps) {
  const [projects, setProjects] = useState<FmeaProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        setError('未登录');
        setLoading(false);
        return;
      }

      const { token, userInfo } = JSON.parse(authData);
      const response = await fetch('http://localhost:3001/api/collaboration/projects', {
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        }
      });

      if (!response.ok) {
        throw new Error('获取项目列表失败');
      }

      const data = await response.json();
      setProjects(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      setLoading(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个项目吗？')) {
      return;
    }

    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        return;
      }

      const { token, userInfo } = JSON.parse(authData);
      const response = await fetch(`http://localhost:3001/api/collaboration/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        }
      });

      if (!response.ok) {
        throw new Error('删除项目失败');
      }

      await loadProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const getStatusText = (status: ProjectStatus) => {
    const statusMap = {
      [ProjectStatus.DRAFT]: '草稿',
      [ProjectStatus.IN_PROGRESS]: '进行中',
      [ProjectStatus.REVIEW]: '审核中',
      [ProjectStatus.APPROVED]: '已批准',
      [ProjectStatus.ARCHIVED]: '已归档'
    };
    return statusMap[status];
  };

  const getStatusColor = (status: ProjectStatus) => {
    const colorMap = {
      [ProjectStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [ProjectStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [ProjectStatus.REVIEW]: 'bg-yellow-100 text-yellow-800',
      [ProjectStatus.APPROVED]: 'bg-green-100 text-green-800',
      [ProjectStatus.ARCHIVED]: 'bg-gray-200 text-gray-600'
    };
    return colorMap[status];
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">我的项目</h2>
        <button
          onClick={onCreateProject}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          新建项目
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无项目</h3>
          <p className="text-gray-500 mb-4">创建您的第一个FMEA项目开始分析</p>
          <button
            onClick={onCreateProject}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            新建项目
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-blue-600" />
                    <span className="text-xs font-medium text-blue-600 uppercase">
                      {project.type === FmeaType.DFMEA ? 'DFMEA' : 'PFMEA'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {project.title}
                </h3>

                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{project.collaborators.length + 1}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                  <span className="text-xs text-gray-400">
                    v{project.currentVersion}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}