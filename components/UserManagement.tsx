import React, { useState, useEffect } from 'react';
import { Users, Calendar, Shield, User, Trash2, Save, RefreshCw, Key, X } from 'lucide-react';
import { UserInfo, UserRole, AuthToken } from '../types';
import { API_ENDPOINTS } from '../config/api';

interface UserManagementProps {
  authToken: AuthToken;
}

interface UserWithDays extends UserInfo {
  remainingDays: number;
}

interface VerificationCode {
  phone: string;
  code: string;
  expiresAt: number;
  createdAt: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ authToken }) => {
  const [users, setUsers] = useState<UserWithDays[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithDays | null>(null);
  const [extensionDays, setExtensionDays] = useState<number>(30);
  const [convertToRegular, setConvertToRegular] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showVerificationCodes, setShowVerificationCodes] = useState<boolean>(false);
  const [verificationCodes, setVerificationCodes] = useState<VerificationCode[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.users);
      if (response.ok) {
        const parsedUsers: UserInfo[] = await response.json();
        const usersWithDays = parsedUsers.map(user => ({
          ...user,
          remainingDays: Math.ceil((user.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))
        })).sort((a, b) => a.expiresAt - b.expiresAt);
        setUsers(usersWithDays);
      } else {
        showMessage('error', '加载用户列表失败');
      }
    } catch (error) {
      showMessage('error', '加载用户列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVerificationCodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.verificationCodes);
      if (response.ok) {
        const codes: VerificationCode[] = await response.json();
        setVerificationCodes(codes);
        setShowVerificationCodes(true);
      } else {
        showMessage('error', '加载验证码列表失败');
      }
    } catch (error) {
      showMessage('error', '加载验证码列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExtendExpiry = () => {
    if (!selectedUser) return;

    try {
      const usersData = localStorage.getItem('fmea_users');
      if (usersData) {
        const parsedUsers: UserInfo[] = JSON.parse(usersData);
        const updatedUsers = parsedUsers.map(user => {
          if (user.id === selectedUser.id) {
            const newExpiresAt = user.expiresAt + (extensionDays * 24 * 60 * 60 * 1000);
            return {
              ...user,
              expiresAt: newExpiresAt,
              isTrial: convertToRegular ? false : user.isTrial
            };
          }
          return user;
        });

        localStorage.setItem('fmea_users', JSON.stringify(updatedUsers));
        
        const actionText = convertToRegular ? '已转为正式账户并延长' : '有效期已延长';
        showMessage('success', `用户 ${selectedUser.phone} ${actionText} ${extensionDays} 天`);
        setSelectedUser(null);
        setConvertToRegular(false);
        loadUsers();
      }
    } catch (error) {
      showMessage('error', '更新用户有效期失败');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('确定要删除此用户吗？')) return;

    try {
      const usersData = localStorage.getItem('fmea_users');
      if (usersData) {
        const parsedUsers: UserInfo[] = JSON.parse(usersData);
        const updatedUsers = parsedUsers.filter(user => user.id !== userId);
        localStorage.setItem('fmea_users', JSON.stringify(updatedUsers));
        showMessage('success', '用户已删除');
        loadUsers();
      }
    } catch (error) {
      showMessage('error', '删除用户失败');
    }
  };

  const getRoleBadge = (role: UserRole, isTrial: boolean) => {
    if (role === UserRole.ADMIN) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded border border-purple-200">
          <Shield size={12} />
          管理员
        </span>
      );
    }
    if (isTrial) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded border border-orange-200">
          <User size={12} />
          试用
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded border border-green-200">
        <User size={12} />
        正式
      </span>
    );
  };

  const getExpiryStatus = (remainingDays: number) => {
    if (remainingDays <= 0) {
      return <span className="text-red-600 font-semibold">已过期</span>;
    }
    if (remainingDays <= 7) {
      return <span className="text-orange-600 font-semibold">{remainingDays} 天</span>;
    }
    return <span className="text-green-600">{remainingDays} 天</span>;
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users size={28} className="text-purple-600" />
          <h1 className="text-3xl font-bold text-slate-900">用户管理</h1>
        </div>
        <p className="text-slate-500 mt-2">
          管理系统用户、设置账户有效期和权限
        </p>
      </header>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.type === 'success' ? <Save size={16} /> : <Trash2 size={16} />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-700">用户列表</h2>
          <div className="flex gap-2">
            <button
              onClick={loadVerificationCodes}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Key size={16} />
              查看验证码
            </button>
            <button
              onClick={loadUsers}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              刷新
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">手机号</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">角色</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">剩余有效期</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    暂无用户数据
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        <span className="text-slate-900 font-medium">{user.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role, user.isTrial)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getExpiryStatus(user.remainingDays)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {user.role !== UserRole.ADMIN && (
                          <>
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                              title="延长有效期"
                            >
                              <Calendar size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="删除用户"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar size={24} className="text-purple-600" />
              设置用户有效期
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">用户手机号</label>
                <div className="px-3 py-2 bg-slate-100 rounded-lg text-slate-900 font-medium">
                  {selectedUser.phone}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">当前用户类型</label>
                <div className="px-3 py-2 bg-slate-100 rounded-lg">
                  {getRoleBadge(selectedUser.role, selectedUser.isTrial)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">当前剩余有效期</label>
                <div className="px-3 py-2 bg-slate-100 rounded-lg">
                  {getExpiryStatus(selectedUser.remainingDays)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">延长天数</label>
                <input
                  type="number"
                  min="1"
                  max="3650"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              {selectedUser.isTrial && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="convertToRegular"
                    checked={convertToRegular}
                    onChange={(e) => setConvertToRegular(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="convertToRegular" className="text-sm text-slate-700">
                    转为正式账户
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setConvertToRegular(false);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleExtendExpiry}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  确认设置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVerificationCodes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 animate-fade-in max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Key size={24} className="text-blue-600" />
                验证码记录
              </h3>
              <button
                onClick={() => setShowVerificationCodes(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">手机号</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">验证码</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">创建时间</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">过期时间</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {verificationCodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        暂无验证码记录
                      </td>
                    </tr>
                  ) : (
                    verificationCodes.map((code, index) => {
                      const isExpired = Date.now() > code.expiresAt;
                      const timeLeft = Math.ceil((code.expiresAt - Date.now()) / 1000);
                      return (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-slate-900 font-medium">
                            {code.phone}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono text-lg font-bold text-blue-600">
                              {code.code}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {new Date(code.createdAt).toLocaleString('zh-CN')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {new Date(code.expiresAt).toLocaleString('zh-CN')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                                已过期
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                有效 ({timeLeft}秒)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>共 {verificationCodes.length} 条记录</span>
                <button
                  onClick={loadVerificationCodes}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  刷新
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
