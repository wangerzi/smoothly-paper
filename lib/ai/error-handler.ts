/**
 * AI 服务错误处理工具
 * 提供统一的错误处理和用户友好的错误消息
 */

import { DoubaoAPIError } from './doubao';

/** 错误类型 */
export enum ErrorType {
  API_KEY_MISSING = 'API_KEY_MISSING',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/** 用户友好的错误信息 */
export interface FriendlyError {
  type: ErrorType;
  message: string;
  suggestion: string;
  canRetry: boolean;
}

/**
 * 将错误转换为用户友好的信息
 */
export function formatErrorForUser(error: unknown): FriendlyError {
  // API Key 缺失
  if (error instanceof Error && error.message.includes('豆包 API 密钥未配置')) {
    return {
      type: ErrorType.API_KEY_MISSING,
      message: 'AI 服务未配置',
      suggestion: '请在 .env.local 文件中配置 DOUBAO_API_KEY',
      canRetry: false,
    };
  }

  // 豆包 API 错误
  if (error instanceof DoubaoAPIError) {
    // 速率限制
    if (error.isRateLimitError) {
      return {
        type: ErrorType.RATE_LIMIT,
        message: 'AI 服务请求频率超限',
        suggestion: '请稍等片刻后重试，或考虑降低并发请求数量',
        canRetry: true,
      };
    }

    // 超时
    if (error.statusCode === 408 || error.errorType === 'timeout') {
      return {
        type: ErrorType.TIMEOUT,
        message: 'AI 服务响应超时',
        suggestion: '请检查网络连接，或稍后重试',
        canRetry: true,
      };
    }

    // 服务器错误
    if (error.statusCode >= 500) {
      return {
        type: ErrorType.SERVER_ERROR,
        message: 'AI 服务暂时不可用',
        suggestion: 'AI 服务提供商可能正在维护，请稍后重试',
        canRetry: true,
      };
    }

    // 其他 API 错误
    return {
      type: ErrorType.SERVER_ERROR,
      message: `AI 服务错误: ${error.message}`,
      suggestion: '请检查 API 配置或联系管理员',
      canRetry: error.isRetryable,
    };
  }

  // JSON 解析错误
  if (error instanceof Error && error.message.includes('JSON')) {
    return {
      type: ErrorType.INVALID_RESPONSE,
      message: 'AI 返回的数据格式异常',
      suggestion: '这可能是临时问题，请重试。如果问题持续，请联系管理员',
      canRetry: true,
    };
  }

  // 网络错误
  if (error instanceof Error && (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.name === 'TypeError'
  )) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: '网络连接失败',
      suggestion: '请检查网络连接，确保可以访问 API 服务',
      canRetry: true,
    };
  }

  // 未知错误
  return {
    type: ErrorType.UNKNOWN,
    message: error instanceof Error ? error.message : '未知错误',
    suggestion: '请重试，如果问题持续，请联系管理员',
    canRetry: true,
  };
}

/**
 * 记录错误到控制台（带格式化）
 */
export function logError(context: string, error: unknown): void {
  const friendlyError = formatErrorForUser(error);
  
  console.error(`[AI Error] ${context}`);
  console.error(`  类型: ${friendlyError.type}`);
  console.error(`  消息: ${friendlyError.message}`);
  console.error(`  建议: ${friendlyError.suggestion}`);
  console.error(`  可重试: ${friendlyError.canRetry ? '是' : '否'}`);
  
  if (error instanceof Error) {
    console.error(`  原始错误: ${error.stack || error.message}`);
  }
}

/**
 * 检查错误是否致命（不可恢复）
 */
export function isFatalError(error: unknown): boolean {
  const friendlyError = formatErrorForUser(error);
  return friendlyError.type === ErrorType.API_KEY_MISSING;
}

/**
 * 获取重试延迟时间（毫秒）
 */
export function getRetryDelay(attemptNumber: number): number {
  // 指数退避：1s, 2s, 4s, 8s, ...
  return Math.min(Math.pow(2, attemptNumber) * 1000, 30000); // 最多 30 秒
}

/**
 * 安全执行函数，带错误处理
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  context: string,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logError(context, error);
    return fallback;
  }
}

/**
 * 带降级的执行函数
 */
export async function executeWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    logError(`${context} (主方案失败，使用降级方案)`, error);
    return await fallback();
  }
}


