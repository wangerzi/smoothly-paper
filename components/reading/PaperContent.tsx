/**
 * 论文内容区组件
 * 显示段落内容和生词高亮
 */

'use client';

import { useState } from 'react';
import type { ParagraphWithAnnotations } from '@/lib/db/paragraphs';
import { WordTooltip } from './WordTooltip';
import { stripHtmlTags, escapeRegex } from '@/lib/utils/format';

interface PaperContentProps {
  paragraphs: ParagraphWithAnnotations[];
  currentIndex: number;
  fontSize: number;
  onParagraphClick: (index: number) => void;
}

/**
 * 基于上下文查找词汇在段落中的位置
 * @param content 段落内容
 * @param word 要查找的词汇
 * @param contextBefore 词汇前的上下文（3-5个词）
 * @param contextAfter 词汇后的上下文（3-5个词）
 * @returns 词汇的起始和结束位置，找不到返回 null
 */
function findWordByContext(
  content: string,
  word: string,
  contextBefore: string = '',
  contextAfter: string = ''
): { start: number; end: number } | null {
  // 策略1: 如果有完整上下文，使用上下文匹配
  if (contextBefore || contextAfter) {
    try {
      // 构建灵活的正则模式：允许词之间有多个空格或换行
      const beforePattern = contextBefore 
        ? escapeRegex(contextBefore).replace(/\s+/g, '\\s+') 
        : '';
      const wordPattern = escapeRegex(word);
      const afterPattern = contextAfter 
        ? escapeRegex(contextAfter).replace(/\s+/g, '\\s+') 
        : '';
      
      // 构建完整模式：(before)?(word)(after)?
      const pattern = new RegExp(
        `${beforePattern ? '(' + beforePattern + ')' : ''}(\\s*)(${wordPattern})(\\s*)${afterPattern ? '(' + afterPattern + ')' : ''}`,
        'i'
      );
      
      const match = content.match(pattern);
      if (match) {
        // 找到词汇的实际位置
        const fullMatch = match[0];
        const matchIndex = content.indexOf(fullMatch);
        
        // 计算词汇在匹配中的偏移量
        let wordOffset = 0;
        if (contextBefore) {
          // 跳过 before context
          const beforeMatch = match[1] || '';
          wordOffset += beforeMatch.length;
        }
        // 跳过前导空格
        wordOffset += (match[2] || '').length;
        
        const wordStart = matchIndex + wordOffset;
        const actualWord = match[3] || word;
        
        return {
          start: wordStart,
          end: wordStart + actualWord.length,
        };
      }
    } catch (error) {
      console.warn('上下文匹配失败:', error);
    }
  }
  
  // 策略2: 降级到简单词汇匹配（不区分大小写）
  const lowerContent = content.toLowerCase();
  const lowerWord = word.toLowerCase();
  
  // 使用单词边界匹配，避免匹配到词的一部分
  const wordBoundaryPattern = new RegExp(`\\b${escapeRegex(lowerWord)}\\b`, 'i');
  const match = content.match(wordBoundaryPattern);
  
  if (match && match.index !== undefined) {
    return {
      start: match.index,
      end: match.index + match[0].length,
    };
  }
  
  // 策略3: 最后降级到简单的 indexOf
  const simpleIndex = lowerContent.indexOf(lowerWord);
  if (simpleIndex !== -1) {
    return {
      start: simpleIndex,
      end: simpleIndex + word.length,
    };
  }
  
  return null;
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

  // 高亮段落中的难词（使用上下文匹配）
  const highlightWords = (paragraph: ParagraphWithAnnotations) => {
    // 防御性清洗：移除可能残留的 HTML 标签
    let content = stripHtmlTags(paragraph.content);
    const { difficultWords } = paragraph.annotations;

    if (difficultWords.length === 0) {
      return content;
    }

    // 第一步：使用上下文匹配找到所有词汇的位置
    const wordPositions: Array<{
      word: any;
      start: number;
      end: number;
    }> = [];

    for (const word of difficultWords) {
      const position = findWordByContext(
        content,
        word.word,
        word.context_before || '',
        word.context_after || ''
      );

      if (position) {
        wordPositions.push({
          word,
          start: position.start,
          end: position.end,
        });
      } else {
        console.warn(`无法定位词汇: ${word.word}`);
      }
    }

    // 第二步：按位置排序（从后往前替换，避免位置偏移）
    const sortedPositions = wordPositions.sort((a, b) => b.start - a.start);

    // 第三步：从后往前插入高亮标签
    for (const { word, start, end } of sortedPositions) {
      const before = content.slice(0, start);
      const wordText = content.slice(start, end);
      const after = content.slice(end);

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


