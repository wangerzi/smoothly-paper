/**
 * 全局常量定义
 */

// 文件上传限制
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const ALLOWED_FILE_TYPES = ['application/pdf'];

// 用户水平定义
export const USER_LEVELS = {
  beginner: {
    label: '初级',
    icon: '🌱',
    description: '3K词汇量',
    vocabularySize: 3000,
  },
  intermediate: {
    label: '中级',
    icon: '🌿',
    description: '5K词汇量',
    vocabularySize: 5000,
  },
  advanced: {
    label: '高级',
    icon: '🌲',
    description: '8K+词汇',
    vocabularySize: 8000,
  },
} as const;

// AI 模型配置
export const AI_CONFIG = {
  model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4096'),
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3'),
};

// 数据库配置
export const DB_CONFIG = {
  path: process.env.DATABASE_PATH || './data/papers.db',
};

// 上传配置
export const UPLOAD_CONFIG = {
  directory: process.env.UPLOAD_DIR || './data/uploads',
  maxSize: parseInt(process.env.MAX_FILE_SIZE || String(MAX_FILE_SIZE)),
};

// 分析状态步骤
export const ANALYSIS_STEPS = [
  { key: 'extracting', label: '提取文本', weight: 20 },
  { key: 'summarizing', label: '生成总结', weight: 20 },
  { key: 'segmenting', label: '智能分段', weight: 20 },
  { key: 'annotating', label: '难点分析', weight: 40 },
] as const;

// 错误代码
export const ERROR_CODES = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  PDF_PARSE_FAILED: 'PDF_PARSE_FAILED',
  AI_REQUEST_FAILED: 'AI_REQUEST_FAILED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  [ERROR_CODES.FILE_TOO_LARGE]: '文件大小超过 20MB 限制',
  [ERROR_CODES.INVALID_FILE_TYPE]: '仅支持 PDF 格式文件',
  [ERROR_CODES.UPLOAD_FAILED]: '文件上传失败，请重试',
  [ERROR_CODES.PDF_PARSE_FAILED]: 'PDF 解析失败，请确保文件未损坏或加密',
  [ERROR_CODES.AI_REQUEST_FAILED]: 'AI 分析失败，请稍后重试',
  [ERROR_CODES.DATABASE_ERROR]: '数据库操作失败',
  [ERROR_CODES.NOT_FOUND]: '资源不存在',
  [ERROR_CODES.INTERNAL_ERROR]: '服务器内部错误',
} as const;

