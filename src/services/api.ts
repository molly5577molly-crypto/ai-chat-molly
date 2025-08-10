import { ChatResponse, ApiError } from '../types/chat';

// 修正URL拼写 (woker -> worker)
const API_BASE_URL = 'https://ai-chat-worker.fyq990503.workers.dev';

export class ChatAPI {
  // 测试 API 连接 - GraphQL 格式
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
          model: "gpt-3.5-turbo",
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
      
      // 模拟打字机效果
      const content = response.message;
      const chunks = content.split('');
      
      for (let i = 0; i < chunks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20)); // 20ms延迟
        onChunk(chunks.slice(0, i + 1).join(''));
      }
      
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


