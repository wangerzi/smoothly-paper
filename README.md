# 📚 Smoothly Paper - 论文流畅读

AI 驱动的英文学术论文阅读辅助工具，让论文阅读变得优雅而高效。

## ✨ 特性

- 🎯 **智能分析**：AI 自动生成论文摘要、按结构智能分段、多维度难点标注
- 📖 **沉浸式阅读**：三栏布局，目录导航、原文阅读、辅助面板一目了然
- 🔤 **个性化标注**：根据英语水平（初级/中级/高级）智能标注生词
- 🤖 **豆包 AI 驱动**：使用火山引擎豆包大模型，支持论文结构识别和精准翻译
- 🎨 **炫酷界面**：赛博朋克风格，毛玻璃效果，流畅动画
- 🔒 **隐私优先**：完全本地运行，论文数据不上传云端
- ⚡ **灵活配置**：支持真实 AI / Mock 模式切换，开发测试两不误

## 🚀 快速开始

### 环境要求

- Node.js 18.17+ 或 20.5+
- npm / pnpm / yarn

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/yourusername/smoothly-paper.git
cd smoothly-paper
```

2. **安装依赖**

```bash
npm install
# 或
pnpm install
```

3. **初始化数据库**

```bash
npm run db:init
```

4. **配置豆包 AI（可选）**

```bash
# 创建 .env.local 文件
cp .env.example .env.local

# 编辑 .env.local，填入豆包 API 密钥
# DOUBAO_API_KEY=你的密钥
```

> 💡 **提示**：开发测试可以使用 Mock 模式（设置 `USE_MOCK_AI=true`），无需配置 API 密钥。

详细配置请查看 [豆包 AI 快速开始](./QUICK_START.md)

5. **启动开发服务器**

```bash
npm run dev
```

6. **打开浏览器访问** [http://localhost:3000](http://localhost:3000)

## 📖 使用指南

### 1. 上传论文

- 拖拽或点击上传 PDF 文件（≤20MB）
- 选择您的英语水平（初级/中级/高级）
- 点击"开始分析"

### 2. 等待分析

- AI 会自动提取文本、生成摘要、智能分段、标注难点
- 通常需要 30-60 秒

### 3. 开始阅读

- **左侧目录栏**：快速导航到不同章节
- **中间原文区**：阅读原文，点击高亮词汇查看释义
- **右侧辅助面板**：查看术语、生词、语法分析、翻译

### 4. 阅读功能

- 🔼🔽 上一段/下一段导航
- 🔍 字号调节（12-24px）
- 👁️ 护眼模式
- 📊 实时阅读进度

## 🛠️ 技术栈

- **前端框架**：Next.js 14 + React 18 + TypeScript
- **样式方案**：Tailwind CSS + shadcn/ui
- **数据库**：SQLite (better-sqlite3)
- **PDF 处理**：pdf-parse + pdfjs-dist
- **动画**：Framer Motion
- **AI 服务**：豆包 AI (Doubao) + Mock 模式（开发测试）

## 📁 项目结构

```
smoothly-paper/
├── app/                  # Next.js 页面和 API 路由
│   ├── api/             # API 接口
│   ├── processing/      # 处理中页面
│   └── read/            # 阅读页面
├── components/          # React 组件
│   ├── effects/         # 动画效果组件
│   ├── reading/         # 阅读相关组件
│   ├── ui/              # UI 基础组件
│   └── upload/          # 上传组件
├── lib/                 # 核心业务逻辑
│   ├── ai/              # AI 分析服务
│   ├── db/              # 数据库操作
│   ├── pdf/             # PDF 处理
│   └── utils/           # 工具函数
├── hooks/               # 自定义 Hooks
├── types/               # TypeScript 类型定义
├── data/                # 数据存储（本地）
│   ├── papers.db        # SQLite 数据库
│   ├── uploads/         # PDF 文件
│   └── cache/           # 缓存文件
└── memory-bank/         # 项目文档和记忆库
```

## 🔧 开发指南

### AI 服务配置

项目支持两种 AI 模式：

#### Mock 模式（推荐用于开发）
```bash
# .env.local
USE_MOCK_AI=true
```
使用模拟数据，不消耗 API 配额，快速验证功能。

#### 真实 AI 模式（豆包）
```bash
# .env.local
USE_MOCK_AI=false
DOUBAO_API_KEY=你的真实密钥
DOUBAO_API_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=doubao-seed-1-6-flash-250828
```

**获取 API 密钥**：访问 [火山引擎 ARK 平台](https://console.volcengine.com/ark)

**详细文档**：
- [快速开始](./QUICK_START.md) - 5 分钟配置
- [完整配置指南](./DOUBAO_SETUP.md) - 详细说明
- [测试指南](./DOUBAO_TESTING_GUIDE.md) - 测试流程

### 数据库操作

```bash
# 初始化数据库
npm run db:init

# 重置数据库（删除所有数据）
rm -rf data/papers.db && npm run db:init
```

### 代码规范

```bash
# 代码检查
npm run lint

# 代码格式化（如已配置）
npm run format
```

### 构建生产版本

```bash
npm run build
npm start
```

## 🎯 Roadmap

### v1.0 (当前)
- [x] PDF 上传和解析
- [x] Mock AI 分析（开发测试）
- [x] **豆包 AI 集成** ✨ 新增
  - [x] 论文结构识别（章节自动划分）
  - [x] 智能分段（语义完整性）
  - [x] 多维度段落分析（术语、难词、语法、翻译）
  - [x] 错误处理和降级机制
- [x] 三栏阅读界面
- [x] 生词标注和翻译
- [x] 阅读进度追踪

### v2.0 (计划中)
- [ ] 用户账号和云同步
- [ ] 笔记和标注系统
- [ ] 生词本和学习统计
- [ ] 段落级缓存优化
- [ ] 浏览器插件版本

### v3.0 (未来)
- [ ] 多论文对比阅读
- [ ] 知识图谱构建
- [ ] 本地 LLM 支持（Ollama）
- [ ] 协作和分享功能
- [ ] 移动端 APP

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [shadcn/ui](https://ui.shadcn.com/) - 精美的 UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 框架
- [豆包 AI](https://www.volcengine.com/product/doubao) - 火山引擎大语言模型
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - PDF 文本提取
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - 高性能 SQLite 绑定

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/yourusername/smoothly-paper/issues)
- 发送邮件至：your.email@example.com

---

**Made with ❤️ by [Your Name]**
