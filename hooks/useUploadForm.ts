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
      // 创建 FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('level', level);

      // 调用上传 API
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || '上传失败');
      }

      const uploadResult = await uploadResponse.json();
      const { paperId } = uploadResult;

      console.log('上传成功:', uploadResult);

      // 触发 AI 分析
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paperId }),
      });

      if (!analyzeResponse.ok) {
        throw new Error('启动分析失败');
      }

      console.log('分析已启动');

      // 跳转到处理页面
      window.location.href = `/processing/${paperId}`;
    } catch (err) {
      // 处理错误
      const errorMessage = err instanceof Error ? err.message : '上传失败，请重试';
      setError(errorMessage);
      console.error('上传错误:', err);
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

