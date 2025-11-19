/**
 * 阅读功能的 Hook
 * 管理当前阅读段落、进度等状态
 */

'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseReadingProps {
  paperId: string;
  totalParagraphs: number;
  initialParagraphId?: number;
}

export function useReading({
  paperId,
  totalParagraphs,
  initialParagraphId,
}: UseReadingProps) {
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isEyeCareMode, setIsEyeCareMode] = useState(false);

  // 初始化当前段落
  useEffect(() => {
    if (initialParagraphId !== undefined) {
      setCurrentParagraphIndex(initialParagraphId);
    }
  }, [initialParagraphId]);

  // 跳转到指定段落
  const goToParagraph = useCallback((index: number) => {
    if (index >= 0 && index < totalParagraphs) {
      setCurrentParagraphIndex(index);
      
      // 滚动到对应段落
      const element = document.getElementById(`paragraph-${index}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [totalParagraphs]);

  // 上一段
  const previousParagraph = useCallback(() => {
    goToParagraph(currentParagraphIndex - 1);
  }, [currentParagraphIndex, goToParagraph]);

  // 下一段
  const nextParagraph = useCallback(() => {
    goToParagraph(currentParagraphIndex + 1);
  }, [currentParagraphIndex, goToParagraph]);

  // 增加字号
  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.min(prev + 2, 24));
  }, []);

  // 减小字号
  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.max(prev - 2, 12));
  }, []);

  // 切换护眼模式
  const toggleEyeCareMode = useCallback(() => {
    setIsEyeCareMode((prev) => !prev);
  }, []);

  // 计算阅读进度
  const progress = totalParagraphs > 0
    ? ((currentParagraphIndex + 1) / totalParagraphs) * 100
    : 0;

  // 保存阅读进度到数据库（防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      // 这里可以调用 API 保存进度
      // fetch(`/api/reading-progress`, { ... })
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentParagraphIndex, paperId]);

  return {
    currentParagraphIndex,
    fontSize,
    isEyeCareMode,
    progress,
    goToParagraph,
    previousParagraph,
    nextParagraph,
    increaseFontSize,
    decreaseFontSize,
    toggleEyeCareMode,
    canGoPrevious: currentParagraphIndex > 0,
    canGoNext: currentParagraphIndex < totalParagraphs - 1,
  };
}


