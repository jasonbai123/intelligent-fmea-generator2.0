/**
 * Step 7: Documentation of Results - Main Page
 * AIAG VDA FMEA 1st Edition - Complete Documentation Component
 *
 * This is the main component that integrates all Step 7 sub-components:
 * - Completion Checklist
 * - Executive Summary
 * - Review and Approval
 */

import React, { useState } from 'react';
import { FmeaAnalysisResult, FmeaDocumentation, AiSettings } from '../types';
import { FileText, ClipboardCheck, FileSignature, Download, Send, Save, CheckCircle2 } from 'lucide-react';
import { FmeaStep7Checklist } from './FmeaStep7Checklist';
import { FmeaStep7ExecutiveSummary } from './FmeaStep7ExecutiveSummary';
import { FmeaStep7Approval } from './FmeaStep7Approval';

interface FmeaStep7DocumentationProps {
  fmeaData: FmeaAnalysisResult;
  documentation?: FmeaDocumentation;
  aiSettings?: AiSettings;
  currentUser?: string;
  onSave: (documentation: FmeaDocumentation) => void;
  onSubmitForApproval?: (level: 'preliminary' | 'interim' | 'final') => void;
}

export const FmeaStep7Documentation: React.FC<FmeaStep7DocumentationProps> = ({
  fmeaData,
  documentation: initialDocumentation,
  aiSettings,
  currentUser = 'Current User',
  onSave,
  onSubmitForApproval
}) => {
  const [documentation, setDocumentation] = useState<FmeaDocumentation>(
    initialDocumentation || {
      fmeaId: `fmea-${Date.now()}`,
      completionChecklist: {
        allHighPrioritiesAddressed: false,
        responsiblePersonAssigned: false,
        targetDatesSet: false,
        actionsDocumented: false,
        reviewCompleted: false,
        approvalObtained: false,
        checkedBy: '',
        checkedDate: 0,
        notes: ''
      },
      executiveSummary: '',
      topRisks: [],
      metrics: {
        totalRows: 0,
        highAPCount: 0,
        mediumAPCount: 0,
        lowAPCount: 0,
        completionRate: 0,
        averageActionCycle: 0,
        actionsCompleted: 0,
        actionsPending: 0,
        overdueActions: 0
      },
      reviewHistory: [],
      approval: null,
      archivalInfo: {
        version: '1.0',
        status: 'draft',
        archivedBy: '',
        archivedDate: 0,
        retentionPeriod: 2555, // 7 years in days
        nextReviewDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
        documentNumber: `FMEA-${fmeaData.type}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        distributionList: []
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  );

  const [activeSection, setActiveSection] = useState<'checklist' | 'summary' | 'approval' | 'all'>('all');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChecklist = (checklist: any) => {
    const updated = {
      ...documentation,
      completionChecklist: checklist,
      updatedAt: Date.now()
    };
    setDocumentation(updated);
    debouncedSave(updated);
  };

  const handleSaveSummary = (summary: string) => {
    const updated = {
      ...documentation,
      executiveSummary: summary,
      updatedAt: Date.now()
    };
    setDocumentation(updated);
    debouncedSave(updated);
  };

  const handleSaveReview = (review: any) => {
    const updated = {
      ...documentation,
      reviewHistory: [...documentation.reviewHistory, review],
      updatedAt: Date.now()
    };
    setDocumentation(updated);
    debouncedSave(updated);
  };

  const handleApprove = (approval: any) => {
    const updated = {
      ...documentation,
      approval,
      updatedAt: Date.now()
    };
    setDocumentation(updated);
    debouncedSave(updated);
  };

  const handleReject = (reason: string) => {
    // Remove approval and add to review history
    const updated = {
      ...documentation,
      approval: null,
      reviewHistory: [
        ...documentation.reviewHistory,
        {
          reviewId: `rejection-${Date.now()}`,
          reviewType: 'management' as const,
          reviewer: currentUser,
          reviewerName: currentUser,
          reviewDate: Date.now(),
          comments: [{
            id: `comment-${Date.now()}`,
            author: currentUser,
            authorName: currentUser,
            content: `拒绝原因: ${reason}`,
            timestamp: Date.now(),
            resolved: false
          }],
          decisions: [{
            category: '总体评估',
            decision: 'reject' as const,
            reason
          }],
          status: 'rejected' as const
        }
      ],
      updatedAt: Date.now()
    };
    setDocumentation(updated);
    debouncedSave(updated);
  };

  const handleSubmitForApproval = (level: 'preliminary' | 'interim' | 'final') => {
    if (onSubmitForApproval) {
      onSubmitForApproval(level);
    }

    // Update archival info
    const updated = {
      ...documentation,
      archivalInfo: {
        ...documentation.archivalInfo,
        status: level === 'final' ? 'approved' : 'submitted'
      },
      updatedAt: Date.now()
    };
    setDocumentation(updated);
    debouncedSave(updated);
  };

  // Debounced save function
  let saveTimeout: NodeJS.Timeout;
  const debouncedSave = (doc: FmeaDocumentation) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      onSave(doc);
    }, 500);
  };

  const handleExportAll = () => {
    // Export complete documentation as JSON
    const blob = new Blob([JSON.stringify(documentation, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fmeaData.title}_Step7_文档化_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = () => {
    setIsSaving(true);
    onSave(documentation);
    setTimeout(() => {
      setIsSaving(false);
      alert('✅ Step 7文档化数据已成功保存！');
    }, 500);
  };

  const completionPercentage = Object.values(documentation.completionChecklist)
    .filter(v => typeof v === 'boolean' && v === true)
    .length / 6 * 100;

  const isComplete = completionPercentage === 100 && documentation.approval;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Step 7 - 结果文件化</h1>
              <p className="text-blue-100 mt-1">
                AIAG VDA FMEA 1st Edition - Documentation of Results
              </p>
              <div className="text-sm text-blue-100 mt-2">
                项目: {fmeaData.title} ({fmeaData.type})
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{Math.round(completionPercentage)}%</div>
            <div className="text-sm text-blue-100">完成度</div>
            {isComplete && (
              <div className="flex items-center gap-1 mt-1 text-sm">
                <CheckCircle2 size={16} />
                <span>已完成</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          {[
            { id: 'checklist', label: '完成检查清单', icon: ClipboardCheck, completed: completionPercentage >= 100 },
            { id: 'summary', label: '执行摘要', icon: FileText, completed: !!documentation.executiveSummary },
            { id: 'approval', label: '评审批准', icon: FileSignature, completed: !!documentation.approval }
          ].map((step, idx) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setActiveSection(step.id as any)}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                  activeSection === step.id || activeSection === 'all'
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  step.completed ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'
                }`}>
                  <step.icon size={20} />
                </div>
                <span className={`text-xs font-medium text-center ${
                  activeSection === step.id ? 'text-blue-700' : 'text-slate-600'
                }`}>
                  {step.label}
                </span>
              </button>
              {idx < 2 && (
                <div className={`flex-shrink-0 w-12 h-0.5 ${
                  completionPercentage > (idx + 1) * 33 ? 'bg-green-500' : 'bg-slate-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Section Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveSection('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          显示全部
        </button>
        <button
          onClick={() => setActiveSection('checklist')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'checklist'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          检查清单
        </button>
        <button
          onClick={() => setActiveSection('summary')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'summary'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          执行摘要
        </button>
        <button
          onClick={() => setActiveSection('approval')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'approval'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          评审批准
        </button>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Checklist Section */}
        {(activeSection === 'all' || activeSection === 'checklist') && (
          <section id="checklist-section">
            <FmeaStep7Checklist
              fmeaData={fmeaData}
              checklist={documentation.completionChecklist}
              onSave={handleSaveChecklist}
              currentUser={currentUser}
            />
          </section>
        )}

        {/* Executive Summary Section */}
        {(activeSection === 'all' || activeSection === 'summary') && (
          <section id="summary-section">
            <FmeaStep7ExecutiveSummary
              fmeaData={fmeaData}
              aiSettings={aiSettings}
              onSave={handleSaveSummary}
            />
          </section>
        )}

        {/* Review and Approval Section */}
        {(activeSection === 'all' || activeSection === 'approval') && (
          <section id="approval-section">
            <FmeaStep7Approval
              fmeaId={documentation.fmeaId}
              reviewHistory={documentation.reviewHistory}
              approval={documentation.approval}
              currentUser={currentUser}
              onSaveReview={handleSaveReview}
              onSubmitForApproval={handleSubmitForApproval}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </section>
        )}
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-0 bg-white border border-slate-200 rounded-xl shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600">
            <span className="font-medium">状态:</span>{' '}
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isComplete
                ? 'bg-green-100 text-green-800'
                : documentation.archivalInfo.status === 'submitted'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-100 text-slate-800'
            }`}>
              {isComplete ? '已完成' : documentation.archivalInfo.status === 'submitted' ? '已提交' : '草稿'}
            </span>
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-medium">版本:</span> {documentation.archivalInfo.version}
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-medium">文档号:</span> {documentation.archivalInfo.documentNumber}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            导出全部
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                保存中...
              </>
            ) : (
              <>
                <Save size={16} />
                保存全部
              </>
            )}
          </button>
          {isComplete && (
            <button
              onClick={() => {
                alert('✅ FMEA已完成所有Step 7要求！\n\n可以进入下一阶段或导出最终报告。');
              }}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm font-medium"
            >
              <Send size={16} />
              提交最终报告
            </button>
          )}
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <div className="font-bold mb-2">ℹ️ Step 7 - 结果文件化 (AIAG VDA FMEA)</div>
        <p className="mb-2">
          本步骤确保FMEA分析得到完整记录、评审和批准。根据AIAG VDA FMEA第一版标准，所有FMEA项目必须：
        </p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>完成所有验证项目（检查清单100%）</li>
          <li>生成执行摘要，供管理层审阅</li>
          <li>经过跨职能团队评审</li>
          <li>获得相应级别的正式批准</li>
          <li>建立文件归档和分发机制</li>
        </ul>
      </div>
    </div>
  );
};
