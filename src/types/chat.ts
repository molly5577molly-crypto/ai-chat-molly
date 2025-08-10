export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

export class ApiError extends Error {
  status?: number;
  
  constructor(config: { message: string; status?: number }) {
    super(config.message);
    this.name = 'ApiError';
    this.status = config.status;
  }
}
