// 后端API诊断脚本
// 在浏览器Console中运行此脚本来测试后端连接

async function testBackendAPI() {
  const results = {
    apiBase: 'https://fmea-backend.baipj123.workers.dev',
    tests: []
  };

  console.log('🔍 开始测试后端API连接...\n');

  // 测试1: 健康检查
  console.log('📋 测试1: 健康检查接口');
  try {
    const response = await fetch('https://fmea-backend.baipj123.workers.dev/api/health');
    const data = await response.json();
    console.log('✅ 成功:', data);
    results.tests.push({ name: 'Health Check', status: 'success', data });
  } catch (error) {
    console.error('❌ 失败:', error.message);
    results.tests.push({ name: 'Health Check', status: 'failed', error: error.message });
  }

  console.log('\n---\n');

  // 测试2: 发送验证码
  console.log('📋 测试2: 发送验证码接口');
  try {
    const response = await fetch('https://fmea-backend.baipj123.workers.dev/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138000' })
    });
    const data = await response.json();
    console.log('✅ 成功:', data);
    results.tests.push({ name: 'Send Code', status: 'success', data });
  } catch (error) {
    console.error('❌ 失败:', error.message);
    results.tests.push({ name: 'Send Code', status: 'failed', error: error.message });
  }

  console.log('\n---\n');
  console.log('📊 测试总结:');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

// 运行测试
testBackendAPI();
