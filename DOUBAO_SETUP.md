# 豆包 AI 服务配置指南

本文档详细说明如何配置和使用豆包（Doubao）AI 服务。

---

## 📋 前置要求

1. **豆包 API 账号**
   - 访问 [火山引擎 ARK 平台](https://console.volcengine.com/ark)
   - 注册并创建应用
   - 获取 API 密钥（Access Key）

2. **开发环境**
   - Node.js 18.17+ 已安装
   - 项目依赖已安装（`npm install`）

---

## ⚙️ 配置步骤

### 步骤 1：创建环境变量文件

在项目根目录创建 `.env.local` 文件（如果不存在）：

```bash
# 豆包 AI API 配置
DOUBAO_API_KEY=你的实际API密钥
DOUBAO_API_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=doubao-seed-1-6-flash-250828

# 开发模式：设置为 true 使用 Mock 数据（避免消耗 API 配额）
USE_MOCK_AI=false
```

**重要提示**：
- ⚠️ **不要将 `.env.local` 提交到 Git**（已在 `.gitignore` 中）
- 📝 `.env.example` 是模板文件，可以提交
- 🔑 API 密钥请妥善保管，不要泄露

### 步骤 2：填入真实的 API 密钥

将 `DOUBAO_API_KEY=你的实际API密钥` 替换为从火山引擎获取的真实密钥。

示例：
```bash
DOUBAO_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 步骤 3：验证配置

启动开发服务器：

```bash
npm run dev
```

如果配置正确，你应该在控制台看到：
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

---

## 🧪 测试 AI 服务

### 测试流程

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问首页**
   打开浏览器访问 http://localhost:3000

3. **上传测试论文**
   - 准备一篇英文学术论文 PDF（建议 < 10 页用于测试）
   - 拖拽到上传区或点击上传
   - 选择英语水平（初级/中级/高级）
   - 点击「开始分析」

4. **观察处理过程**
   - 系统会跳转到处理页面，显示进度动画
   - 检查浏览器控制台（F12 -> Console）查看日志
   - 等待分析完成（约 30-60 秒）

5. **查看分析结果**
   - 自动跳转到阅读界面
   - 检查以下内容：
     - ✅ 论文摘要是否生成
     - ✅ 段落是否按章节结构划分
     - ✅ 术语标注是否准确
     - ✅ 难词高亮是否合理
     - ✅ 翻译是否流畅

### 控制台日志示例

成功调用 AI 服务时，你应该看到类似日志：

```
[Analysis] 使用 真实 AI 模式分析论文 xxx
[AI Analyzer] 开始分析论文结构...
[Doubao API] Tokens - Prompt: 1234, Completion: 567, Total: 1801
[AI Analyzer] 结构分析完成：5 个章节，共 23 个段落
[Analysis] 开始批量分析 23 个段落...
[AI Analyzer] 分析段落 1...
[Analysis] 进度: 1/23
...
✅ 论文 xxx 分析完成
```

---

## 🔧 开发模式

### 使用 Mock 数据（避免消耗 API 配额）

在开发调试 UI 时，可以使用 Mock 模式：

```bash
# .env.local
USE_MOCK_AI=true
```

此时系统会使用模拟数据，不会调用真实的 AI API。

### 切换回真实 AI

```bash
# .env.local
USE_MOCK_AI=false
```

---

## 🐛 常见问题

### 1. 报错：「豆包 API 密钥未配置」

**原因**：`.env.local` 文件不存在或 `DOUBAO_API_KEY` 未设置

**解决方法**：
1. 检查项目根目录是否有 `.env.local` 文件
2. 确认文件中有 `DOUBAO_API_KEY=你的密钥`
3. 重启开发服务器（`Ctrl+C` 停止，再 `npm run dev`）

### 2. 报错：「请求超时」

**原因**：网络问题或 API 响应慢

**解决方法**：
1. 检查网络连接
2. 确认可以访问 `https://ark.cn-beijing.volces.com`
3. 如果在国内，确认 API 地址正确
4. 尝试使用更短的测试文档

### 3. 报错：「速率限制」（Rate Limit）

**原因**：API 调用频率过高

**解决方法**：
1. 等待 1-2 分钟后重试
2. 检查是否有多个请求同时运行
3. 联系火山引擎提升配额

### 4. 分段结果不理想

**可能原因**：
- AI 模型对特定领域论文理解不够
- Prompt 需要针对性优化

**解决方法**：
1. 尝试不同的论文测试
2. 查看日志，确认 AI 是否返回了合理结果
3. 如果需要，可以调整 `lib/ai/prompts.ts` 中的 Prompt

### 5. 分析过程中断

**解决方法**：
1. 查看浏览器控制台错误日志
2. 查看 Next.js 开发服务器控制台
3. 检查数据库文件 `data/papers.db` 是否可写
4. 重新上传论文尝试

---

## 💰 成本控制

### Token 消耗估算

- **结构分析**：~2000-5000 tokens/论文
- **段落分析**：~500-1000 tokens/段落
- **10 页论文**（约 20 段落）：~12,000-25,000 tokens

### 价格参考（豆包 Lite）

- Input：¥0.3 / 1M tokens
- Output：¥0.6 / 1M tokens

**单篇论文成本**：约 ¥0.01-0.03

### 节省建议

1. **开发时使用 Mock 模式**
   ```bash
   USE_MOCK_AI=true
   ```

2. **测试时使用较短文档**（2-5 页）

3. **实现缓存**（已完成）
   - 已分析的论文会保存到数据库
   - 重复查看不会重新调用 API

4. **批量控制**
   - 当前限制：最多 3 个并发请求
   - 可在 `lib/ai/analyzer.ts` 中调整

---

## 📊 监控和调试

### 查看 API 调用日志

所有 API 调用都会在控制台输出详细日志：

```bash
# 开发服务器控制台
[Doubao API] Tokens - Prompt: xxx, Completion: xxx, Total: xxx
[AI Analyzer] 段落 X 分析完成：Y 个术语，Z 个难词
```

### 检查数据库

使用 SQLite 客户端查看数据：

```bash
# macOS/Linux
sqlite3 data/papers.db "SELECT * FROM papers LIMIT 5;"

# Windows
# 使用 DB Browser for SQLite
```

---

## 🔄 后续优化

### 已实现的功能

- ✅ 豆包 API 客户端封装
- ✅ 智能结构分析和分段
- ✅ 多维度段落分析
- ✅ 错误重试和降级机制
- ✅ 并发控制（最多 3 个）
- ✅ Mock/真实 AI 切换

### 未来可优化

- [ ] 缓存优化（段落级缓存）
- [ ] 向量数据库（语义搜索）
- [ ] 本地 LLM 支持（Ollama）
- [ ] 实时进度推送（WebSocket）
- [ ] 成本统计面板

---

## 📚 相关文档

- [豆包 API 官方文档](https://www.volcengine.com/docs/82379)
- [项目 README](./README.md)
- [技术方案文档](./docs/技术方案文档.md)

---

**最后更新**：2025-11-19  
**维护者**：开发团队


