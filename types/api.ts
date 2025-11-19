/**
 * API 响应类型定义
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface UploadResponse {
  paperId: string;
  filename: string;
  fileSize: number;
  status: string;
}

export interface AnalysisProgress {
  paperId: string;
  status: 'pending' | 'extracting' | 'summarizing' | 'segmenting' | 'annotating' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string;
  estimatedTime?: number; // 秒
  error?: string;
}

export interface PaperDetail {
  paper: {
    id: string;
    filename: string;
    title: string;
    pageCount: number;
    status: string;
  };
  summary: string;
  paragraphs: Array<{
    id: number;
    section: string;
    content: string;
    translation: string;
    terms: Array<{
      term: string;
      definition: string;
      context: string;
    }>;
    words: Array<{
      word: string;
      definition: string;
      difficultyLevel: string;
    }>;
  }>;
}

