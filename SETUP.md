# 🚀 项目安装指南

本文档将指导你完成 Smoothly Paper 项目的完整安装和配置。

---

## 📋 前置要求

在开始之前，请确保你的系统已安装：

- **Node.js** 18.17.0 或更高版本
- **pnpm** 8.0+ （推荐）或 npm 9+
- **Git** 2.30+

### 检查版本

```bash
node --version    # 应该 >= v18.17.0
pnpm --version    # 应该 >= 8.0.0（或 npm --version >= 9.0.0）
git --version     # 应该 >= 2.30.0
```

### 安装 pnpm（如果还没有）

```bash
npm install -g pnpm
```

---

## 🎯 安装步骤

### 步骤 1: 安装项目依赖

在项目根目录执行：

```bash
pnpm install
```

或者使用 npm：

```bash
npm install
```

**预计时间**：2-3 分钟（取决于网络速度）

### 步骤 2: 安装 shadcn/ui 组件

shadcn/ui 需要单独安装所需的组件。执行以下命令：

```bash
# 安装 Button 组件
npx shadcn-ui@latest add button

# 安装 Card 组件
npx shadcn-ui@latest add card

# 安装 Tabs 组件
npx shadcn-ui@latest add tabs

# 安装 Tooltip 组件
npx shadcn-ui@latest add tooltip

# 安装 Progress 组件
npx shadcn-ui@latest add progress

# 安装 Scroll Area 组件
npx shadcn-ui@latest add scroll-area
```

或者一次性安装所有组件（推荐）：

```bash
npx shadcn-ui@latest add button card tabs tooltip progress scroll-area
```

**注意**：安装时会提示选择样式，使用默认选项即可（直接按回车）。

### 步骤 3: 安装依赖包（需要原生编译）

某些包（如 better-sqlite3）需要原生编译：

```bash
# macOS 用户需要安装 Xcode Command Line Tools
xcode-select --install

# 然后重新安装 better-sqlite3
pnpm rebuild better-sqlite3
```

**Windows 用户**需要安装：
- Visual Studio Build Tools
- Python 3.x

```bash
# Windows 用户执行
npm install --global windows-build-tools
```

### 步骤 4: 配置环境变量

1. 复制环境变量模板：

```bash
cp .env.example .env.local
```

2. 编辑 `.env.local` 文件，填入你的配置：

```env
# 必填：OpenAI API Key
OPENAI_API_KEY=sk-your-api-key-here

# 可选：如果使用代理
OPENAI_BASE_URL=https://api.openai.com/v1

# 其他配置保持默认即可
```

**如何获取 OpenAI API Key？**

1. 访问 [OpenAI 平台](https://platform.openai.com/)
2. 注册账号并登录
3. 前往 [API Keys 页面](https://platform.openai.com/api-keys)
4. 点击 "Create new secret key"
5. 复制生成的 Key（注意保密！）

### 步骤 5: 初始化数据库

```bash
pnpm run db:init
```

你应该看到类似输出：

```
📦 开始初始化数据库...

✅ 表 papers 创建成功
✅ 表 paper_contents 创建成功
✅ 表 paragraphs 创建成功
...

✨ 数据库初始化完成！
```

### 步骤 6: 启动开发服务器

```bash
pnpm run dev
```

看到以下输出表示启动成功：

```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.3s
```

### 步骤 7: 访问应用

打开浏览器访问：[http://localhost:3000](http://localhost:3000)

你应该能看到炫酷的首页界面！🎉

---

## ✅ 验证安装

### 检查清单

- [ ] 依赖安装成功（没有报错）
- [ ] shadcn/ui 组件安装完成
- [ ] 环境变量配置正确
- [ ] 数据库初始化成功
- [ ] 开发服务器启动成功
- [ ] 浏览器能访问首页

### 测试命令

```bash
# 检查 TypeScript 编译
pnpm run build

# 检查代码规范
pnpm run lint
```

---

## 🐛 常见问题

### 问题 1: `better-sqlite3` 安装失败

**症状**：
```
Error: Could not locate the bindings file
```

**解决方案**：
```bash
# 清理 node_modules 并重新安装
rm -rf node_modules
pnpm install

# 重新编译 native 模块
pnpm rebuild better-sqlite3
```

### 问题 2: 端口 3000 被占用

**症状**：
```
Error: Port 3000 is already in use
```

**解决方案**：

方法 1：杀掉占用端口的进程
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F
```

方法 2：使用其他端口
```bash
pnpm run dev -- -p 3001
```

### 问题 3: OpenAI API 调用失败

**症状**：
```
Error: OpenAI API request failed
```

**可能原因**：
1. API Key 未配置或错误
2. 账号余额不足
3. 网络问题（需要代理）

**解决方案**：
1. 检查 `.env.local` 中的 `OPENAI_API_KEY`
2. 访问 [OpenAI 账单页面](https://platform.openai.com/account/billing) 检查余额
3. 配置代理：
   ```env
   OPENAI_BASE_URL=https://your-proxy-url/v1
   ```

### 问题 4: 页面样式错乱

**症状**：页面显示没有样式或布局异常

**解决方案**：
```bash
# 清理 Next.js 缓存
rm -rf .next

# 重新启动
pnpm run dev
```

### 问题 5: 数据库文件损坏

**症状**：
```
Error: Database is locked or corrupted
```

**解决方案**：
```bash
# 删除数据库文件
rm data/papers.db data/papers.db-shm data/papers.db-wal

# 重新初始化
pnpm run db:init
```

---

## 📚 下一步

安装完成后，你可以：

1. **学习基础知识**
   - [Next.js 官方教程](https://nextjs.org/learn)
   - [React 中文文档](https://react.dev/learn)
   - [TypeScript 入门](https://ts.xcatliu.com/)

2. **开始开发**
   - 查看 [项目文档](./docs/)
   - 阅读 [Memory Bank](./memory-bank/)
   - 查看 [代码注释](./app/page.tsx)

3. **参与贡献**
   - 查看 [开发进度](./memory-bank/progress.md)
   - 选择一个待办任务
   - 提交 Pull Request

---

## 🆘 获取帮助

如果遇到问题：

1. 查看本文档的"常见问题"部分
2. 搜索 [GitHub Issues](../../issues)
3. 提交新的 Issue
4. 询问 AI 助手（Claude/ChatGPT）

---

## 🎉 开始探索

恭喜！你已经成功搭建了 Smoothly Paper 开发环境。

现在可以：
- 上传一篇论文试试（记得先配置 OpenAI API Key）
- 查看代码学习项目结构
- 开始开发新功能

祝你开发愉快！✨

