'use client';

import { UploadZone } from '@/components/upload/UploadZone';
import { LevelSelector } from '@/components/upload/LevelSelector';
import { StartButton } from '@/components/upload/StartButton';
import { useUploadForm } from '@/hooks/useUploadForm';

export default function Home() {
  const {
    selectedFile,
    level,
    isUploading,
    error,
    handleFileSelect,
    handleLevelChange,
    handleSubmit,
    canSubmit,
  } = useUploadForm();

  return (
    <main className="page-enter relative min-h-screen overflow-hidden bg-space">
      {/* 粒子背景效果 - 稍后实现 */}
      <div className="absolute inset-0 bg-gradient-to-br from-space via-space-elevated to-space opacity-80" />
      
      {/* 主内容 */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* 标题区域 */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-6xl font-bold">
            <span className="text-gradient">📚 Smoothly Paper</span>
          </h1>
          <p className="text-xl text-muted-foreground">让英文论文阅读变得优雅而高效</p>
        </div>

        {/* 上传卡片 */}
        <div className="glass-card w-full max-w-2xl p-12">
          {/* 错误提示 */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* 拖拽上传区域 */}
          <UploadZone
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            disabled={isUploading}
          />

          {/* 水平选择器 */}
          <LevelSelector
            value={level}
            onChange={handleLevelChange}
            disabled={isUploading}
          />

          {/* 开始按钮 */}
          <StartButton
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={isUploading}
          />
        </div>

        {/* 底部提示 */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>✨ 本地运行 · 数据隐私 · AI 驱动</p>
        </div>
      </div>
    </main>
  );
}

