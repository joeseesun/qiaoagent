# 🚀 部署指南

本文档详细说明如何将 AI 创作工作流助手部署到 Vercel。

## 📋 前置要求

1. **GitHub 账号** - 用于托管代码
2. **Vercel 账号** - 用于部署应用（可使用 GitHub 登录）
3. **tu-zi.com API Key** - 用于调用 Claude 模型

## 🔧 本地测试

在部署前，建议先在本地测试应用是否正常运行。

### 1. 安装依赖

```bash
# 安装 Node.js 依赖
npm install

# 安装 Python 依赖
pip install -r requirements.txt
```

### 2. 配置环境变量

确保 `.env` 文件已正确配置：

```env
OPENAI_API_BASE=https://api.tu-zi.com/v1
OPENAI_API_KEY=sk-SOZK3nDcfF2Q56sb9xFiTTWFHEJkFZepIy9hN1KJK4S6lYmT
OPENAI_MODEL_NAME=claude-sonnet-4-5-20250929
ADMIN_PASSWORD=ai_admin_2025
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 测试应用。

### 4. 测试 API 接口

```bash
# 测试获取工作流列表
curl http://localhost:3000/api/workflows

# 测试管理员认证
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"ai_admin_2025"}'
```

## 🌐 部署到 Vercel

### 方法一：通过 Vercel Dashboard（推荐）

#### 步骤 1：推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### 步骤 2：导入项目到 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择你的 GitHub 仓库
5. 点击 "Import"

#### 步骤 3：配置项目

Vercel 会自动检测到这是一个 Next.js 项目。

**Framework Preset:** Next.js
**Root Directory:** ./
**Build Command:** `npm run build`
**Output Directory:** `.next`

#### 步骤 4：添加环境变量

在 "Environment Variables" 部分添加以下变量：

| Name | Value |
|------|-------|
| `OPENAI_API_BASE` | `https://api.tu-zi.com/v1` |
| `OPENAI_API_KEY` | `sk-SOZK3nDcfF2Q56sb9xFiTTWFHEJkFZepIy9hN1KJK4S6lYmT` |
| `OPENAI_MODEL_NAME` | `claude-sonnet-4-5-20250929` |
| `ADMIN_PASSWORD` | `ai_admin_2025` |

**注意：** 请将 `ADMIN_PASSWORD` 修改为你自己的安全密码！

#### 步骤 5：部署

点击 "Deploy" 按钮，等待部署完成。

### 方法二：通过 Vercel CLI

#### 步骤 1：安装 Vercel CLI

```bash
npm i -g vercel
```

#### 步骤 2：登录 Vercel

```bash
vercel login
```

#### 步骤 3：部署

```bash
vercel
```

按照提示操作：

1. Set up and deploy? **Y**
2. Which scope? 选择你的账号
3. Link to existing project? **N**
4. What's your project's name? 输入项目名称
5. In which directory is your code located? **.**
6. Want to override the settings? **N**

#### 步骤 4：添加环境变量

```bash
vercel env add OPENAI_API_BASE
# 输入: https://api.tu-zi.com/v1

vercel env add OPENAI_API_KEY
# 输入: sk-SOZK3nDcfF2Q56sb9xFiTTWFHEJkFZepIy9hN1KJK4S6lYmT

vercel env add OPENAI_MODEL_NAME
# 输入: claude-sonnet-4-5-20250929

vercel env add ADMIN_PASSWORD
# 输入: ai_admin_2025
```

#### 步骤 5：重新部署

```bash
vercel --prod
```

## ✅ 验证部署

### 1. 访问应用

部署完成后，Vercel 会提供一个 URL，例如：
```
https://your-app.vercel.app
```

### 2. 测试功能

#### 测试用户端
1. 访问首页
2. 选择工作流
3. 输入主题
4. 点击生成
5. 查看结果

#### 测试管理端
1. 访问 `/admin`
2. 输入管理员密码
3. 进入配置界面
4. 编辑工作流
5. 保存配置

### 3. 测试 API

```bash
# 替换为你的 Vercel URL
export VERCEL_URL="https://your-app.vercel.app"

# 测试工作流列表
curl $VERCEL_URL/api/workflows

# 测试认证
curl -X POST $VERCEL_URL/api/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"ai_admin_2025"}'

# 测试运行工作流
curl -X POST $VERCEL_URL/api/run_crew \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI改变教育","workflow_id":"tech_writer"}'
```

## 🔄 更新部署

### 通过 Git 推送

如果使用 GitHub 集成，只需推送代码即可自动部署：

```bash
git add .
git commit -m "Update workflow"
git push
```

Vercel 会自动检测到更新并重新部署。

### 通过 CLI

```bash
vercel --prod
```

## 🐛 故障排查

### 问题 1：API 接口 404

**原因：** Vercel 路由配置问题

**解决方案：** 检查 `vercel.json` 文件是否正确配置

### 问题 2：Python 依赖安装失败

**原因：** `requirements.txt` 中的包版本不兼容

**解决方案：** 
1. 在本地测试 `pip install -r requirements.txt`
2. 更新包版本
3. 重新部署

### 问题 3：环境变量未生效

**原因：** 环境变量未正确配置

**解决方案：**
1. 在 Vercel Dashboard 检查环境变量
2. 确保变量名称正确
3. 重新部署项目

### 问题 4：CrewAI 执行超时

**原因：** Vercel Serverless Function 有 10 秒执行时间限制（免费版）

**解决方案：**
1. 升级到 Vercel Pro（60 秒限制）
2. 优化工作流，减少 Agent 数量
3. 使用更快的模型

## 📊 监控和日志

### 查看部署日志

在 Vercel Dashboard 中：
1. 选择你的项目
2. 点击 "Deployments"
3. 选择一个部署
4. 查看 "Build Logs" 和 "Function Logs"

### 实时日志

```bash
vercel logs
```

## 🔒 安全建议

1. **修改默认密码** - 不要使用 `ai_admin_2025`
2. **保护 API Key** - 不要将 `.env` 文件提交到 Git
3. **使用环境变量** - 所有敏感信息都应通过环境变量配置
4. **启用 HTTPS** - Vercel 默认启用，确保不要禁用

## 💰 成本估算

### Vercel 免费版限制
- 100 GB 带宽/月
- 100 次部署/天
- 10 秒 Serverless Function 执行时间

### Vercel Pro 版（$20/月）
- 1 TB 带宽/月
- 无限部署
- 60 秒 Serverless Function 执行时间

### tu-zi.com API 成本
根据使用量计费，具体请查看 tu-zi.com 定价。

## 🎉 完成

恭喜！你已成功部署 AI 创作工作流助手到 Vercel。

如有问题，请查看：
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [CrewAI 文档](https://docs.crewai.com/)

