import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, Edit, Save, X, Plus, UserMinus } from 'lucide-react';
import { FmeaProject, ProjectStatus } from '../types';

interface ProjectDetailProps {
  project: FmeaProject;
  onBack: () => void;
  onUpdate: (project: FmeaProject) => void;
}

export default function ProjectDetail({ project, onBack, onUpdate }: ProjectDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<FmeaProject>(project);
  const [collaboratorInput, setCollaboratorInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditedProject(project);
  }, [project]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('auth');
      if (!authData) {
        return;
      }

      const { token, userInfo } = JSON.parse(authData);
      const response = await fetch(`http://localhost:3001/api/collaboration/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        },
        body: JSON.stringify({
          title: editedProject.title,
          description: editedProject.description,
          status: editedProject.status
        })
      });

      if (!response.ok) {
        throw new Error('更新项目失败');
      }

      const updatedProject = await response.json();
      onUpdate(updatedProject);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!collaboratorInput.trim()) {
      return;
    }

    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        return;
      }

      const { token, userInfo } = JSON.parse(authData);
      const response = await fetch(`http://localhost:3001/api/collaboration/projects/${project.id}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        },
        body: JSON.stringify({ collaboratorId: collaboratorInput.trim() })
      });

      if (!response.ok) {
        throw new Error('添加协作者失败');
      }

      const updatedProject = await response.json();
      onUpdate(updatedProject);
      setCollaboratorInput('');
    } catch (err) {
      alert(err instanceof Error ? err.message : '添加失败');
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!confirm('确定要移除这个协作者吗？')) {
      return;
    }

    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        return;
      }

      const { token, userInfo } = JSON.parse(authData);
      const response = await fetch(`http://localhost:3001/api/collaboration/projects/${project.id}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        }
      });

      if (!response.ok) {
        throw new Error('移除协作者失败');
      }

      const updatedProject = await response.json();
      onUpdate(updatedProject);
    } catch (err) {
      alert(err instanceof Error ? err.message : '移除失败');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const authData = localStorage.getItem('auth');
  const currentUserId = authData ? JSON.parse(authData).userInfo.id : '';
  const isOwner = project.createdBy === currentUserId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          返回项目列表
        </button>
        
        {isOwner && (
          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isEditing ? (
              <>
                <Save size={20} />
                保存
              </>
            ) : (
              <>
                <Edit size={20} />
                编辑
              </>
            )}
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    项目标题
                  </label>
                  <input
                    type="text"
                    value={editedProject.title}
                    onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    项目描述
                  </label>
                  <textarea
                    value={editedProject.description || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    项目状态
                  </label>
                  <select
                    value={editedProject.status}
                    onChange={(e) => setEditedProject({ ...editedProject, status: e.target.value as ProjectStatus })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={ProjectStatus.DRAFT}>草稿</option>
                    <option value={ProjectStatus.IN_PROGRESS}>进行中</option>
                    <option value={ProjectStatus.REVIEW}>审核中</option>
                    <option value={ProjectStatus.APPROVED}>已批准</option>
                    <option value={ProjectStatus.ARCHIVED}>已归档</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProject(project);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                  <p className="text-gray-600">{project.description || '暂无描述'}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>创建于 {formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>更新于 {formatDate(project.updatedAt)}</span>
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                    {getStatusText(project.status)}
                  </div>
                  <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-medium">
                    v{project.currentVersion}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} />
              协作者 ({project.collaborators.length + 1})
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">创建者</div>
                  <div className="text-sm text-gray-600">{project.createdBy}</div>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  所有者
                </span>
              </div>

              {project.collaborators.map((collaboratorId) => (
                <div
                  key={collaboratorId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">{collaboratorId}</div>
                    <div className="text-sm text-gray-600">协作者</div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveCollaborator(collaboratorId)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="移除协作者"
                    >
                      <UserMinus size={18} />
                    </button>
                  )}
                </div>
              ))}

              {isOwner && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入用户ID添加协作者"
                    value={collaboratorInput}
                    onChange={(e) => setCollaboratorInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCollaborator()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddCollaborator}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    添加
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}