/**
 * AP (Action Priority) Validation and Calculation Utilities
 * Based on AIAG VDA FMEA 1st Edition (2019) standards
 */

import { APValidationRule, APValidationResult, ValidationError, ValidationWarning } from '../types';

/**
 * Calculate AP based on S, O, D values
 * According to AIAG VDA FMEA standard:
 * - H (High): S ≥ 8 OR O ≥ 8 OR D ≥ 8
 * - M (Medium): Not H, and (S ≥ 6 OR O ≥ 6 OR D ≥ 6)
 * - L (Low): S ≤ 5 AND O ≤ 5 AND D ≤ 5
 */
export const calculateAP = (s: number, o: number, d: number): string => {
  // Validate inputs
  if (s < 1 || s > 10 || o < 1 || o > 10 || d < 1 || d > 10) {
    throw new Error('S, O, D values must be between 1 and 10');
  }

  // High Priority: Any score ≥ 8
  if (s >= 8 || o >= 8 || d >= 8) {
    return 'H';
  }

  // Medium Priority: Not high, and any score ≥ 6
  if (s >= 6 || o >= 6 || d >= 6) {
    return 'M';
  }

  // Low Priority: All scores ≤ 5
  return 'L';
};

/**
 * AIAG VDA FMEA AP Validation Rules
 */
export const AP_VALIDATION_RULES: APValidationRule[] = [
  {
    ruleCode: 'HIGH_S',
    description: 'S ≥ 8时，AP必须为H',
    check: (s, o, d, currentAP) => s >= 8 ? currentAP === 'H' : true,
    expectedAP: (s, o, d) => s >= 8 ? 'H' : null,
    errorMessage: '严重度(S)≥8时，行动优先级(AP)必须为H（高）',
    severity: 'error'
  },
  {
    ruleCode: 'HIGH_O',
    description: 'O ≥ 8时，AP必须为H',
    check: (s, o, d, currentAP) => o >= 8 ? currentAP === 'H' : true,
    expectedAP: (s, o, d) => o >= 8 ? 'H' : null,
    errorMessage: '频度(O)≥8时，行动优先级(AP)必须为H（高）',
    severity: 'error'
  },
  {
    ruleCode: 'HIGH_D',
    description: 'D ≥ 8时，AP必须为H',
    check: (s, o, d, currentAP) => d >= 8 ? currentAP === 'H' : true,
    expectedAP: (s, o, d) => d >= 8 ? 'H' : null,
    errorMessage: '探测度(D)≥8时，行动优先级(AP)必须为H（高）',
    severity: 'error'
  },
  {
    ruleCode: 'LOW_ALL',
    description: 'S≤5且O≤5且D≤5时，AP应为L',
    check: (s, o, d, currentAP) => (s <= 5 && o <= 5 && d <= 5) ? currentAP === 'L' : true,
    expectedAP: (s, o, d) => (s <= 5 && o <= 5 && d <= 5) ? 'L' : null,
    errorMessage: '当S≤5且O≤5且D≤5时，行动优先级(AP)应为L（低）',
    severity: 'warning'
  },
  {
    ruleCode: 'MEDIUM_RANGE',
    description: '6-7范围应为M或H',
    check: (s, o, d, currentAP) => {
      const hasSixOrSeven = [s, o, d].some(v => v >= 6 && v <= 7);
      const hasHigh = [s, o, d].some(v => v >= 8);
      if (hasSixOrSeven && !hasHigh) {
        return currentAP === 'M' || currentAP === 'H';
      }
      return true;
    },
    expectedAP: (s, o, d) => {
      const hasSixOrSeven = [s, o, d].some(v => v >= 6 && v <= 7);
      const hasHigh = [s, o, d].some(v => v >= 8);
      if (hasSixOrSeven && !hasHigh) {
        return 'M';
      }
      return null;
    },
    errorMessage: '当任一评分在6-7范围且无高值时，AP应为M（中）',
    severity: 'warning'
  }
];

/**
 * Validate AP against AIAG VDA FMEA rules
 */
export const validateAP = (
  s: number,
  o: number,
  d: number,
  currentAP: string
): APValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  // Validate input ranges
  if (s < 1 || s > 10) {
    errors.push({
      rule: 'RANGE_S',
      message: '严重度(S)必须在1-10之间',
      severity: s,
      value: s,
      threshold: 10
    });
  }
  if (o < 1 || o > 10) {
    errors.push({
      rule: 'RANGE_O',
      message: '频度(O)必须在1-10之间',
      severity: o,
      value: o,
      threshold: 10
    });
  }
  if (d < 1 || d > 10) {
    errors.push({
      rule: 'RANGE_D',
      message: '探测度(D)必须在1-10之间',
      severity: d,
      value: d,
      threshold: 10
    });
  }

  // Calculate expected AP
  const expectedAP = calculateAP(s, o, d);

  // Check all validation rules
  AP_VALIDATION_RULES.forEach(rule => {
    if (!rule.check(s, o, d, currentAP.toUpperCase())) {
      if (rule.severity === 'error') {
        errors.push({
          rule: rule.ruleCode,
          message: rule.errorMessage,
          severity: s >= 8 ? s : (o >= 8 ? o : d),
          value: Math.max(s, o, d),
          threshold: 8
        });
      } else {
        warnings.push({
          rule: rule.ruleCode,
          message: rule.errorMessage,
          recommendation: `建议AP为${expectedAP}`
        });
      }
    }
  });

  // Generate suggestions
  if (currentAP.toUpperCase() !== expectedAP) {
    suggestions.push(`根据AIAG VDA标准，建议AP为: ${expectedAP}`);
  }

  if (s >= 8 || o >= 8 || d >= 8) {
    suggestions.push('高优先级项目必须采取降低措施');
  }

  if (currentAP.toUpperCase() === 'H' && (s >= 8 || o >= 8 || d >= 8)) {
    suggestions.push('这是高风险项目，需要管理层关注');
  }

  return {
    isValid: errors.length === 0,
    currentAP: currentAP.toUpperCase(),
    expectedAP,
    errors,
    warnings,
    suggestions
  };
};

