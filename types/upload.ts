/**
 * 上传模块类型定义
 */

// 用户英语水平
export type EnglishLevel = 'beginner' | 'intermediate' | 'advanced';

// 水平选项配置
export interface LevelOption {
  value: EnglishLevel;
  label: string;
  description: string;
  icon: string;
}

// 上传表单状态
export interface UploadFormState {
  selectedFile: File | null;
  level: EnglishLevel;
  isUploading: boolean;
  error: string | null;
}

// 文件验证结果
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// 文件验证选项
export interface FileValidationOptions {
  maxSizeMB: number;
  allowedTypes: string[];
}

