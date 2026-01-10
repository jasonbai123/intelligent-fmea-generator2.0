/**
 * Step 7: Review and Approval Component
 * AIAG VDA FMEA - Management Review and Approval Process
 */

import React, { useState, useEffect } from 'react';
import { ReviewRecord, ApprovalRecord, ReviewComment, ReviewDecision } from '../types';
import { CheckCircle, XCircle, Clock, UserCheck, FileSignature, MessageSquare, Plus, Send, Archive } from 'lucide-react';

interface FmeaStep7ApprovalProps {
  fmeaId: string;
  reviewHistory?: ReviewRecord[];
  approval?: ApprovalRecord | null;
  currentUser?: string;
  onSaveReview: (review: ReviewRecord) => void;
  onSubmitForApproval: (level: 'preliminary' | 'interim' | 'final') => void;
  onApprove: (approval: ApprovalRecord) => void;
  onReject: (reason: string) => void;
}

export const FmeaStep7Approval: React.FC<FmeaStep7ApprovalProps> = ({
  fmeaId,
  reviewHistory: initialReviewHistory = [],
  approval: initialApproval = null,
  currentUser = 'Current User',
  onSaveReview,
  onSubmitForApproval,
  onApprove,
  onReject
}) => {
  const [reviewHistory, setReviewHistory] = useState<ReviewRecord[]>(initialReviewHistory);
  const [approval, setApproval] = useState<ApprovalRecord | null>(initialApproval);

  const [activeTab, setActiveTab] = useState<'reviews' | 'approval' | 'new-review'>('reviews');
  const [newReview, setNewReview] = useState<Partial<ReviewRecord>>({
    reviewType: 'management',
    reviewer: currentUser,
    reviewerName: currentUser,
    reviewDate: Date.now(),
    comments: [],
    decisions: [],
    status: 'pending'
  });
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: ReviewComment = {
      id: `comment-${Date.now()}`,
      author: currentUser,
      authorName: currentUser,
      content: newComment,
      timestamp: Date.now(),
      resolved: false
    };

    setNewReview({
      ...newReview,
      comments: [...(newReview.comments || []), comment]
    });
    setNewComment('');
  };

  const handleAddDecision = () => {
    const decision: ReviewDecision = {
      category: '总体评估',
      decision: 'conditional',
      condition: '',
      reason: ''
    };

    setNewReview({
      ...newReview,
      decisions: [...(newReview.decisions || []), decision]
    });
  };

  const handleUpdateDecision = (index: number, field: keyof ReviewDecision, value: any) => {
    const updatedDecisions = [...(newReview.decisions || [])];
    updatedDecisions[index] = {
      ...updatedDecisions[index],
      [field]: value
    };
    setNewReview({
      ...newReview,
      decisions: updatedDecisions
    });
  };

  const handleRemoveDecision = (index: number) => {
    const updatedDecisions = [...(newReview.decisions || [])];
    updatedDecisions.splice(index, 1);
    setNewReview({
      ...newReview,
      decisions: updatedDecisions
    });
  };

  const handleSubmitReview = () => {
    if (!newReview.reviewType || !newReview.comments?.length) {
      alert('请至少添加一条评审意见');
      return;
    }

    const review: ReviewRecord = {
      reviewId: `review-${Date.now()}`,
      ...newReview,
      fmeaId,
      reviewDate: Date.now(),
      comments: newReview.comments || [],
      decisions: newReview.decisions || [],
      status: 'submitted' as any
    } as ReviewRecord;

    setReviewHistory([...reviewHistory, review]);
    onSaveReview(review);

    // Reset form
    setNewReview({
      reviewType: 'management',
      reviewer: currentUser,
      reviewerName: currentUser,
      reviewDate: Date.now(),
      comments: [],
      decisions: [],
      status: 'pending'
    });
    setActiveTab('reviews');
  };

  const handleApprove = (level: 'preliminary' | 'interim' | 'final') => {
    if (!window.confirm(`确认批准为${level === 'preliminary' ? '初步' : level === 'interim' ? '中间' : '最终'}批准？`)) {
      return;
    }

    const approvalRecord: ApprovalRecord = {
      approverName: currentUser,
      approverRole: 'Quality Manager',
      approvalDate: Date.now(),
      signature: 'DIGITAL_SIGNATURE', // In real app, use actual digital signature
      validUntil: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      conditions: [],
      approvalLevel: level
    };

    setApproval(approvalRecord);
    onApprove(approvalRecord);
  };

  const handleReject = () => {
    const reason = prompt('请输入拒绝原因：');
    if (!reason) return;

    setApproval(null);
    onReject(reason);
  };

  const getReviewTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      peer: '同行评审',
      management: '管理层评审',
      supplier: '供应商评审',
      customer: '顾客评审',
      external: '外部专家评审'
    };
    return labels[type] || type;
  };

  const getReviewTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      peer: 'bg-blue-100 text-blue-800',
      management: 'bg-purple-100 text-purple-800',
      supplier: 'bg-green-100 text-green-800',
      customer: 'bg-red-100 text-red-800',
      external: 'bg-amber-100 text-amber-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={16} />;
      case 'conditional':
        return <Clock className="text-amber-600" size={16} />;
      default:
        return <Clock className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="space-y-6 bg-white rounded-xl shadow-md border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileSignature className="text-indigo-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              评审与批准
            </h3>
            <p className="text-sm text-slate-500">
              FMEA管理层评审和正式批准流程
            </p>
          </div>
        </div>
        {approval && (
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            <div>
              <div className="font-bold">已批准</div>
              <div className="text-xs">{approval.approvalLevel} level</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'reviews'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          评审历史 ({reviewHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('approval')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'approval'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          批准状态
        </button>
        <button
          onClick={() => setActiveTab('new-review')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'new-review'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          新建评审
        </button>
      </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviewHistory.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg">
              <MessageSquare className="text-slate-400 mx-auto mb-3" size={48} />
              <p className="text-slate-500">暂无评审记录</p>
              <p className="text-sm text-slate-400 mt-1">点击"新建评审"开始</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewHistory.map((review) => (
                <div key={review.reviewId} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReviewTypeColor(review.reviewType)}`}>
                        {getReviewTypeLabel(review.reviewType)}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        {getStatusIcon(review.status)}
                        <span className="font-medium">{review.reviewerName}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(review.reviewDate).toLocaleString('zh-CN')}
                    </div>
                  </div>

                  {/* Comments */}
                  {review.comments && review.comments.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {review.comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-50 rounded p-3 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-700">{comment.authorName}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(comment.timestamp).toLocaleString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-slate-600">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Decisions */}
                  {review.decisions && review.decisions.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-slate-700">评审决策</div>
                      {review.decisions.map((decision, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded p-3 text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-700">{decision.category}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              decision.decision === 'approve'
                                ? 'bg-green-100 text-green-800'
                                : decision.decision === 'reject'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {decision.decision === 'approve' ? '批准' : decision.decision === 'reject' ? '拒绝' : '有条件批准'}
                            </span>
                          </div>
                          {decision.reason && (
                            <p className="text-slate-600 text-xs">{decision.reason}</p>
                          )}
                          {decision.condition && (
                            <p className="text-amber-700 text-xs mt-1">条件: {decision.condition}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approval Tab */}
      {activeTab === 'approval' && (
        <div className="space-y-6">
          {approval ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-green-600" size={32} />
                <div>
                  <div className="text-lg font-bold text-green-900">FMEA已批准</div>
                  <div className="text-sm text-green-700">
                    {approval.approvalLevel === 'final' ? '最终' : approval.approvalLevel === 'interim' ? '中间' : '初步'}批准
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">批准人: </span>
                  <span className="font-medium text-slate-700">{approval.approverName}</span>
                </div>
                <div>
                  <span className="text-slate-500">角色: </span>
                  <span className="font-medium text-slate-700">{approval.approverRole}</span>
                </div>
                <div>
                  <span className="text-slate-500">批准日期: </span>
                  <span className="font-medium text-slate-700">
                    {new Date(approval.approvalDate).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">有效期至: </span>
                  <span className="font-medium text-slate-700">
                    {new Date(approval.validUntil).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>

              {approval.conditions && approval.conditions.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-slate-700 mb-2">批准条件</div>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    {approval.conditions.map((condition, idx) => (
                      <li key={idx}>{condition}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-amber-600" size={20} />
                  <span className="font-medium text-amber-900">等待批准</span>
                </div>
                <p className="text-sm text-amber-700">
                  该FMEA尚未获得正式批准。请确保完成所有评审并提交批准请求。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => onSubmitForApproval('preliminary')}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <div className="font-bold text-blue-900 mb-1">初步批准</div>
                  <div className="text-xs text-blue-700">用于内部评审和初步发布</div>
                </button>
                <button
                  onClick={() => onSubmitForApproval('interim')}
                  className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="font-bold text-purple-900 mb-1">中间批准</div>
                  <div className="text-xs text-purple-700">用于阶段性成果确认</div>
                </button>
                <button
                  onClick={() => onSubmitForApproval('final')}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <div className="font-bold text-green-900 mb-1">最终批准</div>
                  <div className="text-xs text-green-700">用于正式发布和归档</div>
                </button>
              </div>

              {/* Quick Approve for Authorized Users */}
              <div className="border-t border-slate-200 pt-4">
                <div className="text-sm font-medium text-slate-700 mb-3">快速批准（授权用户）</div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove('preliminary')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium"
                  >
                    批准为初步
                  </button>
                  <button
                    onClick={() => handleApprove('interim')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors text-sm font-medium"
                  >
                    批准为中间
                  </button>
                  <button
                    onClick={() => handleApprove('final')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm font-medium"
                  >
                    批准为最终
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors text-sm font-medium"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Review Tab */}
      {activeTab === 'new-review' && (
        <div className="space-y-6">
          {/* Review Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              评审类型
            </label>
            <select
              value={newReview.reviewType}
              onChange={(e) => setNewReview({ ...newReview, reviewType: e.target.value as any })}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="peer">同行评审</option>
              <option value="management">管理层评审</option>
              <option value="supplier">供应商评审</option>
              <option value="customer">顾客评审</option>
              <option value="external">外部专家评审</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              评审意见
            </label>
            <div className="space-y-3">
              {newReview.comments?.map((comment, idx) => (
                <div key={comment.id} className="bg-slate-50 rounded-lg p-3 flex items-start justify-between">
                  <div className="text-sm text-slate-700">{comment.content}</div>
                  <button
                    onClick={() => {
                      const updated = [...(newReview.comments || [])];
                      updated.splice(idx, 1);
                      setNewReview({ ...newReview, comments: updated });
                    }}
                    className="text-red-600 hover:text-red-700 text-xs"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="输入评审意见..."
                className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
                rows={2}
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Decisions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">
                评审决策
              </label>
              <button
                onClick={handleAddDecision}
                className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <Plus size={12} />
                添加决策
              </button>
            </div>
            <div className="space-y-3">
              {newReview.decisions?.map((decision, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={decision.category}
                      onChange={(e) => handleUpdateDecision(idx, 'category', e.target.value)}
                      placeholder="决策类别"
                      className="flex-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                    <button
                      onClick={() => handleRemoveDecision(idx)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                  <select
                    value={decision.decision}
                    onChange={(e) => handleUpdateDecision(idx, 'decision', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="approve">批准</option>
                    <option value="conditional">有条件批准</option>
                    <option value="reject">拒绝</option>
                  </select>
                  {decision.decision === 'conditional' && (
                    <input
                      type="text"
                      value={decision.condition || ''}
                      onChange={(e) => handleUpdateDecision(idx, 'condition', e.target.value)}
                      placeholder="批准条件..."
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  )}
                  <textarea
                    value={decision.reason}
                    onChange={(e) => handleUpdateDecision(idx, 'reason', e.target.value)}
                    placeholder="决策理由..."
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              onClick={handleSubmitReview}
              disabled={!newReview.comments?.length || submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Clock className="animate-spin" size={16} />
                  提交中...
                </>
              ) : (
                <>
                  <Send size={16} />
                  提交评审
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
