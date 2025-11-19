/**
 * 生词提示浮窗
 */

'use client';

import { useEffect, useRef } from 'react';

interface WordTooltipProps {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export function WordTooltip({
  word,
  phonetic,
  partOfSpeech,
  definition,
  position,
  onClose,
}: WordTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 w-72 rounded-lg border border-border/50 bg-space-elevated p-4 shadow-2xl animate-in fade-in slide-in-from-top-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {/* 单词 */}
      <div className="mb-2 flex items-baseline gap-2">
        <h4 className="text-lg font-bold text-primary">{word}</h4>
        {partOfSpeech && (
          <span className="text-xs text-muted-foreground">{partOfSpeech}</span>
        )}
      </div>

      {/* 音标 */}
      {phonetic && (
        <p className="mb-3 text-sm text-muted-foreground">{phonetic}</p>
      )}

      {/* 释义 */}
      {definition && (
        <p className="text-sm leading-relaxed text-foreground">{definition}</p>
      )}

      {/* 三角形箭头 */}
      <div
        className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-8 border-transparent border-t-space-elevated"
        style={{ marginTop: '-1px' }}
      />
    </div>
  );
}


