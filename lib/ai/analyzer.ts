/**
 * AI 分析器
 * 使用豆包 API 实现论文的智能分析
 */

import { z } from 'zod';
import { callDoubaoJSON, callDoubaoSingle, createLimiter } from './doubao';
import {
  createStructureAnalysisPrompt,
  createParagraphAnalysisPrompt,
  createTranslationPrompt,
  createVocabularyPrompt,
  createSyntaxPrompt,
  createQuickSummaryPrompt,
  detectSectionFromContent,
  PROMPT_CONFIG,
} from './prompts';
import { stripHtmlTags } from '@/lib/utils/format';
import type { EnglishLevel } from '@/types/upload';

// ============================================================================
// 类型定义
// ============================================================================

/** 论文结构分析结果 */
export interface StructureAnalysisResult {
  summary: string;
  sections: Array<{
    name: string;
    paragraphs: string[];
  }>;
}

/** 段落分析结果 */
export interface ParagraphAnalysis {
  content: string;
  title: string; // 新增：段落标题
  translation: string;
  terms: Array<{
    term: string;
    definition: string;
    context: string;
    category: string;
  }>;
  difficultWords: Array<{
    word: string;
    phonetic: string;
    part_of_speech: string;
    definition: string;
    difficulty_level: 'easy' | 'medium' | 'hard';
    context_before: string; // 新增：上下文（前）
    context_after: string; // 新增：上下文（后）
    position_start: number;
    position_end: number;
  }>;
  syntaxAnalyses: Array<{
    sentence: string;
    structure: string;
    explanation: string;
  }>;
}

// ============================================================================
// Zod Schema（用于验证 AI 返回的 JSON）
// ============================================================================

const StructureAnalysisSchema = z.object({
  summary: z.string().min(50, '摘要太短'),
  sections: z.array(
    z.object({
      name: z.string(),
      paragraphs: z.array(z.string()).min(1, '章节至少包含一个段落'),
    })
  ).min(1, '至少包含一个章节'),
});

// 词汇标注Schema（包含段落标题和上下文字段）
const VocabularySchema = z.object({
  // 新增：段落标题
  paragraphTitle: z.string().min(2).max(50).optional().default('段落内容'),
  terms: z.array(
    z.object({
      term: z.string(),
      definition: z.string(),
      category: z.string(),
    })
  ),
  difficultWords: z.array(
    z.object({
      word: z.string(),
      phonetic: z.string(),
      partOfSpeech: z.string(),
      definition: z.string(),
      difficultyLevel: z.enum(['easy', 'medium', 'hard']),
      // 新增：上下文字段
      contextBefore: z.string().optional().default(''),
      contextAfter: z.string().optional().default(''),
      // 使用coerce自动转换字符串到数字，并提供默认值
      positionStart: z.coerce.number().int().min(0).default(0),
      positionEnd: z.coerce.number().int().min(0).default(0),
    })
  ),
});

// 句法分析Schema
const SyntaxSchema = z.object({
  syntaxAnalyses: z.array(
    z.object({
      sentence: z.string(),
      structure: z.string(),
      explanation: z.string(),
    })
  ),
});

// 旧版完整Schema（保留用于兼容）
const ParagraphAnalysisSchema = z.object({
  terms: z.array(
    z.object({
      term: z.string(),
      definition: z.string(),
      context: z.string(),
      category: z.string(),
    })
  ),
  difficultWords: z.array(
    z.object({
      word: z.string(),
      phonetic: z.string(),
      partOfSpeech: z.string(),
      definition: z.string(),
      difficultyLevel: z.enum(['easy', 'medium', 'hard']),
      positionStart: z.number().int().min(0),
      positionEnd: z.number().int().min(0),
    })
  ),
  syntaxAnalyses: z.array(
    z.object({
      sentence: z.string(),
      structure: z.string(),
      explanation: z.string(),
    })
  ),
  translation: z.string().min(5, '翻译太短'),
});

// ============================================================================
// 核心分析函数
// ============================================================================

/**
 * 快速生成论文摘要（仅使用前8000字符）
 * @param fullText 论文全文
 * @returns 中文摘要
 */
