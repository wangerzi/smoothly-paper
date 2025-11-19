/**
 * AI Prompt 模板
 * 为豆包 API 设计的专用 Prompt
 */

import type { EnglishLevel } from '@/types/upload';

// ============================================================================
// 论文结构分析和智能分段
// ============================================================================

/**
 * 生成论文结构分析的 Prompt
 * 目标：识别论文章节结构，并按结构和语义完整性分段
 */
export function createStructureAnalysisPrompt(fullText: string): string {
  return `你是一位专业的学术论文分析专家。请分析以下英文学术论文的结构，并进行智能分段。

## 任务要求

1. **识别论文章节**：识别论文的主要章节（如 Abstract、Introduction、Related Work、Methodology、Experiments、Results、Discussion、Conclusion、References 等）

2. **智能分段**：
   - 优先使用原文中的换行符(\\n\\n)作为自然分段点
   - 每个段落必须是语义完整的单元（不要在句子中间断开）
   - 段落长度控制在 100-300 个英文单词之间
   - 段落最少不能少于 50 个单词，过短的段落可以与相邻段落合并
   - 如果某个章节太长，优先在换行符处分段，其次按子主题分段
   - 保持段落的学术完整性（一个完整的论点或实验描述）

3. **生成摘要**：用 150-200 字的中文生成论文摘要，包括：
   - 研究背景和核心问题
   - 主要方法
   - 核心贡献（1-2点）

## 论文全文

${fullText.slice(0, 30000)}

${fullText.length > 30000 ? '\n（论文过长，已截断到前30000字符）' : ''}

## 输出格式

请严格按照以下 JSON 格式返回结果：

\`\`\`json
{
  "summary": "论文的中文摘要（200-300字）",
  "sections": [
    {
      "name": "章节名称（如 Abstract、Introduction 等）",
      "paragraphs": [
        "第一个段落的完整英文内容",
        "第二个段落的完整英文内容"
      ]
    }
  ]
}
\`\`\`

注意事项：
- 保持原文的英文内容不变，不要翻译段落内容
- 章节名称使用英文
- 段落必须是完整的，不要在句子中间截断
- 如果无法明确识别章节，可以用 "Section 1"、"Section 2" 等命名
- References 部分可以作为单独章节，但不需要分段`;
}

// ============================================================================
// 段落分析 - 拆分任务
// ============================================================================

/**
 * 任务1: 生成翻译的 Prompt
 */
export function createTranslationPrompt(content: string): string {
  return `请将以下英文学术段落翻译成准确、流畅的中文。

## 要求
- 保持学术严谨性
- 专业术语使用学术界通用译名
- 不要过度口语化

## 段落内容

${content}

请直接返回中文翻译，不要包含其他内容。`;
}

/**
 * 任务2: 生成词汇标注的 Prompt（术语+难词+段落标题）
 */
export function createVocabularyPrompt(
  content: string,
  level: EnglishLevel
): string {
  // 根据用户水平调整标注策略
  const levelConfig = {
    beginner: {
      vocabSize: '3000',
      difficulty: '初级',
      wordCount: '8-12',
      description: '标注较多基础学术词汇',
    },
    intermediate: {
      vocabSize: '5000',
      difficulty: '中级',
      wordCount: '5-8',
      description: '标注中等难度的专业词汇',
    },
    advanced: {
      vocabSize: '8000+',
      difficulty: '高级',
      wordCount: '3-5',
      description: '仅标注高级词汇和专业术语',
    },
  };

  const config = levelConfig[level];

  return `分析以下英文段落，生成标题、标注专业术语和难词。

## 读者水平
- 词汇量：${config.vocabSize}
- 标注数量：术语2-3个，难词${config.wordCount}个

## 段落内容

${content}

## 任务要求

### 0. 段落标题（新增）
- 为段落生成一个简洁的中文标题（3-8个字）
- 标题应概括段落的核心内容
- 例如："模型架构设计"、"实验结果分析"、"数据预处理流程"

### 1. 专业术语（2-3个）
- 识别段落中的核心术语
- 提供简短定义（不超过30字）
- 标注学科分类

### 2. 难词（${config.wordCount}个）
- ${config.description}
- 提供音标、词性、释义（不超过20字）
- 标注难度等级
- **提供上下文**：词汇前后各3-5个词，用于精确定位

## 输出格式（JSON）

\`\`\`json
{
  "paragraphTitle": "段落标题（3-8个中文字）",
  "terms": [
    {
      "term": "术语原文",
      "definition": "简短定义（不超过30字）",
      "category": "分类"
    }
  ],
  "difficultWords": [
    {
      "word": "单词",
      "phonetic": "/音标/",
      "partOfSpeech": "词性",
      "definition": "释义（不超过20字）",
      "difficultyLevel": "easy/medium/hard",
      "contextBefore": "词汇前的3-5个词",
      "contextAfter": "词汇后的3-5个词",
      "positionStart": 0,
      "positionEnd": 10
    }
  ]
}
\`\`\`

**重要规则**：
- JSON格式必须完全正确
- paragraphTitle 必须是简洁的中文标题（3-8个字）
- contextBefore 和 contextAfter 用于定位词汇，必须提供
- contextBefore/After 从段落原文中提取，保持原文大小写
- 如果词汇在段落开头或结尾，上下文可以为空字符串""
- positionStart和positionEnd仍需提供（兼容）
- difficultyLevel只能是easy、medium、hard之一
- 所有字段都必须提供，不能缺失`;
}

