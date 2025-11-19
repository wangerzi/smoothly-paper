/**
 * 论文内容区组件
 * 显示段落内容和生词高亮
 */

'use client';

import { useState } from 'react';
import type { ParagraphWithAnnotations } from '@/lib/db/paragraphs';
import { WordTooltip } from './WordTooltip';

interface PaperContentProps {
  paragraphs: ParagraphWithAnnotations[];
  currentIndex: number;
  fontSize: number;
  onParagraphClick: (index: number) => void;
}

export function PaperContent({
  paragraphs,
  currentIndex,
  fontSize,
  onParagraphClick,
}: PaperContentProps) {
  const [hoveredWord, setHoveredWord] = useState<{
    word: string;
    definition: string;
    phonetic: string;
    partOfSpeech: string;
    position: { x: number; y: number };
  } | null>(null);

  // 高亮段落中的难词
  const highlightWords = (paragraph: ParagraphWithAnnotations) => {
    let content = paragraph.content;
    const { difficultWords } = paragraph.annotations;

    if (difficultWords.length === 0) {
      return content;
    }

    // 按位置排序（从后往前替换，避免位置偏移）
    const sortedWords = [...difficultWords].sort(
      (a, b) => (b.position_start || 0) - (a.position_start || 0)
    );

    for (const word of sortedWords) {
      if (word.position_start === null || word.position_end === null) continue;

      const before = content.slice(0, word.position_start);
      const wordText = content.slice(word.position_start, word.position_end);
      const after = content.slice(word.position_end);

      // 根据难度设置颜色
      const colorClass =
        word.difficulty_level === 'easy'
          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border-b-2 border-yellow-500/50'
          : word.difficulty_level === 'medium'
          ? 'bg-orange-500/20 hover:bg-orange-500/30 border-b-2 border-orange-500/50'
          : 'bg-pink-500/20 hover:bg-pink-500/30 border-b-2 border-pink-500/50';

      content =
        before +
        `<span 
          class="difficult-word cursor-pointer ${colorClass} rounded-sm px-0.5 transition-colors"
          data-word="${word.word}"
          data-phonetic="${word.phonetic || ''}"
          data-pos="${word.part_of_speech || ''}"
          data-definition="${word.definition || ''}"
        >${wordText}</span>` +
        after;
    }

    return content;
  };

  // 处理生词点击
  const handleWordClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('difficult-word')) {
      const word = target.dataset.word || '';
      const phonetic = target.dataset.phonetic || '';
      const pos = target.dataset.pos || '';
      const definition = target.dataset.definition || '';

      const rect = target.getBoundingClientRect();
      setHoveredWord({
        word,
        phonetic,
        partOfSpeech: pos,
        definition,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        },
      });
    } else {
      setHoveredWord(null);
    }
  };

  return (
    <div className="space-y-8" onClick={handleWordClick}>
      {paragraphs.map((paragraph, index) => {
        const isActive = index === currentIndex;
        const highlightedContent = highlightWords(paragraph);

        return (
          <div
            key={paragraph.id}
            id={`paragraph-${index}`}
            className={`rounded-lg p-6 transition-all ${
              isActive
                ? 'border-2 border-primary/50 bg-primary/5 shadow-lg'
                : 'border border-transparent hover:border-border/50'
            }`}
            onClick={() => onParagraphClick(index)}
          >
            {/* 段落标题 */}
            {paragraph.section && (
              <h3 className="mb-4 text-lg font-semibold text-primary">
                {paragraph.section}
              </h3>
            )}

            {/* 段落编号 */}
            <div className="mb-2 text-xs text-muted-foreground">
              段落 {index + 1} / {paragraphs.length}
            </div>

            {/* 段落内容 */}
            <div
              className="leading-relaxed text-foreground"
              style={{ fontSize: `${fontSize}px` }}
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />

            {/* 词数统计 */}
            {paragraph.word_count && (
              <div className="mt-4 text-xs text-muted-foreground">
                约 {paragraph.word_count} 词
              </div>
            )}
          </div>
        );
      })}

      {/* 词汇提示浮窗 */}
      {hoveredWord && (
        <WordTooltip
          word={hoveredWord.word}
          phonetic={hoveredWord.phonetic}
          partOfSpeech={hoveredWord.partOfSpeech}
          definition={hoveredWord.definition}
          position={hoveredWord.position}
          onClose={() => setHoveredWord(null)}
        />
      )}
    </div>
  );
}

