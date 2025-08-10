import React, { useEffect, useRef } from 'react';
import { Message } from '../types/chat';
import { User, Bot } from 'lucide-react';
import { MarkdownMessage } from './MarkdownMessage';

/**
 * 消息列表组件
 * 显示聊天消息列表，支持用户消息和AI助手消息的不同样式
 * AI消息支持Markdown、数学公式、代码高亮等富文本渲染
 */
interface MessageListProps {
  messages: Message[];     // 消息列表
  isTyping?: boolean;      // 是否显示输入中状态
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  // 用于自动滚动到最新消息的引用
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 当消息列表更新时，自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* 空状态：当没有消息时显示欢迎界面 */}
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Bot className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-lg font-medium">欢迎使用 AI Chat Molly</p>
            <p className="text-sm mt-2">开始对话吧！我是您的 AI 助手。</p>
          </div>
        </div>
      ) : (
        <>
          {/* 消息列表渲染 */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* 头像 */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              
              {/* 消息内容 */}
              <div
                className={`flex-1 max-w-3xl ${
                  message.role === 'user' ? 'text-right' : ''
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.role === 'user' ? (
                    // 用户消息：保持简单格式，支持换行
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  ) : (
                    // AI消息：使用Markdown渲染器，支持富文本格式
                    <MarkdownMessage 
                      content={message.content} 
                      className="prose prose-sm max-w-none"
                    />
                  )}
                </div>
                
                {/* 时间戳 */}
                <div
                  className={`text-xs text-gray-500 mt-1 ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {/* 输入中状态指示器 */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 max-w-3xl">
                <div className="inline-block p-3 rounded-lg bg-white text-gray-800 border border-gray-200">
                  {/* 动画点点点效果 */}
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* 自动滚动锚点 */}
      <div ref={messagesEndRef} />
    </div>
  );
};
