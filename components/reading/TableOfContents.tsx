/**
 * 目录栏组件
 * 显示论文结构和章节导航
 */

'use client';

import type { ParagraphWithAnnotations } from '@/lib/db/paragraphs';

interface TableOfContentsProps {
  paragraphs: ParagraphWithAnnotations[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function TableOfContents({
  paragraphs,
  currentIndex,
  onSelect,
}: TableOfContentsProps) {
  // 提取章节信息
  const sections = paragraphs.reduce((acc, para, index) => {
    if (para.section) {
      acc.push({
        section: para.section,
        index,
        title: para.section,
      });
    }
    return acc;
  }, [] as Array<{ section: string; index: number; title: string }>);

  // 如果没有章节，按段落分组
  const items = sections.length > 0
    ? sections
    : paragraphs.map((_, index) => ({
        section: `段落 ${index + 1}`,
        index,
        title: `段落 ${index + 1}`,
      }));

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
        目录
      </h2>

      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = currentIndex === item.index;
          const isNearby = Math.abs(currentIndex - item.index) <= 2;

          return (
            <button
              key={item.index}
              onClick={() => onSelect(item.index)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                isActive
                  ? 'bg-primary/20 font-medium text-primary'
                  : isNearby
                  ? 'text-foreground hover:bg-muted'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
                <span className="line-clamp-2">{item.title}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* 快速跳转 */}
      <div className="mt-6 space-y-2 border-t border-border/50 pt-4">
        <button
          onClick={() => onSelect(0)}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          ⬆️ 回到开头
        </button>
        <button
          onClick={() => onSelect(paragraphs.length - 1)}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          ⬇️ 跳到结尾
        </button>
      </div>
    </div>
  );
}

