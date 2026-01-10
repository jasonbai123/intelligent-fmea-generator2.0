import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

describe('集成测试 - 完整用户流程', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该完成完整的登录流程', async () => {
    const user = userEvent.setup();
    
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, code: '123456' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, token: 'test-token', user: { phone: '13800138000', role: 'admin' } }),
      });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<App />);
    
    const phoneInput = screen.getByPlaceholderText(/手机|phone/i);
    await user.type(phoneInput, '13800138000');
    
    const sendCodeButton = screen.getByRole('button', { name: /发送验证码|send code/i });
    await user.click(sendCodeButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('123456'));
    });
    
    const codeInput = screen.getByPlaceholderText(/验证码|code/i);
    await user.type(codeInput, '123456');
    
    const loginButton = screen.getByRole('button', { name: /登录|login/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/登录|login/i)).not.toBeInTheDocument();
      expect(screen.getByText(/项目|project/i)).toBeInTheDocument();
    });
    
    alertSpy.mockRestore();
  });

  it('应该完成创建项目和FMEA分析的流程', async () => {
    const user = userEvent.setup();
    
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, code: '123456' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, token: 'test-token', user: { phone: '13800138000', role: 'admin' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, project: { id: 1, name: '测试项目' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, fmea: { id: 1, items: [] } }),
      });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<App />);
    
    const phoneInput = screen.getByPlaceholderText(/手机|phone/i);
    await user.type(phoneInput, '13800138000');
    
    const sendCodeButton = screen.getByRole('button', { name: /发送验证码|send code/i });
    await user.click(sendCodeButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('123456'));
    });
    
    const codeInput = screen.getByPlaceholderText(/验证码|code/i);
    await user.type(codeInput, '123456');
    
    const loginButton = screen.getByRole('button', { name: /登录|login/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/项目|project/i)).toBeInTheDocument();
    });
    
    const createProjectButton = screen.getByRole('button', { name: /新建项目|create project/i });
    await user.click(createProjectButton);
    
    const projectNameInput = screen.getByPlaceholderText(/项目名称|project name/i);
    await user.type(projectNameInput, '测试项目');
    
    const submitButton = screen.getByRole('button', { name: /提交|submit/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('测试项目')).toBeInTheDocument();
    });
    
    const projectItem = screen.getByText('测试项目');
    await user.click(projectItem);
    
    await waitFor(() => {
      expect(screen.getByText(/FMEA/i)).toBeInTheDocument();
    });
    
    alertSpy.mockRestore();
  });

  it('应该完成AI生成FMEA内容的流程', async () => {
    const user = userEvent.setup();
    
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, code: '123456' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, token: 'test-token', user: { phone: '13800138000', role: 'admin' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, project: { id: 1, name: '测试项目' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, fmea: { id: 1, items: [] } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true, 
          content: '刹车系统FMEA分析\n1. 故障模式：制动力不足\n2. 严重度：8\n3. 发生度：5\n4. 探测度：4\n5. RPN：160' 
        }),
      });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<App />);
    
    const phoneInput = screen.getByPlaceholderText(/手机|phone/i);
    await user.type(phoneInput, '13800138000');
    
    const sendCodeButton = screen.getByRole('button', { name: /发送验证码|send code/i });
    await user.click(sendCodeButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('123456'));
    });
    
    const codeInput = screen.getByPlaceholderText(/验证码|code/i);
    await user.type(codeInput, '123456');
    
    const loginButton = screen.getByRole('button', { name: /登录|login/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/项目|project/i)).toBeInTheDocument();
    });
    
    const createProjectButton = screen.getByRole('button', { name: /新建项目|create project/i });
    await user.click(createProjectButton);
    
    const projectNameInput = screen.getByPlaceholderText(/项目名称|project name/i);
    await user.type(projectNameInput, '测试项目');
    
    const submitButton = screen.getByRole('button', { name: /提交|submit/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('测试项目')).toBeInTheDocument();
    });
    
    const projectItem = screen.getByText('测试项目');
    await user.click(projectItem);
    
    await waitFor(() => {
      expect(screen.getByText(/FMEA/i)).toBeInTheDocument();
    });
    
    const aiGenerateButton = screen.getByRole('button', { name: /AI生成|AI generate/i });
    await user.click(aiGenerateButton);
    
    const promptInput = screen.getByPlaceholderText(/描述|prompt/i);
    await user.type(promptInput, '生成一个关于刹车系统的FMEA分析');
    
    const generateButton = screen.getByRole('button', { name: /生成|generate/i });
    await user.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/刹车系统FMEA分析/i)).toBeInTheDocument();
      expect(screen.getByText(/制动力不足/i)).toBeInTheDocument();
    });
    
    alertSpy.mockRestore();
  });

  it('应该完成导出FMEA数据的流程', async () => {
    const user = userEvent.setup();
    
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, code: '123456' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, token: 'test-token', user: { phone: '13800138000', role: 'admin' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, project: { id: 1, name: '测试项目' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, fmea: { id: 1, items: [] } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, url: 'https://example.com/export.xlsx' }),
      });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<App />);
    
    const phoneInput = screen.getByPlaceholderText(/手机|phone/i);
    await user.type(phoneInput, '13800138000');
    
    const sendCodeButton = screen.getByRole('button', { name: /发送验证码|send code/i });
    await user.click(sendCodeButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('123456'));
    });
    
    const codeInput = screen.getByPlaceholderText(/验证码|code/i);
    await user.type(codeInput, '123456');
    
    const loginButton = screen.getByRole('button', { name: /登录|login/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/项目|project/i)).toBeInTheDocument();
    });
    
    const createProjectButton = screen.getByRole('button', { name: /新建项目|create project/i });
    await user.click(createProjectButton);
    
    const projectNameInput = screen.getByPlaceholderText(/项目名称|project name/i);
    await user.type(projectNameInput, '测试项目');
    
    const submitButton = screen.getByRole('button', { name: /提交|submit/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('测试项目')).toBeInTheDocument();
    });
    
    const projectItem = screen.getByText('测试项目');
    await user.click(projectItem);
    
    await waitFor(() => {
      expect(screen.getByText(/FMEA/i)).toBeInTheDocument();
    });
    
    const exportButton = screen.getByRole('button', { name: /导出|export/i });
    await user.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText(/导出成功|export successful/i)).toBeInTheDocument();
    });
    
    alertSpy.mockRestore();
  });

  it('应该处理网络错误', async () => {
    const user = userEvent.setup();
    
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
    
    render(<App />);
    
    const phoneInput = screen.getByPlaceholderText(/手机|phone/i);
    await user.type(phoneInput, '13800138000');
    
    const sendCodeButton = screen.getByRole('button', { name: /发送验证码|send code/i });
    await user.click(sendCodeButton);
    
    await waitFor(() => {
      expect(screen.getByText(/网络错误|network error/i)).toBeInTheDocument();
    });
  });

  it('应该处理API错误响应', async () => {
    const user = userEvent.setup();
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: '验证码错误' }),
    });
    
    render(<App />);
    
    const phoneInput = screen.getByPlaceholderText(/手机|phone/i);
    await user.type(phoneInput, '13800138000');
    
    const codeInput = screen.getByPlaceholderText(/验证码|code/i);
    await user.type(codeInput, '000000');
    
    const loginButton = screen.getByRole('button', { name: /登录|login/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/验证码错误|invalid code/i)).toBeInTheDocument();
    });
  });
});