/**
 * 404 页面
 */

'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-space px-4">
      <div className="glass-card max-w-md p-8 text-center">
        <div className="mb-4 text-6xl">🔍</div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-xl text-muted-foreground">页面未找到</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          抱歉，您访问的页面不存在或已被移除
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}

