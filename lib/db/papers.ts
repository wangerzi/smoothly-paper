/**
 * Papers 表相关的数据库操作
 */

import { getDb, execute, queryOne, query } from './client';
import type { EnglishLevel } from '@/types/upload';

// 论文状态
export type PaperStatus = 'uploading' | 'processing' | 'completed' | 'failed';

// 论文数据类型
export interface Paper {
  id: string;
  filename: string;
  title: string | null;
  file_path: string;
  file_size: number | null;
  page_count: number | null;
  upload_time: string;
  user_level: EnglishLevel;
  status: PaperStatus;
  created_at: string;
  updated_at: string;
}

// 创建论文参数
export interface CreatePaperParams {
  id: string;
  filename: string;
  title?: string;
  file_path: string;
  file_size: number;
  page_count?: number;
  user_level: EnglishLevel;
  status?: PaperStatus;
}

/**
 * 创建论文记录
 */
export function createPaper(params: CreatePaperParams): Paper {
  const {
    id,
    filename,
    title,
    file_path,
    file_size,
    page_count,
    user_level,
    status = 'uploading',
  } = params;

  const sql = `
    INSERT INTO papers (
      id, filename, title, file_path, file_size, 
      page_count, user_level, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  execute(sql, [
    id,
    filename,
    title || null,
    file_path,
    file_size,
    page_count || null,
    user_level,
    status,
  ]);

  // 返回创建的记录
  return getPaperById(id)!;
}

/**
 * 根据 ID 获取论文
 */
export function getPaperById(id: string): Paper | undefined {
  const sql = 'SELECT * FROM papers WHERE id = ?';
  return queryOne<Paper>(sql, [id]);
}

/**
 * 更新论文状态
 */
export function updatePaperStatus(id: string, status: PaperStatus): void {
  const sql = `
    UPDATE papers 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  execute(sql, [status, id]);
}

/**
 * 更新论文信息
 */
export function updatePaper(
  id: string,
  updates: Partial<Pick<Paper, 'title' | 'page_count' | 'status'>>
): void {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.page_count !== undefined) {
    fields.push('page_count = ?');
    values.push(updates.page_count);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  if (fields.length === 0) return;

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const sql = `UPDATE papers SET ${fields.join(', ')} WHERE id = ?`;
  execute(sql, values);
}

/**
 * 保存论文内容
 */
export function savePaperContent(
  paperId: string,
  fullText: string,
  summary?: string
): void {
  const sql = `
    INSERT INTO paper_contents (paper_id, full_text, summary)
    VALUES (?, ?, ?)
    ON CONFLICT(paper_id) DO UPDATE SET
      full_text = excluded.full_text,
      summary = excluded.summary
  `;
  
  const db = getDb();
  // 注意：SQLite 不直接支持 ON CONFLICT，需要先删除再插入
  db.prepare('DELETE FROM paper_contents WHERE paper_id = ?').run(paperId);
  db.prepare(`
    INSERT INTO paper_contents (paper_id, full_text, summary)
    VALUES (?, ?, ?)
  `).run(paperId, fullText, summary || null);
}

/**
 * 获取论文内容
 */
export function getPaperContent(paperId: string): {
  full_text: string;
  summary: string | null;
} | undefined {
  const sql = 'SELECT full_text, summary FROM paper_contents WHERE paper_id = ?';
  return queryOne(sql, [paperId]);
}

/**
 * 获取所有论文列表（按上传时间倒序）
 */
export function getAllPapers(limit = 50): Paper[] {
  const sql = `
    SELECT * FROM papers 
    ORDER BY upload_time DESC 
    LIMIT ?
  `;
  return query<Paper>(sql, [limit]);
}

/**
 * 删除论文（级联删除所有关联数据）
 */
export function deletePaper(id: string): void {
  const sql = 'DELETE FROM papers WHERE id = ?';
  execute(sql, [id]);
}

