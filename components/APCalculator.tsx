/**
 * AP (Action Priority) Auto-Calculation Component
 * Enhanced FMEA table cell with real-time AP calculation and validation
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, Calculator } from 'lucide-react';
import { calculateAP, validateAP, getAPColorClass, getAPIcon } from '../utils/apValidation';

interface APCalculatorProps {
  s: number;
  o: number;
  d: number;
  currentAP: string;
  onAPChange: (newAP: string) => void;
  onSChange?: (newS: number) => void;
  onOChange?: (newO: number) => void;
  onDChange?: (newD: number) => void;
  showDetails?: boolean;
  readOnly?: boolean;
}

export const APCalculator: React.FC<APCalculatorProps> = ({
  s,
  o,
  d,
  currentAP,
  onAPChange,
  onSChange,
  onOChange,
  onDChange,
  showDetails = false,
  readOnly = false
}) => {
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [validation, setValidation] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (autoCalculate) {
      const calculatedAP = calculateAP(s, o, d);
      if (calculatedAP !== currentAP.toUpperCase()) {
        onAPChange(calculatedAP);
      }
    }

    // Validate AP
    const validationResult = validateAP(s, o, d, currentAP);
    setValidation(validationResult);
  }, [s, o, d, currentAP, autoCalculate]);

  const handleManualAPChange = (newAP: string) => {
    setAutoCalculate(false);
    onAPChange(newAP);
  };

  const handleEnableAutoCalculate = () => {
    setAutoCalculate(true);
    const calculatedAP = calculateAP(s, o, d);
    onAPChange(calculatedAP);
  };

  const apColor = getAPColorClass(currentAP);
  const apIcon = getAPIcon(currentAP);
  const expectedAP = validation?.expectedAP || currentAP;

  return (
    <div className="relative">
      {/* AP Badge/Cell */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => !readOnly && setShowTooltip(!showTooltip)}
          className={`
            px-3 py-1.5 rounded-lg border text-sm font-bold transition-all
            flex items-center gap-2 hover:shadow-md
            ${apColor}
            ${!readOnly && 'cursor-pointer'}
            ${validation && !validation.isValid && 'ring-2 ring-red-500'}
          `}
          title={validation && !validation.isValid ? 'AP不正确' : ''}
        >
          <span className="text-lg">{apIcon}</span>
          <span className="text-base">{currentAP.toUpperCase()}</span>
          {!readOnly && <Calculator size={14} className="opacity-50" />}
        </button>

        {!readOnly && (
          <button
            onClick={handleEnableAutoCalculate}
            className={`
              p-1.5 rounded-lg text-xs transition-colors
              ${autoCalculate
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }
            `}
            title={autoCalculate ? '自动计算已启用' : '启用自动计算'}
          >
            <CheckCircle size={14} />
          </button>
        )}
      </div>

      {/* Validation Tooltip */}
      {showTooltip && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowTooltip(false)}
          />
          <div className="absolute z-20 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                {validation && !validation.isValid ? (
                  <AlertTriangle className="text-red-600" size={16} />
                ) : (
                  <CheckCircle className="text-green-600" size={16} />
                )}
                AP验证结果
              </h4>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Current Scores */}
            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-2">当前评分</div>
              <div className="grid grid-cols-3 gap-2">
                <ScoreBadge label="S" value={s} threshold={8} />
                <ScoreBadge label="O" value={o} threshold={8} />
                <ScoreBadge label="D" value={d} threshold={8} />
              </div>
            </div>

            {/* AP Calculation */}
            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-2">行动优先级</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded ${getAPColorClass(currentAP)}`}>
                    {currentAP.toUpperCase()}
                  </span>
                  {validation && currentAP.toUpperCase() !== expectedAP && (
                    <>
                      <span className="text-slate-400">→</span>
                      <span className={`px-3 py-1 rounded ${getAPColorClass(expectedAP)}`}>
                        {expectedAP}
                      </span>
                    </>
                  )}
                </div>
                {!readOnly && !autoCalculate && (
                  <button
                    onClick={handleEnableAutoCalculate}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    自动修正
                  </button>
                )}
              </div>
            </div>

            {/* Validation Errors */}
            {validation && validation.errors.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  错误
                </div>
                <div className="space-y-1">
                  {validation.errors.map((error: any, idx: number) => (
                    <div key={idx} className="text-xs bg-red-50 text-red-700 rounded p-2">
                      {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Warnings */}
            {validation && validation.warnings.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  警告
                </div>
                <div className="space-y-1">
                  {validation.warnings.map((warning: any, idx: number) => (
                    <div key={idx} className="text-xs bg-amber-50 text-amber-700 rounded p-2">
                      {warning.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {validation && validation.suggestions.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium text-blue-600 mb-2 flex items-center gap-1">
                  <Info size={12} />
                  建议
                </div>
                <div className="space-y-1">
                  {validation.suggestions.map((suggestion: string, idx: number) => (
                    <div key={idx} className="text-xs bg-blue-50 text-blue-700 rounded p-2">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AP Reference Table */}
            {showDetails && (
              <div className="border-t border-slate-200 pt-3">
                <div className="text-xs font-medium text-slate-700 mb-2">AP参考表</div>
                <APReferenceTable />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

interface ScoreBadgeProps {
  label: string;
  value: number;
  threshold: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ label, value, threshold }) => {
  const isHigh = value >= threshold;
  return (
    <div className={`
      px-2 py-1 rounded text-center
      ${isHigh ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}
    `}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
};

const APReferenceTable: React.FC = () => {
  return (
    <div className="text-xs">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 px-2 py-1">S</th>
            <th className="border border-slate-300 px-2 py-1">O</th>
            <th className="border border-slate-300 px-2 py-1">D</th>
            <th className="border border-slate-300 px-2 py-1">AP</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 px-2 py-1 text-center" colSpan={3}>≥ 8 (任意一个)</td>
            <td className="border border-slate-300 px-2 py-1 text-center bg-red-100">H</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-2 py-1 text-center" colSpan={3}>6-7 (任意一个)</td>
            <td className="border border-slate-300 px-2 py-1 text-center bg-yellow-100">M</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-2 py-1 text-center" colSpan={3}>全部 ≤ 5</td>
            <td className="border border-slate-300 px-2 py-1 text-center bg-green-100">L</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

/**
 * Enhanced FMEA Table Cell with AP Auto-Calculation
 * Use this to replace existing S/O/D input cells
 */
interface APInputCellProps {
  value: number;
  onChange: (value: number) => void;
  type: 'S' | 'O' | 'D';
  disabled?: boolean;
}

export const APInputCell: React.FC<APInputCellProps> = ({
  value,
  onChange,
  type,
  disabled = false
}) => {
  const [tempValue, setTempValue] = useState(value.toString());

  useEffect(() => {
    setTempValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTempValue(newValue);

    const num = parseInt(newValue);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      onChange(num);
    }
  };

  const getColor = (val: number) => {
    if (val >= 8) return 'bg-red-100 text-red-900 border-red-300';
    if (val >= 6) return 'bg-yellow-100 text-yellow-900 border-yellow-300';
    return 'bg-green-50 text-green-900 border-green-200';
  };

  return (
    <input
      type="number"
      min={1}
      max={10}
      value={tempValue}
      onChange={handleChange}
      disabled={disabled}
      className={`
        w-full px-2 py-1 border rounded text-center font-bold text-sm
        focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
        transition-colors
        ${getColor(value)}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    />
  );
};
