import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AiSettingsPage } from '../../components/AiSettings';

describe('AiSettings组件测试', () => {
  const mockOnSave = vi.fn();
  const mockOnTest = vi.fn();

  const mockSettings = {
    provider: 'gemini',
    modelName: 'gemini-2.0-flash',
    apiKey: 'test-api-key',
    baseUrl: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('应该渲染AI设置面板', () => {
    render(
      <AiSettingsPage 
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByText('AI API 设置')).toBeInTheDocument();
  });

  it('应该显示当前提供商', () => {
    render(
      <AiSettingsPage 
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByText('Google Gemini')).toBeInTheDocument();
  });

  it('应该能够选择提供商', async () => {
    const user = userEvent.setup();
    render(
      <AiSettingsPage 
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );
    
    const providerButton = screen.getByText('硅基流动 (SiliconFlow)').closest('button');
    if (providerButton) {
      await user.click(providerButton);
      
      const siliconflowButton = screen.getByText('硅基流动 (SiliconFlow)').closest('button');
      expect(siliconflowButton).toHaveClass('border-blue-500');
    }
  });

  it('应该能够选择模型', async () => {
    const user = userEvent.setup();
    render(
      <AiSettingsPage 
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );
    
    const modelSelect = screen.getByRole('combobox');
    await user.selectOptions(modelSelect, 'gemini-1.5-pro');
    
    expect(modelSelect).toHaveValue('gemini-1.5-pro');
  });

  it('应该能够输入API密钥', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <AiSettingsPage 
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );
    
    const apiKeyInput = screen.getByPlaceholderText(/输入您的 Gemini API 密钥/);
    await user.clear(apiKeyInput);
    await user.type(apiKeyInput, 'new-api-key');
    
    expect(apiKeyInput).toHaveValue('new-api-key');
  }, 15000);

  it('应该能够保存设置', async () => {
    const user = userEvent.setup();
    render(
      <AiSettingsPage 
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /保存设置/i });
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('应该能够重置设置', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    render(
      <AiSettingsPage 
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );
    
    const resetButton = screen.getByRole('button', { name: /重置默认/i });
    await user.click(resetButton);
    
    expect(window.confirm).toHaveBeenCalledWith('确定要恢复默认设置吗？');
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('应该显示当前选择的模型', () => {
    render(
      <AiSettingsPage 
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByText(/当前选择: gemini-2.0-flash/i)).toBeInTheDocument();
  });

  it('应该能够切换到非Gemini提供商', async () => {
    const user = userEvent.setup();
    render(
      <AiSettingsPage 
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );
    
    const providerButton = screen.getByText('DeepSeek (深度求索)').closest('button');
    if (providerButton) {
      await user.click(providerButton);
      
      const deepseekButton = screen.getByText('DeepSeek (深度求索)').closest('button');
      expect(deepseekButton).toHaveClass('border-blue-500');
    }
  });

  it('应该显示API密钥输入提示', () => {
    render(
      <AiSettingsPage 
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByPlaceholderText(/输入您的 Gemini API 密钥/i)).toBeInTheDocument();
  });

  it('应该显示所有AI服务商选项', () => {
    render(
      <AiSettingsPage 
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByText('Google Gemini')).toBeInTheDocument();
    expect(screen.getByText('DeepSeek (深度求索)')).toBeInTheDocument();
    expect(screen.getByText('智谱 AI (GLM)')).toBeInTheDocument();
    expect(screen.getByText('硅基流动 (SiliconFlow)')).toBeInTheDocument();
  });
});