import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectList from '../../components/ProjectList';
import { FmeaType, ProjectStatus } from '../../types';

describe('ProjectList组件测试', () => {
  const mockAuthToken = {
    userInfo: {
      id: 'user-1',
      phone: '13800138000',
      role: 'user'
    },
    token: 'mock-token'
  };

  const mockProjects = [
    {
      id: 'project-1',
      title: '刹车系统FMEA',
      description: '汽车刹车系统失效模式分析',
      type: FmeaType.DFMEA,
      status: ProjectStatus.IN_PROGRESS,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now(),
      currentVersion: 1,
      collaborators: ['user-2']
    },
    {
      id: 'project-2',
      title: '转向系统FMEA',
      description: '汽车转向系统失效模式分析',
      type: FmeaType.PFMEA,
      status: ProjectStatus.APPROVED,
      createdAt: Date.now() - 172800000,
      updatedAt: Date.now(),
      currentVersion: 2,
      collaborators: []
    }
  ];

  const mockOnSelectProject = vi.fn();
  const mockOnCreateProject = vi.fn();

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
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthToken));
    global.fetch = vi.fn();
  });

  it('应该渲染项目列表', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProjects
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('刹车系统FMEA')).toBeInTheDocument();
      expect(screen.getByText('转向系统FMEA')).toBeInTheDocument();
    });
  });

  it('应该显示项目描述', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProjects
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('汽车刹车系统失效模式分析')).toBeInTheDocument();
      expect(screen.getByText('汽车转向系统失效模式分析')).toBeInTheDocument();
    });
  });

  it('应该能够选择项目', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProjects
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('刹车系统FMEA')).toBeInTheDocument();
    });

    const projectCard = screen.getByText('刹车系统FMEA').closest('.group');
    if (projectCard) {
      await user.click(projectCard);
    }

    expect(mockOnSelectProject).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('应该能够创建新项目', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProjects
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('新建项目')).toBeInTheDocument();
    });

    const createButton = screen.getByText('新建项目');
    await user.click(createButton);

    expect(mockOnCreateProject).toHaveBeenCalled();
  });

  it('应该能够删除项目', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    let callCount = 0;
    (global.fetch as any).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProjects
        });
      } else if (callCount === 2) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true })
        });
      } else {
        return Promise.resolve({
          ok: true,
          json: async () => mockProjects.filter(p => p.id !== 'project-1')
        });
      }
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('刹车系统FMEA')).toBeInTheDocument();
    });

    const projectCard = screen.getByText('刹车系统FMEA').closest('.group');
    if (projectCard) {
      const deleteButton = projectCard.querySelector('button');
      if (deleteButton) {
        await user.click(deleteButton);
      }
    }

    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/projects/'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    confirmSpy.mockRestore();
  });

  it('应该显示项目状态', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProjects
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('进行中')).toBeInTheDocument();
      expect(screen.getByText('已批准')).toBeInTheDocument();
    });
  });

  it('应该显示项目创建日期', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProjects
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      const dates = screen.getAllByText(/\d{4}\/\d{2}\/\d{2}/);
      expect(dates.length).toBeGreaterThan(0);
    });
  });

  it('应该显示项目类型', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProjects
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('DFMEA')).toBeInTheDocument();
      expect(screen.getByText('PFMEA')).toBeInTheDocument();
    });
  });

  it('应该显示项目版本', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProjects
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('v1')).toBeInTheDocument();
      expect(screen.getByText('v2')).toBeInTheDocument();
    });
  });

  it('应该显示协作者数量', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProjects
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('应该处理空项目列表', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => []
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('暂无项目')).toBeInTheDocument();
      expect(screen.getByText('创建您的第一个FMEA项目开始分析')).toBeInTheDocument();
    });
  });

  it('应该显示加载状态', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('应该处理错误状态', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: '获取项目列表失败' })
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/获取项目列表失败/i)).toBeInTheDocument();
    });
  });

  it('应该处理未登录状态', async () => {
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn()
    };
    global.localStorage = localStorageMock as any;
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProjects
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('未登录')).toBeInTheDocument();
    });
  });

  it('应该显示我的项目标题', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProjects
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('我的项目')).toBeInTheDocument();
    });
  });

  it('应该在空项目列表时显示创建按钮', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => []
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      const createButtons = screen.getAllByText('新建项目');
      expect(createButtons.length).toBe(2);
    });
  });

  it('应该在删除项目时取消删除', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProjects
    });

    render(
      <ProjectList 
        onSelectProject={mockOnSelectProject}
        onCreateProject={mockOnCreateProject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('刹车系统FMEA')).toBeInTheDocument();
    });

    const projectCard = screen.getByText('刹车系统FMEA').closest('.group');
    if (projectCard) {
      const deleteButton = projectCard.querySelector('button');
      if (deleteButton) {
        await user.click(deleteButton);
      }
    }

    expect(confirmSpy).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
