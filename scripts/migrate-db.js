/**
 * 数据库迁移脚本
 * 添加段落标题和词汇上下文字段
 */

const Database = require('better-sqlite3');
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, '../data/papers.db');

console.log('🔧 开始数据库迁移...\n');

try {
  // 连接数据库
  const db = new Database(DB_PATH);

  // 检查数据库是否存在
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all();
  
  if (tables.length === 0) {
    console.log('⚠️  数据库为空，请先运行 init-db.js 初始化数据库');
    process.exit(1);
  }

  console.log('📊 当前数据库表:', tables.map(t => t.name).join(', '));
  console.log('');

  // 迁移 1: 添加 paragraphs.title 字段
  console.log('🔄 迁移 1: 添加 paragraphs.title 字段...');
  try {
    // 检查字段是否已存在
    const columnsInfo = db.pragma('table_info(paragraphs)');
    const titleExists = columnsInfo.some(col => col.name === 'title');
    
    if (titleExists) {
      console.log('  ⏭️  字段 title 已存在，跳过');
    } else {
      db.exec('ALTER TABLE paragraphs ADD COLUMN title TEXT');
      console.log('  ✅ 字段 title 添加成功');
    }
  } catch (error) {
    console.error('  ❌ 迁移失败:', error.message);
  }

  // 迁移 2: 添加 difficult_words.context_before 字段
  console.log('🔄 迁移 2: 添加 difficult_words.context_before 字段...');
  try {
    const columnsInfo = db.pragma('table_info(difficult_words)');
    const contextBeforeExists = columnsInfo.some(col => col.name === 'context_before');
    
    if (contextBeforeExists) {
      console.log('  ⏭️  字段 context_before 已存在，跳过');
    } else {
      db.exec('ALTER TABLE difficult_words ADD COLUMN context_before TEXT');
      console.log('  ✅ 字段 context_before 添加成功');
    }
  } catch (error) {
    console.error('  ❌ 迁移失败:', error.message);
  }

  // 迁移 3: 添加 difficult_words.context_after 字段
  console.log('🔄 迁移 3: 添加 difficult_words.context_after 字段...');
  try {
    const columnsInfo = db.pragma('table_info(difficult_words)');
    const contextAfterExists = columnsInfo.some(col => col.name === 'context_after');
    
    if (contextAfterExists) {
      console.log('  ⏭️  字段 context_after 已存在，跳过');
    } else {
      db.exec('ALTER TABLE difficult_words ADD COLUMN context_after TEXT');
      console.log('  ✅ 字段 context_after 添加成功');
    }
  } catch (error) {
    console.error('  ❌ 迁移失败:', error.message);
  }

  // 验证迁移结果
  console.log('\n📋 验证迁移结果...');
  
  const paragraphsColumns = db.pragma('table_info(paragraphs)');
  const hasTitleColumn = paragraphsColumns.some(col => col.name === 'title');
  console.log(`  paragraphs.title: ${hasTitleColumn ? '✅' : '❌'}`);
  
  const wordsColumns = db.pragma('table_info(difficult_words)');
  const hasContextBefore = wordsColumns.some(col => col.name === 'context_before');
  const hasContextAfter = wordsColumns.some(col => col.name === 'context_after');
  console.log(`  difficult_words.context_before: ${hasContextBefore ? '✅' : '❌'}`);
  console.log(`  difficult_words.context_after: ${hasContextAfter ? '✅' : '❌'}`);

  // 关闭数据库连接
  db.close();

  console.log('\n✨ 数据库迁移完成！\n');
} catch (error) {
  console.error('❌ 迁移过程出错:', error.message);
  process.exit(1);
}

