'use client';

import { Loader2 } from 'lucide-react';

interface StartButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export function StartButton({ onClick, disabled, loading }: StartButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        gradient-bg mt-8 w-full rounded-xl py-4 text-lg font-semibold 
        text-white shadow-lg transition-all
        ${disabled || loading
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:scale-105 hover:shadow-glow-purple'
        }
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>处理中...</span>
        </span>
      ) : (
        <span>━━━━ 开始智能解析 ━━━━</span>
      )}
    </button>
  );
}