/**
 * 任务3: 生成句法分析的 Prompt
 */
export function createSyntaxPrompt(content: string): string {
  return `找出以下段落中1-2个最复杂的长句，分析其结构。

## 段落内容

${content}

## 任务要求
- 找出1-2个最复杂的句子
- 简短描述句子结构
- 用中文解释理解要点（不超过50字）

## 输出格式（JSON）

\`\`\`json
{
  "syntaxAnalyses": [
    {
      "sentence": "句子原文",
      "structure": "结构描述（简短）",
      "explanation": "理解要点（不超过50字）"
    }
  ]
}
\`\`\`

注意：确保JSON格式正确`;
}

// ============================================================================
// 段落深度分析（旧版本，保留用于兼容）
// ============================================================================

/**
 * 生成段落分析的 Prompt
 * 目标：提取术语、标注难词、分析语法、提供翻译
 * 注意：此函数已被拆分为3个独立任务，建议使用新的函数
 */
export function createParagraphAnalysisPrompt(
  content: string,
  level: EnglishLevel
): string {
  // 根据用户水平调整标注策略
  const levelConfig = {
    beginner: {
      vocabSize: '3000',
      difficulty: '初级',
      wordCount: '8-12',
      description: '标注较多基础学术词汇，提供详细解释',
    },
    intermediate: {
      vocabSize: '5000',
      difficulty: '中级',
      wordCount: '5-8',
      description: '标注中等难度的专业词汇',
    },
    advanced: {
      vocabSize: '8000+',
      difficulty: '高级',
      wordCount: '3-5',
      description: '仅标注高级词汇和专业术语',
    },
  };

  const config = levelConfig[level];

  return `你是一位专业的英语学术阅读辅导专家。请对以下段落进行深度分析，帮助读者理解学术内容。

## 读者水平
- 词汇量：${config.vocabSize} 词
- 等级：${config.difficulty}

## 段落内容

${content}

## 任务要求

### 1. 专业术语提取（Terms）
- 识别段落中的专业术语和关键概念（3-5 个）
- 提供术语在**本段上下文中**的具体含义（不是通用定义）
- 标注术语的学科分类（如"机器学习术语"、"统计学概念"等）

### 2. 难词标注（Difficult Words）
- 根据读者水平，标注 ${config.wordCount} 个难词
- ${config.description}
- 提供音标、词性、中文释义
- 标注难度等级（easy/medium/hard）
- 给出词在段落中的位置（字符起始和结束位置）

### 3. 复杂句法分析（Syntax Analysis）
- 找出 1-2 个最复杂的长句
- 分析句子结构（主句、从句、修饰成分）
- 用中文解释句子的逻辑关系，帮助理解

### 4. 准确翻译（Translation）
- 提供流畅、准确的学术中文翻译
- 保持学术严谨性，不要过度口语化
- 专业术语使用学术界通用的中文译名

## 输出格式

请严格按照以下 JSON 格式返回结果：

\`\`\`json
{
  "terms": [
    {
      "term": "术语原文",
      "definition": "该术语在本段中的具体含义",
      "context": "上下文说明（为什么在这里出现，有什么作用）",
      "category": "术语分类"
    }
  ],
  "difficultWords": [
    {
      "word": "单词原形",
      "phonetic": "音标（如 /ˈeksəmpl/）",
      "partOfSpeech": "词性（如 n. / v. / adj.）",
      "definition": "中文释义",
      "difficultyLevel": "easy 或 medium 或 hard",
      "positionStart": 在段落中的起始字符位置（数字）,
      "positionEnd": 在段落中的结束字符位置（数字）
    }
  ],
  "syntaxAnalyses": [
    {
      "sentence": "复杂句子原文",
      "structure": "句子结构描述（如：主句 + 定语从句 + 状语）",
      "explanation": "中文解释：句子的逻辑关系和理解要点"
    }
  ],
  "translation": "段落的完整中文翻译"
}
\`\`\`

注意事项：
- 确保 JSON 格式正确，可以被直接解析
- positionStart 和 positionEnd 必须是数字，且在段落范围内
- 音标使用国际音标（IPA）格式
- 难度等级只能是 easy、medium、hard 三者之一
- 翻译要准确、流畅、符合学术规范`;
}

