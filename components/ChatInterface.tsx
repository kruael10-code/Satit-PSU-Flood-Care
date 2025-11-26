import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, LifeBuoy } from 'lucide-react';
import { getFloodAdvice } from '../services/geminiService';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'สวัสดีครับ ผมเป็นผู้ช่วยอัจฉริยะ หากต้องการคำแนะนำเรื่องความปลอดภัยจากน้ำท่วม หรือเบอร์โทรฉุกเฉิน ถามได้เลยครับ' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Convert internal message format to Gemini history format
    const history = newMessages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const response = await getFloodAdvice(history, input);
    
    setMessages([...newMessages, { role: 'model', text: response || 'ขออภัย ระบบขัดข้องชั่วคราว' }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-md mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden mt-4">
      <div className="bg-blue-600 p-4 text-white flex items-center gap-2">
        <LifeBuoy size={24} />
        <div>
            <h3 className="font-bold">ปรึกษาผู้ช่วย</h3>
            <p className="text-xs text-blue-100">AI แนะนำความปลอดภัย</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'}`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border shadow-sm rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white border p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-400">
                กำลังพิมพ์...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="พิมพ์คำถามที่นี่..."
          className="flex-1 p-2 border border-gray-300 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;