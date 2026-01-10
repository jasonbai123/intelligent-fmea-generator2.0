import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentManagement from '../../components/CommentManagement';
import { CommentType } from '../../types';

describe('CommentManagement组件测试', () => {
  const mockProjectId = 'test-project-1';
  const mockAuthToken = {
    userInfo: {
      id: 'user-1',
      phone: '13800138000',
      role: 'user'
    },
    token: 'mock-token'
  };

  const mockComments = [
    {
      id: 'comment-1',
      projectId: mockProjectId,
      type: CommentType.GENERAL,
      content: '这是一个测试评论',
      author: 'user-1',
      authorName: '13800138000',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now(),
      resolved: false,
      replies: [
        {
          id: 'reply-1',
          commentId: 'comment-1',
          content: '这是一个回复',
          author: 'user-2',
          authorName: '13900139000',
          createdAt: Date.now() - 43200000,
          updatedAt: Date.now()
        }
      ]
    },
    {
      id: 'comment-2',
      projectId: mockProjectId,
      type: CommentType.ROW,
      content: '另一个测试评论',
      author: 'user-2',
      authorName: '13900139000',
      createdAt: Date.now() - 172800000,
      updatedAt: Date.now(),
      resolved: true,
      replies: []
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    const localStorageMock = {
      getItem: vi.fn((key: string) => {
        if (key === 'fmea_auth_token') {
          return JSON.stringify(mockAuthToken);
        }
        return null;
      }),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn()
    };
    global.localStorage = localStorageMock as any;
    global.fetch = vi.fn().mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === 'POST' || options?.method === 'PUT' || options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockComments
      });
    });
  });

  it('应该渲染评论管理界面', async () => {
    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText(/评论 \(/i)).toBeInTheDocument();
    });
  });

  it('应该显示评论列表', async () => {
    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('这是一个测试评论')).toBeInTheDocument();
      expect(screen.getByText('另一个测试评论')).toBeInTheDocument();
    });
  });

  it('应该显示评论作者', async () => {
    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getAllByText('13800138000').length).toBeGreaterThan(0);
      expect(screen.getAllByText('13900139000').length).toBeGreaterThan(0);
    });
  });

  it('应该能够打开新建评论模态框', async () => {
    const user = userEvent.setup();

    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('新建评论')).toBeInTheDocument();
    });

    const newCommentButton = screen.getAllByText('新建评论')[0];
    await user.click(newCommentButton);

    expect(screen.getByText('评论类型')).toBeInTheDocument();
    expect(screen.getByText('评论内容')).toBeInTheDocument();
  });

  it('应该能够创建新评论', async () => {
    const user = userEvent.setup();

    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('新建评论')).toBeInTheDocument();
    });

    const newCommentButton = screen.getAllByText('新建评论')[0];
    await user.click(newCommentButton);

    const commentTextarea = screen.getByPlaceholderText('输入您的评论...');
    await user.type(commentTextarea, '这是一个新评论');

    const createButton = screen.getByText('创建评论');
    await user.click(createButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/comments'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('这是一个新评论')
        })
      );
    });
  });

  it('应该能够回复评论', async () => {
    const user = userEvent.setup();

    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('这是一个测试评论')).toBeInTheDocument();
    });

    const replyButtons = screen.getAllByText('回复');
    await user.click(replyButtons[0]);

    const replyTextarea = screen.getByPlaceholderText('输入回复...');
    await user.type(replyTextarea, '这是一个回复');

    const sendButton = screen.getByText('发送回复');
    await user.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/replies'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('这是一个回复')
        })
      );
    });
  });

  it('应该能够标记评论为已解决', async () => {
    const user = userEvent.setup();

    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('这是一个测试评论')).toBeInTheDocument();
    });

    const resolveButtons = screen.getAllByTitle('标记为已解决');
    await user.click(resolveButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/comments/'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"resolved":true')
        })
      );
    });
  });

  it('应该能够编辑评论', async () => {
    const user = userEvent.setup();

    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('这是一个测试评论')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('编辑');
    await user.click(editButtons[0]);

    const editTextarea = screen.getByRole('textbox');
    await user.clear(editTextarea);
    await user.type(editTextarea, '编辑后的评论');

    const saveButton = screen.getByText('保存');
    await user.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/comments/'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('编辑后的评论')
        })
      );
    });
  });

  it('应该能够删除评论', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('这是一个测试评论')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('删除');
    await user.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/comments/'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    confirmSpy.mockRestore();
  });

  it('应该显示已解决的评论', async () => {
    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('已解决')).toBeInTheDocument();
    });
  });

  it('应该显示回复列表', async () => {
    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('这是一个回复')).toBeInTheDocument();
    });
  });

  it('应该处理空评论列表', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('暂无评论')).toBeInTheDocument();
      expect(screen.getByText('添加第一条评论开始讨论')).toBeInTheDocument();
    });
  });

  it('应该显示加载状态', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));

    render(<CommentManagement projectId={mockProjectId} />);

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('应该能够取消新建评论', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockComments
    });

    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('新建评论')).toBeInTheDocument();
    });

    const newCommentButton = screen.getByText('新建评论');
    await user.click(newCommentButton);

    const cancelButton = screen.getByText('取消');
    await user.click(cancelButton);

    expect(screen.queryByText('评论类型')).not.toBeInTheDocument();
  });

  it('应该能够取消回复', async () => {
    const user = userEvent.setup();

    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('这是一个测试评论')).toBeInTheDocument();
    });

    const replyButtons = screen.getAllByText('回复');
    await user.click(replyButtons[0]);

    const cancelButton = screen.getByText('取消');
    await user.click(cancelButton);

    expect(screen.queryByPlaceholderText('输入回复...')).not.toBeInTheDocument();
  });

  it('应该能够取消编辑评论', async () => {
    const user = userEvent.setup();

    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('这是一个测试评论')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('编辑');
    await user.click(editButtons[0]);

    const cancelButton = screen.getByText('取消');
    await user.click(cancelButton);

    expect(screen.getByText('这是一个测试评论')).toBeInTheDocument();
  });

  it('应该显示评论数量', async () => {
    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText(/评论 \(2\)/i)).toBeInTheDocument();
    });
  });

  it('应该只显示当前用户的编辑和删除按钮', async () => {
    render(<CommentManagement projectId={mockProjectId} />);

    await waitFor(() => {
      expect(screen.getByText('这是一个测试评论')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('编辑');
    const deleteButtons = screen.getAllByTitle('删除');

    expect(editButtons.length).toBe(1);
    expect(deleteButtons.length).toBe(1);
  });
});
