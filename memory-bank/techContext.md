# 技术上下文 - 论文流畅读

## 技术架构概览

### 架构设计原则
1. **本地优先（Local-First）**：除 AI 调用外，所有数据和计算在本地完成
2. **零配置启动**：用户无需配置环境，开箱即用
3. **渐进式增强**：核心功能优先，高级特性后续迭代
4. **类型安全**：全面使用 TypeScript，减少运行时错误

### 系统架构图

```
用户浏览器（localhost:3000）
    ↓
Next.js 应用（前后端一体）
    ├─ 前端：React + Tailwind CSS
    ├─ 后端：API Routes
    └─ 渲染：SSR + CSR 混合
    ↓
本地存储层
    ├─ SQLite 数据库（data/papers.db）
    └─ 文件系统（data/uploads/*.pdf）
    ↓
外部服务（唯一网络依赖）
    └─ OpenAI GPT-4 API
```

## 技术栈详解

### 前端技术

#### 核心框架
- **Next.js 14**：App Router 模式，React 服务端组件
- **React 18**：并发渲染，Suspense 边界
- **TypeScript 5**：严格模式，类型安全

#### 样式方案
- **Tailwind CSS 3.4**：原子化 CSS，快速开发
- **CSS Variables**：主题色统一管理
- **Framer Motion**：声明式动画库

#### UI 组件
- **shadcn/ui**：基于 Radix UI 的无样式组件
- **Lucide React**：轻量级图标库（2KB gzipped）
- **Radix UI Primitives**：无障碍访问组件基础

#### 动画和特效
- **Framer Motion**：页面过渡、组件动画
- **Canvas API**：粒子背景效果
- **CSS 3D Transforms**：立方体加载动画

### 后端技术

#### 运行时
- **Node.js 18+**：支持 ES2022+ 特性
- **Next.js API Routes**：文件系统路由

#### PDF 处理
- **pdf-parse**：纯 JS 实现的 PDF 文本提取
- **pdf.js**（前端）：Mozilla 官方 PDF 渲染库

#### 数据库
- **better-sqlite3**：同步 API 的 SQLite 绑定
- **SQLite**：无服务器、文件型数据库
- **WAL 模式**：提升并发性能

#### 数据验证
- **Zod**：TypeScript 优先的运行时验证

### AI 服务

#### 模型选择
- **主力模型**：GPT-4 Turbo（gpt-4-turbo-preview）
- **备选方案**：GPT-3.5 Turbo（降级方案）
- **未来方向**：Claude 3.5 / 本地 Llama 3

#### API 客户端
- **openai 官方 SDK**：v4.x 版本
- **错误处理**：指数退避重试机制
- **速率限制**：令牌桶算法

## 开发环境

### 必需软件
```bash
Node.js: v18.17+ 或 v20.5+
pnpm: v8.0+ (推荐) 或 npm v9+
Git: v2.30+
VS Code: 最新版
```

### VS Code 扩展
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- GitLens

### 环境变量

```bash
# 必需
OPENAI_API_KEY=sk-xxx

# 可选
OPENAI_BASE_URL=https://api.openai.com/v1  # 代理地址
AI_MODEL=gpt-4-turbo-preview
DATABASE_PATH=./data/papers.db
UPLOAD_DIR=./data/uploads
MAX_FILE_SIZE=20971520  # 20MB
```

## 项目结构规范

### 目录组织原则
- `app/`：Next.js 14 App Router，按路由组织
- `components/`：React 组件，按功能分类
- `lib/`：业务逻辑和工具函数
- `hooks/`：自定义 React Hooks
- `types/`：TypeScript 类型定义
- `data/`：本地数据存储（Git 忽略）

### 命名约定
- **文件名**：PascalCase（组件）、camelCase（工具）
- **组件**：大写开头，如 `UploadZone.tsx`
- **工具函数**：小写开头，如 `pdfParser.ts`
- **类型文件**：小写 + `.ts`，如 `paper.ts`

## 核心依赖说明

### 生产依赖
```json
{
  "next": "^14.0.0",              // React 全栈框架
  "react": "^18.2.0",             // UI 库
  "react-dom": "^18.2.0",         
  "typescript": "^5.3.0",         // 类型系统
  
  "tailwindcss": "^3.4.0",        // 样式框架
  "@radix-ui/react-*": "^1.0.0", // UI 基础组件
  "framer-motion": "^11.0.0",     // 动画库
  "lucide-react": "^0.300.0",     // 图标库
  
  "better-sqlite3": "^9.2.0",     // 数据库
  "pdf-parse": "^1.1.1",          // PDF 解析
  "pdfjs-dist": "^4.0.0",         // PDF 渲染
  
  "openai": "^4.24.0",            // AI API
  "zod": "^3.22.0",               // 数据验证
  
  "clsx": "^2.1.0",               // className 工具
  "tailwind-merge": "^2.2.0"      // Tailwind 合并
}
```

