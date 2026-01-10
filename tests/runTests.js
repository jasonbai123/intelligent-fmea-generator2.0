import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import TestReportGenerator from './helpers/reportGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestRunner {
  constructor() {
    this.reportGenerator = new TestReportGenerator();
    this.results = [];
  }

  async runAllTests() {
    console.log('🚀 开始运行自动化测试...\n');

    try {
      await this.runUnitTests();
      await this.runIntegrationTests();
      await this.runE2ETests();
      await this.runNetworkTests();

      const reportPath = this.reportGenerator.generateReport(this.results);
      
      console.log('\n✅ 所有测试完成！');
      console.log(`📊 测试报告已生成: ${reportPath}`);
      console.log(`📁 报告目录: ${path.join(__dirname, '../test-results')}`);

      return this.results;
    } catch (error) {
      console.error('❌ 测试运行失败:', error);
      throw error;
    }
  }

  async runUnitTests() {
    console.log('🧪 运行单元测试...');
    
    const unitResults = await this.runCommand('npm', ['run', 'test:unit']);
    this.addResults('unit', unitResults);
    
    console.log('✅ 单元测试完成\n');
  }

  async runIntegrationTests() {
    console.log('🔗 运行集成测试...');
    
    const integrationResults = await this.runCommand('npm', ['run', 'test:integration']);
    this.addResults('integration', integrationResults);
    
    console.log('✅ 集成测试完成\n');
  }

  async runE2ETests() {
    console.log('🎭 运行端到端测试...');
    
    const e2eResults = await this.runCommand('npm', ['run', 'test:e2e']);
    this.addResults('e2e', e2eResults);
    
    console.log('✅ 端到端测试完成\n');
  }

  async runNetworkTests() {
    console.log('🌐 运行网络可访问性测试...');
    
    const networkResults = await this.runCommand('npm', ['run', 'test:network']);
    this.addResults('network', networkResults);
    
    console.log('✅ 网络可访问性测试完成\n');
  }

  async runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, exitCode: code });
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  addResults(type, commandResult) {
    const results = this.parseTestResults(commandResult.stdout);
    results.forEach(result => {
      this.results.push({
        ...result,
        type,
        timestamp: new Date().toISOString(),
      });
    });
  }

  parseTestResults(output) {
    const results = [];
    
    const testMatches = output.matchAll(/PASS\s+(.+)/g);
    for (const match of testMatches) {
      results.push({
        name: match[1],
        status: 'passed',
        duration: 0,
      });
    }

    const failMatches = output.matchAll(/FAIL\s+(.+)/g);
    for (const match of failMatches) {
      results.push({
        name: match[1],
        status: 'failed',
        duration: 0,
        error: 'Test failed',
      });
    }

    return results;
  }

  async fixIssues() {
    console.log('🔧 开始自动修复问题...\n');

    const failedTests = this.results.filter(r => r.status === 'failed');
    
    if (failedTests.length === 0) {
      console.log('✅ 没有需要修复的问题');
      return;
    }

    console.log(`发现 ${failedTests.length} 个失败测试，尝试自动修复...\n`);

    for (const test of failedTests) {
      await this.fixTest(test);
    }

    console.log('\n✅ 自动修复完成，重新运行测试...');
    await this.runAllTests();
  }

  async fixTest(test) {
    console.log(`🔧 修复测试: ${test.name}`);

    if (test.name.includes('网络') || test.name.includes('network')) {
      await this.fixNetworkIssue(test);
    } else if (test.name.includes('API') || test.name.includes('api')) {
      await this.fixApiIssue(test);
    } else if (test.name.includes('认证') || test.name.includes('auth')) {
      await this.fixAuthIssue(test);
    } else {
      console.log(`⚠️  无法自动修复: ${test.name}`);
    }
  }

  async fixNetworkIssue(test) {
    console.log(`  🔧 尝试修复网络问题...`);
    
    try {
      await this.runCommand('curl', ['-I', 'https://intelligent-fmea-generator2.pages.dev']);
      console.log(`  ✅ 网络连接正常`);
    } catch (error) {
      console.log(`  ❌ 网络连接失败，需要手动检查`);
    }
  }

  async fixApiIssue(test) {
    console.log(`  🔧 尝试修复API问题...`);
    
    try {
      await this.runCommand('curl', ['-I', 'https://fmea-backend.baipj123.workers.dev/api/health']);
      console.log(`  ✅ API连接正常`);
    } catch (error) {
      console.log(`  ❌ API连接失败，需要手动检查`);
    }
  }

  async fixAuthIssue(test) {
    console.log(`  🔧 尝试修复认证问题...`);
    
    console.log(`  ⚠️  认证问题需要手动检查`);
  }
}

const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;

if (isMainModule) {
  const runner = new TestRunner();
  
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');

  runner.runAllTests()
    .then(() => {
      if (shouldFix) {
        return runner.fixIssues();
      }
    })
    .catch(error => {
      console.error('❌ 测试运行失败:', error);
      process.exit(1);
    });
}

export default TestRunner;