# 系统模式 - 论文流畅读

## 架构模式

### 1. 本地优先架构（Local-First Architecture）

**模式描述**：
- 数据存储和计算优先在本地完成
- 仅在必要时调用外部服务（AI API）
- 用户数据不离开本地设备

**应用场景**：
- 所有论文数据存储在本地 SQLite
- PDF 解析在本地完成
- AI 分析结果缓存到本地数据库

**优势**：
- 数据隐私保护
- 响应速度快
- 可离线工作（除首次分析）

### 2. 服务端组件模式（Server Components）

**模式描述**：
使用 Next.js 14 的 React Server Components，在服务端渲染组件。

**应用场景**：
```tsx
// app/read/[id]/page.tsx - 服务端组件
export default async function ReadingPage({ params }) {
  // 在服务端直接访问数据库
  const paper = await getPaperById(params.id);
  
  return (
    <div>
      <ServerPaperContent paper={paper} />
      <ClientAssistantPanel /> {/* 客户端组件 */}
    </div>
  );
}
```

**优势**：
- 减少客户端 JavaScript 体积
- 直接访问数据库，无需 API 层
- 更好的 SEO（虽然本应用不需要）

### 3. 组件组合模式（Compound Component）

**模式描述**：
父组件通过 Context 共享状态，子组件协同工作。

**应用示例**：
```tsx
// 阅读界面组件
<ReadingLayout>
  <ReadingLayout.Sidebar>
    <TableOfContents />
  </ReadingLayout.Sidebar>
  
  <ReadingLayout.Content>
    <PaperContent />
  </ReadingLayout.Content>
  
  <ReadingLayout.Assistant>
    <AssistantPanel />
  </ReadingLayout.Assistant>
</ReadingLayout>
```

## 数据模式

### 1. 数据库事务模式

**模式描述**：
使用事务确保数据一致性，特别是批量插入时。

```typescript
export function savePaperAnalysis(paperId: string, data: Analysis) {
  const insertParagraph = db.prepare(`
    INSERT INTO paragraphs (paper_id, content, translation) 
    VALUES (?, ?, ?)
  `);

  const transaction = db.transaction((paragraphs) => {
    for (const p of paragraphs) {
      insertParagraph.run(paperId, p.content, p.translation);
    }
  });

  transaction(data.paragraphs);
}
```

**应用场景**：
- 保存 AI 分析结果（段落 + 术语 + 生词）
- 确保数据完整性

### 2. 懒加载模式（Lazy Loading）

**模式描述**：
按需加载数据，减少初始加载时间。

```typescript
// 仅加载当前段落的辅助数据
export function getParagraphAnnotations(paragraphId: number) {
  const terms = db.prepare('SELECT * FROM terms WHERE paragraph_id = ?').all(paragraphId);
  const words = db.prepare('SELECT * FROM difficult_words WHERE paragraph_id = ?').all(paragraphId);
  
  return { terms, words };
}
```

**应用场景**：
- 阅读界面：仅加载当前段落的辅助信息
- 避免一次性加载整篇论文的所有标注

### 3. 缓存优先模式（Cache-First）

**模式描述**：
AI 分析结果缓存到数据库，避免重复调用 API。

```typescript
export async function getOrAnalyzeParagraph(paragraphId: number, content: string, level: string) {
  // 1. 尝试从缓存读取
  const cached = db.prepare('SELECT * FROM paragraph_cache WHERE id = ?').get(paragraphId);
  
  if (cached) {
    return cached.data;
  }
  
  // 2. 调用 AI 分析
  const result = await analyzeParagraph(content, level);
  
  // 3. 写入缓存
  db.prepare('INSERT INTO paragraph_cache (id, data) VALUES (?, ?)').run(
    paragraphId,
    JSON.stringify(result)
  );
  
  return result;
}
```

## UI 模式

### 1. 渐进式增强（Progressive Enhancement）

**模式描述**：
核心功能先加载，高级特效后加载。

```tsx
// 动态导入重型组件
const ParticleBackground = dynamic(
  () => import('@/components/effects/ParticleBackground'),
  { 
    ssr: false,  // 不服务端渲染
    loading: () => <div className="bg-space" />  // 后备方案
  }
);
```

### 2. 乐观更新（Optimistic Updates）

**模式描述**：
用户操作立即反馈 UI，后台异步处理。

```tsx
function handleParagraphRead(paragraphId: number) {
  // 1. 立即更新 UI（乐观更新）
  setReadProgress(prev => prev + 1);
  
  // 2. 后台保存到数据库
  saveProgressAsync(paragraphId).catch(() => {
    // 失败时回滚
    setReadProgress(prev => prev - 1);
  });
}
```

