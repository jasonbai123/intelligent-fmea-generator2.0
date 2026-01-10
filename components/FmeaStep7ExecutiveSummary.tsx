/**
 * Step 7: Executive Summary Component
 * AIAG VDA FMEA - Automated Executive Summary Generation with AI
 */

import React, { useState, useEffect } from 'react';
import { FmeaAnalysisResult, AiSettings, AiProvider } from '../types';
import { calculateFmeaMetrics, getTopRisks } from '../utils/apValidation';
import { FileText, Sparkles, Loader2, Download, RefreshCw, BarChart3 } from 'lucide-react';

interface FmeaStep7ExecutiveSummaryProps {
  fmeaData: FmeaAnalysisResult;
  aiSettings?: AiSettings;
  onSave: (summary: string) => void;
  onGenerateWithAI?: () => Promise<string>;
}

export const FmeaStep7ExecutiveSummary: React.FC<FmeaStep7ExecutiveSummaryProps> = ({
  fmeaData,
  aiSettings,
  onSave,
  onGenerateWithAI
}) => {
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [topRisks, setTopRisks] = useState<any[]>([]);

  useEffect(() => {
    // Calculate metrics
    const calculatedMetrics = calculateFmeaMetrics(fmeaData.rows);
    setMetrics(calculatedMetrics);

    // Get top risks
    const risks = getTopRisks(fmeaData.rows, 5);
    setTopRisks(risks);

    // Generate initial summary template
    const template = generateSummaryTemplate(fmeaData, calculatedMetrics, risks);
    setSummary(template);
  }, [fmeaData]);

  const generateSummaryTemplate = (
    data: FmeaAnalysisResult,
    metrics: any,
    risks: any[]
  ): string => {
    const isDfmea = data.type === 'DFMEA';
    const typeLabel = isDfmea ? '设计' : '过程';

    return `# ${data.title} - ${typeLabel}FMEA 执行摘要

## 项目概述

本${typeLabel}FMEA分析涵盖 **${metrics.totalRows}** 个潜在失效模式，采用AIAG VDA FMEA第一版（2019）标准方法论。

### FMEA范围
- **项目名称**: ${data.title}
- **FMEA类型**: ${data.type}
- **分析基准**: AIAG VDA FMEA 1st Edition
- **生成日期**: ${new Date().toLocaleDateString('zh-CN')}

---

## 风险分析摘要

### 风险分布
| 优先级 | 数量 | 占比 |
|--------|------|------|
| 🔴 高 (H) | ${metrics.highAPCount} | ${metrics.totalRows > 0 ? ((metrics.highAPCount / metrics.totalRows) * 100).toFixed(1) : 0}% |
| 🟡 中 (M) | ${metrics.mediumAPCount} | ${metrics.totalRows > 0 ? ((metrics.mediumAPCount / metrics.totalRows) * 100).toFixed(1) : 0}% |
| 🟢 低 (L) | ${metrics.lowAPCount} | ${metrics.totalRows > 0 ? ((metrics.lowAPCount / metrics.totalRows) * 100).toFixed(1) : 0}% |

### 关键发现
${risks.length > 0 ? risks.map((risk, idx) => `
**${idx + 1}. ${risk.failureMode}**
   - 影响: ${risk.failureEffect}
   - 风险评分: S=${risk.s}, O=${risk.o}, D=${risk.d} | AP=${risk.ap}
   - 状态: ${risk.requiresImmediateAction ? '⚠️ 需要立即采取措施' : '已评估'}
`).join('') : '**无高风险项目**'}

---

## 措施状态

### 措施完成情况
- ✅ **已完成**: ${metrics.actionsCompleted} 项
- 🔄 **进行中/待处理**: ${metrics.actionsPending} 项
- ⚠️ **逾期**: ${metrics.overdueActions} 项
- 📊 **完成率**: ${metrics.completionRate}%

### 主要改进措施
${data.rows
  .filter(row => row.s6_prev_action || row.s6_det_action)
  .slice(0, 3)
  .map((row, idx) => `
**${idx + 1}. ${row.s4_mode}**
   - 预防措施: ${row.s6_prev_action || '未定义'}
   - 探测措施: ${row.s6_det_action || '未定义'}
   - 责任人: ${row.s6_resp_person || '未分配'}
   - 目标日期: ${row.s6_target_date || '未设定'}
`).join('')}

---

## 建议与后续行动

${metrics.highAPCount > 0 ? `
### ⚠️ 优先处理项
1. 所有 ${metrics.highAPCount} 个高优先级项目必须在 ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN')} 前完成措施制定
2. 建议召开专项评审会议，讨论高风险项目的缓解方案
3. 考虑设计变更或过程优化以降低根本风险
` : `
### ✅ 风险可控
所有项目风险处于可接受水平，建议：
1. 继续监控中风险项目，确保预防措施有效实施
2. 定期（每季度）评审FMEA，确保与实际情况同步
3. 将经验教训记录到知识库，供未来项目参考
`}

${metrics.overdueActions > 0 ? `
### 🚨 逾期警告
当前有 ${metrics.overdueActions} 项措施已逾期，建议：
1. 立即更新措施计划，重新设定完成日期
2. 识别逾期原因，采取纠正措施
3. 加强措施跟踪和监控机制
` : ''}

---

## 结论

本${typeLabel}FMEA分析采用系统化方法，识别了 **${metrics.totalRows}** 个潜在失效模式，其中 **${metrics.highAPCount}** 个被评定为高优先级。

通过实施已计划的预防和探测措施，预期将显著降低产品/过程风险，提高顾客满意度。

${metrics.completionRate >= 80 ?
  '✅ 措施实施进展良好，建议继续推进并按计划完成所有剩余措施。' :
  '⚠️ 措施实施进度需加快，建议加强资源投入和项目管理。'}

---

**报告生成时间**: ${new Date().toLocaleString('zh-CN')}
**FMEA版本**: v1.0
**下次评审日期**: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN')}
`;
  };

  const handleAIGenerate = async () => {
    if (!aiSettings) {
      alert('请先在AI设置中配置API密钥');
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare prompt for AI
      const prompt = generateAIPrompt(fmeaData, metrics);

      if (onGenerateWithAI) {
        // Use provided AI generation function
        const aiSummary = await onGenerateWithAI();
        setSummary(aiSummary);
        onSave(aiSummary);
      } else {
        // Fallback: Call AI API directly
        // This would be implemented based on your AI service
        console.warn('AI generation not implemented, using template');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('AI生成失败：' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIPrompt = (data: FmeaAnalysisResult, metrics: any): string => {
    return `请基于以下FMEA数据生成一份专业的执行摘要（Executive Summary），要求：

1. 使用专业的质量工程术语
2. 突出关键风险和改进措施
3. 提供清晰的建议和后续行动
4. 格式化为Markdown文档
5. 包含数据分析和可视化建议

FMEA数据：
- 项目名称：${data.title}
- 类型：${data.type}
- 总行数：${metrics.totalRows}
- 高优先级：${metrics.highAPCount}
- 中优先级：${metrics.mediumAPCount}
- 低优先级：${metrics.lowAPCount}
- 措施完成率：${metrics.completionRate}%

请生成一份简洁、专业、可执行的执行摘要。`;
  };

  const handleSave = () => {
    onSave(summary);
    alert('执行摘要已保存');
  };

  const handleExport = () => {
    // Create a blob and download
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fmeaData.title}_执行摘要_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 bg-white rounded-xl shadow-md border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              执行摘要
            </h3>
            <p className="text-sm text-slate-500">
              AIAG VDA FMEA 项目总结与建议
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAIGenerate}
            disabled={isGenerating || !aiSettings}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                AI生成中...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                AI优化
              </>
            )}
          </button>
          <button
            onClick={() => {
              const template = generateSummaryTemplate(fmeaData, metrics, topRisks);
              setSummary(template);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} />
            重置
          </button>
        </div>
      </div>

      {/* Metrics Quick View */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="总失效模式"
            value={metrics.totalRows}
            icon={<BarChart3 className="text-blue-600" size={20} />}
            color="blue"
          />
          <MetricCard
            label="高优先级"
            value={metrics.highAPCount}
            icon={<div className="w-2 h-2 bg-red-500 rounded-full" />}
            color="red"
          />
          <MetricCard
            label="措施完成率"
            value={`${metrics.completionRate}%`}
            icon={<div className="w-2 h-2 bg-green-500 rounded-full" />}
            color="green"
          />
          <MetricCard
            label="待处理措施"
            value={metrics.actionsPending}
            icon={<div className="w-2 h-2 bg-amber-500 rounded-full" />}
            color="amber"
          />
        </div>
      )}

      {/* Summary Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-slate-700">
            摘要内容
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
            >
              保存
            </button>
            <button
              onClick={handleExport}
              className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors flex items-center gap-1"
            >
              <Download size={12} />
              导出
            </button>
          </div>
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full h-96 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm resize-y"
          placeholder="执行摘要将在这里显示..."
        />
      </div>

      {/* Preview */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h4 className="text-sm font-bold text-slate-700 mb-3">预览</h4>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: summary
              .replace(/^# (.*$)/gim, '<h1>$1</h1>')
              .replace(/^## (.*$)/gim, '<h2>$1</h2>')
              .replace(/^### (.*$)/gim, '<h3>$1</h3>')
              .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
              .replace(/\n/gim, '<br>')
          }}
        />
      </div>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'green' | 'amber';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
    amber: 'bg-amber-50 border-amber-200'
  };

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color]} flex items-center gap-3`}>
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
};
