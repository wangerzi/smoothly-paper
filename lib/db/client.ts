/**
 * SQLite 数据库客户端
 * 提供统一的数据库连接和基础操作
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 数据库文件路径
const DB_PATH = path.join(process.cwd(), 'data/papers.db');

// 确保数据目录存在
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 创建数据库连接
let db: Database.Database | null = null;

/**
 * 获取数据库连接实例（单例模式）
 */
export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    // 启用 WAL 模式提升性能
    db.pragma('journal_mode = WAL');
    // 启用外键约束
    db.pragma('foreign_keys = ON');
  }
  return db;
}

/**
 * 关闭数据库连接
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * 执行事务
 */
export function transaction<T>(fn: (db: Database.Database) => T): T {
  const database = getDb();
  const txn = database.transaction(fn);
  return txn(database);
}

/**
 * 通用查询函数（返回多行）
 */
export function query<T = any>(sql: string, params?: any[]): T[] {
  const database = getDb();
  const stmt = database.prepare(sql);
  return stmt.all(params || []) as T[];
}

/**
 * 通用查询函数（返回单行）
 */
export function queryOne<T = any>(sql: string, params?: any[]): T | undefined {
  const database = getDb();
  const stmt = database.prepare(sql);
  return stmt.get(params || []) as T | undefined;
}

/**
 * 通用执行函数（INSERT/UPDATE/DELETE）
 */
export function execute(sql: string, params?: any[]): Database.RunResult {
  const database = getDb();
  const stmt = database.prepare(sql);
  return stmt.run(params || []);
}

/**
 * 批量插入
 */
export function batchInsert(sql: string, records: any[][]): void {
  const database = getDb();
  const stmt = database.prepare(sql);
  const insertMany = database.transaction((items: any[][]) => {
    for (const item of items) {
      stmt.run(item);
    }
  });
  insertMany(records);
}

// 导出类型
export type { Database };


