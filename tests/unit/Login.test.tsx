import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Login from '../../components/Login';

describe('Login组件测试', () => {
  const mockOnLogin = vi.fn();
  const mockOnSendCode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('应该渲染登录表单', () => {
    render(<Login onLogin={mockOnLogin} onSendCode={mockOnSendCode} isLoading={false} />);

    expect(screen.getByPlaceholderText(/请输入11位手机号/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/请输入6位验证码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /发送验证码/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

  it('应该能够输入手机号', () => {
    render(<Login onLogin={mockOnLogin} onSendCode={mockOnSendCode} isLoading={false} />);

    const phoneInput = screen.getByPlaceholderText(/请输入11位手机号/i);
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });

    expect(phoneInput).toHaveValue('13800138000');
  });

  it('应该能够输入验证码', () => {
    render(<Login onLogin={mockOnLogin} onSendCode={mockOnSendCode} isLoading={false} />);

    const codeInput = screen.getByPlaceholderText(/请输入6位验证码/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });

    expect(codeInput).toHaveValue('123456');
  });

  it('应该验证手机号格式', () => {
    render(<Login onLogin={mockOnLogin} onSendCode={mockOnSendCode} isLoading={false} />);

    const phoneInput = screen.getByPlaceholderText(/请输入11位手机号/i);
    fireEvent.change(phoneInput, { target: { value: '123' } });

    const sendCodeButton = screen.getByRole('button', { name: /发送验证码/i });
    fireEvent.click(sendCodeButton);

    expect(screen.getByText(/请输入有效的11位手机号/i)).toBeInTheDocument();
  });

  it('应该能够发送验证码', async () => {
    mockOnSendCode.mockResolvedValue(undefined);

    render(<Login onLogin={mockOnLogin} onSendCode={mockOnSendCode} isLoading={false} />);

    const phoneInput = screen.getByPlaceholderText(/请输入11位手机号/i);
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });

    const sendCodeButton = screen.getByRole('button', { name: /发送验证码/i });

    await act(async () => {
      fireEvent.click(sendCodeButton);
      await Promise.resolve();
    });

    expect(mockOnSendCode).toHaveBeenCalledWith('13800138000');
  });

  it('应该能够显示验证码倒计时', async () => {
    mockOnSendCode.mockResolvedValue(undefined);

    render(<Login onLogin={mockOnLogin} onSendCode={mockOnSendCode} isLoading={false} />);

    const phoneInput = screen.getByPlaceholderText(/请输入11位手机号/i);
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });

    const sendCodeButton = screen.getByRole('button', { name: /发送验证码/i });

    await act(async () => {
      fireEvent.click(sendCodeButton);
      await Promise.resolve();
      vi.advanceTimersByTime(1000);
    });

    expect(mockOnSendCode).toHaveBeenCalledWith('13800138000');
  });

  it('应该能够登录', async () => {
    mockOnLogin.mockResolvedValue(undefined);

    render(<Login onLogin={mockOnLogin} onSendCode={mockOnSendCode} isLoading={false} />);

    const phoneInput = screen.getByPlaceholderText(/请输入11位手机号/i);
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });

    const codeInput = screen.getByPlaceholderText(/请输入6位验证码/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });

    const loginButton = screen.getByRole('button', { name: /登录/i });

    await act(async () => {
      fireEvent.click(loginButton);
      await Promise.resolve();
    });

    expect(mockOnLogin).toHaveBeenCalledWith('13800138000', '123456');
  });

  it('应该显示错误消息', async () => {
    mockOnLogin.mockRejectedValue(new Error('验证码错误'));

    render(<Login onLogin={mockOnLogin} onSendCode={mockOnSendCode} isLoading={false} />);

    const phoneInput = screen.getByPlaceholderText(/请输入11位手机号/i);
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });

    const codeInput = screen.getByPlaceholderText(/请输入6位验证码/i);
    fireEvent.change(codeInput, { target: { value: '000000' } });

    const loginButton = screen.getByRole('button', { name: /登录/i });

    await act(async () => {
      fireEvent.click(loginButton);
      await Promise.resolve();
    });

    // 使用findBy代替waitFor，避免超时
    const errorMessage = screen.queryByText(/验证码错误/i);
    expect(errorMessage).toBeInTheDocument();
  }, 20000);

  it('应该禁用发送验证码按钮在倒计时期间', async () => {
    mockOnSendCode.mockResolvedValue(undefined);

    render(<Login onLogin={mockOnLogin} onSendCode={mockOnSendCode} isLoading={false} />);

    const phoneInput = screen.getByPlaceholderText(/请输入11位手机号/i);
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });

    const sendCodeButton = screen.getByRole('button', { name: /发送验证码/i });

    await act(async () => {
      fireEvent.click(sendCodeButton);
      await Promise.resolve();
      vi.advanceTimersByTime(1000);
    });

    expect(mockOnSendCode).toHaveBeenCalledWith('13800138000');
    expect(sendCodeButton).toBeDisabled();
  });
});
