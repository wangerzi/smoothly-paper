/**
 * 处理中页面
 * 显示 AI 分析进度，完成后自动跳转到阅读页面
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CubeLoader } from '@/components/effects/CubeLoader';
import { ProgressSteps } from '@/components/effects/ProgressSteps';

interface AnalysisStatus {
  paperId: string;
  status: string;
  progress: number;
  currentStep: string;
  paragraphCount: number;
  paper: {
    id: string;
    title: string | null;
    filename: string;
    pageCount: number | null;
  };
}

export default function ProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.paperId as string;

  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paperId) return;

    let intervalId: NodeJS.Timeout;

    // 轮询获取分析状态
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/analyze/${paperId}/status`);
        
        if (!response.ok) {
          throw new Error('获取状态失败');
        }

        const data: AnalysisStatus = await response.json();
        setStatus(data);

        // 如果完成，跳转到阅读页面
        if (data.status === 'completed') {
          clearInterval(intervalId);
          setTimeout(() => {
            router.push(`/read/${paperId}`);
          }, 1000);
        }

        // 如果失败，显示错误
        if (data.status === 'failed') {
          clearInterval(intervalId);
          setError('分析失败，请重试');
        }
      } catch (err) {
        console.error('状态查询错误:', err);
        setError(err instanceof Error ? err.message : '未知错误');
        clearInterval(intervalId);
      }
    };

    // 立即检查一次
    checkStatus();

    // 每 2 秒轮询一次
    intervalId = setInterval(checkStatus, 2000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paperId, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-space px-4">
        <div className="glass-card max-w-md p-8 text-center">
          <div className="mb-4 text-4xl">❌</div>
          <h1 className="mb-2 text-2xl font-bold text-red-400">分析失败</h1>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90"
          >
            返回首页
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-space">
      {/* 背景效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-space via-space-elevated to-space opacity-80" />

      {/* 主内容 */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* 论文信息卡片 */}
        {status && (
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              {status.paper.title || status.paper.filename}
            </h2>
            <p className="text-sm text-muted-foreground">
              {status.paper.pageCount && `${status.paper.pageCount} 页`}
              {status.paragraphCount > 0 && ` · ${status.paragraphCount} 段落`}
            </p>
          </div>
        )}

        {/* 加载动画 */}
        <div className="mb-12">
          <CubeLoader />
        </div>

        {/* 进度信息 */}
        <div className="glass-card w-full max-w-md p-8">
          {/* 进度条 */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">分析进度</span>
              <span className="text-sm font-bold text-primary">
                {status?.progress || 0}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${status?.progress || 0}%` }}
              />
            </div>
          </div>

          {/* 当前步骤 */}
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground">{status?.currentStep}</p>
          </div>

          {/* 步骤列表 */}
          <ProgressSteps currentProgress={status?.progress || 0} />

          {/* 提示信息 */}
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>✨ AI 正在分析您的论文，请稍候...</p>
            <p className="mt-1">预计需要 30-60 秒</p>
          </div>
        </div>
      </div>
    </main>
  );
}


