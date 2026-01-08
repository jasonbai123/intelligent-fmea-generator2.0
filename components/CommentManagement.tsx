import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Reply, CheckCircle, XCircle, Trash2, Edit2 } from 'lucide-react';
import { Comment, CommentType } from '../types';

interface CommentManagementProps {
  projectId: string;
}

export default function CommentManagement({ projectId }: CommentManagementProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCommentModal, setShowNewCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<CommentType>(CommentType.GENERAL);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadComments();
  }, [projectId]);

  const loadComments = async () => {
    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        return;
      }

      const { token, userInfo } = JSON.parse(authData);
      const response = await fetch(`http://localhost:3001/api/collaboration/projects/${projectId}/comments`, {
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        }
      });

      if (!response.ok) {
        throw new Error('获取评论列表失败');
      }

      const data = await response.json();
      setComments(data.sort((a: Comment, b: Comment) => b.createdAt - a.createdAt));
      setLoading(false);
    } catch (err) {
      console.error('加载评论失败:', err);
      setLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) {
      alert('请输入评论内容');
      return;
    }

    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        return;
      }

      const { token, userInfo } = JSON.parse(authData);
      const response = await fetch(`http://localhost:3001/api/collaboration/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        },
        body: JSON.stringify({
          type: commentType,
          content: newComment
        })
      });

      if (!response.ok) {
        throw new Error('创建评论失败');
      }

      setShowNewCommentModal(false);
      setNewComment('');
      setCommentType(CommentType.GENERAL);
      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : '创建失败');
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) {
      alert('请输入回复内容');
      return;
    }

    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        return;
      }

      const { token, userInfo } = JSON.parse(authData);
      const response = await fetch(`http://localhost:3001/api/collaboration/projects/${projectId}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        },
        body: JSON.stringify({ content: replyContent })
      });

      if (!response.ok) {
        throw new Error('回复失败');
      }

      setReplyingTo(null);
      setReplyContent('');
      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : '回复失败');
    }
  };

  const handleToggleResolved = async (comment: Comment) => {
    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        return;
      }

      const { token, userInfo } = JSON.parse(authData);
      const response = await fetch(`http://localhost:3001/api/collaboration/projects/${projectId}/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        },
        body: JSON.stringify({ resolved: !comment.resolved })
      });

      if (!response.ok) {
        throw new Error('更新评论失败');
      }

      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新失败');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        return;
      }

      const { token, userInfo } = JSON.parse(authData);
      const response = await fetch(`http://localhost:3001/api/collaboration/projects/${projectId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        }
      });

      if (!response.ok) {
        throw new Error('删除评论失败');
      }

      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      alert('请输入评论内容');
      return;
    }

    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        return;
      }

      const { token, userInfo } = JSON.parse(authData);
      const response = await fetch(`http://localhost:3001/api/collaboration/projects/${projectId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'userId': userInfo.id,
          'userName': userInfo.phone
        },
        body: JSON.stringify({ content: editContent })
      });

      if (!response.ok) {
        throw new Error('更新评论失败');
      }

      setEditingComment(null);
      setEditContent('');
      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新失败');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
  };

  const authData = localStorage.getItem('auth');
  const currentUserId = authData ? JSON.parse(authData).userInfo.id : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare size={20} />
          评论 ({comments.length})
        </h3>
        <button
          onClick={() => setShowNewCommentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Send size={18} />
          新建评论
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评论</h3>
          <p className="text-gray-500">添加第一条评论开始讨论</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-white rounded-lg border ${
                comment.resolved ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{comment.authorName}</div>
                      <div className="text-sm text-gray-500">{formatDate(comment.createdAt)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {comment.resolved && (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle size={16} />
                        已解决
                      </span>
                    )}
                    <button
                      onClick={() => handleToggleResolved(comment)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title={comment.resolved ? '标记为未解决' : '标记为已解决'}
                    >
                      {comment.resolved ? <XCircle size={18} /> : <CheckCircle size={18} />}
                    </button>
                    {comment.author === currentUserId && (
                      <>
                        <button
                          onClick={() => {
                            setEditingComment(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="编辑"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingComment === comment.id ? (
                  <div className="mb-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setEditingComment(null);
                          setEditContent('');
                        }}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-900 mb-3">{comment.content}</p>
                )}

                {comment.replies.length > 0 && (
                  <div className="space-y-2 ml-4 border-l-2 border-gray-200 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-medium">
                              {reply.authorName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{reply.authorName}</span>
                          <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {replyingTo === comment.id ? (
                  <div className="mt-3">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      placeholder="输入回复..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleReply(comment.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        发送回复
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Reply size={14} />
                    回复
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">新建评论</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评论类型
                </label>
                <select
                  value={commentType}
                  onChange={(e) => setCommentType(e.target.value as CommentType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={CommentType.GENERAL}>一般评论</option>
                  <option value={CommentType.ROW}>行评论</option>
                  <option value={CommentType.CELL}>单元格评论</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评论内容
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  placeholder="输入您的评论..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateComment}
                  disabled={!newComment.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  创建评论
                </button>
                <button
                  onClick={() => {
                    setShowNewCommentModal(false);
                    setNewComment('');
                    setCommentType(CommentType.GENERAL);
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