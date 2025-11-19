/**
 * 分析状态查询 API
 * GET /api/analyze/[paperId]/status
 * 用于前端轮询获取分析进度
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPaperById } from '@/lib/db/papers';
import { getParagraphsByPaperId } from '@/lib/db/paragraphs';

export async function GET(
  request: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { paperId } = params;

    // 获取论文信息
    const paper = getPaperById(paperId);
    
    if (!paper) {
      return NextResponse.json(
        { error: '论文不存在' },
        { status: 404 }
      );
    }

    // 获取段落数量（用于计算进度）
    const paragraphs = getParagraphsByPaperId(paperId);

    // 计算进度
    let progress = 0;
    let currentStep = '';

    switch (paper.status) {
      case 'uploading':
        progress = 10;
        currentStep = '上传中...';
        break;
      case 'processing':
        // 根据段落数量估算进度（30-90%）
        if (paragraphs.length === 0) {
          progress = 30;
          currentStep = '生成摘要中...';
        } else {
          progress = 30 + Math.min(60, (paragraphs.length / 50) * 60);
          currentStep = `分析段落中... (${paragraphs.length} 个段落)`;
        }
        break;
      case 'completed':
        progress = 100;
        currentStep = '分析完成';
        break;
      case 'failed':
        progress = 0;
        currentStep = '分析失败';
        break;
    }

    return NextResponse.json({
      paperId,
      status: paper.status,
      progress: Math.round(progress),
      currentStep,
      paragraphCount: paragraphs.length,
      paper: {
        id: paper.id,
        title: paper.title,
        filename: paper.filename,
        pageCount: paper.page_count,
      },
    });
  } catch (error) {
    console.error('状态查询错误:', error);
    return NextResponse.json(
      {
        error: '状态查询失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}


