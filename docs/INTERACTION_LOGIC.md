# 智能FMEA生成器 - 软件交互逻辑

## 一、用户交互流程总览

### 1.1 FMEA生成流程

```
用户打开应用
    ↓
选择FMEA类型 (DFMEA/PFMEA)
    ↓
输入文本描述或上传文件
    ↓
配置AI设置 (选择提供商、模型、API Key)
    ↓
点击"生成FMEA"按钮
    ↓
显示加载状态
    ↓
调用AI服务生成FMEA分析
    ↓
显示生成结果 (FMEA表格)
    ↓
用户可以:
    - 导出Excel
    - 聊天优化
    - 保存项目
    - 重新生成
```

### 1.2 用户认证流程

```
用户点击"登录"
    ↓
输入手机号
    ↓
点击"获取验证码"
    ↓
系统生成验证码并显示
    ↓
用户输入验证码
    ↓
点击"登录"
    ↓
验证验证码有效性
    ↓
生成认证令牌
    ↓
保存令牌到localStorage
    ↓
更新用户状态为已登录
    ↓
显示用户信息
```

### 1.3 项目协作流程

```
用户创建新项目
    ↓
输入项目标题和描述
    ↓
选择FMEA类型
    ↓
点击"创建"
    ↓
保存项目到后端
    ↓
添加协作者 (可选)
    ↓
协作者可以:
    - 查看项目
    - 编辑项目
    - 添加评论
    - 创建版本
```

### 1.4 版本管理流程

```
用户编辑项目
    ↓
点击"保存版本"
    ↓
输入版本描述
    ↓
系统创建版本快照
    ↓
保存版本到后端
    ↓
用户可以:
    - 查看版本历史
    - 恢复到任意版本
    - 比较版本差异
```

---

## 二、核心功能交互逻辑

### 2.1 FMEA生成器交互逻辑

#### 2.1.1 初始化
```typescript
// App.tsx 初始化
useEffect(() => {
  // 从localStorage加载AI设置
  const savedSettings = localStorage.getItem('fmea_ai_settings');
  if (savedSettings) {
    setAiSettings(JSON.parse(savedSettings));
  }
  
  // 从localStorage加载认证令牌
  const savedToken = localStorage.getItem('fmea_auth_token');
  if (savedToken) {
    const token: AuthToken = JSON.parse(savedToken);
    if (token.expiresAt > Date.now()) {
      setAuthToken(token);
    }
  }
}, []);
```

#### 2.1.2 文本输入处理
```typescript
// 用户输入文本
const handleTextInputChange = (value: string) => {
  setTextInput(value);
  setError(null);
};

// 用户选择文件
const handleFileSelect = (file: File) => {
  setSelectedFile(file);
  
  // 创建预览URL
  const url = URL.createObjectURL(file);
  setPreviewUrl(url);
  
  // 读取文件内容
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    setTextInput(content);
  };
  reader.readAsText(file);
};
```

#### 2.1.3 FMEA生成
```typescript
const handleGenerate = async () => {
  // 验证输入
  if (!textInput.trim()) {
    setError('请输入文本描述或上传文件');
    return;
  }
  
  // 验证AI设置
  if (!aiSettings.apiKey) {
    setError('请先配置AI API Key');
    return;
  }
  
  // 设置加载状态
  setIsLoading(true);
  setError(null);
  
  try {
    // 构建请求
    const request: GenerationRequest = {
      textContext: textInput,
      type: activeTab,
      settings: aiSettings
    };
    
    // 调用AI服务
    const result = await generateFmeaAnalysis(request);
    
    // 保存结果
    setResult(result);
    
    // 保存到localStorage
    localStorage.setItem('fmea_last_result', JSON.stringify(result));
    
  } catch (err) {
    setError(err instanceof Error ? err.message : '生成失败，请重试');
  } finally {
    setIsLoading(false);
  }
};
```

