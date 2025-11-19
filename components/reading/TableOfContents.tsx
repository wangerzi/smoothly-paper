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
  // 构建目录项：优先使用段落标题，其次章节名，最后使用段落编号
  const items = paragraphs.map((para, index) => {
    // 1. 优先使用 AI 生成的段落标题
    if (para.title && para.title.trim() !== '' && para.title !== '段落内容') {
      return {
        index,
        title: para.title,
        section: para.section || null,
      };
    }
    
    // 2. 其次使用章节名
    if (para.section && para.section.trim() !== '') {
      return {
        index,
        title: para.section,
        section: para.section,
      };
    }
    
    // 3. 最后使用段落编号
    return {
      index,
      title: `段落 ${index + 1}`,
      section: null,
    };
  });

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


