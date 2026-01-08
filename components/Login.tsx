import React, { useState } from 'react';
import { Smartphone, Shield, ArrowRight, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (phone: string, code: string) => Promise<void>;
  onSendCode: (phone: string) => Promise<void>;
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSendCode, isLoading }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      setError('请输入有效的11位手机号');
      return;
    }

    setIsSendingCode(true);
    setError(null);

    try {
      await onSendCode(phone);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || '发送验证码失败');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleLogin = async () => {
    if (!phone || phone.length !== 11) {
      setError('请输入有效的11位手机号');
      return;
    }

    if (!code || code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    setError(null);

    try {
      await onLogin(phone, code);
    } catch (err: any) {
      setError(err.message || '登录失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">FMEA Genius</h1>
            <p className="text-slate-500">智能 FMEA 生成器</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                手机号
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="请输入11位手机号"
                  maxLength={11}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow text-slate-900"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                验证码
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="请输入6位验证码"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow text-slate-900"
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || isSendingCode || isLoading}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-medium"
                >
                  {isSendingCode ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : countdown > 0 ? (
                    `${countdown}s`
                  ) : (
                    '发送验证码'
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  登录中...
                </>
              ) : (
                <>
                  登录
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="text-center text-sm text-slate-500">
              <p>首次登录自动创建试用账户（15天有效期）</p>
              <p className="mt-1">如需延长有效期，请联系管理员</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-400 text-center">
              <p>Powered by AIAG & VDA FMEA 1.0</p>
              <p className="mt-1">© 版权归 Jasonbai 老师所有</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
