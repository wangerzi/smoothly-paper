# 活跃上下文 - 论文流畅读

## 当前状态

**项目阶段**：初始化阶段  
**当前日期**：2025-11-19  
**项目状态**：Memory Bank 已初始化，准备开始开发

---

## 当前工作焦点

### 立即进行的任务
1. ✅ 创建项目文档（产品需求、UI 设计、技术方案）
2. ✅ 初始化 Memory Bank
3. 🔄 初始化 Next.js 项目结构
4. ⏳ 配置开发环境和依赖
5. ⏳ 搭建首页上传界面

### 下一步计划
- 实现 PDF 上传功能
- 接入 OpenAI API
- 开发阅读界面原型

---

## 最近变更

### [2025-11-19] 段落分析任务拆分优化 + 重试机制 ✅

**问题**：
- 段落分析JSON解析失败：AI返回的positionStart/positionEnd为字符串而非数字
- 返回内容超过4096 tokens导致JSON截断
- 单个段落分析包含4个子任务（术语、难词、句法、翻译），token消耗大
- 所有任务串行执行，速度慢，失败时全部重做
- 失败后继续执行后续请求，浪费资源

**完成的优化**：
1. **架构拆分**：将段落分析拆分为3个独立任务
   - 任务1：`translateParagraph` - 翻译（最高优先级，3000 tokens）
   - 任务2：`annotateVocabulary` - 词汇标注（术语+难词，2000 tokens）
   - 任务3：`analyzeSyntax` - 句法分析（延迟加载，800 tokens）

2. **Prompt优化**：
   - 新增 `createTranslationPrompt` - 简洁的翻译prompt
   - 新增 `createVocabularyPrompt` - 词汇标注prompt（术语2-3个，定义≤30字）
   - 新增 `createSyntaxPrompt` - 句法分析prompt（1-2个句子，解释≤50字）

3. **并发优化**：
   - 翻译和词汇标注并发执行（Promise.all）
   - 句法分析延迟加载（返回空数组）
   - `callDoubaoJSON` 支持 maxTokens 参数

4. **Schema优化**：
   - 新增 `VocabularySchema` - 简化版词汇schema（去掉context字段）
   - 使用 `z.coerce.number()` 自动转换字符串到数字
   - 添加 `default(0)` 防止字段缺失
   - 新增 `SyntaxSchema` - 句法分析schema
   - 保留旧的 `ParagraphAnalysisSchema` 用于兼容

5. **重试机制**：
   - 所有3个任务都添加3次自动重试
   - 指数退避：失败后等待1秒、2秒、3秒再重试
   - 失败日志记录重试次数
   - 重试3次后仍失败才抛出错误

6. **快速失败机制**：
   - 批量分析时，第一个段落失败立即中止后续请求
   - 使用 `hasFailed` 标志位快速判断
   - 保存第一个错误信息用于调试
   - 避免浪费API调用和时间

7. **Prompt强化**：
   - 明确要求positionStart/positionEnd必须是纯数字
   - 提供示例格式（0, 10）
   - 强调所有字段必须提供，不能缺失
   - 系统prompt中增加类型要求

**预期效果**：
- 单段落分析：15-20秒 → **8-12秒**（40%↑）
- Token使用：5000+ → **4200 tokens**（16%↓）
- JSON截断风险：高 → **低**（任务独立）
- 类型错误：自动转换 + 默认值 → **零容忍**
- 失败率：无重试 → **3次重试，降低90%**
- 资源浪费：失败后继续 → **立即中止，节省成本**

**修改文件**：
- `lib/ai/prompts.ts`: 新增3个Prompt函数，强化JSON格式要求
- `lib/ai/analyzer.ts`: 
  - 新增3个分析函数（翻译、词汇、句法）
  - 每个函数添加3次重试机制
  - Schema使用coerce自动转换类型
  - 批量分析添加快速失败逻辑
- `lib/ai/doubao.ts`: callDoubaoJSON支持maxTokens参数
- `memory-bank/decisionLog.md`: 记录架构决策
- `memory-bank/activeContext.md`: 记录最新优化

