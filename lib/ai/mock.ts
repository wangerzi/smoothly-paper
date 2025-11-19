/**
 * Mock AI 分析服务
 * 用于开发阶段快速验证功能，无需调用真实 AI API
 */

import type { EnglishLevel } from '@/types/upload';

// 段落分析结果
export interface ParagraphAnalysis {
  content: string;
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
    position_start: number;
    position_end: number;
  }>;
  syntaxAnalyses: Array<{
    sentence: string;
    structure: string;
    explanation: string;
  }>;
}

// 常见学术术语示例
const MOCK_TERMS = [
  'neural network',
  'machine learning',
  'deep learning',
  'algorithm',
  'optimization',
  'convergence',
  'gradient descent',
  'hyperparameter',
  'overfitting',
  'cross-validation',
  'feature extraction',
  'convolutional',
  'recurrent',
  'transformer',
  'attention mechanism',
];

// 常见难词示例（根据等级）
const DIFFICULT_WORDS = {
  beginner: [
    { word: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', pos: 'adj.', def: '重要的；显著的' },
    { word: 'evaluate', phonetic: '/ɪˈvæljueɪt/', pos: 'v.', def: '评估；评价' },
    { word: 'demonstrate', phonetic: '/ˈdemənstreɪt/', pos: 'v.', def: '证明；展示' },
    { word: 'comprehensive', phonetic: '/ˌkɑːmprɪˈhensɪv/', pos: 'adj.', def: '全面的；综合的' },
    { word: 'substantial', phonetic: '/səbˈstænʃl/', pos: 'adj.', def: '大量的；实质的' },
  ],
  intermediate: [
    { word: 'paradigm', phonetic: '/ˈpærədaɪm/', pos: 'n.', def: '范式；典范' },
    { word: 'empirical', phonetic: '/ɪmˈpɪrɪkl/', pos: 'adj.', def: '经验的；实证的' },
    { word: 'ubiquitous', phonetic: '/juːˈbɪkwɪtəs/', pos: 'adj.', def: '普遍存在的' },
    { word: 'inherent', phonetic: '/ɪnˈhɪrənt/', pos: 'adj.', def: '内在的；固有的' },
    { word: 'facilitate', phonetic: '/fəˈsɪlɪteɪt/', pos: 'v.', def: '促进；使便利' },
  ],
  advanced: [
    { word: 'ameliorate', phonetic: '/əˈmiːliəreɪt/', pos: 'v.', def: '改善；改良' },
    { word: 'efficacy', phonetic: '/ˈefɪkəsi/', pos: 'n.', def: '功效；效力' },
    { word: 'salient', phonetic: '/ˈseɪliənt/', pos: 'adj.', def: '显著的；突出的' },
    { word: 'proliferate', phonetic: '/prəˈlɪfəreɪt/', pos: 'v.', def: '增殖；激增' },
    { word: 'corroborate', phonetic: '/kəˈrɑːbəreɪt/', pos: 'v.', def: '证实；确证' },
  ],
};

/**
 * 生成模拟论文摘要
 */
export function generateMockSummary(text: string): string {
  // 提取前 300 字作为基础
  const snippet = text.slice(0, 300).trim();
  
  return `【本文摘要】\n\n本研究探讨了深度学习在自然语言处理领域的最新进展。通过设计创新的神经网络架构，我们提出了一种新的方法来解决文本理解中的关键挑战。\n\n实验结果表明，该方法在多个基准数据集上取得了显著的性能提升，相比现有方法平均提高了 15-20%。此外，我们还分析了模型的可解释性，为未来研究提供了新的方向。\n\n【核心贡献】\n1. 提出了创新的模型架构\n2. 在多个任务上实现了性能突破\n3. 提供了详细的消融实验和分析\n\n本研究为该领域的后续工作奠定了重要基础。`;
}

/**
 * 智能分段
 * 根据双换行或字数（约 150-300 词/段）拆分文本
 */
export function splitIntoParagraphs(text: string): string[] {
  // 先按双换行分段
  let paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  
  // 处理过长的段落（超过 400 词）
  const result: string[] = [];
  
  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    
    if (words.length <= 400) {
      result.push(para.trim());
    } else {
      // 分割长段落（按句子）
      const sentences = para.split(/(?<=[.!?])\s+/);
      let currentChunk = '';
      let wordCount = 0;
      
      for (const sentence of sentences) {
        const sentenceWords = sentence.split(/\s+/).length;
        
        if (wordCount + sentenceWords > 300 && currentChunk) {
          result.push(currentChunk.trim());
          currentChunk = sentence;
          wordCount = sentenceWords;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
          wordCount += sentenceWords;
        }
      }
      
      if (currentChunk) {
        result.push(currentChunk.trim());
      }
    }
  }
  
  return result;
}

/**
 * 识别段落中的专业术语
 */
function extractTerms(content: string): ParagraphAnalysis['terms'] {
  const terms: ParagraphAnalysis['terms'] = [];
  const contentLower = content.toLowerCase();
  
  // 查找预定义的术语
  for (const term of MOCK_TERMS) {
    if (contentLower.includes(term.toLowerCase())) {
      terms.push({
        term,
        definition: `${term} 的定义和解释（模拟数据）`,
        context: `在本段中，${term} 指的是...`,
        category: '技术术语',
      });
    }
  }
  
  // 识别大写单词（可能是专有名词）
  const capitalWords = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const uniqueCapitalWords = Array.from(new Set(capitalWords)).slice(0, 3);
  
  for (const word of uniqueCapitalWords) {
    if (!terms.some((t) => t.term === word)) {
      terms.push({
        term: word,
        definition: `${word} 的相关解释`,
        context: '专有名词或重要概念',
        category: '专有名词',
      });
    }
  }
  
  return terms.slice(0, 5); // 最多返回 5 个术语
}

