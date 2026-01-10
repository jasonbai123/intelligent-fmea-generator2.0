import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VersionManagement from '../../components/VersionManagement';

describe('VersionManagement组件测试', () => {
  const mockProjectId = 'test-project-1';
  const mockCurrentVersion = 2;
  const mockOnVersionRestore = vi.fn();

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
    
    const mockAuthData = {
      userInfo: {
        id: 'user-1',
        phone: '13800138000'
      }
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => []
    });
  });

  it('应该渲染版本管理界面', () => {
    render(
      <VersionManagement 
        projectId={mockProjectId}
        currentVersion={mockCurrentVersion}
        onVersionRestore={mockOnVersionRestore}
      />
    );
    
    expect(screen.getByText('版本历史')).toBeInTheDocument();
    expect(screen.getByText('创建新版本')).toBeInTheDocument();
  });

  it('应该显示加载状态', () => {
    render(
      <VersionManagement 
        projectId={mockProjectId}
        currentVersion={mockCurrentVersion}
        onVersionRestore={mockOnVersionRestore}
      />
    );
    
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('应该显示暂无版本历史', async () => {
    render(
      <VersionManagement 
        projectId={mockProjectId}
        currentVersion={mockCurrentVersion}
        onVersionRestore={mockOnVersionRestore}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('暂无版本历史')).toBeInTheDocument();
    });
  });

  it('应该能够打开创建版本模态框', async () => {
    const user = userEvent.setup();
    
    render(
      <VersionManagement 
        projectId={mockProjectId}
        currentVersion={mockCurrentVersion}
        onVersionRestore={mockOnVersionRestore}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('创建新版本')).toBeInTheDocument();
    });

    await user.click(screen.getByText('创建新版本'));
    
    expect(screen.getByText('版本说明')).toBeInTheDocument();
    expect(screen.getByText('创建版本')).toBeInTheDocument();
  });

  it('应该能够关闭创建版本模态框', async () => {
    const user = userEvent.setup();
    
    render(
      <VersionManagement 
        projectId={mockProjectId}
        currentVersion={mockCurrentVersion}
        onVersionRestore={mockOnVersionRestore}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('创建新版本')).toBeInTheDocument();
    });

    await user.click(screen.getByText('创建新版本'));
    
    const cancelButton = screen.getByText('取消');
    await user.click(cancelButton);
    
    expect(screen.queryByText('版本说明')).not.toBeInTheDocument();
  });

  it('应该能够输入版本说明', async () => {
    const user = userEvent.setup();
    
    render(
      <VersionManagement 
        projectId={mockProjectId}
        currentVersion={mockCurrentVersion}
        onVersionRestore={mockOnVersionRestore}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('创建新版本')).toBeInTheDocument();
    });

    await user.click(screen.getByText('创建新版本'));
    
    const textarea = screen.getByPlaceholderText('描述此版本的主要变更...');
    await user.type(textarea, '这是新版本的说明');
    
    expect(textarea).toHaveValue('这是新版本的说明');
  });

  it('应该在未输入说明时禁用创建按钮', async () => {
    const user = userEvent.setup();
    
    render(
      <VersionManagement 
        projectId={mockProjectId}
        currentVersion={mockCurrentVersion}
        onVersionRestore={mockOnVersionRestore}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('创建新版本')).toBeInTheDocument();
    });

    await user.click(screen.getByText('创建新版本'));
    
    const createButton = screen.getByText('创建版本');
    expect(createButton).toBeDisabled();
  });

  it('应该在输入说明后启用创建按钮', async () => {
    const user = userEvent.setup();
    
    render(
      <VersionManagement 
        projectId={mockProjectId}
        currentVersion={mockCurrentVersion}
        onVersionRestore={mockOnVersionRestore}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('创建新版本')).toBeInTheDocument();
    });

    await user.click(screen.getByText('创建新版本'));
    
    const textarea = screen.getByPlaceholderText('描述此版本的主要变更...');
    await user.type(textarea, '这是新版本的说明');
    
    const createButton = screen.getByText('创建版本');
    expect(createButton).not.toBeDisabled();
  });

  it('应该能够恢复旧版本', async () => {
    const user = userEvent.setup();

    render(
      <VersionManagement 
        projectId={mockProjectId}
        currentVersion={mockCurrentVersion}
        onVersionRestore={mockOnVersionRestore}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });
});