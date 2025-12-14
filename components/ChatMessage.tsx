import React from 'react';
import { Message } from '../types';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'model';

  // Basic formatting for markdown-like display without heavy libraries
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold handling
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} className="min-h-[1.2em] mb-1">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-hero-cyan font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isBot ? 'bg-hero-purple' : 'bg-hero-blue'} shadow-lg shadow-hero-purple/20`}>
          {isBot ? <Bot className="text-white w-6 h-6" /> : <User className="text-white w-6 h-6" />}
        </div>

        {/* Bubble */}
        <div className={`mx-3 p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-md ${
          isBot 
            ? 'bg-slate-800 text-gray-200 rounded-tl-none border border-slate-700' 
            : 'bg-hero-blue text-white rounded-tr-none'
        }`}>
          {message.isThinking ? (
            <div className="flex items-center space-x-2 animate-pulse">
              <div className="w-2 h-2 bg-hero-cyan rounded-full"></div>
              <div className="w-2 h-2 bg-hero-cyan rounded-full delay-75"></div>
              <div className="w-2 h-2 bg-hero-cyan rounded-full delay-150"></div>
            </div>
          ) : (
             <div className="font-mono">{formatText(message.text)}</div>
          )}
        </div>
      </div>
    </div>
  );
};
