import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';
import { ChatMessage, ChatRole } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const text = input;
    setInput('');
    await onSendMessage(text);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-slate-200 mt-8 overflow-hidden flex flex-col h-[600px] animate-fade-in print:hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              AI 智能修订助手
              <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">Beta</span>
            </h3>
            <p className="text-xs text-slate-500">您可以直接对话修改报表内容，例如：“删除第3行”、“把严重度大于8的标红”</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 p-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <MessageSquare size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium text-base">FMEA 分析已生成</p>
            <p className="text-sm text-slate-400 mt-2 max-w-md">
              您可以对报表不满意的地方进行指令式修改。AI 支持增加列、修改数据、删除行或解释评分逻辑。
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
               <button onClick={() => onSendMessage("请检查所有严重度(S)为10的项目，并给出建议措施")} className="text-xs text-left p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-lg transition-colors shadow-sm">
                 🔍 检查严重度 S=10 的项目
               </button>
               <button onClick={() => onSendMessage("增加一列'成本估算'，并为每行填入预估值")} className="text-xs text-left p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-lg transition-colors shadow-sm">
                 ➕ 增加"成本估算"列
               </button>
               <button onClick={() => onSendMessage("把探测度 D 的评分逻辑解释一下")} className="text-xs text-left p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-lg transition-colors shadow-sm">
                 ❓ 解释探测度评分
               </button>
               <button onClick={() => onSendMessage("将 AP 为 H (高风险) 的行背景标红")} className="text-xs text-left p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-lg transition-colors shadow-sm">
                 🎨 高风险项标红
               </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === ChatRole.USER ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
                msg.role === ChatRole.USER ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white'
              }`}>
                {msg.role === ChatRole.USER ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`rounded-2xl px-5 py-3 text-sm shadow-sm leading-relaxed ${
                msg.role === ChatRole.USER 
                  ? 'bg-white border border-slate-200 text-slate-800 rounded-tr-sm' 
                  : 'bg-white border border-indigo-100 text-slate-700 rounded-tl-sm'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.isUpdate && (
                  <div className="mt-3 pt-2 border-t border-indigo-50 flex items-center gap-2 text-xs text-indigo-600 font-bold bg-indigo-50/50 -mx-5 -mb-3 px-5 py-2 rounded-b-2xl">
                    <RefreshCw size={12} className="animate-spin-once" />
                    已根据指令更新上方 FMEA 报表
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-pulse">
             <div className="flex gap-3 max-w-[80%]">
               <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex-shrink-0 flex items-center justify-center shadow-sm">
                 <Bot size={16} />
               </div>
               <div className="bg-white border border-indigo-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-3">
                 <Loader2 size={18} className="animate-spin text-indigo-600" />
                 <span className="text-sm text-slate-500 font-medium">AI 正在思考并处理数据...</span>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="输入指令 (如：增加一行关于X失效的分析，删除第2行...)"
            className="flex-1 pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-shadow shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400">AI 内容由大模型生成，请仔细核对。</span>
        </div>
      </div>
    </div>
  );
};
