/**
 * 数据库初始化脚本
 * 创建 SQLite 数据库和表结构
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, '../data/papers.db');
const DATA_DIR = path.join(__dirname, '../data');
const UPLOADS_DIR = path.join(__dirname, '../data/uploads');
const CACHE_DIR = path.join(__dirname, '../data/cache');

// 确保目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// 连接数据库
const db = new Database(DB_PATH);

// 启用 WAL 模式
db.pragma('journal_mode = WAL');

console.log('📦 开始初始化数据库...\n');

// 创建表
const tables = [
  {
    name: 'papers',
    sql: `
      CREATE TABLE IF NOT EXISTS papers (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        title TEXT,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        page_count INTEGER,
        upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_level TEXT CHECK(user_level IN ('beginner', 'intermediate', 'advanced')),
        status TEXT CHECK(status IN ('uploading', 'processing', 'completed', 'failed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
  },
  {
    name: 'paper_contents',
    sql: `
      CREATE TABLE IF NOT EXISTS paper_contents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paper_id TEXT NOT NULL,
        full_text TEXT NOT NULL,
        summary TEXT,
        FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
      )
    `,
  },
  {
    name: 'paragraphs',
    sql: `
      CREATE TABLE IF NOT EXISTS paragraphs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paper_id TEXT NOT NULL,
        section TEXT,
        order_index INTEGER,
        content TEXT NOT NULL,
        translation TEXT,
        word_count INTEGER,
        FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
      )
    `,
  },
  {
    name: 'terms',
    sql: `
      CREATE TABLE IF NOT EXISTS terms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paragraph_id INTEGER NOT NULL,
        term TEXT NOT NULL,
        definition TEXT,
        context TEXT,
        category TEXT,
        FOREIGN KEY (paragraph_id) REFERENCES paragraphs(id) ON DELETE CASCADE
      )
    `,
  },
  {
    name: 'difficult_words',
    sql: `
      CREATE TABLE IF NOT EXISTS difficult_words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paragraph_id INTEGER NOT NULL,
        word TEXT NOT NULL,
        phonetic TEXT,
        part_of_speech TEXT,
        definition TEXT,
        difficulty_level TEXT CHECK(difficulty_level IN ('easy', 'medium', 'hard')),
        position_start INTEGER,
        position_end INTEGER,
        FOREIGN KEY (paragraph_id) REFERENCES paragraphs(id) ON DELETE CASCADE
      )
    `,
  },
  {
    name: 'syntax_analyses',
    sql: `
      CREATE TABLE IF NOT EXISTS syntax_analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paragraph_id INTEGER NOT NULL,
        sentence TEXT NOT NULL,
        structure TEXT,
        explanation TEXT,
        FOREIGN KEY (paragraph_id) REFERENCES paragraphs(id) ON DELETE CASCADE
      )
    `,
  },
  {
    name: 'reading_progress',
    sql: `
      CREATE TABLE IF NOT EXISTS reading_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paper_id TEXT NOT NULL,
        current_paragraph_id INTEGER,
        progress_percentage REAL,
        last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
      )
    `,
  },
];

// 执行建表
tables.forEach(({ name, sql }) => {
  try {
    db.exec(sql);
    console.log(`✅ 表 ${name} 创建成功`);
  } catch (error) {
    console.error(`❌ 表 ${name} 创建失败:`, error.message);
  }
});

console.log('\n📊 创建索引...\n');

// 创建索引
const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_papers_status ON papers(status)',
  'CREATE INDEX IF NOT EXISTS idx_paragraphs_paper_id ON paragraphs(paper_id)',
  'CREATE INDEX IF NOT EXISTS idx_paragraphs_order ON paragraphs(paper_id, order_index)',
  'CREATE INDEX IF NOT EXISTS idx_terms_paragraph ON terms(paragraph_id)',
  'CREATE INDEX IF NOT EXISTS idx_words_paragraph ON difficult_words(paragraph_id)',
];

indexes.forEach((sql, index) => {
  try {
    db.exec(sql);
    console.log(`✅ 索引 ${index + 1} 创建成功`);
  } catch (error) {
    console.error(`❌ 索引 ${index + 1} 创建失败:`, error.message);
  }
});

// 关闭数据库连接
db.close();

console.log('\n✨ 数据库初始化完成！');
console.log(`📍 数据库位置: ${DB_PATH}\n`);

