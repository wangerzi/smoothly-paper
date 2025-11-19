/**
 * 豆包 AI API 客户端
 * 封装与豆包（Doubao）API 的交互逻辑
 */

import { z } from 'zod';

// ============================================================================
// 类型定义
// ============================================================================

/** 豆包 API 配置 */
export interface DoubaoConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout?: number;
  maxRetries?: number;
}

/** 消息角色 */
export type MessageRole = 'system' | 'user' | 'assistant';

/** 对话消息 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/** API 请求参数 */
export interface DoubaoRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

/** API 响应（成功） */
export interface DoubaoResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/** API 错误响应 */
export interface DoubaoError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

// ============================================================================
// 配置管理
// ============================================================================

/** 获取豆包配置（从环境变量） */
export function getDoubaoConfig(): DoubaoConfig {
  const apiKey = process.env.DOUBAO_API_KEY;
  const baseUrl = process.env.DOUBAO_API_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  const model = process.env.DOUBAO_MODEL || 'doubao-seed-1-6-flash-250828';

  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error(
      '豆包 API 密钥未配置。请在 .env.local 文件中设置 DOUBAO_API_KEY'
    );
  }

  return {
    apiKey,
    baseUrl,
    model,
    timeout: 120000, // 120 秒超时
    maxRetries: 3,
  };
}

// ============================================================================
// 核心 API 调用
// ============================================================================

/**
 * 调用豆包 API
 * @param messages 对话消息列表
 * @param options 可选配置（覆盖默认配置）
 */
export async function callDoubao(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
): Promise<string> {
  const config = getDoubaoConfig();
  
  const requestBody: DoubaoRequest = {
    model: options?.model || config.model,
    messages,
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens ?? 4096,
    top_p: 0.9,
    stream: false,
  };

  // 带重试的 API 调用
  return await callWithRetry(
    () => performRequest(config, requestBody),
    config.maxRetries || 3
  );
}

/**
 * 执行单次 API 请求
 */
async function performRequest(
  config: DoubaoConfig,
  body: DoubaoRequest
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 处理 HTTP 错误
    if (!response.ok) {
      const errorData: DoubaoError = await response.json().catch(() => ({
        error: { message: '未知错误', type: 'unknown' },
      }));

      throw new DoubaoAPIError(
        errorData.error.message || `API 请求失败: ${response.status}`,
        response.status,
        errorData.error.type
      );
    }

    // 解析响应
    const data: DoubaoResponse = await response.json();

    // 提取返回的内容
    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content;
      
      // 记录 token 使用情况
      if (data.usage) {
        console.log(
          `[Doubao API] Tokens - Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens}, Total: ${data.usage.total_tokens}`
        );
      }

      return content;
    }

    throw new Error('API 响应格式错误：缺少 choices');
  } catch (error) {
    clearTimeout(timeoutId);

    // 超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      throw new DoubaoAPIError('请求超时', 408, 'timeout');
    }

    // 重新抛出
    throw error;
  }
}

// ============================================================================
// 错误处理和重试
// ============================================================================

/** 自定义 API 错误类 */
export class DoubaoAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorType: string
  ) {
    super(message);
    this.name = 'DoubaoAPIError';
  }

  /** 是否为速率限制错误 */
  get isRateLimitError(): boolean {
    return this.statusCode === 429;
  }

  /** 是否为可重试错误 */
  get isRetryable(): boolean {
    return (
      this.statusCode === 429 || // 速率限制
      this.statusCode === 408 || // 超时
      this.statusCode >= 500     // 服务器错误
    );
  }
}

/**
 * 带指数退避的重试机制
 */
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  retryCount = 0
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // 检查是否可以重试
    const shouldRetry =
      error instanceof DoubaoAPIError &&
      error.isRetryable &&
      retryCount < maxRetries;

    if (!shouldRetry) {
      throw error;
    }

    // 计算退避时间（指数增长：1s, 2s, 4s）
    const backoffMs = Math.pow(2, retryCount) * 1000;
    
    console.warn(
      `[Doubao API] 请求失败，${backoffMs}ms 后进行第 ${retryCount + 1} 次重试...`
    );

    await new Promise((resolve) => setTimeout(resolve, backoffMs));

    return callWithRetry(fn, maxRetries, retryCount + 1);
  }
}

// ============================================================================
// 便捷函数
// ============================================================================

/**
 * 调用豆包 API（单轮对话）
 */
export async function callDoubaoSingle(
  prompt: string,
  options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const messages: ChatMessage[] = [];

  if (options?.systemPrompt) {
    messages.push({
      role: 'system',
      content: options.systemPrompt,
    });
  }

  messages.push({
    role: 'user',
    content: prompt,
  });

  return callDoubao(messages, {
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
  });
}

/**
 * 调用豆包 API 并解析 JSON 响应
 */
export async function callDoubaoJSON<T = any>(
  prompt: string,
  options?: {
    systemPrompt?: string;
    schema?: z.ZodSchema<T>;
    maxTokens?: number;
  }
): Promise<T> {
  // 在 system prompt 中要求返回 JSON
  const systemPrompt = `${options?.systemPrompt || ''}\n\n请以 JSON 格式返回结果，不要包含任何其他文本。`;

  const response = await callDoubaoSingle(prompt, {
    systemPrompt,
    temperature: 0.3,
    maxTokens: options?.maxTokens,
  });

  // 提取 JSON（处理可能的 Markdown 代码块）
  const jsonText = extractJSON(response);

  // 解析 JSON
  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`JSON 解析失败: ${error instanceof Error ? error.message : '未知错误'}\n原始响应: ${response.slice(0, 200)}...`);
  }

  // 使用 Zod 验证（如果提供了 schema）
  if (options?.schema) {
    const result = options.schema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`JSON 验证失败: ${result.error.message}`);
    }
    return result.data;
  }

  return parsed as T;
}

/**
 * 从文本中提取 JSON（处理 Markdown 代码块）
 */
function extractJSON(text: string): string {
  // 尝试提取 Markdown JSON 代码块
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // 尝试找到第一个 { 和最后一个 }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  // 尝试找到第一个 [ 和最后一个 ]（数组）
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');

  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return text.slice(firstBracket, lastBracket + 1);
  }

  // 如果都找不到，返回原文
  return text.trim();
}

// ============================================================================
// 并发控制
// ============================================================================

/**
 * 并发限制器
 */
export class ConcurrencyLimiter {
  private queue: Array<() => void> = [];
  private running = 0;

  constructor(private maxConcurrency: number) {}

  /**
   * 执行函数（受并发限制）
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    // 等待空闲槽位
    while (this.running >= this.maxConcurrency) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    // 执行函数
    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      // 唤醒队列中的下一个
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

/**
 * 创建并发限制器（默认 10 个并发）
 */
export function createLimiter(maxConcurrency = 10): ConcurrencyLimiter {
  return new ConcurrencyLimiter(maxConcurrency);
}