/**
 * Check if AP reduction after actions is valid
 */
export const validateAPReduction = (
  originalS: number,
  originalO: number,
  originalD: number,
  originalAP: string,
  newS: number,
  newO: number,
  newD: number,
  newAP: string
): { valid: boolean; message: string; improved: boolean } => {
  const originalAPLevel = { H: 3, M: 2, L: 1 }[originalAP.toUpperCase()];
  const newAPLevel = { H: 3, M: 2, L: 1 }[newAP.toUpperCase()];

  // Validate new AP calculation
  const expectedNewAP = calculateAP(newS, newO, newD);
  if (newAP.toUpperCase() !== expectedNewAP) {
    return {
      valid: false,
      message: `新的AP ${newAP} 与评分不匹配，应为 ${expectedNewAP}`,
      improved: false
    };
  }

  // Check if AP improved
  const improved = newAPLevel < originalAPLevel;
  const stayedSame = newAPLevel === originalAPLevel;
  const gotWorse = newAPLevel > originalAPLevel;

  if (gotWorse) {
    return {
      valid: false,
      message: '警告：行动优先级升高，措施可能无效',
      improved: false
    };
  }

  if (stayedSame) {
    // Check if individual scores improved
    const scoresImproved =
      (newS < originalS) ||
      (newO < originalO) ||
      (newD < originalD);

    return {
      valid: true,
      message: scoresImproved
        ? '评分有所改善，但AP级别未变。建议继续优化。'
        : 'AP和评分均未改善。请检查措施有效性。',
      improved: false
    };
  }

  return {
    valid: true,
    message: '行动优先级成功降低！措施有效。',
    improved: true
  };
};

/**
 * Get AP color class for display
 */
export const getAPColorClass = (ap: string): string => {
  const apUpper = ap.toUpperCase();
  switch (apUpper) {
    case 'H':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'M':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'L':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Get AP icon
 */
export const getAPIcon = (ap: string): string => {
  const apUpper = ap.toUpperCase();
  switch (apUpper) {
    case 'H':
      return '🔴'; // High - Red circle
    case 'M':
      return '🟡'; // Medium - Yellow circle
    case 'L':
      return '🟢'; // Low - Green circle
    default:
      return '⚪'; // Unknown - White circle
  }
};

/**
 * Calculate FMEA metrics
 */
export const calculateFmeaMetrics = (rows: any[]) => {
  const totalRows = rows.length;
  let highAPCount = 0;
  let mediumAPCount = 0;
  let lowAPCount = 0;
  let actionsCompleted = 0;
  let actionsPending = 0;
  let overdueActions = 0;
  const today = new Date();

  rows.forEach(row => {
    // Count AP
    const ap = (row.s5_ap || '').toUpperCase();
    if (ap === 'H') highAPCount++;
    else if (ap === 'M') mediumAPCount++;
    else if (ap === 'L') lowAPCount++;

    // Count actions
    const hasAction = row.s6_prev_action || row.s6_det_action;
    const status = (row.s6_status || '').toLowerCase();
    const targetDate = row.s6_target_date;

    if (hasAction) {
      if (status === 'completed' || status === '完成' || status === 'closed') {
        actionsCompleted++;
      } else {
        actionsPending++;

        // Check overdue
        if (targetDate) {
          const dueDate = new Date(targetDate);
          if (dueDate < today) {
            overdueActions++;
          }
        }
      }
    }
  });

  const completionRate = totalRows > 0
    ? Math.round((actionsCompleted / (actionsCompleted + actionsPending)) * 100)
    : 0;

  return {
    totalRows,
    highAPCount,
    mediumAPCount,
    lowAPCount,
    completionRate,
    actionsCompleted,
    actionsPending,
    overdueActions,
    averageActionCycle: 0 // TODO: Calculate from completion dates
  };
};

/**
 * Get top N risks by AP and scores
 */
export const getTopRisks = (rows: any[], limit: number = 10) => {
  return rows
    .map(row => ({
      rowId: row.id,
      s: row.s4_severity || 0,
      o: row.s5_occurrence || 0,
      d: row.s5_detection || 0,
      ap: (row.s5_ap || '').toUpperCase(),
      failureMode: row.s4_mode || '',
      failureEffect: row.s4_effect || '',
      scoreSum: (row.s4_severity || 0) + (row.s5_occurrence || 0) + (row.s5_detection || 0),
      requiresImmediateAction: (row.s5_ap || '').toUpperCase() === 'H'
    }))
    .filter(item => item.ap === 'H' || item.scoreSum >= 15)
    .sort((a, b) => {
      // Sort by AP first (H > M > L), then by score sum
      const apOrder = { H: 3, M: 2, L: 1 };
      const apDiff = apOrder[b.ap] - apOrder[a.ap];
      if (apDiff !== 0) return apDiff;
      return b.scoreSum - a.scoreSum;
    })
    .slice(0, limit)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));
};