### 3. 骨架屏模式（Skeleton Screen）

**模式描述**：
加载时显示占位骨架，减少空白闪烁。

```tsx
export function PaperContentSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton-paragraph">
          <div className="skeleton-line w-full" />
          <div className="skeleton-line w-5/6" />
          <div className="skeleton-line w-4/6" />
        </div>
      ))}
    </div>
  );
}
```

## AI 集成模式

### 1. 重试与降级模式

**模式描述**：
AI 调用失败时重试，多次失败后降级。

```typescript
async function callAIWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
      });
    } catch (error) {
      if (i === maxRetries - 1) {
        // 降级到 GPT-3.5
        return await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        });
      }
      
      // 指数退避
      await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** i));
    }
  }
}
```

### 2. 批量并发限制模式

**模式描述**：
控制并发 AI 请求数量，避免速率限制。

```typescript
import pLimit from 'p-limit';

const limit = pLimit(3); // 最多 3 个并发请求

async function analyzeParagraphsBatch(paragraphs: string[]) {
  return await Promise.all(
    paragraphs.map(p => limit(() => analyzeWithAI(p)))
  );
}
```

### 3. Prompt 模板模式

**模式描述**：
统一管理 AI Prompt，便于调优。

```typescript
// lib/ai/prompts.ts
export const PROMPTS = {
  summarize: (text: string) => `
    请总结以下论文：
    ${text}
    
    要求：200-300字，包含背景、方法、结论。
  `,
  
  annotate: (paragraph: string, level: string) => `
    分析段落（用户水平：${level}）：
    ${paragraph}
    
    输出：术语、难词、语法分析、翻译（JSON 格式）
  `,
};
```

## 代码组织模式

### 1. 功能分层模式

```
lib/
  ├─ db/          # 数据访问层
  ├─ ai/          # AI 服务层
  ├─ pdf/         # PDF 处理层
  └─ utils/       # 通用工具层
```

**原则**：
- 上层依赖下层
- 下层不依赖上层
- 每层职责单一

### 2. 自定义 Hook 模式

**模式描述**：
封装复杂逻辑到 Hook，提升可复用性。

```typescript
// hooks/usePaper.ts
export function usePaper(paperId: string) {
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPaper(paperId).then(data => {
      setPaper(data);
      setLoading(false);
    });
  }, [paperId]);
  
  return { paper, loading };
}
```

### 3. 工厂函数模式

**模式描述**：
使用工厂函数创建配置对象。

```typescript
// lib/ai/factory.ts
export function createAIConfig(model = 'gpt-4-turbo-preview') {
  return {
    model,
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  };
}
```

## 命名约定

### 组件命名
- **页面组件**：`XxxPage.tsx`（如 `UploadPage.tsx`）
- **布局组件**：`XxxLayout.tsx`
- **UI 组件**：`Button.tsx`, `Card.tsx`（shadcn/ui 风格）
- **业务组件**：`PaperContent.tsx`, `AssistantPanel.tsx`

### 函数命名
- **事件处理**：`handleXxx`（如 `handleUpload`）
- **数据获取**：`getXxx`, `fetchXxx`
- **数据修改**：`setXxx`, `updateXxx`, `createXxx`
- **工具函数**：动词开头（如 `formatDate`, `parseText`）

### 变量命名
- **布尔值**：`isXxx`, `hasXxx`, `shouldXxx`
- **数组**：复数形式（如 `paragraphs`, `terms`）
- **对象**：单数形式（如 `paper`, `user`）

## 错误处理模式

### 1. 边界错误模式（Error Boundary）

```tsx
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 2. Try-Catch 包装模式

```typescript
export async function safeExecute<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(error);
    return fallback;
  }
}
```

## 样式模式

### 1. Tailwind 组合模式

```tsx
import { cn } from '@/lib/utils/cn';

export function Button({ className, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg',  // 基础样式
        'bg-primary text-white',  // 主题样式
        'hover:scale-105 transition',  // 交互样式
        className  // 外部覆盖
      )}
      {...props}
    />
  );
}
```

### 2. CSS 变量模式

```css
/* globals.css */
:root {
  --color-primary: #667eea;
  --color-accent: #06b6d4;
  --spacing-unit: 8px;
}

.card {
  color: var(--color-primary);
  padding: calc(var(--spacing-unit) * 3);
}
```

---

**最后更新**：2025-11-19  
**维护者**：技术团队

