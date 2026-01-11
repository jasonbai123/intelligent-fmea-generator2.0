import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  FileText,
  Settings,
  Upload,
  Zap,
  Loader2,
  Image as ImageIcon,
  XCircle,
  BrainCircuit,
  FileSpreadsheet,
  BookOpen,
  Server,
  MessageSquareText,
  Users
} from 'lucide-react';
import { FmeaType, FmeaAnalysisResult, AiSettings, DEFAULT_AI_SETTINGS, ChatMessage, ChatRole, AuthToken, UserRole } from './types';
import { generateFmeaAnalysis, updateFmeaViaChat } from './services/backendAiService';
import { API_ENDPOINTS } from './config/api';

// 强制刷新缓存 - 版本: 2025-01-11 19:20
// Force cache refresh to ensure users get latest version with Chinese prompts
// Build timestamp: 2025-01-11T19:20:00+08:00
import { FmeaTable } from './components/FmeaTable';
import { DfmeaCriteria } from './components/DfmeaCriteria';
import { PfmeaCriteria } from './components/PfmeaCriteria';
import { AiSettingsPage } from './components/AiSettings';
import { ChatPanel } from './components/ChatPanel';
import { Guestbook } from './components/Guestbook';
import AccountExpirationAlert from './components/AccountExpirationAlert';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import VersionManagement from './components/VersionManagement';
import CommentManagement from './components/CommentManagement';

