/**
 * AI 分析 API
 * POST /api/analyze
 * 触发论文的 AI 分析过程
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPaperById, getPaperContent, updatePaperStatus } from '@/lib/db/papers';
import { saveParagraphs, saveTerms, saveDifficultWords, saveSyntaxAnalyses } from '@/lib/db/paragraphs';
import {
  generateMockSummary,
  splitIntoParagraphs,
  analyzeParagraphsBatch,
  detectSection,
} from '@/lib/ai/mock';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paperId } = body;

    if (!paperId) {
      return NextResponse.json({ error: '缺少 paperId 参数' }, { status: 400 });
    }

    // 获取论文信息
    const paper = getPaperById(paperId);
    if (!paper) {
      return NextResponse.json({ error: '论文不存在' }, { status: 404 });
    }

    // 获取论文全文
    const content = getPaperContent(paperId);
    if (!content || !content.full_text) {
      return NextResponse.json({ error: '论文内容不存在' }, { status: 404 });
    }

    // 更新状态为处理中
    updatePaperStatus(paperId, 'processing');

    // 在后台异步执行分析（实际应该用队列，这里简化处理）
    // 注意：这会阻塞请求，实际生产应该用消息队列
    setImmediate(async () => {
      try {
        await performAnalysis(paperId, content.full_text, paper.user_level);
      } catch (error) {
        console.error('分析失败:', error);
        updatePaperStatus(paperId, 'failed');
      }
    });

    return NextResponse.json({
      success: true,
      message: '分析已开始',
      paperId,
    });
  } catch (error) {
    console.error('分析 API 错误:', error);
    return NextResponse.json(
      {
        error: '分析启动失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 执行完整的论文分析流程
 */
async function performAnalysis(
  paperId: string,
  fullText: string,
  level: 'beginner' | 'intermediate' | 'advanced'
): Promise<void> {
  try {
    // Step 1: 生成摘要
    const summary = generateMockSummary(fullText);
    
    // 保存摘要（更新 paper_contents）
    const { getDb } = await import('@/lib/db/client');
    const db = getDb();
    db.prepare('UPDATE paper_contents SET summary = ? WHERE paper_id = ?').run(summary, paperId);

    // Step 2: 智能分段
    const paragraphTexts = splitIntoParagraphs(fullText);

    // Step 3: 批量分析段落
    const analyses = await analyzeParagraphsBatch(paragraphTexts, level);

    // Step 4: 保存段落和标注到数据库
    const paragraphIds = saveParagraphs(
      paperId,
      paragraphTexts.map((text, index) => ({
        section: detectSection(text, index),
        order_index: index,
        content: text,
        translation: analyses[index].translation,
        word_count: text.split(/\s+/).length,
      }))
    );

    // 保存每个段落的标注
    for (let i = 0; i < paragraphIds.length; i++) {
      const paragraphId = paragraphIds[i];
      const analysis = analyses[i];

      // 保存术语
      if (analysis.terms.length > 0) {
        saveTerms(paragraphId, analysis.terms);
      }

      // 保存难词
      if (analysis.difficultWords.length > 0) {
        saveDifficultWords(paragraphId, analysis.difficultWords);
      }

      // 保存语法分析
      if (analysis.syntaxAnalyses.length > 0) {
        saveSyntaxAnalyses(paragraphId, analysis.syntaxAnalyses);
      }
    }

    // 更新状态为完成
    updatePaperStatus(paperId, 'completed');
    
    console.log(`✅ 论文 ${paperId} 分析完成`);
  } catch (error) {
    console.error('分析执行失败:', error);
    updatePaperStatus(paperId, 'failed');
    throw error;
  }
}

