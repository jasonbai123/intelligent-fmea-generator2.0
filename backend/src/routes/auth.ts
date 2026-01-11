import express from 'express';
import KVDB from '../utils/db';
import { generateVerificationCode } from '../utils/codeGenerator';
import { SendCodeRequest, LoginRequest, UserInfo, UserRole, AuthToken } from '../types';

const db = new KVDB(null as any);

const router = express.Router();

// 发送验证码
router.post('/send-code', (req, res) => {
  try {
    const { phone }: SendCodeRequest = req.body;

    if (!phone || phone.length !== 11) {
      return res.status(400).json({ message: '请输入有效的11位手机号' });
    }

    // 管理员不需要验证码
    if (phone === '13510420462') {
      return res.status(400).json({ message: '管理员账户请直接登录' });
    }

    // 生成6位验证码
    const code = generateVerificationCode();
    
    // 保存验证码（有效期5分钟）
    db.saveVerificationCode(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // 测试环境：直接返回验证码
    console.log(`[测试] 手机号 ${phone} 的验证码: ${code}`);
    
    return res.status(200).json({
      message: '验证码发送成功',
      code: process.env.NODE_ENV === 'production' ? undefined : code // 生产环境不返回验证码
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    return res.status(500).json({ message: '发送验证码失败' });
  }
});

// 登录
router.post('/login', (req, res) => {
  try {
    const { phone, code }: LoginRequest = req.body;

    if (!phone || phone.length !== 11) {
      return res.status(400).json({ message: '请输入有效的11位手机号' });
    }

    if (!code || code.length !== 6) {
      return res.status(400).json({ message: '请输入6位验证码' });
    }

    const ADMIN_PHONE = '13510420462';
    
    // 管理员登录
    if (phone === ADMIN_PHONE) {
      if (code !== '888888') {
        return res.status(401).json({ message: '管理员验证码错误' });
      }

      const adminUser = db.getUser(ADMIN_PHONE);
      if (!adminUser) {
        return res.status(500).json({ message: '管理员用户不存在' });
      }

      const adminToken: AuthToken = {
        token: `admin_${Date.now()}`,
        userInfo: adminUser,
        expiresAt: adminUser.expiresAt
      };

      return res.status(200).json(adminToken);
    }

    // 普通用户登录
    const savedCodeData = db.getVerificationCode(phone);
    if (!savedCodeData) {
      return res.status(401).json({ message: '验证码已过期，请重新获取' });
    }

    const { code: savedCode, expiresAt } = savedCodeData;
    
    if (Date.now() > expiresAt) {
      db.deleteVerificationCode(phone);
      return res.status(401).json({ message: '验证码已过期，请重新获取' });
    }

    if (code !== savedCode) {
      return res.status(401).json({ message: '验证码错误' });
    }

    // 验证通过，删除验证码
    db.deleteVerificationCode(phone);

    // 获取或创建用户
    let user = db.getUser(phone);
    
    if (!user) {
      // 新用户创建试用账户（15天有效期）
      user = {
        id: `user_${Date.now()}`,
        phone,
        role: UserRole.TRIAL,
        createdAt: Date.now(),
        expiresAt: Date.now() + 15 * 24 * 60 * 60 * 1000,
        isTrial: true,
        trialDays: 15
      };
      db.saveUser(user);
    }

    // 检查账户是否过期
    if (Date.now() > user.expiresAt) {
      return res.status(403).json({ message: '账户已过期，请联系管理员' });
    }

    // 生成登录令牌
    const token: AuthToken = {
      token: `token_${Date.now()}`,
      userInfo: user,
      expiresAt: user.expiresAt
    };

    return res.status(200).json(token);
  } catch (error) {
    console.error('登录失败:', error);
    return res.status(500).json({ message: '登录失败' });
  }
});

// 用户管理相关路由
router.get('/users', (req, res) => {
  try {
    const users = db.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return res.status(500).json({ message: '获取用户列表失败' });
  }
});

router.put('/users/:phone/expire', (req, res) => {
  try {
    const { phone } = req.params;
    const { days } = req.body;

    if (!phone || phone.length !== 11) {
      return res.status(400).json({ message: '无效的手机号' });
    }

    if (!days || isNaN(Number(days)) || Number(days) <= 0) {
      return res.status(400).json({ message: '请输入有效的天数' });
    }

    const user = db.getUser(phone);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 计算新的过期时间
    const expiresAt = Date.now() + Number(days) * 24 * 60 * 60 * 1000;
    
    // 更新用户过期时间
    db.updateUserExpiration(phone, expiresAt);

    // 获取更新后的用户信息
    const updatedUser = db.getUser(phone);

    return res.status(200).json({
      message: '账户有效期更新成功',
      user: updatedUser
    });
  } catch (error) {
    console.error('更新账户有效期失败:', error);
    return res.status(500).json({ message: '更新账户有效期失败' });
  }
});

router.put('/users/:phone/convert', (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone || phone.length !== 11) {
      return res.status(400).json({ message: '无效的手机号' });
    }

    const success = db.convertTrialToRegular(phone);
    if (!success) {
      return res.status(400).json({ message: '转换失败，该用户可能不是试用账户或不存在' });
    }

    const updatedUser = db.getUser(phone);

    return res.status(200).json({
      message: '账户转换成功',
      user: updatedUser
    });
  } catch (error) {
    console.error('转换账户类型失败:', error);
    return res.status(500).json({ message: '转换账户类型失败' });
  }
});

router.delete('/users/:phone', (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone || phone.length !== 11) {
      return res.status(400).json({ message: '无效的手机号' });
    }

    const success = db.deleteUser(phone);
    if (!success) {
      return res.status(400).json({ message: '删除失败，该用户可能不存在或为管理员' });
    }

    return res.status(200).json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    return res.status(500).json({ message: '删除用户失败' });
  }
});

export default router;
