/**
 * 阅读页面布局组件
 * 三栏响应式布局
 */

'use client';

import { useState } from 'react';
import type { ParagraphWithAnnotations } from '@/lib/db/paragraphs';
import type { EnglishLevel } from '@/types/upload';
import { useReading } from '@/hooks/useReading';
import { TableOfContents } from './TableOfContents';
import { PaperContent } from './PaperContent';
import { AssistantPanel } from './AssistantPanel';
import { ReadingControls } from './ReadingControls';

interface ReadingLayoutProps {
  paper: {
    id: string;
    title: string;
    filename: string;
    pageCount: number;
    userLevel: EnglishLevel;
  };
  paragraphs: ParagraphWithAnnotations[];
}

export function ReadingLayout({ paper, paragraphs }: ReadingLayoutProps) {
  const reading = useReading({
    paperId: paper.id,
    totalParagraphs: paragraphs.length,
  });

  const [showToc, setShowToc] = useState(true);
  const [showAssistant, setShowAssistant] = useState(true);

  const currentParagraph = paragraphs[reading.currentParagraphIndex];

  return (
    <div
      className={`min-h-screen bg-space ${
        reading.isEyeCareMode ? 'bg-amber-50/5' : ''
      }`}
    >
      {/* 顶部标题栏 */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-space/95 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              ← 返回
            </button>
            <div>
              <h1 className="text-lg font-semibold">{paper.title}</h1>
              <p className="text-xs text-muted-foreground">
                {paragraphs.length} 段落 · 进度 {Math.round(reading.progress)}%
              </p>
            </div>
          </div>

          {/* 控制按钮 */}
          <ReadingControls
            {...reading}
            onToggleToc={() => setShowToc(!showToc)}
            onToggleAssistant={() => setShowAssistant(!showAssistant)}
            showToc={showToc}
            showAssistant={showAssistant}
          />
        </div>

        {/* 进度条 */}
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${reading.progress}%` }}
          />
        </div>
      </header>

      {/* 三栏布局 */}
      <div className="flex">
        {/* 左侧目录栏 */}
        {showToc && (
          <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 flex-shrink-0 overflow-y-auto border-r border-border/50 bg-space-elevated/50 p-4">
            <TableOfContents
              paragraphs={paragraphs}
              currentIndex={reading.currentParagraphIndex}
              onSelect={reading.goToParagraph}
            />
          </aside>
        )}

        {/* 中间原文区 */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-4xl">
            <PaperContent
              paragraphs={paragraphs}
              currentIndex={reading.currentParagraphIndex}
              fontSize={reading.fontSize}
              onParagraphClick={reading.goToParagraph}
            />
          </div>
        </main>

        {/* 右侧辅助面板 */}
        {showAssistant && currentParagraph && (
          <aside className="sticky top-16 h-[calc(100vh-4rem)] w-96 flex-shrink-0 overflow-y-auto border-l border-border/50 bg-space-elevated/50 p-4">
            <AssistantPanel
              paragraph={currentParagraph}
              userLevel={paper.userLevel}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

