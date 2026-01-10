/**
 * Step 7: FMEA Completion Checklist Component
 * AIAG VDA FMEA 1st Edition - Documentation of Results
 */

import React, { useState, useEffect } from 'react';
import { FmeaAnalysisResult, FMEACompletionChecklist, FmeaMetrics } from '../types';
import { calculateFmeaMetrics, getTopRisks } from '../utils/apValidation';
import { CheckCircle2, Circle, AlertTriangle, FileCheck, ClipboardCheck } from 'lucide-react';

interface FmeaStep7ChecklistProps {
  fmeaData: FmeaAnalysisResult;
  checklist?: FMEACompletionChecklist;
  onSave: (checklist: FMEACompletionChecklist) => void;
  currentUser?: string;
}

export const FmeaStep7Checklist: React.FC<FmeaStep7ChecklistProps> = ({
  fmeaData,
  checklist: initialChecklist,
  onSave,
  currentUser = 'Current User'
}) => {
  const [checklist, setChecklist] = useState<FMEACompletionChecklist>(
    initialChecklist || {
      allHighPrioritiesAddressed: false,
      responsiblePersonAssigned: false,
      targetDatesSet: false,
      actionsDocumented: false,
      reviewCompleted: false,
      approvalObtained: false,
      checkedBy: '',
      checkedDate: 0,
      notes: ''
    }
  );

  const [metrics, setMetrics] = useState<FmeaMetrics | null>(null);
  const [topRisks, setTopRisks] = useState<any[]>([]);

  useEffect(() => {
    // Calculate metrics
    const calculatedMetrics = calculateFmeaMetrics(fmeaData.rows);
    setMetrics(calculatedMetrics);

    // Get top risks
    const risks = getTopRisks(fmeaData.rows, 10);
    setTopRisks(risks);

    // Auto-check some items based on data
    const updatedChecklist = { ...checklist };

    // Check if all high priorities have actions
    const allHighAddressed = fmeaData.rows.every(row => {
      const ap = (row.s5_ap || '').toUpperCase();
      if (ap === 'H') {
        return !!(row.s6_prev_action || row.s6_det_action);
      }
      return true;
    });
    updatedChecklist.allHighPrioritiesAddressed = allHighAddressed;

    // Check if responsible persons are assigned
    const hasResponsible = fmeaData.rows.some(row => !!row.s6_resp_person);
    updatedChecklist.responsiblePersonAssigned = hasResponsible;

    // Check if target dates are set
    const hasTargetDates = fmeaData.rows.some(row => !!row.s6_target_date);
    updatedChecklist.targetDatesSet = hasTargetDates;

    // Check if actions are documented
    const hasActions = fmeaData.rows.some(row =>
      !!(row.s6_prev_action || row.s6_det_action)
    );
    updatedChecklist.actionsDocumented = hasActions;

    setChecklist(updatedChecklist);
  }, [fmeaData]);

  const handleToggle = (field: keyof FMEACompletionChecklist, value: boolean) => {
    const updated = {
      ...checklist,
      [field]: value,
      checkedBy: currentUser,
      checkedDate: Date.now()
    };
    setChecklist(updated);
    onSave(updated);
  };

  const handleNotesChange = (notes: string) => {
    const updated = {
      ...checklist,
      notes,
      checkedBy: currentUser,
      checkedDate: Date.now()
    };
    setChecklist(updated);
    onSave(updated);
  };

  const completionPercentage = Object.values(checklist)
    .filter(v => typeof v === 'boolean' && v === true)
    .length / 6 * 100;

  const allChecked = Object.values(checklist)
    .filter(v => typeof v === 'boolean')
    .every(v => v === true);

  return (
    <div className="space-y-6 bg-white rounded-xl shadow-md border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ClipboardCheck className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Step 7 - 完成检查清单
            </h3>
            <p className="text-sm text-slate-500">
              AIAG VDA FMEA 文件化要求验证
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">
            {Math.round(completionPercentage)}%
          </div>
          <div className="text-xs text-slate-500">完成度</div>
        </div>
      </div>

      {/* Metrics Summary */}
      {metrics && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <FileCheck size={16} />
            FMEA 指标概览
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded p-3 border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{metrics.totalRows}</div>
              <div className="text-xs text-slate-500">总行数</div>
            </div>
            <div className="bg-red-50 rounded p-3 border border-red-200">
              <div className="text-2xl font-bold text-red-700">{metrics.highAPCount}</div>
              <div className="text-xs text-red-600">高优先级 (H)</div>
            </div>
            <div className="bg-yellow-50 rounded p-3 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{metrics.mediumAPCount}</div>
              <div className="text-xs text-yellow-600">中优先级 (M)</div>
            </div>
            <div className="bg-green-50 rounded p-3 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{metrics.completionRate}%</div>
              <div className="text-xs text-green-600">措施完成率</div>
            </div>
          </div>

          {/* Action Status */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-slate-600">已完成措施: <strong>{metrics.actionsCompleted}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-slate-600">待处理措施: <strong>{metrics.actionsPending}</strong></span>
            </div>
            {metrics.overdueActions > 0 && (
              <div className="flex items-center gap-2 text-sm col-span-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-600">逾期措施: <strong>{metrics.overdueActions}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Risks Alert */}
      {topRisks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            Top 5 高风险项目警告
          </h4>
          <div className="space-y-2">
            {topRisks.slice(0, 5).map((risk, idx) => (
              <div key={risk.rowId} className="text-xs bg-white rounded p-2 border border-amber-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700">#{risk.rank} - {risk.failureMode}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-bold">
                    S={risk.s} O={risk.o} D={risk.d} AP={risk.ap}
                  </span>
                </div>
                <div className="text-slate-600">{risk.failureEffect}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-700 mt-2">
            💡 这些高风险项目必须在FMEA提交前处理或制定明确的措施计划。
          </p>
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-700 mb-3">验证项目</h4>

        {/* Item 1: All High Priorities Addressed */}
        <ChecklistItem
          id="allHighPrioritiesAddressed"
          label="所有高优先级(H)项目已采取措施"
          checked={checklist.allHighPrioritiesAddressed}
          onChange={(checked) => handleToggle('allHighPrioritiesAddressed', checked)}
          hint="确保所有S≥8或O≥8或D≥8的项目都有相应的预防和探测措施"
          warning={!checklist.allHighPrioritiesAddressed && metrics?.highAPCount > 0}
          warningText={`还有 ${metrics?.highAPCount || 0} 个高优先级项目未处理`}
        />

        {/* Item 2: Responsible Person Assigned */}
        <ChecklistItem
          id="responsiblePersonAssigned"
          label="责任人已分配"
          checked={checklist.responsiblePersonAssigned}
          onChange={(checked) => handleToggle('responsiblePersonAssigned', checked)}
          hint="每项措施都应明确指定责任人"
          warning={!checklist.responsiblePersonAssigned}
          warningText="请为所有措施分配责任人"
        />

        {/* Item 3: Target Dates Set */}
        <ChecklistItem
          id="targetDatesSet"
          label="目标完成日期已设定"
          checked={checklist.targetDatesSet}
          onChange={(checked) => handleToggle('targetDatesSet', checked)}
          hint="所有措施都应有明确的完成日期"
          warning={!checklist.targetDatesSet}
          warningText="请设置所有措施的目标完成日期"
        />

        {/* Item 4: Actions Documented */}
        <ChecklistItem
          id="actionsDocumented"
          label="措施已完整记录"
          checked={checklist.actionsDocumented}
          onChange={(checked) => handleToggle('actionsDocumented', checked)}
          hint="包括预防措施和探测措施的详细描述"
          warning={!checklist.actionsDocumented}
          warningText="请确保所有措施都已详细记录"
        />

        {/* Item 5: Review Completed */}
        <ChecklistItem
          id="reviewCompleted"
          label="FMEA评审已完成"
          checked={checklist.reviewCompleted}
          onChange={(checked) => handleToggle('reviewCompleted', checked)}
          hint="包括跨职能团队评审和管理层评审"
        />

        {/* Item 6: Approval Obtained */}
        <ChecklistItem
          id="approvalObtained"
          label="已获得必要批准"
          checked={checklist.approvalObtained}
          onChange={(checked) => handleToggle('approvalObtained', checked)}
          hint="获得项目经理、质量经理等相关人员的批准"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          备注说明
        </label>
        <textarea
          value={checklist.notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="记录检查过程中的发现、问题或特殊说明..."
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          rows={3}
        />
      </div>

      {/* Checked By Info */}
      {checklist.checkedDate > 0 && (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500">检查人: </span>
              <span className="font-medium text-slate-700">{checklist.checkedBy}</span>
            </div>
            <div>
              <span className="text-slate-500">检查时间: </span>
              <span className="font-medium text-slate-700">
                {new Date(checklist.checkedDate).toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {allChecked && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="text-green-600" size={24} />
          <div>
            <div className="font-bold text-green-900">🎉 恭喜！</div>
            <div className="text-sm text-green-700">
              FMEA已完成所有验证项目，可以进入评审和批准流程。
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ChecklistItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  warning?: boolean;
  warningText?: string;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  id,
  label,
  checked,
  onChange,
  hint,
  warning,
  warningText
}) => {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
      warning
        ? 'bg-amber-50 border-amber-300'
        : checked
        ? 'bg-green-50 border-green-200'
        : 'bg-slate-50 border-slate-200'
    }`}>
      <button
        onClick={() => onChange(!checked)}
        className="flex-shrink-0 mt-0.5"
      >
        {checked ? (
          <CheckCircle2 className="text-green-600" size={20} />
        ) : (
          <Circle className="text-slate-400" size={20} />
        )}
      </button>
      <div className="flex-1">
        <label
          htmlFor={id}
          className={`block text-sm font-medium cursor-pointer ${
            checked ? 'text-green-800 line-through' : 'text-slate-700'
          }`}
        >
          {label}
        </label>
        {hint && (
          <p className="text-xs text-slate-500 mt-1">{hint}</p>
        )}
        {warning && warningText && (
          <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
            <AlertTriangle size={12} />
            {warningText}
          </p>
        )}
      </div>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
    </div>
  );
};