### 开发依赖
```json
{
  "@types/node": "^20.10.0",
  "@types/react": "^18.2.0",
  "@types/better-sqlite3": "^7.6.0",
  
  "eslint": "^8.56.0",
  "eslint-config-next": "^14.0.0",
  "prettier": "^3.1.0",
  "prettier-plugin-tailwindcss": "^0.5.0",
  
  "vitest": "^1.1.0",             // 测试框架
  "@testing-library/react": "^14.1.0"
}
```

## 技术决策

### 为什么选择 Next.js？
✅ **优势**：
- 前后端一体，简化架构
- 零配置，开箱即用
- 优秀的性能和 SEO
- 活跃的社区和生态

❌ **劣势**：
- 学习曲线略陡（对零基础）
- 打包体积较大

**决策**：优势远大于劣势，适合快速开发 MVP

### 为什么选择 SQLite？
✅ **优势**：
- 无需安装数据库服务器
- 单文件存储，易于备份
- 性能足够（本地应用）
- 零配置

❌ **劣势**：
- 不支持并发写入（WAL 模式可缓解）
- 不适合大规模扩展

**决策**：MVP 阶段完美适配，v2.0 可迁移至 PostgreSQL

### 为什么选择 OpenAI？
✅ **优势**：
- GPT-4 理解能力最强
- API 稳定可靠
- 文档完善

❌ **劣势**：
- 费用较高（$0.01/1K tokens）
- 需要网络连接
- 国内访问需代理

**决策**：
- MVP 使用 OpenAI，确保质量
- v2.0 考虑本地 LLM（Llama 3）

### 为什么不用数据库 ORM？
**决策**：使用原生 SQL
- MVP 数据模型简单
- better-sqlite3 的 API 已足够简洁
- 避免引入额外复杂度
- 性能更高

## 性能目标

### 关键指标
| 指标 | 目标值 |
|------|--------|
| 首屏加载（FCP） | < 1.5s |
| 可交互时间（TTI） | < 3s |
| PDF 上传 | < 2s |
| 文本提取（10 页） | < 5s |
| AI 分析（10 段） | < 60s |
| 段落切换 | < 100ms |

### 优化策略
1. **代码分割**：动态导入大型组件
2. **图片优化**：Next.js Image 组件
3. **虚拟滚动**：react-window 处理长列表
4. **缓存策略**：AI 响应缓存到数据库
5. **并发控制**：限制同时 AI 请求数量

## 安全考虑

### 文件上传安全
- 文件大小限制：20MB
- 文件类型验证：仅允许 PDF
- 文件名清洗：防止路径遍历
- 随机文件名：避免冲突

### API 安全
- API Key 仅在服务端使用
- 环境变量不提交到 Git
- 请求速率限制
- 错误信息脱敏

### 数据隐私
- 所有论文数据本地存储
- 不上传用户文件到云端
- AI 调用时仅发送必要文本

## 开发流程

### Git 工作流
```bash
main           # 主分支（稳定版本）
  ├─ develop   # 开发分支
  │   ├─ feature/upload     # 功能分支
  │   ├─ feature/reading    # 功能分支
  │   └─ bugfix/pdf-parse   # 修复分支
```

### 提交规范
```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具变动
```

## 测试策略

### 测试分层
1. **单元测试**：核心工具函数（lib/）
2. **组件测试**：UI 组件（components/）
3. **集成测试**：API 路由（app/api/）
4. **E2E 测试**：关键用户流程（v2.0）

### 测试工具
- **Vitest**：单元测试
- **React Testing Library**：组件测试
- **Playwright**（v2.0）：E2E 测试

## 技术债务

### 已知限制
1. AI 调用成本高，未来需优化
2. 单文件数据库，并发写入受限
3. 词汇等级判断基于规则，不够智能
4. 缺乏离线支持

### 后续优化方向
1. 引入本地 LLM（Ollama + Llama 3）
2. 向量数据库（Qdrant）支持语义搜索
3. 增量分析，缓存已处理段落
4. WebAssembly 加速 PDF 解析

---

**最后更新**：2025-11-19  
**维护者**：技术团队