#### 2.1.4 AI服务调用
```typescript
// backendAiService.ts
export const generateFmeaAnalysis = async (request: GenerationRequest): Promise<FmeaAnalysisResult> => {
  const provider = request.settings?.provider || AiProvider.GEMINI;
  const systemInstruction = getSystemInstruction(request.type);

  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: request.textContext }
  ];

  // Gemini使用前端直接调用
  if (provider === AiProvider.GEMINI && request.settings?.apiKey) {
    return generateWithGeminiDirect(messages, request);
  }

  // 前端直连模式
  if (request.settings?.apiKey &&
      (provider === AiProvider.ZHIPU ||
       provider === AiProvider.SILICONFLOW ||
       provider === AiProvider.DEEPSEEK)) {
    return generateDirect(request);
  }

  // 后端代理模式
  const response = await fetch(`${API_BASE_URL}/api/ai/${provider}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model: request.settings?.modelName
    })
  });

  if (!response.ok) {
    throw new Error(`AI服务调用失败: ${response.statusText}`);
  }

  const data = await response.json();
  return parseFmeaResponse(data.content);
};
```

---

### 2.2 用户认证交互逻辑

#### 2.2.1 发送验证码
```typescript
const handleSendCode = async (phone: string) => {
  // 验证手机号
  if (!phone || phone.length !== 11) {
    alert('请输入有效的11位手机号');
    return;
  }

  try {
    // 调用后端API
    const response = await fetch(API_ENDPOINTS.auth.sendCode, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();
    
    if (response.ok) {
      // 显示验证码（开发环境）
      alert(`验证码: ${data.code}`);
    } else {
      alert(data.message || '发送验证码失败');
    }
  } catch (error) {
    alert('网络错误，请重试');
  }
};
```

#### 2.2.2 用户登录
```typescript
const handleLogin = async (phone: string, code: string) => {
  // 验证输入
  if (!phone || phone.length !== 11) {
    alert('请输入有效的11位手机号');
    return;
  }
  
  if (!code || code.length !== 6) {
    alert('请输入6位验证码');
    return;
  }

  setIsAuthLoading(true);

  try {
    // 调用登录API
    const response = await fetch(API_ENDPOINTS.auth.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code })
    });

    const data: AuthToken = await response.json();
    
    if (response.ok) {
      // 保存令牌
      setAuthToken(data);
      localStorage.setItem('fmea_auth_token', JSON.stringify(data));
      
      // 关闭登录对话框
      setShowLogin(false);
    } else {
      alert(data.message || '登录失败');
    }
  } catch (error) {
    alert('网络错误，请重试');
  } finally {
    setIsAuthLoading(false);
  }
};
```

#### 2.2.3 令牌验证
```typescript
// 在App组件中验证令牌
useEffect(() => {
  const savedToken = localStorage.getItem('fmea_auth_token');
  if (savedToken) {
    try {
      const token: AuthToken = JSON.parse(savedToken);
      
      // 检查令牌是否过期
      if (token.expiresAt > Date.now()) {
        setAuthToken(token);
      } else {
        // 令牌已过期，清除
        localStorage.removeItem('fmea_auth_token');
        setAuthToken(null);
      }
    } catch (e) {
      console.error("Failed to parse auth token", e);
      localStorage.removeItem('fmea_auth_token');
    }
  }
}, []);
```

---

### 2.3 项目协作交互逻辑

#### 2.3.1 创建项目
```typescript
const handleCreateProject = async (projectData: Partial<FmeaProject>) => {
  if (!authToken) {
    alert('请先登录');
    return;
  }

  try {
    const response = await fetch(API_ENDPOINTS.collaboration.projects, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.token}`
      },
      body: JSON.stringify({
        ...projectData,
        createdBy: authToken.userInfo.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'active',
        collaborators: [authToken.userInfo.id],
        currentVersion: 1
      })
    });

    if (response.ok) {
      const project = await response.json();
      setSelectedProject(project);
      
      // 刷新项目列表
      loadProjects();
    } else {
      const error = await response.json();
      alert(error.message || '创建项目失败');
    }
  } catch (error) {
    alert('网络错误，请重试');
  }
};
```

#### 2.3.2 加载项目列表
```typescript
const loadProjects = async () => {
  if (!authToken) return;

  try {
    const response = await fetch(API_ENDPOINTS.collaboration.projects, {
      headers: {
        'Authorization': `Bearer ${authToken.token}`
      }
    });

    if (response.ok) {
      const projects = await response.json();
      setProjects(projects);
    }
  } catch (error) {
    console.error('Failed to load projects', error);
  }
};
```

#### 2.3.3 更新项目
```typescript
const handleUpdateProject = async (projectId: string, updates: Partial<FmeaProject>) => {
  if (!authToken) return;

  try {
    const response = await fetch(API_ENDPOINTS.collaboration.project(projectId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.token}`
      },
      body: JSON.stringify({
        ...updates,
        updatedAt: Date.now()
      })
    });

    if (response.ok) {
      const updatedProject = await response.json();
      setSelectedProject(updatedProject);
      
      // 刷新项目列表
      loadProjects();
    }
  } catch (error) {
    alert('更新项目失败');
  }
};
```

---

### 2.4 版本管理交互逻辑

#### 2.4.1 创建版本
```typescript
const handleCreateVersion = async (description: string) => {
  if (!selectedProject || !authToken) return;

  try {
    const response = await fetch(
      API_ENDPOINTS.collaboration.versions(selectedProject.id),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken.token}`
        },
        body: JSON.stringify({
          version: selectedProject.currentVersion + 1,
          data: selectedProject.data,
          description,
          createdBy: authToken.userInfo.id,
          createdAt: Date.now()
        })
      }
    );

    if (response.ok) {
      // 更新项目当前版本
      await handleUpdateProject(selectedProject.id, {
        currentVersion: selectedProject.currentVersion + 1
      });
      
      // 刷新版本列表
      loadVersions();
    }
  } catch (error) {
    alert('创建版本失败');
  }
};
```

#### 2.4.2 恢复版本
```typescript
const handleRestoreVersion = async (version: string) => {
  if (!selectedProject || !authToken) return;

  if (!confirm('确定要恢复到此版本吗？当前更改将丢失。')) {
    return;
  }

  try {
    const response = await fetch(
      API_ENDPOINTS.collaboration.restoreVersion(selectedProject.id, version),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken.token}`
        }
      }
    );

    if (response.ok) {
      const restoredProject = await response.json();
      setSelectedProject(restoredProject);
      
      // 刷新版本列表
      loadVersions();
    }
  } catch (error) {
    alert('恢复版本失败');
  }
};
```

---

### 2.5 评论管理交互逻辑

#### 2.5.1 添加评论
```typescript
const handleAddComment = async (content: string) => {
  if (!selectedProject || !authToken) return;

  try {
    const response = await fetch(
      API_ENDPOINTS.collaboration.comments(selectedProject.id),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken.token}`
        },
        body: JSON.stringify({
          content,
          userId: authToken.userInfo.id,
          userName: authToken.userInfo.phone,
          createdAt: Date.now()
        })
      }
    );

    if (response.ok) {
      // 刷新评论列表
      loadComments();
    }
  } catch (error) {
    alert('添加评论失败');
  }
};
```

#### 2.5.2 回复评论
```typescript
const handleReplyComment = async (commentId: string, content: string) => {
  if (!selectedProject || !authToken) return;

  try {
    const response = await fetch(
      API_ENDPOINTS.collaboration.replies(selectedProject.id, commentId),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken.token}`
        },
        body: JSON.stringify({
          content,
          userId: authToken.userInfo.id,
          userName: authToken.userInfo.phone,
          createdAt: Date.now()
        })
      }
    );

    if (response.ok) {
      // 刷新评论列表
      loadComments();
    }
  } catch (error) {
    alert('回复失败');
  }
};
```

---

## 三、状态管理逻辑

### 3.1 全局状态结构
```typescript
interface AppState {
  // 视图状态
  currentView: 'GENERATOR' | 'COLLAB' | 'SETTINGS' | 'ABOUT';
  activeTab: 'dfmea' | 'pfmea';
  
