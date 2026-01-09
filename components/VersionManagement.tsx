import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, RotateCcw, Clock, User } from 'lucide-react';
import { ProjectVersion } from '../types';
import { API_ENDPOINTS } from '../config/api';

interface VersionManagementProps {
  projectId: string;
  currentVersion: number;
  onVersionRestore: (version: number) => void;
}

export default function VersionManagement({ projectId, currentVersion, onVersionRestore }: VersionManagementProps) {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [comment, setComment] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [projectId]);

  const loadVersions = async () => {
    try {
      const authData = localStorage.getItem('fmea_auth_token');
      if (!authData) {
        return;
      }

      const { userInfo } = JSON.parse(authData);
      const response = await fetch(API_ENDPOINTS.collaboration.versions(projectId), {
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        }
      });

      if (!response.ok) {
        throw new Error('获取版本列表失败');
      }

      const data = await response.json();
      setVersions(data.reverse());
      setLoading(false);
    } catch (err) {
      console.error('加载版本失败:', err);
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!comment.trim()) {
      alert('请输入版本说明');
      return;
    }

    try {
      setCreating(true);
      const authData = localStorage.getItem('fmea_auth_token');
      if (!authData) {
        return;
      }

      const { userInfo } = JSON.parse(authData);
      const response = await fetch(API_ENDPOINTS.collaboration.versions(projectId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        },
        body: JSON.stringify({ comment })
      });

      if (!response.ok) {
        throw new Error('创建版本失败');
      }

      setShowCreateModal(false);
      setComment('');
      await loadVersions();
    } catch (err) {
      alert(err instanceof Error ? err.message : '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreVersion = async (version: number) => {
    if (!confirm(`确定要恢复到版本 ${version} 吗？当前版本将被覆盖。`)) {
      return;
    }

    try {
      const authData = localStorage.getItem('fmea_auth_token');
      if (!authData) {
        return;
      }

      const { userInfo } = JSON.parse(authData);
      const response = await fetch(API_ENDPOINTS.collaboration.restoreVersion(projectId, version.toString()), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        }
      });

      if (!response.ok) {
        throw new Error('恢复版本失败');
      }

      alert('版本恢复成功');
      onVersionRestore(version);
      await loadVersions();
    } catch (err) {
      alert(err instanceof Error ? err.message : '恢复失败');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <GitBranch size={20} />
          版本历史
        </h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          创建新版本
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <GitBranch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无版本历史</h3>
          <p className="text-gray-500">创建第一个版本开始追踪项目变更</p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className={`bg-white rounded-lg border ${
                version.version === currentVersion
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      version.version === currentVersion
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      v{version.version}
                      {version.version === currentVersion && ' (当前)'}
                    </div>
                  </div>
                  
                  {version.version !== currentVersion && (
                    <button
                      onClick={() => handleRestoreVersion(version.version)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <RotateCcw size={14} />
                      恢复此版本
                    </button>
                  )}
                </div>

                <p className="text-gray-900 font-medium mb-3">{version.comment}</p>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{version.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatDate(version.createdAt)}</span>
                  </div>
                  <div className="text-gray-400">
                    {version.data.rows.length} 行数据
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">创建新版本</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  版本说明
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="描述此版本的主要变更..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateVersion}
                  disabled={creating || !comment.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {creating ? '创建中...' : '创建版本'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setComment('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}