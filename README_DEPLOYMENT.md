# AI Creative Workflow - 部署指南

这是一个基于 Next.js 和 CrewAI 的 AI 创意工作流系统，支持多种 LLM 提供商。

## 📋 目录

- [环境要求](#环境要求)
- [环境变量配置](#环境变量配置)
- [本地开发](#本地开发)
- [部署到 Vercel](#部署到-vercel)
- [部署到其他平台](#部署到其他平台)
- [常见问题](#常见问题)

## 🔧 环境要求

- Node.js 18.x 或更高版本
- Python 3.9 或更高版本
- npm 或 yarn 包管理器

## 🔑 环境变量配置

### 必需的环境变量

在项目根目录创建 `.env` 文件（可以复制 `.env.example`）：

```bash
# API Configuration
OPENAI_API_BASE=https://api.tu-zi.com/v1
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL_NAME=claude-sonnet-4-5-20250929

# Admin Password (IMPORTANT: Change this in production!)
ADMIN_PASSWORD=your-secure-password-here
```

### 可选的环境变量（多 LLM 提供商）

如果你在 `config/llm-providers.json` 中配置了多个 LLM 提供商，可以通过环境变量覆盖它们的 API keys：

```bash
# Tu-Zi API Key
TUZI_API_KEY=your-tuzi-api-key

# Kimi API Key
KIMI_API_KEY=your-kimi-api-key

# DeepSeek API Key
DEEPSEEK_API_KEY=your-deepseek-api-key

# Zhipu AI API Key
ZHIPU_API_KEY=your-zhipu-api-key
```

**重要提示：**
- ⚠️ **永远不要**将真实的 API keys 提交到 Git 仓库
- ⚠️ 在生产环境中，务必修改 `ADMIN_PASSWORD` 为强密码
- ✅ 使用环境变量管理所有敏感信息
- ✅ `.env` 文件已在 `.gitignore` 中，不会被提交

## 💻 本地开发

### 1. 克隆仓库

```bash
git clone <your-repo-url>
cd qiaoagent
```

### 2. 安装依赖

```bash
# 安装 Node.js 依赖
npm install

# 安装 Python 依赖
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的 API keys
nano .env  # 或使用你喜欢的编辑器
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 🚀 部署到 Vercel

### 方式一：通过 GitHub 集成（推荐）

1. **推送代码到 GitHub**

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/your-username/your-repo.git

# 推送到 GitHub
git push -u origin main
```

2. **在 Vercel 中导入项目**

- 访问 [Vercel Dashboard](https://vercel.com/dashboard)
- 点击 "Add New Project"
- 选择你的 GitHub 仓库
- Vercel 会自动检测到 Next.js 项目

3. **配置环境变量**

在 Vercel 项目设置中添加环境变量：

- 进入项目设置 → Environment Variables
- 添加以下变量：
  - `OPENAI_API_BASE`
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL_NAME`
  - `ADMIN_PASSWORD`
  - （可选）其他 LLM 提供商的 API keys

4. **部署**

- 点击 "Deploy"
- 等待部署完成
- 访问 Vercel 提供的 URL

### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 添加环境变量
vercel env add OPENAI_API_KEY
vercel env add OPENAI_API_BASE
vercel env add OPENAI_MODEL_NAME
vercel env add ADMIN_PASSWORD

# 重新部署以应用环境变量
vercel --prod
```

### 使用 GitHub CLI (gh)

如果你使用 GitHub CLI：

```bash
# 创建新仓库
gh repo create qiaoagent --public --source=. --remote=origin

# 推送代码
git add .
git commit -m "Initial commit"
git push -u origin main
```

## 🌐 部署到其他平台

### Netlify

1. 连接 GitHub 仓库
2. 构建命令：`npm run build`
3. 发布目录：`.next`
4. 添加环境变量（同 Vercel）

### Railway

1. 连接 GitHub 仓库
2. Railway 会自动检测 Next.js 项目
3. 添加环境变量
4. 部署

### 自托管（Docker）

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

构建和运行：

```bash
docker build -t qiaoagent .
docker run -p 3000:3000 --env-file .env qiaoagent
```

## 🔒 安全最佳实践

1. **API Keys 管理**
   - 永远不要在代码中硬编码 API keys
   - 使用环境变量存储所有敏感信息
   - 定期轮换 API keys

2. **密码安全**
   - 使用强密码作为 `ADMIN_PASSWORD`
   - 考虑使用密码管理器生成随机密码
   - 不要在多个服务中重复使用密码

3. **Git 安全**
   - 确保 `.env` 在 `.gitignore` 中
   - 检查提交历史，确保没有泄露敏感信息
   - 如果不小心提交了敏感信息，立即轮换相关凭证

4. **生产环境**
   - 启用 HTTPS
   - 配置 CORS 策略
   - 实施速率限制
   - 监控 API 使用情况

## ❓ 常见问题

### Q: 如何更新 LLM 提供商配置？

A: 编辑 `config/llm-providers.json` 文件，但不要在其中包含真实的 API keys。使用环境变量覆盖 API keys。

### Q: 部署后 API 调用失败？

A: 检查以下几点：
1. 环境变量是否正确配置
2. API keys 是否有效
3. API base URL 是否正确
4. 查看 Vercel 日志获取详细错误信息

### Q: 如何添加新的 LLM 提供商？

A: 
1. 在 `config/llm-providers.json` 中添加配置（使用占位符 API key）
2. 在部署平台添加对应的环境变量（如 `NEWPROVIDER_API_KEY`）
3. 重新部署

### Q: 本地开发时如何测试？

A: 
1. 确保 `.env` 文件包含有效的 API keys
2. 运行 `npm run dev`
3. 访问 http://localhost:3000
4. 使用 `/admin` 页面测试管理功能

## 📚 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [Vercel 部署文档](https://vercel.com/docs)
- [CrewAI 文档](https://docs.crewai.com/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

