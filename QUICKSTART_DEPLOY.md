# 快速开始 - 部署到 Vercel

这是一个快速部署指南，帮助你在 5 分钟内将项目部署到 Vercel。

## 🚀 快速部署（推荐）

### 方式一：使用自动化脚本

**macOS/Linux:**
```bash
./deploy.sh
```

**Windows:**
```bash
deploy.bat
```

脚本会自动帮你：
- ✅ 检查依赖
- ✅ 检查环境变量
- ✅ 检查敏感信息泄露
- ✅ 提交代码到 Git
- ✅ 推送到 GitHub
- ✅ 部署到 Vercel

### 方式二：手动部署

#### 步骤 1: 准备环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的真实 API keys
nano .env  # 或使用你喜欢的编辑器
```

**重要：** 确保填入以下变量：
- `OPENAI_API_KEY` - 你的 API key
- `ADMIN_PASSWORD` - 设置一个强密码

#### 步骤 2: 推送到 GitHub

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 创建 GitHub 仓库并推送
gh repo create qiaoagent --public --source=. --remote=origin --push
```

或者手动创建仓库：
```bash
# 在 GitHub 上创建仓库后
git remote add origin https://github.com/your-username/qiaoagent.git
git push -u origin main
```

#### 步骤 3: 部署到 Vercel

**选项 A: 通过 Vercel Dashboard（最简单）**

1. 访问 https://vercel.com/new
2. 导入你的 GitHub 仓库
3. 配置环境变量（见下方）
4. 点击 Deploy

**选项 B: 通过 Vercel CLI**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

#### 步骤 4: 配置 Vercel 环境变量

在 Vercel Dashboard 中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `OPENAI_API_BASE` | `https://api.tu-zi.com/v1` | API 基础 URL |
| `OPENAI_API_KEY` | `sk-your-key-here` | 你的 API key |
| `OPENAI_MODEL_NAME` | `claude-sonnet-4-5-20250929` | 模型名称 |
| `ADMIN_PASSWORD` | `your-secure-password` | 管理员密码 |

**可选的环境变量（如果使用多个 LLM 提供商）：**
- `TUZI_API_KEY`
- `KIMI_API_KEY`
- `DEEPSEEK_API_KEY`
- `ZHIPU_API_KEY`

#### 步骤 5: 重新部署

配置环境变量后，重新部署以应用更改：

```bash
vercel --prod
```

或在 Vercel Dashboard 中点击 "Redeploy"。

## ✅ 验证部署

1. 访问 Vercel 提供的 URL
2. 测试主页功能
3. 访问 `/admin` 测试管理功能
4. 使用你设置的 `ADMIN_PASSWORD` 登录

## 🔒 安全检查清单

在部署前，请确认：

- [ ] `.env` 文件**不在** Git 仓库中（已在 `.gitignore`）
- [ ] `config/llm-providers.json` 不包含真实的 API keys
- [ ] 已在 Vercel 中配置所有环境变量
- [ ] 已设置强密码作为 `ADMIN_PASSWORD`
- [ ] 已检查 Git 历史，确保没有敏感信息

## 📝 常用命令

```bash
# 本地开发
npm run dev

# 构建
npm run build

# 查看 Vercel 日志
vercel logs

# 查看 Vercel 环境变量
vercel env ls

# 添加环境变量
vercel env add OPENAI_API_KEY

# 删除部署
vercel remove
```

## 🆘 常见问题

### Q: 部署后 API 调用失败？

**A:** 检查以下几点：
1. 环境变量是否正确配置
2. API key 是否有效
3. 查看 Vercel 日志：`vercel logs`

### Q: 如何更新环境变量？

**A:** 
1. 在 Vercel Dashboard 中更新环境变量
2. 重新部署：`vercel --prod`

### Q: 如何回滚到之前的版本？

**A:** 
1. 在 Vercel Dashboard 中找到之前的部署
2. 点击 "Promote to Production"

### Q: 本地开发时如何使用不同的 API key？

**A:** 
1. 在本地 `.env` 文件中设置不同的值
2. `.env` 文件不会被提交到 Git
3. 本地和生产环境使用不同的环境变量

## 📚 下一步

- 📖 阅读完整的 [部署文档](./README_DEPLOYMENT.md)
- 🔒 查看 [安全策略](./SECURITY.md)
- 🛠️ 自定义工作流配置
- 📊 监控 API 使用情况

## 🎯 快速命令参考

```bash
# 一键部署（使用脚本）
./deploy.sh  # macOS/Linux
deploy.bat   # Windows

# 手动部署流程
cp .env.example .env
# 编辑 .env 文件
git add .
git commit -m "Initial commit"
git push
vercel --prod
# 在 Vercel Dashboard 配置环境变量
# 重新部署

# 本地测试
npm install
npm run dev
# 访问 http://localhost:3000
```

## 💡 提示

1. **首次部署**：使用自动化脚本 `deploy.sh` 或 `deploy.bat`
2. **更新代码**：直接 `git push`，Vercel 会自动部署
3. **环境变量**：在 Vercel Dashboard 中管理，不要提交到 Git
4. **测试**：先在本地测试，确认无误后再部署

## 🔗 有用的链接

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel 文档](https://vercel.com/docs)
- [GitHub](https://github.com)
- [项目完整文档](./README_DEPLOYMENT.md)

---

**需要帮助？** 查看 [完整部署文档](./README_DEPLOYMENT.md) 或 [安全策略](./SECURITY.md)

