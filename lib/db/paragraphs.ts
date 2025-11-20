/**
 * Paragraphs 表及相关标注数据的数据库操作
 */

import { getDb, execute, query, batchInsert } from './client';

// 段落数据类型
export interface Paragraph {
  id: number;
  paper_id: string;
  section: string | null;
  title: string | null; // 新增：段落标题
  order_index: number;
  content: string;
  translation: string | null;
  word_count: number | null;
}

// 术语数据类型
export interface Term {
  id: number;
  paragraph_id: number;
  term: string;
  definition: string | null;
  context: string | null;
  category: string | null;
}

// 难词数据类型
export interface DifficultWord {
  id: number;
  paragraph_id: number;
  word: string;
  phonetic: string | null;
  part_of_speech: string | null;
  definition: string | null;
  difficulty_level: 'easy' | 'medium' | 'hard';
  context_before: string | null; // 新增：上下文（前）
  context_after: string | null; // 新增：上下文（后）
  position_start: number | null;
  position_end: number | null;
}

// 段落标注（包含术语、难词）
export interface ParagraphAnnotations {
  terms: Term[];
  difficultWords: DifficultWord[];
}

// 完整段落数据（包含标注）
export interface ParagraphWithAnnotations extends Paragraph {
  annotations: ParagraphAnnotations;
}

/**
 * 批量插入段落
 */
export function saveParagraphs(
  paperId: string,
  paragraphs: Array<{
    section?: string | null;
    title?: string | null; // 新增：段落标题
    order_index: number;
    content: string;
    translation?: string | null;
    word_count?: number;
  }>
): number[] {
  const db = getDb();
  const sql = `
    INSERT INTO paragraphs (
      paper_id, section, title, order_index, content, translation, word_count
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const stmt = db.prepare(sql);
  const ids: number[] = [];

  const insertMany = db.transaction((items: typeof paragraphs) => {
    for (const p of items) {
      const result = stmt.run(
        paperId,
        p.section || null,
        p.title || null, // 新增：段落标题
        p.order_index,
        p.content,
        p.translation || null,
        p.word_count || null
      );
      ids.push(result.lastInsertRowid as number);
    }
  });

  insertMany(paragraphs);
  return ids;
}

/**
 * 获取论文的所有段落
 */
export function getParagraphsByPaperId(paperId: string): Paragraph[] {
  const sql = `
    SELECT * FROM paragraphs 
    WHERE paper_id = ? 
    ORDER BY order_index ASC
  `;
  return query<Paragraph>(sql, [paperId]);
}

/**
 * 根据 ID 获取单个段落
 */
export function getParagraphById(id: number): Paragraph | undefined {
  const db = getDb();
  const sql = 'SELECT * FROM paragraphs WHERE id = ?';
  return db.prepare(sql).get(id) as Paragraph | undefined;
}

/**
 * 批量插入术语
 */
export function saveTerms(
  paragraphId: number,
  terms: Array<{
    term: string;
    definition?: string;
    context?: string;
    category?: string;
  }>
): void {
  if (terms.length === 0) return;

  const sql = `
    INSERT INTO terms (paragraph_id, term, definition, context, category)
    VALUES (?, ?, ?, ?, ?)
  `;

  const records = terms.map((t) => [
    paragraphId,
    t.term,
    t.definition || null,
    t.context || null,
    t.category || null,
  ]);

  batchInsert(sql, records);
}

/**
 * 批量插入难词
 */
export function saveDifficultWords(
  paragraphId: number,
  words: Array<{
    word: string;
    phonetic?: string;
    part_of_speech?: string;
    definition?: string;
    difficulty_level: 'easy' | 'medium' | 'hard';
    context_before?: string; // 新增：上下文（前）
    context_after?: string; // 新增：上下文（后）
    position_start?: number;
    position_end?: number;
  }>
): void {
  if (words.length === 0) return;

  const sql = `
    INSERT INTO difficult_words (
      paragraph_id, word, phonetic, part_of_speech, 
      definition, difficulty_level, context_before, context_after,
      position_start, position_end
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const records = words.map((w) => [
    paragraphId,
    w.word,
    w.phonetic || null,
    w.part_of_speech || null,
    w.definition || null,
    w.difficulty_level,
    w.context_before || null, // 新增：上下文（前）
    w.context_after || null, // 新增：上下文（后）
    w.position_start || null,
    w.position_end || null,
  ]);

  batchInsert(sql, records);
}


/**
 * 获取段落的所有标注
 */
export function getParagraphAnnotations(
  paragraphId: number
): ParagraphAnnotations {
  const terms = query<Term>(
    'SELECT * FROM terms WHERE paragraph_id = ?',
    [paragraphId]
  );

  const difficultWords = query<DifficultWord>(
    'SELECT * FROM difficult_words WHERE paragraph_id = ? ORDER BY position_start',
    [paragraphId]
  );

  return {
    terms,
    difficultWords,
  };
}

/**
 * 获取论文的所有段落及标注
 */
export function getParagraphsWithAnnotations(
  paperId: string
): ParagraphWithAnnotations[] {
  const paragraphs = getParagraphsByPaperId(paperId);

  return paragraphs.map((p) => ({
    ...p,
    annotations: getParagraphAnnotations(p.id),
  }));
}

/**
 * 保存阅读进度
 */
export function saveReadingProgress(
  paperId: string,
  currentParagraphId: number,
  progressPercentage: number
): void {
  const db = getDb();
  
  // 先删除旧记录
  db.prepare('DELETE FROM reading_progress WHERE paper_id = ?').run(paperId);
  
  // 插入新记录
  const sql = `
    INSERT INTO reading_progress (
      paper_id, current_paragraph_id, progress_percentage
    )
    VALUES (?, ?, ?)
  `;
  
  db.prepare(sql).run(paperId, currentParagraphId, progressPercentage);
}

/**
 * 获取阅读进度
 */
export function getReadingProgress(paperId: string): {
  current_paragraph_id: number;
  progress_percentage: number;
  last_read_at: string;
} | undefined {
  const sql = `
    SELECT current_paragraph_id, progress_percentage, last_read_at
    FROM reading_progress
    WHERE paper_id = ?
  `;
  
  const db = getDb();
  return db.prepare(sql).get(paperId) as any;
}

