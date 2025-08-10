import React, { useState, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  onStop?: () => void;
  isGenerating?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  onStop,
  isGenerating = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? '正在生成回复...' : '输入消息... (Shift+Enter 换行)'}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{
              minHeight: '48px',
              maxHeight: '120px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
        </div>
        {isGenerating ? (
          <button
            onClick={handleStop}
            className="flex-shrink-0 rounded-lg bg-red-500 p-3 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            title="停止生成"
          >
            <Square className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="flex-shrink-0 rounded-lg bg-primary-500 p-3 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="发送消息"
          >
            <Send className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
