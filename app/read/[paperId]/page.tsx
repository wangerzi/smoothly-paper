/**
 * 阅读页面
 * 三栏布局：目录 + 原文 + 辅助面板
 */

import { notFound } from 'next/navigation';
import { getPaperById } from '@/lib/db/papers';
import { getParagraphsWithAnnotations } from '@/lib/db/paragraphs';
import { ReadingLayout } from '@/components/reading/ReadingLayout';

interface ReadingPageProps {
  params: {
    paperId: string;
  };
}

export default async function ReadingPage({ params }: ReadingPageProps) {
  const { paperId } = params;

  // 获取论文信息
  const paper = getPaperById(paperId);
  
  if (!paper) {
    notFound();
  }

  // 检查论文是否已完成分析
  if (paper.status !== 'completed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-space">
        <div className="glass-card max-w-md p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">论文尚未完成分析</h1>
          <p className="text-muted-foreground">
            当前状态：{paper.status === 'processing' ? '处理中' : '失败'}
          </p>
        </div>
      </div>
    );
  }

  // 获取所有段落及标注
  const paragraphs = getParagraphsWithAnnotations(paperId);

  if (paragraphs.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-space">
        <div className="glass-card max-w-md p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">未找到段落数据</h1>
          <p className="text-muted-foreground">论文内容为空</p>
        </div>
      </div>
    );
  }

  return (
    <ReadingLayout
      paper={{
        id: paper.id,
        title: paper.title || paper.filename,
        filename: paper.filename,
        pageCount: paper.page_count || 0,
        userLevel: paper.user_level,
      }}
      paragraphs={paragraphs}
    />
  );
}

