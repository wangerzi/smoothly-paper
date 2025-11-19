# 🚀 部署指南

本文档说明如何将 Smoothly Paper 部署到生产环境。

## 本地部署

### 1. 构建生产版本

```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:init

# 构建
npm run build
```

### 2. 启动生产服务器

```bash
npm start
```

服务器将在 http://localhost:3000 启动。

### 3. 使用 PM2 守护进程（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "smoothly-paper" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs smoothly-paper

# 设置开机自启
pm2 startup
pm2 save
```

## Docker 部署（推荐）

### 1. 创建 Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产镜像
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# 复制必要文件
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/scripts ./scripts

# 创建数据目录
RUN mkdir -p data/uploads data/cache

# 初始化数据库
RUN npm run db:init

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### 3. 构建和运行

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 云平台部署

### Vercel 部署

**注意**：Vercel 是无服务器平台，不适合需要持久化数据库的应用。建议使用其他方案。

### Railway 部署

1. 访问 [Railway.app](https://railway.app/)
2. 连接 GitHub 仓库
3. 添加环境变量（如需要）
4. 部署

### DigitalOcean 部署

1. 创建 Droplet（Ubuntu 20.04+）
2. SSH 登录服务器
3. 安装 Node.js 和 PM2

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 克隆代码
git clone https://github.com/yourusername/smoothly-paper.git
cd smoothly-paper

# 安装依赖
npm install

# 初始化数据库
npm run db:init

# 构建
npm run build

# 使用 PM2 启动
npm install -g pm2
pm2 start npm --name "smoothly-paper" -- start
pm2 startup
pm2 save
```

4. 配置 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/smoothly-paper
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/smoothly-paper /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

5. 配置 SSL（使用 Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 环境变量

如果未来需要使用真实 AI API，创建 `.env` 文件：

```env
# OpenAI API（可选）
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1

# 数据库路径（可选）
DATABASE_PATH=./data/papers.db

# 上传配置（可选）
UPLOAD_DIR=./data/uploads
MAX_FILE_SIZE=20971520
```

## 性能优化

### 1. 启用 Gzip 压缩

Next.js 已默认启用，确保在 Nginx 中也启用：

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. 配置缓存

```nginx
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 数据库优化

定期清理旧数据：

```bash
# 清理 30 天前的论文
sqlite3 data/papers.db "DELETE FROM papers WHERE created_at < datetime('now', '-30 days');"
```

### 4. 文件清理

定期清理旧的 PDF 文件：

```bash
# 清理 30 天前的文件
find data/uploads -type f -mtime +30 -delete
```

## 监控和日志

### 1. PM2 监控

```bash
# 实时监控
pm2 monit

# 查看日志
pm2 logs smoothly-paper --lines 100
```

### 2. 日志文件

Next.js 日志默认输出到 stdout/stderr，PM2 会自动收集。

### 3. 错误追踪

建议集成 Sentry 进行错误追踪：

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## 备份策略

### 1. 数据库备份

```bash
# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
cp data/papers.db $BACKUP_DIR/papers_$DATE.db
# 保留最近 7 天的备份
find $BACKUP_DIR -name "papers_*.db" -mtime +7 -delete
EOF

chmod +x backup.sh

# 添加到 crontab（每天凌晨 2 点备份）
crontab -e
# 添加：0 2 * * * /path/to/smoothly-paper/backup.sh
```

### 2. 文件备份

使用 rsync 备份上传的 PDF：

```bash
rsync -av --delete data/uploads/ /backup/smoothly-paper/uploads/
```

## 安全建议

1. **防火墙配置**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

2. **文件权限**
```bash
chmod 700 data
chmod 600 data/papers.db
```

3. **定期更新**
```bash
npm audit
npm update
```

4. **限制上传大小**（Nginx）
```nginx
client_max_body_size 20M;
```

## 故障排查

### 问题：端口被占用

```bash
# 查看占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 问题：数据库锁定

```bash
# 检查数据库完整性
sqlite3 data/papers.db "PRAGMA integrity_check;"

# 如果损坏，从备份恢复
cp backups/papers_YYYYMMDD_HHMMSS.db data/papers.db
```

### 问题：磁盘空间不足

```bash
# 查看磁盘使用
df -h

# 查看大文件
du -sh data/*

# 清理旧数据
rm -rf data/uploads/*
```

## 更新应用

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
npm install

# 重新构建
npm run build

# 重启应用
pm2 restart smoothly-paper

# 或 Docker
docker-compose down
docker-compose build
docker-compose up -d
```

## 扩展性

如果用户量增长，可以考虑：

1. **使用 PostgreSQL** 替代 SQLite
2. **添加 Redis** 缓存层
3. **使用对象存储**（如 AWS S3）存储 PDF
4. **负载均衡** 多个 Node.js 实例
5. **CDN** 加速静态资源

---

**祝部署顺利！** 🎉

