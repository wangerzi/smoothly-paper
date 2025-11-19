/**
 * 论文相关类型定义
 */

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export type PaperStatus = 'uploading' | 'processing' | 'completed' | 'failed';

export interface Paper {
  id: string;
  filename: string;
  title?: string;
  filePath: string;
  fileSize: number;
  pageCount?: number;
  userLevel: UserLevel;
  status: PaperStatus;
  uploadTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaperContent {
  id: number;
  paperId: string;
  fullText: string;
  summary?: string;
}

export interface Paragraph {
  id: number;
  paperId: string;
  section: string;
  orderIndex: number;
  content: string;
  translation?: string;
  wordCount: number;
}

export interface Term {
  id: number;
  paragraphId: number;
  term: string;
  definition: string;
  context?: string;
  category?: string;
}

export interface DifficultWord {
  id: number;
  paragraphId: number;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  positionStart: number;
  positionEnd: number;
}

export interface SyntaxAnalysis {
  id: number;
  paragraphId: number;
  sentence: string;
  structure: string; // JSON 格式
  explanation: string;
}

export interface PaperAnalysis {
  summary: {
    summary: string;
    background: string;
    problem: string;
    method: string;
    findings: string;
    significance: string;
    keywords: string[];
  };
  paragraphs: Array<{
    section: string;
    order: number;
    content: string;
    wordCount: number;
    terms: Array<{
      term: string;
      definition: string;
      context: string;
      category: string;
    }>;
    difficultWords: Array<{
      word: string;
      phonetic: string;
      partOfSpeech: string;
      definition: string;
      difficultyLevel: 'easy' | 'medium' | 'hard';
      positionStart: number;
      positionEnd: number;
    }>;
    complexSentences: Array<{
      sentence: string;
      structure: string;
      explanation: string;
    }>;
    translation: string;
  }>;
}

