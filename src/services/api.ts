import { ChatResponse, ApiError } from '../types/chat';

/**
 * AI聊天API服务类
 * 负责与Cloudflare Worker后端通信，发送用户消息并接收AI回复
 * 支持GraphQL格式的API调用
 */

// Cloudflare Worker API地址
const API_BASE_URL = 'https://ai-chat-woker.fyq990503.workers.dev';

export class ChatAPI {
  /**
   * 测试API连接状态
   * 发送GraphQL schema查询来验证服务器连接
   * @returns Promise<boolean> 连接是否成功
   */
  static async testConnection(): Promise<boolean> {
    try {
      // 发送一个简单的GraphQL查询来测试连接
      const testQuery = {
        query: `query TestConnection { 
          __schema { 
            queryType { 
              name 
            } 
          } 
        }`
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testQuery),
      });
      
      // 即使GraphQL schema查询失败，只要能连接上服务器就算成功
      return response.status < 500;
    } catch (error) {
      console.log('连接测试失败:', error);
      return false;
    }
  }


  /**
   * 发送聊天消息到AI
   * 构建GraphQL查询并发送到Worker后端
   * @param message 用户输入的消息
   * @returns Promise<ChatResponse> AI的回复
   */
  static async sendMessage(message: string): Promise<ChatResponse> {
    try {
      // 构建GraphQL查询
      const graphqlQuery = {
        query: `
          query ChatQuery($messages: [MessageInput!]!, $model: String, $maxTokens: Int, $temperature: Float) {
            chat(messages: $messages, model: $model, maxTokens: $maxTokens, temperature: $temperature) {
              id
              model
              choices {
                message {
                  role
                  content
                }
                finishReason
                index
              }
              usage {
                promptTokens
                completionTokens
                totalTokens
              }
              created
            }
          }
        `,
        variables: {
          messages: [
            { role: "user", content: message }
          ],
          model: "gpt-4o-mini",
          maxTokens: 1024,
          temperature: 0.7
        }
      };

      console.log('🚀 发送 GraphQL 请求:', graphqlQuery);

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphqlQuery),
      });

      console.log('📥 API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new ApiError({
          message: `API request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
          status: response.status,
        });
      }

      const responseData = await response.json();
      console.log('✅ GraphQL Response Data:', responseData);

      // 处理GraphQL响应
      if (responseData.errors) {
        throw new ApiError({
          message: `GraphQL Error: ${responseData.errors.map((e: any) => e.message).join(', ')}`,
        });
      }

      if (responseData.data?.chat?.choices?.[0]?.message?.content) {
        return {
          message: responseData.data.chat.choices[0].message.content
        };
      } else {
        throw new ApiError({
          message: '未收到有效的AI回复',
        });
      }

    } catch (error) {
      console.error('🔥 发送消息失败:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        message: error instanceof Error ? error.message : '网络错误',
      });
    }
  }

  /**
   * 发送流式聊天消息（模拟）
   * 由于当前Worker不支持真正的流式响应，这里模拟实现
   * @param message 用户输入的消息
   * @param onChunk 接收消息片段的回调
   * @param onComplete 完成时的回调
   * @param onError 错误时的回调
   */
  static async sendMessageStream(
    message: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: ApiError) => void
  ): Promise<void> {
    try {
      // 对于当前的GraphQL Worker，流式响应需要特殊处理
      // 这里先调用普通的sendMessage，然后模拟流式输出
      const response = await this.sendMessage(message);
      
      // 直接返回完整结果，不模拟打字机效果
      // 因为前端的ChatContainer已经有打字机效果处理
      onChunk(response.message);
      onComplete();
    } catch (error) {
      if (error instanceof ApiError) {
        onError(error);
      } else {
        onError(new ApiError({
          message: error instanceof Error ? error.message : '网络错误',
        }));
      }
    }
  }
}