  // 输入状态
  textInput: string;
  selectedFile: File | null;
  previewUrl: string | null;
  
  // 加载状态
  isLoading: boolean;
  isChatLoading: boolean;
  isAuthLoading: boolean;
  
  // 结果状态
  result: FmeaAnalysisResult | null;
  error: string | null;
  
  // AI设置
  aiSettings: AiSettings;
  
  // 聊天状态
  chatMessages: ChatMessage[];
  
  // 认证状态
  authToken: AuthToken | null;
  
  // 协作状态
  selectedProject: FmeaProject | null;
  projects: FmeaProject[];
  activeCollabTab: 'detail' | 'versions' | 'comments';
}
```

### 3.2 状态更新流程
```
用户操作
    ↓
事件处理函数
    ↓
状态更新 (setState)
    ↓
组件重新渲染
    ↓
UI更新
```

---

## 四、错误处理逻辑

### 4.1 网络错误处理
```typescript
const handleApiError = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      setError('网络连接失败，请检查网络设置');
    } else if (error.message.includes('timeout')) {
      setError('请求超时，请重试');
    } else {
      setError(error.message);
    }
  } else {
    setError('发生未知错误');
  }
};
```

### 4.2 AI服务错误处理
```typescript
const handleAiError = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message.includes('API key')) {
      setError('API Key无效，请检查配置');
    } else if (error.message.includes('quota')) {
      setError('API配额已用完，请稍后重试');
    } else if (error.message.includes('rate limit')) {
      setError('请求过于频繁，请稍后重试');
    } else {
      setError(`AI服务错误: ${error.message}`);
    }
  }
};
```

### 4.3 认证错误处理
```typescript
const handleAuthError = (response: Response) => {
  if (response.status === 401) {
    // 令牌无效或过期
    localStorage.removeItem('fmea_auth_token');
    setAuthToken(null);
    setError('登录已过期，请重新登录');
  } else if (response.status === 403) {
    setError('没有权限执行此操作');
  } else {
    setError('认证失败');
  }
};
```

---

## 五、性能优化逻辑

### 5.1 防抖处理
```typescript
// 文本输入防抖
const debouncedTextInput = useDebounce(textInput, 500);

