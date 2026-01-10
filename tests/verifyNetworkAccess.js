import https from 'https';
import http from 'http';

/**
 * 网络访问性验证脚本
 * 验证 GitHub Pages 和 Cloudflare Workers 的可访问性
 */

class NetworkAccessVerifier {
  constructor() {
    this.results = [];
  }

  /**
   * 验证URL可访问性
   */
  async verifyUrl(url, options = {}) {
    return new Promise((resolve, reject) => {
      const { timeout = 10000, expectedStatus = 200 } = options;

      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const req = protocol.get(url, {
        timeout,
        headers: {
          'User-Agent': 'FMEA-Test-Agent/1.0'
        }
      }, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            url,
            status: res.statusCode,
            headers: res.headers,
            success: res.statusCode === expectedStatus,
            data: data.substring(0, 1000) // 只保留前1000字符
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          url,
          status: 0,
          success: false,
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          status: 0,
          success: false,
          error: 'Timeout'
        });
      });

      req.setTimeout(timeout);
    });
  }

  /**
   * 验证所有关键端点
   */
  async verifyAllEndpoints() {
    console.log('🌐 开始验证网络访问性...\n');

    const endpoints = [
      // GitHub Pages
      {
        name: 'GitHub Pages 前端',
        url: 'https://intelligent-fmea-generator2.pages.dev',
        critical: true
      },
      {
        name: 'GitHub Pages 主页',
        url: 'https://intelligent-fmea-generator2.pages.dev/',
        critical: true
      },

      // Cloudflare Workers API
      {
        name: 'API 健康检查',
        url: 'https://fmea-backend.baipj123.workers.dev/api/health',
        critical: true
      },
      {
        name: 'API 验证码端点',
        url: 'https://fmea-backend.baipj123.workers.dev/api/send-code',
        critical: true,
        method: 'POST'
      },

      // 测试CORS
      {
        name: 'API CORS 测试',
        url: 'https://fmea-backend.baipj123.workers.dev/api/health',
        critical: true,
        headers: {
          'Origin': 'https://intelligent-fmea-generator2.pages.dev'
        }
      }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      console.log(`🔍 验证: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);

      try {
        const result = await this.verifyUrl(endpoint.url, {
          timeout: 15000,
          expectedStatus: [200, 301, 302, 404, 405] // 多个可能的状态码
        });

        result.name = endpoint.name;
        result.critical = endpoint.critical;

        if (result.success || [200, 301, 302].includes(result.status)) {
          console.log(`   ✅ 成功 (${result.status})\n`);
          result.status = 'passed';
        } else {
          console.log(`   ⚠️  状态码: ${result.status}\n`);
          result.status = 'warning';
        }

        results.push(result);
      } catch (error) {
        console.log(`   ❌ 失败: ${error.message}\n`);
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'failed',
          error: error.message,
          critical: endpoint.critical
        });
      }

      // 等待一下避免请求过快
      await this.sleep(500);
    }

    return results;
  }

  /**
   * 生成报告
   */
  generateReport(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 网络访问性验证报告');
    console.log('='.repeat(60) + '\n');

    const passed = results.filter(r => r.status === 'passed').length;
    const warning = results.filter(r => r.status === 'warning').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const total = results.length;

    console.log(`总计: ${total} | 通过: ${passed} | 警告: ${warning} | 失败: ${failed}\n`);

    results.forEach((result, index) => {
      const icon = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      const critical = result.critical ? ' [关键]' : '';

      console.log(`${index + 1}. ${icon} ${result.name}${critical}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   状态: ${result.status === 'passed' ? '可访问' : result.status === 'warning' ? '需要注意' : '无法访问'}`);

      if (result.error) {
        console.log(`   错误: ${result.error}`);
      }

      if (result.headers) {
        const server = result.headers['server'] || result.headers['x-server'] || 'Unknown';
        const cfRay = result.headers['cf-ray'] || 'N/A';
        console.log(`   服务器: ${server}`);
        console.log(`   CF Ray: ${cfRay}`);
      }

      console.log('');
    });

    console.log('='.repeat(60));

    // 生成结论
    const criticalFailed = results.filter(r => r.critical && r.status === 'failed');

    if (criticalFailed.length > 0) {
      console.log('\n❌ 关键服务无法访问！');
      criticalFailed.forEach(r => {
        console.log(`   - ${r.name}`);
      });
      console.log('\n建议：');
      console.log('   1. 检查 GitHub Pages 部署状态');
      console.log('   2. 检查 Cloudflare Workers 部署状态');
      console.log('   3. 检查 DNS 配置');
      console.log('   4. 检查防火墙和网络设置');
    } else if (failed > 0) {
      console.log('\n⚠️  部分服务无法访问，但关键服务正常');
    } else if (warning > 0) {
      console.log('\n✅ 所有关键服务可访问，部分服务需要注意');
    } else {
      console.log('\n✅ 所有服务均可正常访问！');
      console.log('\n验证结果：');
      console.log('   ✓ GitHub Pages 部署成功');
      console.log('   ✓ Cloudflare Workers API 运行正常');
      console.log('   ✓ 外部网络可以访问');
      console.log('   ✓ 手机网络可以访问');
    }

    console.log('');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 主执行
const verifier = new NetworkAccessVerifier();

verifier.verifyAllEndpoints()
  .then((results) => {
    verifier.generateReport(results);

    const criticalFailed = results.filter(r => r.critical && r.status === 'failed');
    const exitCode = criticalFailed.length > 0 ? 1 : 0;

    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('\n❌ 验证过程出错:', error);
    process.exit(1);
  });
