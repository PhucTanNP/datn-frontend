'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Zap, BrainCircuit, ChevronDown } from 'lucide-react';
import api from '@/lib/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  actions?: { label: string; value: string }[];
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: '👋 Chào bạn! Tôi là trợ lý AI của <strong>DRC Tires</strong>.<br/><br/>Tôi có thể giúp gì cho bạn?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'fast' | 'deep'>('fast');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [touchStart, setTouchStart] = useState(0);

  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input khi mở chat
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Khóa scroll body khi mở chat trên mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const res = await api.post('/api/v1/chat', {
        message: msg,
        history: messages.slice(-6),
        mode: mode,
      });
      const reply = res.data.data;
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: reply.text,
        actions: reply.actions,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: '❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (value: string) => {
    sendMessage(value);
  };

  return (
    <>
      {/* Nút mở chat */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Đóng chat' : 'Mở chat'}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 active:scale-90 ${
          open
            ? 'bg-gray-800 rotate-90 scale-90'
            : 'bg-red-600 hover:bg-red-700 hover:scale-110'
        }`}
      >
        {open ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
      </button>

      {/* Overlay tối trên mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:bg-transparent md:pointer-events-none"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Chat window — full mobile, floating desktop */}
      {open && (
        <div
          className={[
            'fixed z-50 flex flex-col bg-white shadow-2xl border border-gray-100 overflow-hidden',
            // Mobile: fullscreen từ dưới lên, chiếm 85% màn hình
            'inset-x-0 bottom-0 top-[15%] md:top-auto rounded-t-3xl md:rounded-3xl',
            'animate-slide-up md:animate-fade-up',
            // Desktop: floating góc phải
            'md:bottom-24 md:right-6 md:left-auto',
            'md:w-[400px] md:h-[600px] md:max-w-[calc(100vw-2rem)] md:max-h-[calc(100vh-200px)]',
            // Safe area cho iPhone notch
            'pb-safe-or-2',
          ].join(' ')}
          // Swipe down để đóng trên mobile
          onTouchStart={(e) => setTouchStart(e.touches[0].clientY)}
          onTouchEnd={(e) => {
            const delta = e.changedTouches[0].clientY - touchStart;
            if (delta > 100) setOpen(false);
          }}
        >
          {/* Thanh kéo (chỉ mobile) */}
          <div className="flex justify-center pt-2 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-3 md:py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">DRC AI Assistant</p>
              <p className="text-xs text-red-100">Hỗ trợ 24/7</p>
            </div>
            {/* Nút close trên desktop */}
            <button
              onClick={() => setOpen(false)}
              className="hidden md:flex p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronDown size={20} className="text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-4 space-y-4 bg-gray-50/50 overscroll-contain">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${i > 0 ? 'animate-fade-in' : ''}`}
              >
                <div
                  className={`${
                    msg.role === 'user' ? 'max-w-[88%] md:max-w-[80%]' : 'max-w-[96%] md:max-w-[88%]'
                  } rounded-2xl px-5 py-3.5 md:px-4 md:py-3 ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white rounded-br-md'
                      : 'bg-white border border-gray-100 shadow-sm rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div
                      className="text-[15px] md:text-base whitespace-pre-line leading-[1.7] [&_strong]:font-bold [&_em]:italic [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5 [&_table]:w-full [&_table]:text-[13px] [&_th]:bg-gray-100 [&_th]:p-2.5 [&_td]:p-2.5 [&_td]:border [&_th]:border [&_td]:border-gray-200 [&_th]:border-gray-200 [&_table]:border-collapse [&_table]:my-3 [&_table]:block [&_table]:overflow-x-auto [&_table]:whitespace-nowrap [&_table]:rounded-lg"
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                  ) : (
                    <p className="text-[15px] md:text-base whitespace-pre-line leading-[1.6]">{msg.text}</p>
                  )}

                  {/* Action buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.actions.map((action, j) => (
                        <button
                          key={j}
                          onClick={() => handleAction(action.value)}
                          className="text-sm md:text-xs font-semibold bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-4 py-2 md:px-3 md:py-1.5 rounded-full transition-colors active:scale-95"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin text-red-600" />
                    <span className="text-xs text-gray-400">
                      {mode === 'deep' ? '🧠 Deep mode...' : '⚡ Fast mode...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 bg-white flex-shrink-0 pb-safe-or-3">
            <div className="flex items-center gap-1.5">
              <select
                value={mode}
                onChange={e => setMode(e.target.value as 'fast' | 'deep')}
                className="text-[10px] bg-white rounded-md px-1.5 py-2 outline-none border border-gray-200 cursor-pointer text-gray-500 font-medium flex-shrink-0"
              >
                <option value="fast">⚡ Fast</option>
                <option value="deep">🧠 Deep</option>
              </select>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                rows={1}
                className="flex-1 bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 border border-transparent focus:border-red-300 transition-all resize-none overflow-y-auto max-h-32"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90 flex-shrink-0"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframes cho animation */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .pb-safe-or-2 {
          padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 0.5rem));
        }
        .pb-safe-or-3 {
          padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0.75rem));
        }
      `}</style>
    </>
  );
}
