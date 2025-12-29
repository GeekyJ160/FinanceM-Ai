import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { sendMessageToMonkey } from '../services/geminiService';
import { ChatMessage } from '../types';

const MAX_CHARS = 500;

export const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'monkey',
      text: "Yo boss, I'm Finance Monkey. I eat credit bureaus for breakfast and shit out deleted collections. What's getting nuked today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ 
        role: m.sender, 
        content: m.text 
      }));
      
      const responseText = await sendMessageToMonkey(history, userMsg.text);

      const monkeyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'monkey',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, monkeyMsg]);
    } catch (error) {
      console.error("Chat Error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
        setInput(value);
    }
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
       <h2 className="text-3xl md:text-4xl font-black text-white font-mono uppercase mb-6">
        Monkey Brain AI – Ask Me Anything
      </h2>
      
      <div className="flex-1 bg-dark-700 rounded-2xl shadow-2xl flex flex-col border border-monkey/20 overflow-hidden h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'monkey' ? 'bg-gradient-to-br from-monkey to-monkey-dark' : 'bg-blue-600'}`}>
                {msg.sender === 'monkey' ? <span className="text-2xl">🐒</span> : <User size={20} />}
              </div>
              
              <div className={`max-w-[80%] p-4 rounded-2xl text-white ${
                msg.sender === 'monkey' 
                  ? 'bg-gradient-to-br from-monkey to-monkey-dark rounded-tl-none shadow-lg shadow-monkey/20' 
                  : 'bg-blue-600 rounded-tr-none shadow-lg'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                <p className="text-xs opacity-50 mt-2 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-monkey to-monkey-dark flex items-center justify-center shrink-0">
                  <span className="text-2xl">🐒</span>
               </div>
               <div className="bg-gradient-to-br from-monkey to-monkey-dark p-4 rounded-2xl rounded-tl-none text-white w-24">
                  <div className="flex gap-1 justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-dark-800 border-t border-monkey/30">
          <div className="flex gap-4">
            <div className="relative flex-1">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about taxes, credit, disputes..."
                    className="w-full bg-dark-900 border-2 border-monkey/30 rounded-xl pl-6 pr-20 py-4 text-white placeholder-gray-500 focus:border-monkey outline-none transition-colors"
                    disabled={isTyping}
                />
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono transition-colors ${
                    input.length >= MAX_CHARS ? 'text-red-500 font-bold' : 'text-gray-500'
                }`}>
                    {input.length}/{MAX_CHARS}
                </div>
            </div>
            <button
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="bg-monkey hover:bg-monkey-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 rounded-xl font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-monkey/25 flex items-center gap-2"
            >
              SEND <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};