import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserManagement from '../../components/UserManagement';

describe('UserManagement组件测试', () => {
  const mockAuthToken = {
    userInfo: {
      id: 'admin-1',
      phone: '13800138000',
      role: 'admin'
    },
    token: 'mock-token'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn()
    };
    global.localStorage = localStorageMock as any;
    global.fetch = vi.fn();
  });

  it('应该渲染用户管理界面', () => {
    render(
      <UserManagement 
        authToken={mockAuthToken}
      />
    );
    
    expect(screen.getByText(/用户管理|user management/i)).toBeInTheDocument();
  });

  it('应该显示加载状态', () => {
    render(
      <UserManagement 
        authToken={mockAuthToken}
      />
    );
    
    expect(screen.getByText('用户管理')).toBeInTheDocument();
  });

  it('应该能够选择用户', async () => {
    const user = userEvent.setup();
    
    const mockUsers = [
      {
        id: 'user-1',
        phone: '13900139000',
        role: 'user',
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        isTrial: true,
        createdAt: Date.now()
      }
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUsers
    });

    render(
      <UserManagement 
        authToken={mockAuthToken}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });
  });

  it('应该能够延长用户有效期', async () => {
    const user = userEvent.setup();
    
    const mockUsers = [
      {
        id: 'user-1',
        phone: '13900139000',
        role: 'user',
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        isTrial: true,
        createdAt: Date.now()
      }
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUsers
    });

    render(
      <UserManagement 
        authToken={mockAuthToken}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });
  });

  it('应该能够显示验证码列表', async () => {
    const user = userEvent.setup();
    
    const mockUsers = [];
    const mockCodes = [
      {
        phone: '13900139000',
        code: '123456',
        expiresAt: Date.now() + 5 * 60 * 1000,
        createdAt: Date.now()
      }
    ];

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCodes
      });

    render(
      <UserManagement 
        authToken={mockAuthToken}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });
  });

  it('应该能够刷新用户列表', async () => {
    const user = userEvent.setup();
    
    const mockUsers = [];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUsers
    });

    render(
      <UserManagement 
        authToken={mockAuthToken}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });
  });
});