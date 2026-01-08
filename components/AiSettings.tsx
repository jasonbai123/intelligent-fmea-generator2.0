import React, { useEffect, useState } from 'react';
import { AiProvider, AiSettings, DEFAULT_AI_SETTINGS } from '../types';
import { Save, RotateCcw, ShieldCheck, Key, Server, Cpu } from 'lucide-react';

interface AiSettingsProps {
  settings: AiSettings;
  onSave: (settings: AiSettings) => void;
}

const PROVIDER_CONFIGS: Record<AiProvider, { name: string; defaultBaseUrl: string; defaultModel: string; placeholder: string }> = {
  [AiProvider.GEMINI]: {
    name: 'Google Gemini',
    defaultBaseUrl: '', // Not used for SDK
    defaultModel: 'gemini-2.0-flash',
    placeholder: '使用默认的环境变量 API Key (推荐)'
  },
  [AiProvider.DEEPSEEK]: {
    name: 'DeepSeek (深度求索)',
    defaultBaseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    placeholder: 'sk-...'
  },
  [AiProvider.ZHIPU]: {
    name: '智谱 AI (GLM)',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    placeholder: 'Key...'
  },
  [AiProvider.SILICONFLOW]: {
    name: '硅基流动 (SiliconFlow)',
    defaultBaseUrl: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    placeholder: 'sk-...'
  },
  [AiProvider.DOUBAO]: {
    name: '火山引擎 (豆包)',
    defaultBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'ep-2024xxxxxxxx-xxxxx', // Endpoint ID usually
    placeholder: 'Access Key / API Key'
  },
  [AiProvider.CLAUDE]: {
    name: 'Anthropic (Claude)',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20240620',
    placeholder: 'sk-ant-...'
  }
};

const GEMINI_MODELS = [
  { label: 'Gemini 2.0 Flash (Default)', value: 'gemini-2.0-flash' },
  { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
  { label: 'Gemini 3.0 Pro (Preview)', value: 'gemini-3-pro-preview' },
  { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash-preview' },
  { label: 'Gemini 2.5 Pro (Custom Input)', value: 'gemini-2.5-pro-preview' }, // Assuming potential future name or user intent
];

export const AiSettingsPage: React.FC<AiSettingsProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<AiSettings>(settings);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof AiSettings, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-fill defaults when provider changes
      if (field === 'provider') {
        const provider = value as AiProvider;
        const config = PROVIDER_CONFIGS[provider];
        newData.baseUrl = config.defaultBaseUrl;
        newData.modelName = config.defaultModel;
        newData.apiKey = ''; // Clear key on switch for security/clarity
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('确定要恢复默认设置吗？')) {
      setFormData(DEFAULT_AI_SETTINGS);
      onSave(DEFAULT_AI_SETTINGS);
    }
  };

  const currentConfig = PROVIDER_CONFIGS[formData.provider];

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <header className="mb-8 border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Server className="text-blue-600" />
          AI API 设置
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          配置用于生成 FMEA 报告的 AI 模型服务商。支持主流的大模型 API。
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
        
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">选择服务商</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
              <button
                type="button"
                key={key}
                onClick={() => handleChange('provider', key)}
                className={`px-4 py-3 rounded-lg border text-left flex items-center gap-2 transition-all ${
                  formData.provider === key 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${formData.provider === key ? 'bg-blue-500' : 'bg-slate-300'}`} />
                <span className="font-medium text-sm">{config.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Key size={16} />
            API Key
          </label>
          <input
            type="password"
            value={formData.apiKey}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            placeholder={currentConfig.placeholder}
            className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
          />
          <p className="text-xs text-slate-400 mt-1">
             {formData.provider === AiProvider.GEMINI 
               ? '留空则使用部署时配置的环境变量 (process.env.API_KEY)。'
               : '您的 Key 仅存储在本地浏览器中，不会发送到任何第三方服务器。'}
          </p>
        </div>

        {/* Model Name */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Cpu size={16} />
            模型名称 (Model Name)
          </label>
          
          {formData.provider === AiProvider.GEMINI ? (
            <div className="space-y-2">
              <select
                value={formData.modelName}
                onChange={(e) => handleChange('modelName', e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm bg-slate-50"
              >
                {GEMINI_MODELS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
                <option value="custom">自定义 (Custom)...</option>
              </select>
              
              {/* Allow custom input if model is not in list or user wants to override */}
              {!GEMINI_MODELS.some(m => m.value === formData.modelName) && (
                <input
                  type="text"
                  value={formData.modelName}
                  onChange={(e) => handleChange('modelName', e.target.value)}
                  placeholder="e.g. gemini-1.5-pro-latest"
                  className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                />
              )}
            </div>
          ) : (
            <input
              type="text"
              value={formData.modelName}
              onChange={(e) => handleChange('modelName', e.target.value)}
              placeholder={currentConfig.defaultModel}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
            />
          )}
          
          <p className="text-xs text-slate-400 mt-1">
             当前选择: {formData.modelName}。
             {formData.provider === AiProvider.GEMINI && " 支持 Gemini 1.5 Pro, 2.5 Flash, 3.0 Pro 等模型。"}
          </p>
        </div>

        {/* Base URL */}
        {formData.provider !== AiProvider.GEMINI && (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Server size={16} />
              API Base URL
            </label>
            <input
              type="text"
              value={formData.baseUrl}
              onChange={(e) => handleChange('baseUrl', e.target.value)}
              placeholder={currentConfig.defaultBaseUrl}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
            />
             {formData.provider === AiProvider.CLAUDE && (
              <p className="text-xs text-amber-600 mt-1">
                注意: 原生 Anthropic API 可能不支持浏览器直接调用 (CORS)。如遇网络错误，请尝试使用支持 CORS 的代理地址。
              </p>
            )}
          </div>
        )}

        <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <RotateCcw size={16} />
            重置默认
          </button>
          
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-bold shadow-md hover:shadow-lg"
          >
            {showSuccess ? <ShieldCheck size={18} /> : <Save size={18} />}
            {showSuccess ? '已保存!' : '保存设置'}
          </button>
        </div>
      </form>
    </div>
  );
};