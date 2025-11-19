/**
 * 阅读控制按钮组件
 * 包含字号调节、护眼模式、上下段导航等
 */

'use client';

import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Eye,
  Menu,
  PanelRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReadingControlsProps {
  fontSize: number;
  isEyeCareMode: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  showToc: boolean;
  showAssistant: boolean;
  previousParagraph: () => void;
  nextParagraph: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleEyeCareMode: () => void;
  onToggleToc: () => void;
  onToggleAssistant: () => void;
}

export function ReadingControls({
  fontSize,
  isEyeCareMode,
  canGoPrevious,
  canGoNext,
  showToc,
  showAssistant,
  previousParagraph,
  nextParagraph,
  increaseFontSize,
  decreaseFontSize,
  toggleEyeCareMode,
  onToggleToc,
  onToggleAssistant,
}: ReadingControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* 段落导航 */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={previousParagraph}
          disabled={!canGoPrevious}
          title="上一段"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={nextParagraph}
          disabled={!canGoNext}
          title="下一段"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border/50" />

      {/* 字号调节 */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={decreaseFontSize}
          title="减小字号"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-8 text-center">
          {fontSize}px
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={increaseFontSize}
          title="增大字号"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border/50" />

      {/* 护眼模式 */}
      <Button
        variant={isEyeCareMode ? 'default' : 'ghost'}
        size="sm"
        onClick={toggleEyeCareMode}
        title="护眼模式"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border/50" />

      {/* 面板切换 */}
      <Button
        variant={showToc ? 'default' : 'ghost'}
        size="sm"
        onClick={onToggleToc}
        title="目录"
      >
        <Menu className="h-4 w-4" />
      </Button>
      <Button
        variant={showAssistant ? 'default' : 'ghost'}
        size="sm"
        onClick={onToggleAssistant}
        title="辅助面板"
      >
        <PanelRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

