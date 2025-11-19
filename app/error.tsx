/**
 * 全局错误页面
 */

'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-space px-4">
      <div className="glass-card max-w-md p-8 text-center">
        <div className="mb-4 text-6xl">❌</div>
        <h1 className="mb-2 text-2xl font-bold text-red-400">出错了</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {error.message || '应用程序遇到了一个错误'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90 transition-colors"
          >
            重试
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="rounded-lg border border-border px-6 py-2 text-foreground hover:bg-muted transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}


