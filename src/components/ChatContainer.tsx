import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Message } from '../types/chat';
import { ChatAPI } from '../services/api';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Trash2, RefreshCw } from 'lucide-react';

export const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAssistantMessageRef = useRef<string>('');

  // 测试 API 连接
  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await ChatAPI.testConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        if (!isConnected) {
          setError('无法连接到 AI 服务，请检查网络连接或稍后再试。');
        }
      } catch {
        setConnectionStatus('disconnected');
        setError('无法连接到 AI 服务，请检查网络连接或稍后再试。');
      }
    };
    testConnection();
  }, []);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content,
        };
      }
      return newMessages;
    });
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (isLoading || isGenerating) return;

    setError(null);
    addMessage({ role: 'user', content });
    setIsLoading(true);
    setIsGenerating(true);

    // Add empty assistant message for streaming
    const assistantMessageId = addMessage({ role: 'assistant', content: '' });
    currentAssistantMessageRef.current = '';

    try {
      // 首先尝试流式 API
      await ChatAPI.sendMessageStream(
        content,
        (chunk: string) => {
          currentAssistantMessageRef.current += chunk;
          updateLastMessage(currentAssistantMessageRef.current);
        },
        () => {
          setIsLoading(false);
          setIsGenerating(false);
        },
        async (error) => {
          console.warn('流式API失败，尝试非流式API:', error.message);
          // 如果流式API失败，尝试非流式API
          try {
            const response = await ChatAPI.sendMessage(content);
            updateLastMessage(response.message || '抱歉，我无法处理您的请求。');
            setIsLoading(false);
            setIsGenerating(false);
          } catch (fallbackError) {
            setError(fallbackError instanceof Error ? fallbackError.message : '发送消息时出错');
            setIsLoading(false);
            setIsGenerating(false);
            // Remove the empty assistant message on error
            setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
          }
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送消息时出错');
      setIsLoading(false);
      setIsGenerating(false);
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    }
  }, [isLoading, isGenerating, addMessage, updateLastMessage]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setIsGenerating(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(() => {
    if (messages.length >= 2) {
      const lastUserMessage = messages[messages.length - 2];
      if (lastUserMessage.role === 'user') {
        // Remove the last assistant message and retry
        setMessages(prev => prev.slice(0, -1));
        handleSendMessage(lastUserMessage.content);
      }
    }
  }, [messages, handleSendMessage]);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex flex-col flex-1 max-w-4xl mx-auto bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold text-gray-900">AI Chat Molly</h1>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'disconnected' ? 'bg-red-500' :
                  'bg-yellow-500 animate-pulse'
                }`} title={
                  connectionStatus === 'connected' ? '已连接' :
                  connectionStatus === 'disconnected' ? '连接失败' :
                  '连接中...'
                }></div>
              </div>
              <p className="text-sm text-gray-600">
                智能对话助手 {connectionStatus === 'disconnected' && '(离线)'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {messages.length > 0 && (
                <>
                  <button
                    onClick={retryLastMessage}
                    disabled={isLoading || messages.length < 2}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="重试最后一条消息"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={clearChat}
                    disabled={isLoading}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="清空对话"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-red-800 flex-1">
                <p className="font-medium">发生错误:</p>
                <p className="text-sm">{error}</p>
                <p className="text-xs mt-2 text-red-600">
                  💡 提示：请打开开发者工具的 Console 标签页查看详细的调试信息
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-red-600 hover:text-red-800"
                title="关闭错误提示"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <MessageList messages={messages} isTyping={isLoading && !isGenerating} />

        {/* Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isLoading || connectionStatus === 'disconnected'}
          onStop={handleStop}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};