// ============================================================================
// 快速摘要（单独使用）
// ============================================================================

/**
 * 生成快速摘要的 Prompt（不分析结构，仅生成摘要）
 */
export function createQuickSummaryPrompt(text: string): string {
  return `请用 150-200 字的中文总结以下英文学术论文的核心内容。
该文本来自论文的 Abstract 和 Introduction 部分。

## 要求
1. 说明研究背景和核心问题
2. 概述主要方法
3. 列出核心贡献（1-2 点）

## 论文内容（Abstract + Introduction）

${text}

请直接返回中文摘要，不需要 JSON 格式。`;
}

// ============================================================================
// 章节检测（辅助函数）
// ============================================================================

/**
 * 检测段落是否可能是某个章节的开头
 * 这是一个启发式函数，用于在 AI 分析失败时的降级方案
 */
export function detectSectionFromContent(content: string, index: number): string | null {
  const contentUpper = content.toUpperCase();
  const firstLine = content.split('\n')[0].toUpperCase();

  // 检查常见章节标题
  const sectionPatterns: Array<[RegExp, string]> = [
    [/^ABSTRACT\b/i, 'Abstract'],
    [/^INTRODUCTION\b/i, 'Introduction'],
    [/^RELATED\s+WORK\b/i, 'Related Work'],
    [/^BACKGROUND\b/i, 'Background'],
    [/^PRELIMINARIES\b/i, 'Preliminaries'],
    [/^METHOD(?:OLOGY)?\b/i, 'Methodology'],
    [/^APPROACH\b/i, 'Approach'],
    [/^MODEL\b/i, 'Model'],
    [/^EXPERIMENT(?:S|AL)?\b/i, 'Experiments'],
    [/^EVALUATION\b/i, 'Evaluation'],
    [/^RESULT(?:S)?\b/i, 'Results'],
    [/^DISCUSSION\b/i, 'Discussion'],
    [/^ANALYSIS\b/i, 'Analysis'],
    [/^CONCLUSION(?:S)?\b/i, 'Conclusion'],
    [/^FUTURE\s+WORK\b/i, 'Future Work'],
    [/^REFERENCE(?:S)?\b/i, 'References'],
    [/^ACKNOWLEDGMENT(?:S)?\b/i, 'Acknowledgments'],
    [/^APPENDIX\b/i, 'Appendix'],
  ];

  for (const [pattern, sectionName] of sectionPatterns) {
    if (pattern.test(firstLine) || pattern.test(contentUpper.slice(0, 100))) {
      return sectionName;
    }
  }

  // 根据位置推测
  if (index === 0) {
    // 第一段通常是 Abstract
    if (content.split(/\s+/).length < 500) {
      return 'Abstract';
    }
  } else if (index === 1) {
    // 第二段可能是 Introduction
    return 'Introduction';
  }

  return null;
}

// ============================================================================
// Prompt 配置
// ============================================================================

/**
 * Prompt 配置常量
 */
export const PROMPT_CONFIG = {
  /** 最大输入文本长度（字符） */
  MAX_INPUT_LENGTH: 30000,
  
  /** 快速摘要的文本长度 */
  QUICK_SUMMARY_LENGTH: 8000,
  
  /** 温度参数 */
  TEMPERATURE: {
    structure: 0.3,  // 结构分析需要更确定性
    analysis: 0.3,   // 段落分析需要准确性
    summary: 0.5,    // 摘要可以稍微创造性一些
  },
  
  /** 最大 token 数 */
  MAX_TOKENS: {
    structure: 6000,  // 结构分析返回内容（减少以提高速度）
    analysis: 3500,   // 单段落分析
    summary: 800,     // 摘要相对简短（150-200字中文约600-800 tokens）
  },
};

