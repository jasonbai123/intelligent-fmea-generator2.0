// Cloudflare Workers认证处理函数

// 导入工具函数
import { generateVerificationCode } from '../utils/codeGenerator';

class AuthHandlers {
  constructor(kvDB) {
    this.db = kvDB;
  }

  // 辅助函数：解析请求体
  async parseRequestBody(request) {
    try {
      return await request.json();
    } catch (error) {
      return null;
    }
  }

  // 辅助函数：创建JSON响应
  createResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  // 处理OPTIONS请求
  handleOptions() {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  // 发送验证码
  async handleSendCode(request) {
    try {
      const body = await this.parseRequestBody(request);
      const { phone } = body;

      if (!phone || phone.length !== 11) {
        return this.createResponse({ message: '请输入有效的11位手机号' }, 400);
      }

      // 管理员不需要验证码
      if (phone === '13510420462') {
        return this.createResponse({ message: '管理员账户请直接登录' }, 400);
      }

      // 生成6位验证码
      const code = generateVerificationCode();
      
      // 保存验证码（有效期5分钟）
      await this.db.saveVerificationCode(phone, {
        code,
        expiresAt: Date.now() + 5 * 60 * 1000
      });

      // 直接返回验证码给前端
      console.log(`[验证码] 手机号 ${phone} 的验证码: ${code}`);
      
      return this.createResponse({
        message: '验证码生成成功',
        code: code
      });
    } catch (error) {
      console.error('发送验证码失败:', error);
      return this.createResponse({ message: '发送验证码失败' }, 500);
    }
  }

  // 登录
  async handleLogin(request) {
    try {
      const body = await this.parseRequestBody(request);
      const { phone, code } = body;

      if (!phone || phone.length !== 11) {
        return this.createResponse({ message: '请输入有效的11位手机号' }, 400);
      }

      if (!code || code.length !== 6) {
        return this.createResponse({ message: '请输入6位验证码' }, 400);
      }

      const ADMIN_PHONE = '13510420462';
      
      // 管理员登录
      if (phone === ADMIN_PHONE) {
        if (code !== '888888') {
          return this.createResponse({ message: '管理员验证码错误' }, 401);
        }

        const adminUser = await this.db.getUser(ADMIN_PHONE);
        if (!adminUser) {
          return this.createResponse({ message: '管理员用户不存在' }, 500);
        }

        const adminToken = {
          token: `admin_${Date.now()}`,
          userInfo: adminUser,
          expiresAt: adminUser.expiresAt
        };

        return this.createResponse(adminToken);
      }

      // 普通用户登录
      const savedCodeData = await this.db.getVerificationCode(phone);
      if (!savedCodeData) {
        return this.createResponse({ message: '验证码已过期，请重新获取' }, 401);
      }

      const { code: savedCode, expiresAt } = savedCodeData;
      
      if (Date.now() > expiresAt) {
        await this.db.deleteVerificationCode(phone);
        return this.createResponse({ message: '验证码已过期，请重新获取' }, 401);
      }

      if (code !== savedCode) {
        return this.createResponse({ message: '验证码错误' }, 401);
      }

      // 验证通过，删除验证码
      await this.db.deleteVerificationCode(phone);

      // 获取或创建用户
      let user = await this.db.getUser(phone);
      
      if (!user) {
        // 新用户创建试用账户（15天有效期）
        user = {
          id: `user_${Date.now()}`,
          phone,
          role: 'TRIAL',
          createdAt: Date.now(),
          expiresAt: Date.now() + 15 * 24 * 60 * 60 * 1000,
          isTrial: true,
          trialDays: 15
        };
        await this.db.saveUser(user);
      }

      // 检查账户是否过期
      if (Date.now() > user.expiresAt) {
        return this.createResponse({ message: '账户已过期，请联系管理员' }, 403);
      }

      // 生成登录令牌
      const token = {
        token: `token_${Date.now()}`,
        userInfo: user,
        expiresAt: user.expiresAt
      };

      return this.createResponse(token);
    } catch (error) {
      console.error('登录失败:', error);
      return this.createResponse({ message: '登录失败' }, 500);
    }
  }

  // 获取用户列表
  async handleGetUsers(request) {
    try {
      const users = await this.db.getAllUsers();
      return this.createResponse(users);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return this.createResponse({ message: '获取用户列表失败' }, 500);
    }
  }

  // 更新用户过期时间
  async handleUpdateUserExpiration(request) {
    try {
      // 从URL参数获取手机号
      const url = new URL(request.url);
      const phone = url.pathname.split('/').pop();
      
      const body = await this.parseRequestBody(request);
      const { days } = body;

      if (!phone || phone.length !== 11) {
        return this.createResponse({ message: '无效的手机号' }, 400);
      }

      if (!days || isNaN(Number(days)) || Number(days) <= 0) {
        return this.createResponse({ message: '请输入有效的天数' }, 400);
      }

      const user = await this.db.getUser(phone);
      if (!user) {
        return this.createResponse({ message: '用户不存在' }, 404);
      }

      // 计算新的过期时间
      const expiresAt = Date.now() + Number(days) * 24 * 60 * 60 * 1000;
      
      // 更新用户过期时间
      const success = await this.db.updateUserExpiration(phone, expiresAt);

      if (!success) {
        return this.createResponse({ message: '更新失败' }, 500);
      }

      // 获取更新后的用户信息
      const updatedUser = await this.db.getUser(phone);

      return this.createResponse({
        message: '账户有效期更新成功',
        user: updatedUser
      });
    } catch (error) {
      console.error('更新账户有效期失败:', error);
      return this.createResponse({ message: '更新账户有效期失败' }, 500);
    }
  }

  // 将试用账户转换为普通账户
  async handleConvertTrialToRegular(request) {
    try {
      // 从URL参数获取手机号
      const url = new URL(request.url);
      const phone = url.pathname.split('/').pop();

      if (!phone || phone.length !== 11) {
        return this.createResponse({ message: '无效的手机号' }, 400);
      }

      const success = await this.db.convertTrialToRegular(phone);
      if (!success) {
        return this.createResponse({ message: '转换失败，该用户可能不是试用账户或不存在' }, 400);
      }

      const updatedUser = await this.db.getUser(phone);

      return this.createResponse({
        message: '账户转换成功',
        user: updatedUser
      });
    } catch (error) {
      console.error('转换账户类型失败:', error);
      return this.createResponse({ message: '转换账户类型失败' }, 500);
    }
  }

  // 删除用户
  async handleDeleteUser(request) {
    try {
      // 从URL参数获取手机号
      const url = new URL(request.url);
      const phone = url.pathname.split('/').pop();

      if (!phone || phone.length !== 11) {
        return this.createResponse({ message: '无效的手机号' }, 400);
      }

      const success = await this.db.deleteUser(phone);
      if (!success) {
        return this.createResponse({ message: '删除失败，该用户可能不存在或为管理员' }, 400);
      }

      return this.createResponse({ message: '用户删除成功' });
    } catch (error) {
      console.error('删除用户失败:', error);
      return this.createResponse({ message: '删除用户失败' }, 500);
    }
  }

  // 获取所有验证码记录（管理员功能）
  async handleGetAllVerificationCodes(request) {
    try {
      const codes = await this.db.getAllVerificationCodes();
      return this.createResponse(codes);
    } catch (error) {
      console.error('获取验证码记录失败:', error);
      return this.createResponse({ message: '获取验证码记录失败' }, 500);
    }
  }
}

// 导出处理函数
export default AuthHandlers;