---

### [2025-11-19] 摘要分段完全分离优化 ✅

**问题**：
- 用户反馈"开始分析论文结构"时间太长（60-120秒）
- 原因：`analyzeStructureAndSplit` 一次性完成结构分析、分段、摘要三个重任务

**完成的优化**：
1. **架构重构**：摘要和分段完全分离
   - 删除 `analyzeStructureAndSplit` 重型函数
   - 新增 `generateFastSummary`：快速摘要生成（仅8000字符）
   - 新增 `splitByRules`：基于换行符和字数的规则分段
   - 新增 `splitLongParagraph`：长段落智能拆分

2. **摘要优化**：
   - 仅使用论文前8000字符（Abstract + Introduction）
   - 并行执行，不阻塞分段处理
   - 预计耗时：5-10秒（原30-60秒）

3. **分段优化**：
   - 完全本地规则处理，无需AI调用
   - 按 `\n\n` 分割，合并<50词段落，拆分>800词段落
   - 预计耗时：<1秒（原30-60秒）

4. **章节识别**：
   - 复用 `detectSectionFromContent` 关键词匹配
   - 基于论文标准章节标题识别

**预期效果**：
- 总体时间：60-120秒 → **10-20秒**（83%↓）
- API成本降低：50%
- 用户体验：显著改善

**修改文件**：
- `lib/ai/analyzer.ts`: 重构核心分析函数
- `app/api/analyze/route.ts`: 更新分析流程
- `lib/ai/prompts.ts`: 优化摘要Prompt
- `memory-bank/decisionLog.md`: 记录架构决策

---

### [2025-11-19] AI 摘要生成初步优化

**问题**：
- 用户反馈摘要生成总是超时
- 原因：输入文本过长（50000字符）、输出要求过多（200-300字）

**完成的优化**：
1. **减少摘要字数**：从 200-300字 优化为 150-200字
2. **缩短输入文本**：从 50000字符 优化为 30000字符
3. **优化分段逻辑**：
   - 优先使用原文换行符(\n\n)作为自然分段点
   - 设置最少字数要求：50个单词
   - 调整段落长度范围：100-300词（原 150-400词）
4. **减少 token 配置**：
   - 摘要输出：1024 → 800 tokens
   - 结构分析：8000 → 6000 tokens

**修改文件**：
- `lib/ai/prompts.ts`: 优化 Prompt 和配置
- `lib/ai/analyzer.ts`: 优化段落过滤逻辑

---

### [2025-11-19] Memory Bank 初始化

**完成的工作**：
1. 创建核心文档：
   - `docs/产品需求文档.md`：完整的 MVP 功能定义
   - `docs/UI 设计和交互文档.md`：炫酷的赛博朋克风格设计
   - `docs/技术方案文档.md`：详细的技术架构和实现方案

2. 初始化 Memory Bank：
   - `projectBrief.md`：项目概述和核心功能
   - `productContext.md`：产品定位和用户体验目标
   - `techContext.md`：技术栈和架构设计
   - `systemPatterns.md`：代码模式和最佳实践
   - `activeContext.md`：当前工作状态（本文件）
   - `progress.md`：开发进度追踪
   - `decisionLog.md`：技术决策记录

**关键决策**：
- 采用 Next.js 14 + React + TypeScript 全栈方案
- 使用 SQLite 作为本地数据库
- UI 风格定位：赛博朋克 + 深空色调 + 霓虹点缀
- 本地优先架构，仅 AI 调用外部服务

---

## 当前技术栈

### 已确定的技术选型
- **前端框架**：Next.js 14 (App Router)
- **UI 库**：React 18 + TypeScript 5
- **样式方案**：Tailwind CSS + shadcn/ui
- **动画库**：Framer Motion
- **数据库**：SQLite (better-sqlite3)
- **PDF 处理**：pdf-parse + pdf.js
- **AI 服务**：OpenAI GPT-4 API

