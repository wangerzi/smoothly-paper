/**
 * PDF 上传 API
 * POST /api/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { createPaper, savePaperContent } from '@/lib/db/papers';
import { parsePDFFromBuffer, extractTitle } from '@/lib/pdf/parser';
import type { EnglishLevel } from '@/types/upload';

// 确保上传目录存在
const UPLOAD_DIR = path.join(process.cwd(), 'data/uploads');

export async function POST(request: NextRequest) {
  try {
    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const level = formData.get('level') as EnglishLevel;

    // 验证参数
    if (!file) {
      return NextResponse.json(
        { error: '请选择 PDF 文件' },
        { status: 400 }
      );
    }

    if (!level || !['beginner', 'intermediate', 'advanced'].includes(level)) {
      return NextResponse.json(
        { error: '请选择有效的英语水平' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: '仅支持 PDF 格式文件' },
        { status: 400 }
      );
    }

    // 验证文件大小（20MB）
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过 20MB' },
        { status: 400 }
      );
    }

    // 生成唯一 ID 和文件名
    const paperId = randomUUID();
    const fileExtension = '.pdf';
    const savedFileName = `${paperId}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, savedFileName);

    // 转换文件为 Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 保存文件
    await writeFile(filePath, buffer);

    // 解析 PDF 提取文本
    let parsedPDF;
    try {
      parsedPDF = await parsePDFFromBuffer(buffer);
    } catch (error) {
      return NextResponse.json(
        { error: 'PDF 解析失败，请确保文件未损坏' },
        { status: 400 }
      );
    }

    // 提取标题
    const title = extractTitle(parsedPDF) || file.name.replace('.pdf', '');

    // 创建数据库记录
    const paper = createPaper({
      id: paperId,
      filename: file.name,
      title,
      file_path: filePath,
      file_size: file.size,
      page_count: parsedPDF.numPages,
      user_level: level,
      status: 'processing',
    });

    // 保存论文全文
    savePaperContent(paperId, parsedPDF.text);

    // 返回成功响应
    return NextResponse.json({
      success: true,
      paperId,
      paper: {
        id: paper.id,
        filename: paper.filename,
        title: paper.title,
        pageCount: paper.page_count,
        status: paper.status,
      },
    });
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json(
      {
        error: '上传失败，请重试',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

