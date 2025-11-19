'use client';

import { EnglishLevel, LevelOption } from '@/types/upload';

interface LevelSelectorProps {
  value: EnglishLevel;
  onChange: (level: EnglishLevel) => void;
  disabled?: boolean;
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    value: 'beginner',
    label: '🌱 初级',
    description: '3K词汇量',
    icon: '🌱',
  },
  {
    value: 'intermediate',
    label: '🌿 中级',
    description: '5K词汇量',
    icon: '🌿',
  },
  {
    value: 'advanced',
    label: '🌲 高级',
    description: '8K+词汇',
    icon: '🌲',
  },
];

export function LevelSelector({ value, onChange, disabled = false }: LevelSelectorProps) {
  const handleLevelClick = (level: EnglishLevel) => {
    if (!disabled) {
      onChange(level);
    }
  };

  return (
    <div className="mt-8">
      <p className="mb-4 text-center text-sm text-muted-foreground">
        选择你的英语水平：
      </p>
      <div className="grid grid-cols-3 gap-4">
        {LEVEL_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => handleLevelClick(option.value)}
              disabled={disabled}
              className={`
                glass-card float-on-hover group p-6 text-center 
                transition-all duration-300
                ${isSelected 
                  ? 'border-primary/80 bg-primary/10 shadow-glow-purple' 
                  : 'border-white/10 hover:border-primary/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <p className={`
                mb-2 text-lg font-semibold transition-colors
                ${isSelected ? 'text-primary' : 'text-foreground'}
              `}>
                {option.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
              
              {/* 选中指示器 */}
              {isSelected && (
                <div className="mt-2 flex justify-center">
                  <div className="h-1 w-8 rounded-full bg-primary animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

