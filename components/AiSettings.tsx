import React, { useEffect, useState } from 'react';
import { AiProvider, AiSettings, DEFAULT_AI_SETTINGS } from '../types';
import { Save, RotateCcw, ShieldCheck, Server, Cpu } from 'lucide-react';

interface AiSettingsProps {
  settings: AiSettings;
  onSave: (settings: AiSettings) => void;
}

const PROVIDER_CONFIGS: Record<AiProvider, { name: string; description: string; defaultBaseUrl: string }> = {
  [AiProvider.GEMINI]: {
    name: 'Google Gemini',
    description: 'Google 的多模态大语言模型，支持文本和图像输入',
    defaultBaseUrl: ''
  },
  [AiProvider.DEEPSEEK]: {
    name: 'DeepSeek (深度求索)',
    description: '深度求索的中文优化大模型',
    defaultBaseUrl: 'https://api.deepseek.com'
  },
  [AiProvider.ZHIPU]: {
    name: '智谱 AI (GLM)',
    description: '智谱AI的GLM系列大模型',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4'
  },
  [AiProvider.SILICONFLOW]: {
    name: '硅基流动 (SiliconFlow)',
    description: '硅基流动的AI服务平台',
    defaultBaseUrl: 'https://api.siliconflow.cn/v1'
  },
  [AiProvider.DOUBAO]: {
    name: '火山引擎 (豆包)',
    description: '字节跳动的AI大模型',
    defaultBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3'
  },
  [AiProvider.CLAUDE]: {
    name: 'Anthropic (Claude)',
    description: 'Anthropic的Claude系列大模型',
    defaultBaseUrl: 'https://api.anthropic.com/v1'
  }
};

const GEMINI_MODELS = [
  { label: 'Gemini 2.5 Pro (最新推荐)', value: 'gemini-2.5-pro-preview-03625' },
  { label: 'Gemini 2.5 Flash Exp', value: 'gemini-2.5-flash-exp' },
  { label: 'Gemini 2.0 Flash (快速)', value: 'gemini-2.0-flash-exp' },
  { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
  { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash-exp' },
  { label: 'Gemini Pro (通用)', value: 'gemini-pro' },
  { label: 'Gemini Flash (快速)', value: 'gemini-flash' },
  { label: '自定义 (Custom)...', value: 'custom' },
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

        // Auto-fill model name
        if (provider === AiProvider.GEMINI) {
          newData.modelName = 'gemini-2.0-flash';
        } else if (provider === AiProvider.DEEPSEEK) {
          newData.modelName = 'deepseek-chat';
        } else if (provider === AiProvider.ZHIPU) {
          newData.modelName = 'glm-4-plus';
        } else if (provider === AiProvider.SILICONFLOW) {
          newData.modelName = 'Qwen/Qwen2.5-72B-Instruct';
        } else if (provider === AiProvider.DOUBAO) {
          newData.modelName = 'doubao-pro-32k';
        } else if (provider === AiProvider.CLAUDE) {
          newData.modelName = 'claude-3-5-sonnet-20241022';
        }

        // Auto-fill baseUrl
        newData.baseUrl = config.defaultBaseUrl;
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
          <label className="block text-sm font-bold text-slate-700 mb-2">选择AI服务商</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
              <button
                type="button"
                key={key}
                onClick={() => handleChange('provider', key)}
                className={`px-4 py-3 rounded-lg border text-left transition-all ${
                  formData.provider === key 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${formData.provider === key ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  <span className="font-medium text-sm">{config.name}</span>
                </div>
                <p className="text-xs text-slate-500 ml-5">{config.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Model Name */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Cpu size={16} />
            模型名称
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
              placeholder="使用默认模型"
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
            />
          )}
          
          <p className="text-xs text-slate-400 mt-1">
             当前选择: {formData.modelName}
          </p>
        </div>

        {/* API Key Input */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <ShieldCheck size={16} />
            API 密钥
          </label>

          {formData.provider === AiProvider.GEMINI ? (
            <>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="输入您的 Gemini API 密钥（可选）"
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 <strong>前端直接调用模式：</strong>
              </p>
              <ul className="text-xs text-slate-600 mt-1 ml-4 list-disc space-y-1">
                <li>输入API密钥后，前端将直接调用Google Gemini API</li>
                <li>不需要后端服务支持</li>
                <li>API密钥存储在浏览器本地，不会发送到服务器</li>
              </ul>
            </>
          ) : formData.provider === AiProvider.ZHIPU ||
             formData.provider === AiProvider.SILICONFLOW ||
             formData.provider === AiProvider.DEEPSEEK ? (
            <>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder={`输入您的 ${PROVIDER_CONFIGS[formData.provider].name} API 密钥`}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 <strong>前端直接调用模式（新增）：</strong>
              </p>
              <ul className="text-xs text-slate-600 mt-1 ml-4 list-disc space-y-1">
                <li>输入API密钥后，前端将直接调用{PROVIDER_CONFIGS[formData.provider].name} API</li>
                <li>不需要后端服务支持</li>
                <li>API密钥存储在浏览器本地，不会发送到服务器</li>
                <li>如果未输入API密钥，将尝试使用后端代理（需要后端配置）</li>
              </ul>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 mb-1">使用后端代理模式</p>
                  <p className="text-amber-700 mb-2">
                    此服务商需要通过后端代理调用，使用后端配置的API密钥。
                  </p>
                  <p className="text-amber-700">
                    前端输入的API密钥仅用于 <strong>Google Gemini</strong>、<strong>智谱AI</strong>、<strong>硅基流动</strong>和<strong>DeepSeek</strong>直接调用。
                  </p>
                  <p className="text-amber-700 mt-2">
                    如需使用此服务商，请联系管理员在后端配置API密钥。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Banner for Direct Connect Providers */}
        {(formData.provider === AiProvider.ZHIPU ||
          formData.provider === AiProvider.SILICONFLOW ||
          formData.provider === AiProvider.DEEPSEEK) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Server className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
              <div className="text-sm">
                <p className="font-medium text-green-900 mb-1">支持前端直连</p>
                <p className="text-green-700 mb-2">
                  <strong>API地址：</strong> <code className="bg-green-100 px-1 py-0.5 rounded">{PROVIDER_CONFIGS[formData.provider].defaultBaseUrl}</code>
                </p>
                <p className="text-green-700">
                  <strong>模型：</strong> {formData.modelName}
                </p>
                <p className="text-green-700 mt-2">
                  ✅ 输入API密钥后可直接使用，无需后端配置
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner for Backend Required Providers */}
        {formData.provider !== AiProvider.GEMINI &&
         formData.provider !== AiProvider.ZHIPU &&
         formData.provider !== AiProvider.SILICONFLOW &&
         formData.provider !== AiProvider.DEEPSEEK && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Server className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">后端配置信息</p>
                <p className="text-blue-700 mb-2">
                  <strong>API地址：</strong> <code className="bg-blue-100 px-1 py-0.5 rounded">{PROVIDER_CONFIGS[formData.provider].defaultBaseUrl}</code>
                </p>
                <p className="text-blue-700">
                  <strong>模型：</strong> {formData.modelName}
                </p>
              </div>
            </div>
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