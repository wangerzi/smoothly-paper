/**
 * PDF 文本提取和解析
 */

import pdfParse from 'pdf-parse';
import fs from 'fs';

// PDF 解析结果
export interface ParsedPDF {
  text: string;
  numPages: number;
  info?: {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
  };
}

/**
 * 从文件路径解析 PDF
 */
export async function parsePDFFromPath(filePath: string): Promise<ParsedPDF> {
  try {
    // 读取 PDF 文件
    const dataBuffer = fs.readFileSync(filePath);
    
    // 解析 PDF
    const data = await pdfParse(dataBuffer);
    
    return {
      text: cleanText(data.text),
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error('PDF 解析失败:', error);
    throw new Error(`PDF 解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 从 Buffer 解析 PDF
 */
export async function parsePDFFromBuffer(buffer: Buffer): Promise<ParsedPDF> {
  try {
    const data = await pdfParse(buffer);
    
    return {
      text: cleanText(data.text),
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error('PDF 解析失败:', error);
    throw new Error(`PDF 解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 清洗 PDF 提取的文本
 * - 移除多余空白
 * - 修复断行问题
 * - 统一换行符
 */
function cleanText(text: string): string {
  return text
    // 统一换行符
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // 移除页眉页脚（简单规则：独立的数字行）
    .replace(/^\d+\s*$/gm, '')
    // 修复单词断行（连字符）
    .replace(/-\n/g, '')
    // 合并段落内的断行（保留段落间的双换行）
    .replace(/([a-z,;:])\n([a-z])/gi, '$1 $2')
    // 移除多余空格
    .replace(/ +/g, ' ')
    // 移除行首空格
    .replace(/^ +/gm, '')
    // 规范化段落间距（保留双换行，移除三个以上的换行）
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 提取论文标题（启发式规则）
 * - 通常是第一段较短的文本
 * - 或者从 PDF 元数据中获取
 */
export function extractTitle(parsedPDF: ParsedPDF): string | null {
  // 优先使用 PDF 元数据
  if (parsedPDF.info?.Title && parsedPDF.info.Title.trim()) {
    return parsedPDF.info.Title.trim();
  }

  // 从文本中提取（取前 200 字符的第一行）
  const lines = parsedPDF.text.split('\n').filter((line) => line.trim().length > 0);
  
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // 标题通常不会太长
    if (firstLine.length > 10 && firstLine.length < 200) {
      return firstLine;
    }
  }

  return null;
}

/**
 * 统计词数（粗略估算）
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * 验证 PDF 文件
 */
export function validatePDF(buffer: Buffer): { valid: boolean; error?: string } {
  // 检查 PDF 文件头
  const header = buffer.slice(0, 5).toString('utf-8');
  
  if (!header.startsWith('%PDF-')) {
    return {
      valid: false,
      error: '无效的 PDF 文件格式',
    };
  }

  // 检查文件大小（20MB 限制）
  const maxSize = 20 * 1024 * 1024;
  if (buffer.length > maxSize) {
    return {
      valid: false,
      error: '文件大小超过 20MB 限制',
    };
  }

  return { valid: true };
}

