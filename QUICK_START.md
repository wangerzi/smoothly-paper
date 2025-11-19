# 快速开始 - 豆包 AI 集成

5 分钟快速配置豆包 AI 服务。

---

## 🚀 快速配置（3 步）

### 1️⃣ 创建配置文件

在项目根目录创建 `.env.local` 文件：

```bash
touch .env.local
```

### 2️⃣ 填入 API 密钥

编辑 `.env.local`，添加以下内容：

```bash
# 豆包 API 配置
DOUBAO_API_KEY=你的API密钥
DOUBAO_API_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=doubao-seed-1-6-flash-250828

# 开发模式（可选）
USE_MOCK_AI=false
```

**获取 API 密钥**：
- 访问 [火山引擎 ARK 平台](https://console.volcengine.com/ark)
- 注册并创建应用
- 复制 API Access Key

### 3️⃣ 启动项目

```bash
npm run dev
```

打开 http://localhost:3000，上传一篇论文测试！

---

## 🧪 快速测试

### 使用 Mock 数据（不消耗配额）

```bash
# .env.local
USE_MOCK_AI=true
```

重启服务器，上传任意 PDF，查看模拟结果。

### 使用真实 AI

```bash
# .env.local
USE_MOCK_AI=false
DOUBAO_API_KEY=你的真实密钥
```

重启服务器，上传 2-5 页的短论文测试。

---

## ❓ 遇到问题？

### 错误：「豆包 API 密钥未配置」

1. 检查 `.env.local` 文件是否存在
2. 确认 `DOUBAO_API_KEY` 已填入真实密钥
3. 重启开发服务器

### 错误：「请求失败」

1. 检查网络连接
2. 确认 API 密钥正确
3. 查看控制台详细错误日志

---

## 📚 详细文档

- [完整配置指南](./DOUBAO_SETUP.md)
- [测试指南](./DOUBAO_TESTING_GUIDE.md)
- [项目 README](./README.md)

---

## 💡 提示

- ✅ 开发时使用 `USE_MOCK_AI=true` 避免消耗配额
- ✅ 测试时先用短论文（2-5 页）
- ✅ 查看浏览器控制台了解详细日志
- ✅ 单篇 10 页论文约消耗 ¥0.01-0.03

---

**配置完成后，开始享受 AI 驱动的论文阅读体验吧！** 🎉