/**
 * 标注难词
 */
function extractDifficultWords(
  content: string,
  level: EnglishLevel
): ParagraphAnalysis['difficultWords'] {
  const words: ParagraphAnalysis['difficultWords'] = [];
  const wordList = DIFFICULT_WORDS[level];
  
  // 根据用户水平选择词汇数量
  const targetCount = level === 'beginner' ? 8 : level === 'intermediate' ? 5 : 3;
  
  // 查找难词在文本中的位置
  for (const item of wordList) {
    const regex = new RegExp(`\\b${item.word}\\b`, 'gi');
    const matches = Array.from(content.matchAll(regex));
    
    if (matches.length > 0) {
      const match = matches[0];
      words.push({
        word: item.word,
        phonetic: item.phonetic,
        part_of_speech: item.pos,
        definition: item.def,
        difficulty_level: level === 'beginner' ? 'easy' : level === 'intermediate' ? 'medium' : 'hard',
        position_start: match.index!,
        position_end: match.index! + item.word.length,
      });
      
      if (words.length >= targetCount) break;
    }
  }
  
  // 如果找不到足够的词，随机标注一些
  if (words.length < targetCount) {
    const allWords = content.match(/\b[a-z]{6,}\b/gi) || [];
    const uniqueWords = Array.from(new Set(allWords)).slice(0, targetCount - words.length);
    
    for (const word of uniqueWords) {
      const match = content.search(new RegExp(`\\b${word}\\b`, 'i'));
      if (match !== -1) {
        words.push({
          word: word.toLowerCase(),
          phonetic: '/ˈmɒk/',
          part_of_speech: 'n.',
          definition: '（模拟词汇）',
          difficulty_level: level === 'beginner' ? 'easy' : level === 'intermediate' ? 'medium' : 'hard',
          position_start: match,
          position_end: match + word.length,
        });
      }
    }
  }
  
  return words;
}

/**
 * 提取复杂句并分析
 */
function extractSyntaxAnalyses(content: string): ParagraphAnalysis['syntaxAnalyses'] {
  const sentences = content.split(/(?<=[.!?])\s+/);
  const analyses: ParagraphAnalysis['syntaxAnalyses'] = [];
  
  // 找出较长的句子（超过 20 个词）
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    
    if (words.length > 20 && analyses.length < 2) {
      analyses.push({
        sentence: sentence.trim(),
        structure: '主句 + 从句结构',
        explanation: '这是一个复杂句，包含主句和从属从句。主句表达主要观点，从句提供补充信息或条件。建议先理解主句，再分析从句的逻辑关系。',
      });
    }
  }
  
  return analyses;
}

/**
 * 生成段落的模拟翻译
 */
function generateTranslation(content: string): string {
  // 简单的模拟翻译（实际应该调用翻译 API）
  const sentences = content.split(/(?<=[.!?])\s+/).slice(0, 3);
  
  return `【段落翻译】\n\n${sentences.map((s, i) => `${i + 1}. 这一句的中文翻译...`).join('\n')}\n\n（完整翻译需要 AI 服务）`;
}

/**
 * 分析单个段落（主函数）
 */
export async function analyzeParagraph(
  content: string,
  level: EnglishLevel,
  orderIndex: number
): Promise<ParagraphAnalysis> {
  // 模拟 AI 处理延迟
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  
  return {
    content,
    translation: generateTranslation(content),
    terms: extractTerms(content),
    difficultWords: extractDifficultWords(content, level),
    syntaxAnalyses: extractSyntaxAnalyses(content),
  };
}

/**
 * 批量分析所有段落
 */
export async function analyzeParagraphsBatch(
  paragraphs: string[],
  level: EnglishLevel,
  onProgress?: (current: number, total: number) => void
): Promise<ParagraphAnalysis[]> {
  const results: ParagraphAnalysis[] = [];
  
  for (let i = 0; i < paragraphs.length; i++) {
    const analysis = await analyzeParagraph(paragraphs[i], level, i);
    results.push(analysis);
    
    // 报告进度
    if (onProgress) {
      onProgress(i + 1, paragraphs.length);
    }
  }
  
  return results;
}

/**
 * 检测论文章节
 */
export function detectSection(content: string, index: number): string | null {
  const contentUpper = content.toUpperCase();
  
  // 常见章节标题
  if (contentUpper.includes('ABSTRACT')) return 'Abstract';
  if (contentUpper.includes('INTRODUCTION')) return 'Introduction';
  if (contentUpper.includes('RELATED WORK') || contentUpper.includes('BACKGROUND')) return 'Related Work';
  if (contentUpper.includes('METHOD') || contentUpper.includes('APPROACH')) return 'Methodology';
  if (contentUpper.includes('EXPERIMENT') || contentUpper.includes('EVALUATION')) return 'Experiments';
  if (contentUpper.includes('RESULT')) return 'Results';
  if (contentUpper.includes('DISCUSSION')) return 'Discussion';
  if (contentUpper.includes('CONCLUSION')) return 'Conclusion';
  if (contentUpper.includes('REFERENCE')) return 'References';
  
  // 根据位置推测
  if (index === 0) return 'Abstract';
  if (index === 1) return 'Introduction';
  
  return null;
}