export async function generateFastSummary(fullText: string): Promise<string> {
  console.log('[AI Analyzer] 开始快速生成摘要（前8000字符）...');

  // 仅使用前8000字符（通常包含Abstract和Introduction）
  const textSlice = fullText.slice(0, 8000);
  const summary = await generateQuickSummary(textSlice);

  console.log('[AI Analyzer] 摘要生成完成');
  return summary;
}

// ============================================================================
// 段落分析 - 拆分任务
// ============================================================================

/**
 * 任务1: 翻译单个段落
 * @param content 段落内容
 * @param retryCount 重试次数
 * @returns 中文翻译
 */
export async function translateParagraph(content: string, retryCount = 0): Promise<string> {
  const maxRetries = 3;
  console.log(`[AI Analyzer] 翻译段落... ${retryCount > 0 ? `(重试 ${retryCount}/${maxRetries})` : ''}`);

  try {
    const prompt = createTranslationPrompt(content);
    const translation = await callDoubaoSingle(prompt, {
      systemPrompt: '你是一位专业的学术翻译专家。',
      temperature: 0.3,
      maxTokens: 3000, // 800词段落约需2400 tokens
    });

    return translation.trim();
  } catch (error) {
    if (retryCount < maxRetries) {
      console.warn(`[AI Analyzer] 翻译失败，${retryCount + 1}秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return translateParagraph(content, retryCount + 1);
    }
    
    console.error('[AI Analyzer] 翻译失败，已达最大重试次数');
    throw error;
  }
}

/**
 * 任务2: 词汇标注（术语+难词+段落标题）
 * @param content 段落内容
 * @param level 用户英语水平
 * @param retryCount 重试次数
 * @returns 段落标题、术语和难词列表
 */
export async function annotateVocabulary(
  content: string,
  level: EnglishLevel,
  retryCount = 0
): Promise<{
  paragraphTitle: string;
  terms: Array<{
    term: string;
    definition: string;
    category: string;
  }>;
  difficultWords: Array<{
    word: string;
    phonetic: string;
    partOfSpeech: string;
    definition: string;
    difficultyLevel: 'easy' | 'medium' | 'hard';
    contextBefore: string;
    contextAfter: string;
    positionStart: number;
    positionEnd: number;
  }>;
}> {
  const maxRetries = 3;
  console.log(`[AI Analyzer] 标注词汇... ${retryCount > 0 ? `(重试 ${retryCount}/${maxRetries})` : ''}`);

  try {
    const prompt = createVocabularyPrompt(content, level);
    const result = await callDoubaoJSON(prompt, {
      systemPrompt: '你是一位专业的英语词汇教学专家。请严格按照JSON格式返回，positionStart和positionEnd必须是数字类型。',
      schema: VocabularySchema,
      maxTokens: 2000, // 词汇标注约需1500 tokens
    });

    return {
      paragraphTitle: result.paragraphTitle || '段落内容',
      terms: result.terms,
      difficultWords: result.difficultWords.map((word) => ({
        word: word.word,
        phonetic: word.phonetic,
        partOfSpeech: word.partOfSpeech,
        definition: word.definition,
        difficultyLevel: word.difficultyLevel,
        contextBefore: word.contextBefore || '',
        contextAfter: word.contextAfter || '',
        positionStart: word.positionStart || 0,
        positionEnd: word.positionEnd || 0,
      })),
    };
  } catch (error) {
    if (retryCount < maxRetries) {
      console.warn(`[AI Analyzer] 词汇标注失败，${retryCount + 1}秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return annotateVocabulary(content, level, retryCount + 1);
    }
    
    console.error('[AI Analyzer] 词汇标注失败，已达最大重试次数');
    throw error;
  }
}

/**
 * 任务3: 句法分析
 * @param content 段落内容
 * @param retryCount 重试次数
 * @returns 句法分析列表
 */
export async function analyzeSyntax(
  content: string,
  retryCount = 0
): Promise<
  Array<{
    sentence: string;
    structure: string;
    explanation: string;
  }>
> {
  const maxRetries = 3;
  console.log(`[AI Analyzer] 分析句法... ${retryCount > 0 ? `(重试 ${retryCount}/${maxRetries})` : ''}`);

  try {
    const prompt = createSyntaxPrompt(content);
    const result = await callDoubaoJSON(prompt, {
      systemPrompt: '你是一位专业的英语句法分析专家。',
      schema: SyntaxSchema,
      maxTokens: 800, // 句法分析约需300-500 tokens
    });

    return result.syntaxAnalyses;
  } catch (error) {
    if (retryCount < maxRetries) {
      console.warn(`[AI Analyzer] 句法分析失败，${retryCount + 1}秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return analyzeSyntax(content, retryCount + 1);
    }
    
    console.error('[AI Analyzer] 句法分析失败，已达最大重试次数');
    throw error;
  }
}

/**
 * 长段落拆分辅助函数
 */
function splitLongParagraph(text: string, targetWords: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';
  let currentWords = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).length;

    if (currentWords + sentenceWords > targetWords && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
      currentWords = sentenceWords;
    } else {
      currentChunk += sentence;
      currentWords += sentenceWords;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.split(/\s+/).length >= 50);
}

/**
 * 基于规则的智能分段
 * @param fullText 论文全文
 * @returns 分段结果（包含章节信息）
 */
export function splitByRules(
  fullText: string
): Array<{
  section: string | null;
  content: string;
}> {
  console.log('[AI Analyzer] 开始基于规则分段...');

  // 1. 按双换行符分割
  const rawParagraphs = fullText.split(/\n\s*\n/);

  // 2. 合并过短段落（<50词），拆分过长段落（>800词）
  const processedParagraphs: Array<{ section: string | null; content: string }> = [];
  let buffer = '';
  let currentSection: string | null = null;

  for (let i = 0; i < rawParagraphs.length; i++) {
    const para = rawParagraphs[i].trim();
    if (!para) continue;

    const wordCount = para.split(/\s+/).length;

    // 检测章节标题
    const detectedSection = detectSectionFromContent(para, i);
    if (detectedSection) {
      currentSection = detectedSection;
    }

    // 段落过短，累积到buffer
    if (wordCount < 50) {
      buffer += (buffer ? ' ' : '') + para;
      continue;
    }

    // 清空buffer
    if (buffer) {
      const combined = buffer + ' ' + para;
      buffer = '';
      if (combined.split(/\s+/).length <= 800) {
        processedParagraphs.push({ section: currentSection, content: combined });
        continue;
      }
    }

    // 段落过长，按句子拆分
    if (wordCount > 800) {
      const chunks = splitLongParagraph(para, 300);
      chunks.forEach((chunk) => {
        processedParagraphs.push({ section: currentSection, content: chunk });
      });
    } else {
      processedParagraphs.push({ section: currentSection, content: para });
    }
  }

  // 处理剩余buffer
  if (buffer && buffer.split(/\s+/).length >= 50) {
    processedParagraphs.push({ section: currentSection, content: buffer });
  }

  console.log(`[AI Analyzer] 规则分段完成：${processedParagraphs.length} 个段落`);

  return processedParagraphs;
}

/**
 * 分析单个段落（使用拆分任务）
 * @param content 段落内容
 * @param level 用户英语水平
 * @param orderIndex 段落序号
 * @returns 段落分析结果
 */
export async function analyzeParagraph(
  content: string,
  level: EnglishLevel,
  orderIndex: number
): Promise<ParagraphAnalysis> {
  console.log(`[AI Analyzer] 分析段落 ${orderIndex + 1}（使用拆分任务）...`);

  // 清洗段落内容，移除可能的 HTML 标签
  const cleanedContent = stripHtmlTags(content);

  // 并发执行翻译和词汇标注（句法分析跳过，改为延迟加载）
  const [translation, vocabulary] = await Promise.all([
    translateParagraph(cleanedContent),
    annotateVocabulary(cleanedContent, level),
  ]);

  // 转换字段名（数据库需要下划线）
  const analysis: ParagraphAnalysis = {
    content: cleanedContent, // 保存清洗后的内容
    title: vocabulary.paragraphTitle, // 新增：段落标题
    translation,
    terms: vocabulary.terms.map((term) => ({
      term: term.term,
      definition: term.definition,
      context: '', // 新版本不返回context，填充空字符串
      category: term.category,
    })),
    difficultWords: vocabulary.difficultWords.map((word) => ({
      word: word.word,
      phonetic: word.phonetic,
      part_of_speech: word.partOfSpeech,
      definition: word.definition,
      difficulty_level: word.difficultyLevel,
      context_before: word.contextBefore, // 新增：上下文（前）
      context_after: word.contextAfter, // 新增：上下文（后）
      position_start: word.positionStart,
      position_end: word.positionEnd,
    })),
    syntaxAnalyses: [], // 句法分析延迟加载，暂返回空数组
  };

  console.log(
    `[AI Analyzer] 段落 ${orderIndex + 1} 分析完成：${analysis.terms.length} 个术语，${analysis.difficultWords.length} 个难词`
  );

  return analysis;
}

/**
 * 批量分析段落（带并发控制和快速失败）
 * @param paragraphs 段落列表
 * @param level 用户英语水平
 * @param onProgress 进度回调
 * @returns 段落分析结果列表
 */
export async function analyzeParagraphsBatch(
  paragraphs: string[],
  level: EnglishLevel,
  onProgress?: (current: number, total: number) => void
): Promise<ParagraphAnalysis[]> {
  const limiter = createLimiter(10); // 最多 10 个并发请求
  const results: ParagraphAnalysis[] = [];
  let completed = 0;
  let hasFailed = false; // 失败标志
  let firstError: Error | null = null; // 保存第一个错误

  console.log(`[AI Analyzer] 开始批量分析 ${paragraphs.length} 个段落...`);

  // 并发执行
  const promises = paragraphs.map((content, index) =>
    limiter.run(async () => {
      // 如果已经有失败，立即跳过
      if (hasFailed) {
        throw new Error('批量分析已中止：前序段落分析失败');
      }

      try {
        const analysis = await analyzeParagraph(content, level, index);
        completed++;

        // 报告进度
        if (onProgress) {
          onProgress(completed, paragraphs.length);
        }

        return analysis;
      } catch (error) {
        // 设置失败标志
        hasFailed = true;
        if (!firstError) {
          firstError = error instanceof Error ? error : new Error(String(error));
        }
        console.error(`[AI Analyzer] 段落 ${index + 1} 分析失败，中止后续分析`);
        throw error;
      }
    })
  );

  try {
    // 等待所有完成（或第一个失败）
    const analysesWithIndex = await Promise.all(promises);

    // 按原顺序返回
    for (let i = 0; i < paragraphs.length; i++) {
      results.push(analysesWithIndex[i]);
    }

    console.log(`[AI Analyzer] 批量分析完成`);
    return results;
  } catch (error) {
    // 如果有失败，抛出第一个错误
    console.error(`[AI Analyzer] 批量分析失败，已处理 ${completed}/${paragraphs.length} 个段落`);
    throw firstError || error;
  }
}

/**
 * 快速生成论文摘要（不分析结构）
 * @param text 论文文本
 * @returns 中文摘要
 */
export async function generateQuickSummary(text: string): Promise<string> {
  console.log('[AI Analyzer] 生成快速摘要...');

  const prompt = createQuickSummaryPrompt(text);
  const summary = await callDoubaoSingle(prompt, {
    systemPrompt: '你是一位学术论文摘要专家。',
    temperature: PROMPT_CONFIG.TEMPERATURE.summary,
    maxTokens: PROMPT_CONFIG.MAX_TOKENS.summary,
  });

  console.log('[AI Analyzer] 快速摘要生成完成');
  return summary.trim();
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 检查是否应该使用 Mock 数据
 */
export function shouldUseMock(): boolean {
  return process.env.USE_MOCK_AI === 'true';
}

/**
 * 估算文本的 token 数量（粗略估算）
 */
export function estimateTokens(text: string): number {
  // 英文: 1 token ≈ 0.75 单词
  // 中文: 1 token ≈ 1.5 字符
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 0.75);
}

/**
 * 检查文本是否过长
 */
export function isTextTooLong(text: string): boolean {
  return estimateTokens(text) > 100000; // 超过 10 万 tokens
}

