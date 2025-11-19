# 📚 Smoothly Paper - 论文流畅读

> AI 驱动的英文学术论文阅读辅助工具

让英文论文阅读变得优雅而高效。通过 AI 智能分析，为你标注难词、解释术语、分析语法、提供翻译，逐步提升专业英语阅读能力。

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.17.0-brightgreen)

## ✨ 核心特性

- 🎯 **PDF 智能解析**：上传论文 PDF，自动提取文本内容
- 🤖 **AI 驱动分析**：GPT-4 生成摘要、智能分段、难点标注
- 📖 **沉浸式阅读**：三栏布局，原文、辅助、导航一目了然
- 🔤 **多维度辅助**：术语解释、生词标注、语法分析、段落翻译
- 🎨 **炫酷界面**：赛博朋克风格，深空主题 + 霓虹点缀
- 🔒 **本地优先**：数据存储在本地，保护隐私安全
- ⚡ **零配置启动**：开箱即用，无需复杂设置

## 🚀 快速开始

### 环境要求

- Node.js 18.17+ 或 20.5+
- pnpm 8.0+ （推荐）或 npm 9+

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd smoothly-paper
```

2. **安装依赖**

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

3. **配置环境变量**

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 OpenAI API Key：

```env
OPENAI_API_KEY=sk-your-api-key-here
```

4. **初始化数据库**

```bash
pnpm run db:init
```

5. **启动开发服务器**

```bash
pnpm run dev
```

6. **访问应用**

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📖 使用指南

### 1. 上传论文

- 拖拽 PDF 文件到上传区域
- 或点击选择文件
- 选择你的英语水平（初级/中级/高级）
- 点击"开始智能解析"

### 2. 等待分析

AI 会自动完成以下任务：
- 提取 PDF 文本
- 生成论文摘要
- 智能分段
- 标注难点（术语、生词、复杂语法）

### 3. 开始阅读

- **左侧目录**：快速导航到不同章节
- **中间原文**：高亮显示难词（不同颜色表示难度）
- **右侧辅助**：查看术语解释、生词释义、语法分析、段落翻译
- 点击高亮词汇查看详细解释

## 🛠️ 技术栈

### 前端
- Next.js 14 (App Router)
- React 18 + TypeScript 5
- Tailwind CSS + shadcn/ui
- Framer Motion (动画)
- Lucide React (图标)

### 后端
- Next.js API Routes
- SQLite (better-sqlite3)
- pdf-parse (PDF 解析)
- OpenAI GPT-4 API

## 📁 项目结构

```
smoothly-paper/
├── app/                    # Next.js 应用
│   ├── api/               # API 路由
│   ├── read/[id]/        # 阅读页面
│   └── globals.css       # 全局样式
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 基础组件
│   ├── upload/           # 上传相关
│   └── reading/          # 阅读界面
├── lib/                   # 核心库
│   ├── ai/               # AI 服务
│   ├── db/               # 数据库
│   ├── pdf/              # PDF 处理
│   └── utils/            # 工具函数
├── data/                  # 本地数据
│   ├── papers.db         # SQLite 数据库
│   └── uploads/          # 上传的 PDF
├── docs/                  # 项目文档
└── memory-bank/          # Memory Bank
```

## 🎨 界面预览

（开发完成后添加截图）

## 📊 开发进度

- [x] 项目规划和文档
- [x] Memory Bank 初始化
- [x] 项目结构搭建
- [ ] 首页开发
- [ ] PDF 处理
- [ ] AI 服务集成
- [ ] 阅读界面
- [ ] 优化和测试

查看详细进度：[memory-bank/progress.md](memory-bank/progress.md)

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发文档

- [产品需求文档](docs/产品需求文档.md)
- [UI 设计和交互文档](docs/UI%20设计和交互文档.md)
- [技术方案文档](docs/技术方案文档.md)
- [Memory Bank](memory-bank/)

## 🗺️ 路线图

### v1.0 MVP（当前）
- 基础论文上传和解析
- AI 智能分析
- 阅读界面

### v2.0（未来）
- 用户账号系统
- 笔记和标注
- 生词本和学习统计
- 浏览器插件

### v3.0（展望）
- 多论文对比
- 知识图谱
- 协作分享
- 移动端 APP

## 💰 成本估算

- OpenAI API：约 ¥200-500/月（根据使用量）
- 服务器：¥0（本地运行）
- 域名：¥50-100/年（可选）

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [OpenAI](https://openai.com/) - AI 能力支持
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架

## 📧 联系方式

有问题或建议？欢迎通过以下方式联系：

- 提交 [GitHub Issue](../../issues)
- 发送邮件：[your-email@example.com]

---

**用心打造，让论文阅读更流畅 ✨**

