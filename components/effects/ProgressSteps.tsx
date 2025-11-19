/**
 * 分析进度步骤显示
 */

'use client';

import { Check, Loader2 } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  progress: number; // 该步骤开始的进度百分比
}

const STEPS: Step[] = [
  { id: 'extract', label: '📄 提取论文文本', progress: 0 },
  { id: 'summary', label: '📝 生成论文摘要', progress: 30 },
  { id: 'segment', label: '🔪 智能分段处理', progress: 50 },
  { id: 'annotate', label: '🎯 标注难点术语', progress: 70 },
];

interface ProgressStepsProps {
  currentProgress: number;
}

export function ProgressSteps({ currentProgress }: ProgressStepsProps) {
  return (
    <div className="space-y-4">
      {STEPS.map((step, index) => {
        const isCompleted = currentProgress > step.progress + 15;
        const isActive =
          currentProgress >= step.progress && currentProgress <= step.progress + 25;

        return (
          <div key={step.id} className="flex items-center gap-4">
            {/* 状态图标 */}
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                isCompleted
                  ? 'border-primary bg-primary text-white'
                  : isActive
                  ? 'border-primary animate-pulse'
                  : 'border-muted'
              }`}
            >
              {isCompleted ? (
                <Check className="h-5 w-5" />
              ) : isActive ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <span className="text-sm text-muted-foreground">{index + 1}</span>
              )}
            </div>

            {/* 步骤标签 */}
            <div className="flex-1">
              <p
                className={`text-sm transition-colors ${
                  isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}