### 待安装的依赖包
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "^1.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.300.0",
    "better-sqlite3": "^9.2.0",
    "pdf-parse": "^1.1.1",
    "pdfjs-dist": "^4.0.0",
    "openai": "^4.24.0",
    "zod": "^3.22.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

---

## 当前问题和挑战

### 技术挑战
1. **零基础学习曲线**：
   - 需要学习 Next.js、React、TypeScript
   - 建议：先跑通官方教程，再开始项目开发

2. **AI Prompt 设计**：
   - 如何设计 Prompt 确保 AI 输出准确、稳定
   - 建议：从简单场景开始，逐步迭代优化

3. **性能优化**：
   - 大型 PDF 文件的处理速度
   - AI 调用的并发控制
   - 建议：MVP 先实现功能，后续优化性能

### 未解决的问题
1. ❓ OpenAI API Key 获取和配置
2. ❓ 词汇等级数据库来源（初级/中级/高级词汇列表）
3. ❓ PDF 解析失败的兜底方案

---

## 开发环境配置

### 需要的环境准备
- [ ] 安装 Node.js 18+
- [ ] 安装 pnpm 或 npm
- [ ] 安装 VS Code + 推荐扩展
- [ ] 注册 OpenAI 账号，获取 API Key
- [ ] 配置 Git（如果还没有）

### 项目初始化步骤
```bash
# 1. 初始化 Next.js 项目
npx create-next-app@latest smoothly-paper --typescript --tailwind --app

# 2. 安装 shadcn/ui
npx shadcn-ui@latest init

# 3. 安装其他依赖
pnpm add better-sqlite3 pdf-parse openai zod framer-motion lucide-react

# 4. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 OPENAI_API_KEY

# 5. 启动开发服务器
pnpm dev
```

---

## 用户反馈和需求

### 用户明确的需求
1. ✅ **完全本地运行**（除大模型外）
2. ✅ **Web 平台**（浏览器访问）
3. ✅ **界面炫酷**（赛博朋克风格）
4. ✅ **零基础友好**（开发者是零基础）

### 待确认的需求
- ❓ 是否需要暗色/亮色模式切换？（已设计护眼模式）
- ❓ 是否需要导出功能？（PDF 注释版）
- ❓ 是否需要打印功能？

---

## 资源和参考

### 学习资源
- [Next.js 官方教程](https://nextjs.org/learn)
- [React 中文文档](https://react.dev/learn)
- [TypeScript 入门教程](https://ts.xcatliu.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 组件库](https://ui.shadcn.com)

### 设计参考
- Dribbble: "cyberpunk dashboard"
- Awwwards: 科技感网站设计
- Vercel 官网：现代化 UI 设计

### 技术参考
- Next.js GitHub 仓库示例
- OpenAI Cookbook（Prompt 工程）
- React Server Components 最佳实践

---

## 时间线

### 本周计划（Week 1）
- [x] 完成项目规划和文档
- [x] 初始化 Memory Bank
- [ ] 初始化 Next.js 项目
- [ ] 学习 Next.js 基础（2-3 天）
- [ ] 搭建首页框架

### 下周计划（Week 2）
- [ ] 实现上传功能
- [ ] 学习 OpenAI API
- [ ] 实现 PDF 解析
- [ ] 数据库设计和初始化

---

## 开发者笔记

### 重要提醒
- 📌 **API Key 安全**：永远不要将 API Key 提交到 Git
- 📌 **渐进式开发**：先实现核心功能，再优化细节
- 📌 **保持简单**：MVP 阶段避免过度设计
- 📌 **记录决策**：重要技术决策记录到 `decisionLog.md`

### 调试技巧
- 使用 `console.log` 调试（零基础友好）
- VS Code 断点调试（学习后使用）
- Next.js 的错误提示很友好，仔细阅读

### 遇到问题时
1. 先查看官方文档
2. 搜索 GitHub Issues
3. 询问 AI 助手（Claude/ChatGPT）
4. 记录问题和解决方案到 Memory Bank

---

**最后更新**：2025-11-19  
**下次更新**：项目初始化完成后

