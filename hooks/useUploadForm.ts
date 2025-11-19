'use client';

import { useState, useCallback } from 'react';
import { EnglishLevel, FileValidationResult, FileValidationOptions } from '@/types/upload';

// 文件验证配置
const FILE_VALIDATION_OPTIONS: FileValidationOptions = {
  maxSizeMB: 20,
  allowedTypes: ['application/pdf'],
};

/**
 * 验证文件
 */
function validateFile(file: File): FileValidationResult {
  // 检查文件类型
  if (!FILE_VALIDATION_OPTIONS.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '仅支持 PDF 格式文件',
    };
  }

  // 检查文件大小
  const maxSizeBytes = FILE_VALIDATION_OPTIONS.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `文件大小不能超过 ${FILE_VALIDATION_OPTIONS.maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * 上传表单 Hook
 */
export function useUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [level, setLevel] = useState<EnglishLevel>('intermediate');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback((file: File | null) => {
    // 清除之前的错误
    setError(null);

    // 如果没有文件（清除操作），直接设置为 null
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // 验证文件
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || '文件验证失败');
      setSelectedFile(null);
      return;
    }

    // 设置有效文件
    setSelectedFile(file);
  }, []);

  /**
   * 处理水平选择
   */
  const handleLevelChange = useCallback((newLevel: EnglishLevel) => {
    setLevel(newLevel);
  }, []);

  /**
   * 处理表单提交
   */
  const handleSubmit = useCallback(async () => {
    // 验证是否已选择文件
    if (!selectedFile) {
      setError('请先选择 PDF 文件');
      return;
    }

    // 设置上传状态
    setIsUploading(true);
    setError(null);

    try {
      // TODO: 实现实际的上传逻辑
      // 这里先模拟上传过程
      console.log('开始上传:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        level,
      });

      // 模拟上传延迟
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 上传成功后的处理
      console.log('上传成功');
      
      // TODO: 跳转到分析页面
      // router.push(`/analyze/${paperId}`);
    } catch (err) {
      // 处理错误
      const errorMessage = err instanceof Error ? err.message : '上传失败，请重试';
      setError(errorMessage);
      console.error('上传错误:', err);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, level]);

  /**
   * 是否可以提交
   */
  const canSubmit = selectedFile !== null && !isUploading;

  return {
    selectedFile,
    level,
    isUploading,
    error,
    handleFileSelect,
    handleLevelChange,
    handleSubmit,
    canSubmit,
  };
}

