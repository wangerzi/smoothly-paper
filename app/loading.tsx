/**
 * 全局加载页面
 */

'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-space">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">加载中...</p>
      </div>
    </div>
  );
}