type ViewState = 'GENERATOR' | 'DFMEA_CRITERIA' | 'PFMEA_CRITERIA' | 'AI_SETTINGS' | 'GUESTBOOK' | 'USER_MANAGEMENT' | 'COLLABORATION';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('GENERATOR');
  const [activeTab, setActiveTab] = useState<FmeaType>(FmeaType.DFMEA);
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FmeaAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [aiSettings, setAiSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Auth State
  const [authToken, setAuthToken] = useState<AuthToken | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Collaboration State
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeCollabTab, setActiveCollabTab] = useState<'detail' | 'versions' | 'comments'>('detail');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Load auth token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('fmea_auth_token');

    if (savedToken) {
      try {
        const token: AuthToken = JSON.parse(savedToken);
        if (token.expiresAt > Date.now()) {
          setAuthToken(token);
          return; // 如果有有效token，直接返回
        } else {
          localStorage.removeItem('fmea_auth_token');
        }
      } catch (e) {
        console.error("Failed to parse auth token", e);
      }
    }

    // 🔴 临时：自动创建测试token（用于测试FMEA生成功能，无需后端API）
    const testToken: AuthToken = {
      token: 'test_token_' + Date.now(),
      phone: '13800138000',
      role: 'admin' as UserRole,
      expiresAt: Date.now() + 15 * 24 * 60 * 60 * 1000 // 15天后过期
    };
    localStorage.setItem('fmea_auth_token', JSON.stringify(testToken));
    setAuthToken(testToken);
    console.log('✅ 自动登录成功（测试模式）- 可以测试FMEA生成功能');
  }, []);

  const handleSendCode = async (phone: string) => {
    const response = await fetch(API_ENDPOINTS.auth.sendCode, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '发送验证码失败');
    }

    const data = await response.json();
    if (data.code) {
      console.log(`[验证码] 手机号 ${phone} 的验证码: ${data.code}`);
      alert(`验证码已生成：${data.code}\n\n请使用此验证码进行登录`);
    }
  };

  const handleLogin = async (phone: string, code: string) => {
    setIsAuthLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '登录失败');
      }

      const token: AuthToken = await response.json();
      localStorage.setItem('fmea_auth_token', JSON.stringify(token));
      setAuthToken(token);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fmea_auth_token');
    setAuthToken(null);
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fmea_ai_settings');
    if (saved) {
      try {
        setAiSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const saveSettings = (newSettings: AiSettings) => {
    setAiSettings(newSettings);
    localStorage.setItem('fmea_ai_settings', JSON.stringify(newSettings));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Create preview URL only if it's an image
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNavClick = (view: ViewState, tab?: FmeaType) => {
    setCurrentView(view);
    if (tab) {
      setActiveTab(tab);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to CSV for better context in prompt
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);
        
        if (!csvContent.trim()) {
            setError("Excel 文件内容为空");
            return;
        }

        setTextInput(prev => {
            const typeLabel = activeTab === FmeaType.DFMEA ? 'BOM' : 'Process';
            const newText = `[已导入 ${typeLabel} Excel: ${file.name}]\n${csvContent}`;
            return prev ? `${prev}\n\n${newText}` : newText;
        });
        
        setError(null);
    } catch (err) {
        console.error(err);
        setError("无法解析 Excel 文件，请确保格式正确 (.xlsx, .xls, .csv)。");
    } finally {
        if (excelInputRef.current) {
            excelInputRef.current.value = '';
        }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!textInput.trim() && !selectedFile) {
      setError("请输入描述或上传图片/文档以开始分析。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setChatMessages([]); // Clear chat on new generation

    try {
      let imageBase64: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (selectedFile) {
        imageBase64 = await fileToBase64(selectedFile);
        mimeType = selectedFile.type;
      }

      const analysisResult = await generateFmeaAnalysis({
        type: activeTab,
        textContext: textInput,
        imageBase64,
        mimeType,
        settings: aiSettings // Pass current settings
      });

      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || "生成分析时发生错误，请检查网络或 API 设置。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSendMessage = async (text: string) => {
    if (!result) return;
    
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: ChatRole.USER,
      content: text,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const { text: reply, updatedFmea } = await updateFmeaViaChat(result, text, aiSettings);
      
      if (updatedFmea) {
        // Re-assign IDs to ensure react key stability if rows changed significantly
        // or keep existing logic. Here we just swap the result.
        // We might want to preserve the ID if possible, but simplest is full swap.
        const rowsWithIds = updatedFmea.rows.map((row, idx) => ({
             ...row,
             id: row.id || `row-updated-${Date.now()}-${idx}`
        }));
        setResult({ ...updatedFmea, rows: rowsWithIds });
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: ChatRole.AI,
        content: reply,
        timestamp: Date.now(),
        isUpdate: !!updatedFmea
      };
      setChatMessages(prev => [...prev, aiMsg]);

    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: ChatRole.AI,
        content: "抱歉，处理您的请求时出现错误，请稍后重试。",
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'DFMEA_CRITERIA':
        return <DfmeaCriteria />;
      case 'PFMEA_CRITERIA':
        return <PfmeaCriteria />;
      case 'AI_SETTINGS':
        return <AiSettingsPage settings={aiSettings} onSave={saveSettings} />;
      case 'GUESTBOOK':
        return <Guestbook />;
      case 'USER_MANAGEMENT':
        // 暂时禁用，直接显示提示
        return <div className="text-center py-12 text-slate-500">
          <div className="mb-4">用户管理功能需要后端支持</div>
          <div className="text-sm">当前为单机模式，可以直接使用FMEA生成功能</div>
        </div>;
        // return authToken ? <UserManagement authToken={authToken} /> : <div className="text-center py-12 text-slate-500">请先登录</div>;
      case 'COLLABORATION':
        // 暂时禁用，直接显示提示
        return <div className="text-center py-12 text-slate-500">
          <div className="mb-4">协作功能需要后端支持</div>
          <div className="text-sm">当前为单机模式，可以直接使用FMEA生成功能</div>
        </div>;
        // return authToken ? renderCollaboration() : <div className="text-center py-12 text-slate-500">请先登录</div>;
      case 'GENERATOR':
      default:
        return renderGenerator();
    }
  };

  const renderCollaboration = () => {
    if (!selectedProject) {
      return (
        <ProjectList
          onSelectProject={setSelectedProject}
          onCreateProject={() => {
            const newProject = {
              id: `project_${Date.now()}`,
              title: '新项目',
              type: FmeaType.DFMEA,
              data: {
                type: FmeaType.DFMEA,
                projectName: '新项目',
                projectDescription: '',
                analysisDate: Date.now(),
                rows: [],
                criteria: {}
              },
              createdBy: authToken?.userInfo.id || '',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              status: 'draft',
              collaborators: [],
              currentVersion: 1
            };
            setSelectedProject(newProject);
          }}
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            返回项目列表
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              <button
                onClick={() => setActiveCollabTab('detail')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeCollabTab === 'detail'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                项目详情
              </button>
              <button
                onClick={() => setActiveCollabTab('versions')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeCollabTab === 'versions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                版本管理
              </button>
              <button
                onClick={() => setActiveCollabTab('comments')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeCollabTab === 'comments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                评论
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeCollabTab === 'detail' && (
              <ProjectDetail
                project={selectedProject}
                onBack={() => setSelectedProject(null)}
                onUpdate={setSelectedProject}
              />
            )}
            {activeCollabTab === 'versions' && (
              <VersionManagement
                projectId={selectedProject.id}
                currentVersion={selectedProject.currentVersion}
                onVersionRestore={(version) => {
                  alert(`已恢复到版本 ${version}`);
                }}
              />
            )}
            {activeCollabTab === 'comments' && (
              <CommentManagement projectId={selectedProject.id} />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderGenerator = () => (
    <div className="animate-fade-in relative">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-slate-900">
            {activeTab === FmeaType.DFMEA ? '设计 FMEA 生成器' : '过程 FMEA 生成器'}
          </h1>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded border border-blue-200">
            AIAG & VDA 1.0
          </span>
        </div>
        <p className="text-slate-500 mt-2">
          {activeTab === FmeaType.DFMEA 
            ? '上传产品BOM、总成图纸或输入结构描述，自动生成符合 AIAG-VDA 标准的 DFMEA 报告（包含 AP 分析）。'
            : '上传过程流程图 (Process Flow) 或输入工序描述，自动生成符合 AIAG-VDA 标准的 PFMEA 报告（包含 AP 分析）。'
          }
        </p>
      </header>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Text Input */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText size={16} />
              {activeTab === FmeaType.DFMEA ? 'BOM / 产品结构描述' : '过程流程描述'}
            </label>
            <button
              onClick={() => excelInputRef.current?.click()}
              className="text-xs flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors"
              title="上传 Excel 文件 (.xlsx, .xls, .csv)"
            >
              <FileSpreadsheet size={14} />
              导入 Excel
            </button>
            <input
              type="file"
              ref={excelInputRef}
              onChange={handleExcelUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
          </div>
          <textarea
            className="w-full flex-1 p-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-shadow text-slate-700 min-h-[200px]"
            placeholder={activeTab === FmeaType.DFMEA 
              ? "例如：电动牙刷动力总成，包含：微型电机 (DC 3.7V)、传动轴（不锈钢）、偏心轮（铜合金）、减震橡胶圈... (支持导入 Excel BOM)"
              : "例如：注塑成型工序：1. 原料烘干 (80°C, 4小时); 2. 自动上料; 3. 螺杆熔融塑化... (支持导入 Excel 流程表)"
            }
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        </div>

        {/* Image/File Input */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <ImageIcon size={16} />
            {activeTab === FmeaType.DFMEA ? '上传总成图纸 / 爆炸图 (PDF/图片)' : '上传流程图 / 现场照片 (PDF/图片)'}
          </label>
          
          <div className="flex-1 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-400 transition-colors">
            {!selectedFile ? (
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <p className="text-sm text-slate-600 font-medium">点击上传文件</p>
                <p className="text-xs text-slate-400 mt-1">支持 PDF, PNG, JPG, WEBP</p>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-100">
                {selectedFile.type.startsWith('image/') && previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                ) : (
                    <div className="flex flex-col items-center text-slate-500 p-4 animate-fade-in">
                        <FileText size={64} className="text-red-500 mb-3 drop-shadow-sm" />
                        <span className="font-semibold text-base text-slate-700 text-center break-all px-4">{selectedFile.name}</span>
                        <span className="text-xs text-slate-400 mt-1 uppercase">{selectedFile.name.split('.').pop()} Document</span>
                    </div>
                )}
                <button 
                  onClick={clearFile}
                  className="absolute top-2 right-2 p-1.5 bg-white text-slate-500 rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors z-10"
                  title="移除文件"
                >
                  <XCircle size={20} />
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="mt-6 flex flex-col items-center">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2 border border-red-100">
            <XCircle size={16} />
            {error}
          </div>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`
            group relative px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all
            ${isLoading 
              ? 'bg-slate-400 cursor-not-allowed pl-12' 
              : activeTab === FmeaType.DFMEA 
                ? 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/30' 
                : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/30'
            }
          `}
        >
          {isLoading && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin" size={20} />
            </div>
          )}
          {isLoading ? 'AI 正在分析中...' : '开始生成分析报告'}
        </button>
      </div>

      {/* Results Area */}
      {result && (
        <div id="results-section" className="relative pb-20">
          <FmeaTable data={result} />
          
          {/* Chat Interface - Embedded directly below table */}
          <ChatPanel 
            messages={chatMessages}
            onSendMessage={handleChatSendMessage}
            isLoading={isChatLoading}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">
      {/* 暂时禁用登录要求，直接显示主应用 */}
      {/* {!authToken ? (
        <Login onLogin={handleLogin} onSendCode={handleSendCode} isLoading={isAuthLoading} />
      ) : (*/}
        <div className="flex flex-col md:flex-row">
          {/* Sidebar / Navigation */}
          <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 text-white">
          <BrainCircuit size={28} className="text-blue-400" />
          <span className="font-bold text-xl tracking-tight">FMEA Genius</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {/* DFMEA Tab */}
          <button
            onClick={() => handleNavClick('GENERATOR', FmeaType.DFMEA)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === 'GENERATOR' && activeTab === FmeaType.DFMEA 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'hover:bg-slate-800'
            }`}
          >
            <Settings size={20} />
            <div className="text-left">
              <div className="font-semibold">DFMEA</div>
              <div className="text-xs opacity-70">设计失效模式分析</div>
            </div>
          </button>

          {/* PFMEA Tab */}
          <button
            onClick={() => handleNavClick('GENERATOR', FmeaType.PFMEA)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === 'GENERATOR' && activeTab === FmeaType.PFMEA 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                : 'hover:bg-slate-800'
            }`}
          >
            <Zap size={20} />
            <div className="text-left">
              <div className="font-semibold">PFMEA</div>
              <div className="text-xs opacity-70">过程失效模式分析</div>
            </div>
          </button>
          
          <div className="my-2 border-t border-slate-800 opacity-50"></div>

          {/* DFMEA Criteria Tab */}
           <button
            onClick={() => handleNavClick('DFMEA_CRITERIA')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === 'DFMEA_CRITERIA'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/50' 
                : 'hover:bg-slate-800'
            }`}
          >
            <BookOpen size={20} />
            <div className="text-left">
              <div className="font-semibold">DFMEA 准则</div>
              <div className="text-xs opacity-70">SOD 及 AP 评分标准</div>
            </div>
          </button>

          {/* PFMEA Criteria Tab */}
          <button
            onClick={() => handleNavClick('PFMEA_CRITERIA')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === 'PFMEA_CRITERIA'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                : 'hover:bg-slate-800'
            }`}
          >
            <BookOpen size={20} />
            <div className="text-left">
              <div className="font-semibold">PFMEA 准则</div>
              <div className="text-xs opacity-70">SOD 及 AP 评分标准</div>
            </div>
          </button>

          <div className="my-2 border-t border-slate-800 opacity-50"></div>

          {/* Guestbook Tab */}
          <button
            onClick={() => handleNavClick('GUESTBOOK')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === 'GUESTBOOK'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'hover:bg-slate-800'
            }`}
          >
            <MessageSquareText size={20} />
            <div className="text-left">
              <div className="font-semibold">留言板</div>
              <div className="text-xs opacity-70">反馈与沟通</div>
            </div>
          </button>

           {/* AI Settings Tab */}
           <button
            onClick={() => handleNavClick('AI_SETTINGS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === 'AI_SETTINGS'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' 
                : 'hover:bg-slate-800'
            }`}
          >
            <Server size={20} />
            <div className="text-left">
              <div className="font-semibold">AI API 设置</div>
              <div className="text-xs opacity-70">配置服务商与 Key</div>
            </div>
          </button>

          {/* Collaboration Tab */}
          <button
            onClick={() => handleNavClick('COLLABORATION')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === 'COLLABORATION'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50' 
                : 'hover:bg-slate-800'
            }`}
          >
            <Users size={20} />
            <div className="text-left">
              <div className="font-semibold">项目协作</div>
              <div className="text-xs opacity-70">团队协作与版本管理</div>
            </div>
          </button>

          {authToken && authToken.userInfo.role === 'admin' && (
            <button
              onClick={() => handleNavClick('USER_MANAGEMENT')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'USER_MANAGEMENT'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' 
                  : 'hover:bg-slate-800'
              }`}
            >
              <Users size={20} />
              <div className="text-left">
                <div className="font-semibold">用户管理</div>
                <div className="text-xs opacity-70">管理用户与权限</div>
              </div>
            </button>
          )}

        </nav>

        <div className="p-6 space-y-2 text-xs text-slate-500 border-t border-slate-800">
          {/* 暂时禁用用户信息显示
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1">
              <div className="font-medium text-slate-400">当前用户</div>
              <div className="text-slate-300 font-mono">{authToken.userInfo.phone}</div>
              <AccountExpirationAlert authToken={authToken} />
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              退出登录
            </button>
          </div>
          */}
          <div>Powered by {aiSettings.provider === 'gemini' ? 'Gemini' : aiSettings.provider.toUpperCase()}</div>
          <div>Standard: AIAG & VDA FMEA 1.0</div>
          <div className="pt-4 mt-2 border-t border-slate-800">
             <div className="font-medium text-slate-400 mb-0.5">设计联系方式 / 微信：</div>
             <div className="text-slate-400 font-mono">jasonbai 13510420462</div>
             <div className="mt-2 text-slate-600">© 版权归 Jasonbai 老师所有</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-[1400px] mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
      {/*)}*/}
    </div>
  );
};

export default App;