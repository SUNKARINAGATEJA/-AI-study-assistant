import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, SubjectCategory } from '../types/study';
import { sendChatApi } from '../services/api';
import { BrainCircuit, Send, Sparkles, User, Bot, Loader2, BookmarkCheck, Lightbulb } from 'lucide-react';

interface AITutorChatProps {
  noteTitle: string;
  noteContent: string;
  subject: SubjectCategory;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({ noteTitle, noteContent, subject }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your StudyMind AI Tutor. I'm ready to answer any questions about "${noteTitle}". Ask me to clarify concepts, test your knowledge, or generate real-world analogies!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const reply = await sendChatApi(query, noteContent, history);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I encountered an error: ${err.message || 'Unable to connect to AI tutor.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Give me a real-world analogy for this note',
    'Generate 3 fill-in-the-blank practice questions',
    'What are the top 3 trick questions on an exam?',
    'Explain the most difficult concept step-by-step'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/80 flex items-center justify-center shrink-0">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">
              AI Study Tutor
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[250px]">Active Context: {noteTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Thread Box */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl h-[480px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800/80 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-1.5 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1 mb-1 text-[10px] font-mono text-slate-300">
                  <span>{msg.role === 'user' ? 'You' : 'StudyMind AI Tutor'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/80 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800/80 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs italic flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Thinking & referencing notes...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="px-3 py-1 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors whitespace-nowrap flex items-center gap-1 shrink-0"
              >
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about your study notes..."
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
