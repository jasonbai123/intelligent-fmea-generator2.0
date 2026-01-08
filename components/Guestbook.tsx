import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Send, Trash2, Crown } from 'lucide-react';

interface GuestbookEntry {
  id: string;
  name: string;
  contact?: string;
  message: string;
  timestamp: number;
  isAdmin?: boolean;
}

const INITIAL_ENTRIES: GuestbookEntry[] = [
  {
    id: 'admin-welcome',
    name: 'Jasonbai (Designer)',
    contact: 'WeChat: jasonbai 13510420462',
    message: '欢迎使用智能 FMEA 生成器！如果您在使用过程中有任何建议、Bug 反馈或定制需求，请在此留言。我会定期查看并优化工具。',
    timestamp: Date.now(),
    isAdmin: true
  }
];

export const Guestbook: React.FC = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('fmea_guestbook');
    if (saved) {
      setEntries(JSON.parse(saved));
    } else {
      setEntries(INITIAL_ENTRIES);
      localStorage.setItem('fmea_guestbook', JSON.stringify(INITIAL_ENTRIES));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newEntry: GuestbookEntry = {
      id: Date.now().toString(),
      name: name.trim(),
      contact: contact.trim(),
      message: message.trim(),
      timestamp: Date.now()
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('fmea_guestbook', JSON.stringify(updatedEntries));

    // Reset form
    setMessage('');
    // Keep name/contact for convenience
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条留言吗？')) {
      const updatedEntries = entries.filter(e => e.id !== id);
      setEntries(updatedEntries);
      localStorage.setItem('fmea_guestbook', JSON.stringify(updatedEntries));
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-10">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="text-indigo-600" />
          留言板 (Guestbook)
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          与设计者 (Jasonbai) 沟通，反馈使用体验或提出改进建议。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="md:col-span-1">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 sticky top-4">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Send size={16} />
              发表留言
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">昵称 / 姓名 *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="怎么称呼您"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">联系方式 (选填)</label>
                <input
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="微信 / 邮箱 / 电话"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">留言内容 *</label>
                <textarea
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="请输入您的建议或反馈..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
              >
                提交留言
              </button>
            </form>
          </div>
        </div>

        {/* Right: List */}
        <div className="md:col-span-2 space-y-4">
          {entries.map(entry => (
            <div 
              key={entry.id} 
              className={`p-5 rounded-xl border transition-all hover:shadow-md ${
                entry.isAdmin 
                  ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                    entry.isAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {entry.isAdmin ? <Crown size={20} /> : <User size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${entry.isAdmin ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {entry.name}
                      </span>
                      {entry.isAdmin && (
                        <span className="px-1.5 py-0.5 bg-indigo-200 text-indigo-700 text-[10px] rounded font-bold">ADMIN</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>
                </div>
                {!entry.isAdmin && (
                  <button 
                    onClick={() => handleDelete(entry.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="删除此条留言 (仅本地)"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              <div className="pl-13 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {entry.message}
              </div>

              {entry.contact && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-semibold">联系方式:</span> {entry.contact}
                </div>
              )}
            </div>
          ))}

          {entries.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              暂无留言，快来抢沙发吧！
            </div>
          )}
        </div>
      </div>
    </div>
  );
};