// 自动保存
useEffect(() => {
  if (debouncedTextInput) {
    localStorage.setItem('fmea_draft', debouncedTextInput);
  }
}, [debouncedTextInput]);
```

### 5.2 缓存策略
```typescript
// 缓存FMEA结果
const getCachedResult = (key: string): FmeaAnalysisResult | null => {
  const cached = localStorage.getItem(key);
  if (cached) {
    const data = JSON.parse(cached);
    // 检查缓存是否过期（1小时）
    if (Date.now() - data.timestamp < 3600000) {
      return data.result;
    }
  }
  return null;
};

const setCachedResult = (key: string, result: FmeaAnalysisResult) => {
  localStorage.setItem(key, JSON.stringify({
    result,
    timestamp: Date.now()
  }));
};
```

### 5.3 懒加载
```typescript
// 组件懒加载
const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
const VersionManagement = lazy(() => import('./components/VersionManagement'));

// 路由懒加载
<Suspense fallback={<Loading />}>
  <ProjectDetail />
</Suspense>
```

---

## 六、数据持久化逻辑

### 6.1 LocalStorage使用
```typescript
// 保存AI设置
const saveAiSettings = (settings: AiSettings) => {
  localStorage.setItem('fmea_ai_settings', JSON.stringify(settings));
};

// 加载AI设置
const loadAiSettings = (): AiSettings | null => {
  const saved = localStorage.getItem('fmea_ai_settings');
  return saved ? JSON.parse(saved) : null;
};

// 保存认证令牌
const saveAuthToken = (token: AuthToken) => {
  localStorage.setItem('fmea_auth_token', JSON.stringify(token));
};

// 加载认证令牌
const loadAuthToken = (): AuthToken | null => {
  const saved = localStorage.getItem('fmea_auth_token');
  return saved ? JSON.parse(saved) : null;
};
```

### 6.2 后端数据同步
```typescript
// 同步项目数据
const syncProject = async (project: FmeaProject) => {
  try {
    await fetch(API_ENDPOINTS.collaboration.project(project.id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken?.token}`
      },
      body: JSON.stringify(project)
    });
  } catch (error) {
    console.error('同步失败', error);
  }
};
```

---

## 七、实时更新逻辑

### 7.1 轮询更新
```typescript
// 轮询项目更新
useEffect(() => {
  if (!selectedProject) return;

  const interval = setInterval(() => {
    loadProjectUpdates(selectedProject.id);
  }, 30000); // 每30秒轮询一次

  return () => clearInterval(interval);
}, [selectedProject]);
```

### 7.2 WebSocket连接（未来扩展）
```typescript
// WebSocket实时更新
const connectWebSocket = (projectId: string) => {
  const ws = new WebSocket(`wss://api.example.com/projects/${projectId}/updates`);
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    handleProjectUpdate(update);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error', error);
  };
  
  return ws;
};
```

---

## 八、用户反馈逻辑

### 8.1 加载状态反馈
```typescript
{isLoading && (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-4">正在生成FMEA分析...</span>
  </div>
)}
```

### 8.2 错误状态反馈
```typescript
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    <div className="flex items-center">
      <AlertCircle className="h-5 w-5 mr-2" />
      <span>{error}</span>
    </div>
  </div>
)}
```

### 8.3 成功状态反馈
```typescript
{result && (
  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
    <div className="flex items-center">
      <CheckCircle className="h-5 w-5 mr-2" />
      <span>FMEA分析生成成功！</span>
    </div>
  </div>
)}
```

---

## 九、可访问性逻辑

### 9.1 键盘导航
```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSubmit();
  } else if (event.key === 'Escape') {
    handleCancel();
  }
};
```

### 9.2 焦点管理
```typescript
useEffect(() => {
  if (showModal) {
    modalRef.current?.focus();
  }
}, [showModal]);
```

### 9.3 ARIA属性
```typescript
<button
  aria-label="生成FMEA分析"
  aria-disabled={isLoading}
  onClick={handleGenerate}
>
  生成FMEA
</button>
```

---

## 十、总结

本软件交互逻辑涵盖了：

1. **用户交互流程**: FMEA生成、用户认证、项目协作、版本管理等核心流程
2. **状态管理**: 全局状态结构和更新流程
3. **错误处理**: 网络错误、AI服务错误、认证错误的处理逻辑
4. **性能优化**: 防抖、缓存、懒加载等优化策略
5. **数据持久化**: LocalStorage和后端数据同步
6. **实时更新**: 轮询和WebSocket（未来扩展）
7. **用户反馈**: 加载、错误、成功状态的反馈
8. **可访问性**: 键盘导航、焦点管理、ARIA属性

这些交互逻辑确保了软件的易用性、稳定性和性能。
