import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestReportGenerator {
  constructor() {
    this.reportDir = path.join(__dirname, '../test-results');
    this.ensureReportDir();
  }

  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  generateReport(testResults) {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      summary: this.generateSummary(testResults),
      details: testResults,
      recommendations: this.generateRecommendations(testResults),
    };

    const reportPath = path.join(this.reportDir, `report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.generateHtmlReport(report);
    this.generateMarkdownReport(report);

    return reportPath;
  }

  generateSummary(testResults) {
    const summary = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      passRate: 0,
    };

    testResults.forEach(result => {
      summary.total++;
      if (result.status === 'passed') {
        summary.passed++;
      } else if (result.status === 'failed') {
        summary.failed++;
      } else if (result.status === 'skipped') {
        summary.skipped++;
      }
      summary.duration += result.duration || 0;
    });

    summary.passRate = summary.total > 0 ? (summary.passed / summary.total * 100).toFixed(2) : 0;

    return summary;
  }

  generateRecommendations(testResults) {
    const recommendations = [];
    const failedTests = testResults.filter(r => r.status === 'failed');
    
    if (failedTests.length > 0) {
      recommendations.push({
        type: 'critical',
        message: `${failedTests.length} 个测试失败，需要立即修复`,
        tests: failedTests.map(t => t.name),
      });
    }

    const slowTests = testResults.filter(r => r.duration > 5000);
    if (slowTests.length > 0) {
      recommendations.push({
        type: 'performance',
        message: `${slowTests.length} 个测试执行时间超过5秒，建议优化`,
        tests: slowTests.map(t => ({ name: t.name, duration: t.duration })),
      });
    }

    const flakyTests = testResults.filter(r => r.flaky);
    if (flakyTests.length > 0) {
      recommendations.push({
        type: 'stability',
        message: `${flakyTests.length} 个测试不稳定，需要检查`,
        tests: flakyTests.map(t => t.name),
      });
    }

    return recommendations;
  }

  generateHtmlReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FMEA自动化测试报告</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .summary-card {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #666;
        }
        .summary-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
        }
        .summary-card.passed .value { color: #28a745; }
        .summary-card.failed .value { color: #dc3545; }
        .summary-card.skipped .value { color: #ffc107; }
        
        .test-list {
            margin-top: 30px;
        }
        .test-item {
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
            border-left: 4px solid #ccc;
        }
        .test-item.passed {
            background-color: #d4edda;
            border-left-color: #28a745;
        }
        .test-item.failed {
            background-color: #f8d7da;
            border-left-color: #dc3545;
        }
        .test-item.skipped {
            background-color: #fff3cd;
            border-left-color: #ffc107;
        }
        .test-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .test-duration {
            color: #666;
            font-size: 14px;
        }
        .test-error {
            color: #dc3545;
            margin-top: 10px;
            padding: 10px;
            background-color: #fff;
            border-radius: 4px;
        }
        
        .recommendations {
            margin-top: 30px;
        }
        .recommendation {
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .recommendation.critical {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
        }
        .recommendation.performance {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
        }
        .recommendation.stability {
            background-color: #d1ecf1;
            border-left: 4px solid #17a2b8;
        }
        
        .timestamp {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>FMEA自动化测试报告</h1>
        <div class="timestamp">生成时间: ${report.timestamp}</div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>总测试数</h3>
                <div class="value">${report.summary.total}</div>
            </div>
            <div class="summary-card passed">
                <h3>通过</h3>
                <div class="value">${report.summary.passed}</div>
            </div>
            <div class="summary-card failed">
                <h3>失败</h3>
                <div class="value">${report.summary.failed}</div>
            </div>
            <div class="summary-card skipped">
                <h3>跳过</h3>
                <div class="value">${report.summary.skipped}</div>
            </div>
            <div class="summary-card">
                <h3>通过率</h3>
                <div class="value">${report.summary.passRate}%</div>
            </div>
            <div class="summary-card">
                <h3>总耗时</h3>
                <div class="value">${(report.summary.duration / 1000).toFixed(2)}s</div>
            </div>
        </div>
        
        <div class="test-list">
            <h2>测试详情</h2>
            ${report.details.map(test => `
                <div class="test-item ${test.status}">
                    <div class="test-name">${test.name}</div>
                    <div class="test-duration">耗时: ${(test.duration / 1000).toFixed(2)}s</div>
                    ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
                </div>
            `).join('')}
        </div>
        
        ${report.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>建议</h2>
            ${report.recommendations.map(rec => `
                <div class="recommendation ${rec.type}">
                    <strong>${rec.message}</strong>
                    ${rec.tests ? `<ul>${rec.tests.map(t => `<li>${typeof t === 'string' ? t : `${t.name} (${(t.duration / 1000).toFixed(2)}s)`}</li>`).join('')}</ul>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>
    `;

    const htmlPath = path.join(this.reportDir, `report-${Date.now()}.html`);
    fs.writeFileSync(htmlPath, html);

    return htmlPath;
  }

  generateMarkdownReport(report) {
    const markdown = `
# FMEA自动化测试报告

生成时间: ${report.timestamp}

## 测试摘要

| 指标 | 数值 |
|------|------|
| 总测试数 | ${report.summary.total} |
| 通过 | ${report.summary.passed} |
| 失败 | ${report.summary.failed} |
| 跳过 | ${report.summary.skipped} |
| 通过率 | ${report.summary.passRate}% |
| 总耗时 | ${(report.summary.duration / 1000).toFixed(2)}s |

## 测试详情

${report.details.map(test => `
### ${test.name}

- 状态: ${test.status === 'passed' ? '✅ 通过' : test.status === 'failed' ? '❌ 失败' : '⏭️ 跳过'}
- 耗时: ${(test.duration / 1000).toFixed(2)}s
${test.error ? `- 错误: \`${test.error}\`` : ''}
`).join('')}

## 建议

${report.recommendations.length > 0 ? report.recommendations.map(rec => `
### ${rec.type === 'critical' ? '🔴 严重' : rec.type === 'performance' ? '⚡ 性能' : '⚠️ 稳定性'}: ${rec.message}

${rec.tests ? rec.tests.map(t => `- ${typeof t === 'string' ? t : `${t.name} (${(t.duration / 1000).toFixed(2)}s)`}`).join('\n') : ''}
`).join('\n') : '无建议'}
`;

    const mdPath = path.join(this.reportDir, `report-${Date.now()}.md`);
    fs.writeFileSync(mdPath, markdown);

    return mdPath;
  }
}

export default TestReportGenerator;