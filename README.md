# 🧩 AI 创作工作流助手

一个基于 CrewAI 的多 Agent 工作流编排平台，支持动态配置和一键部署到 Vercel。

> **⚠️ 重要提示：** 本项目已移除所有硬编码的 API keys。请通过环境变量配置敏感信息。
>
> 📚 **快速部署：** 查看 [快速开始指南](./QUICKSTART_DEPLOY.md) | [完整部署文档](./README_DEPLOYMENT.md) | [安全策略](./SECURITY.md)

## ✨ 功能特性

- 🎯 **多工作流支持** - 预置科技写作、营销文案等多种工作流模板
- 🤖 **多 Agent 协作** - 通过 CrewAI 实现智能 Agent 协同工作
- ⚙️ **动态配置** - 后台可视化编辑 Agents 和 Tasks，无需重新部署
- 🎨 **极简设计** - 黑白灰配色，基于 shadcn/ui 的现代化界面
- 📱 **响应式布局** - 完美支持移动端和桌面端
- 🚀 **一键部署** - 支持 Vercel 无服务器部署

## 🏗️ 技术栈

### 前端
- **Next.js 14** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - UI 组件库
- **Framer Motion** - 动画效果

### 后端
- **FastAPI** - Python Web 框架
- **CrewAI** - 多 Agent 工作流引擎
- **LangChain** - LLM 集成
- **tu-zi.com API** - Claude 模型接口

## 📦 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd ai-creative-workflow
```

### 2. 安装依赖

```bash
# 安装 Node.js 依赖
npm install

# 安装 Python 依赖
pip install -r requirements.txt
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填写你的真实 API keys：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
OPENAI_API_BASE=https://api.tu-zi.com/v1
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL_NAME=claude-sonnet-4-5-20250929
ADMIN_PASSWORD=your-admin-password
```

### 4. 本地开发

```bash
# 启动 Next.js 开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看应用。

## 🚀 部署到 Vercel

### 方法一：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 方法二：通过 GitHub 集成

1. 将代码推送到 GitHub
2. 在 [Vercel Dashboard](https://vercel.com) 导入项目
3. 配置环境变量
4. 点击 Deploy

### 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

- `OPENAI_API_BASE`
- `OPENAI_API_KEY`
- `OPENAI_MODEL_NAME`
- `ADMIN_PASSWORD`

## 📖 使用指南

### 用户端

1. 访问首页
2. 选择工作流（如"科技写作助手"）
3. 输入主题（如"AI 改变教育"）
4. 点击"开始生成"
5. 查看生成结果，可复制或下载

### 管理端

1. 访问 `/admin` 登录后台
2. 输入管理员密码
3. 进入配置界面
4. 编辑 Agents 和 Tasks
5. 保存配置（立即生效）

## 🗂️ 项目结构

```
.
├── api/                    # FastAPI 后端接口
│   ├── auth.py            # 管理员认证
│   ├── config.py          # 配置管理
│   ├── run_crew.py        # 执行工作流
│   └── workflows.py       # 工作流列表
├── app/                    # Next.js 应用
│   ├── admin/             # 管理后台
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   └── ui/                # shadcn/ui 组件
├── crew/                  # CrewAI 工作流引擎
│   └── main.py            # 核心逻辑
├── lib/                   # 工具函数
├── public/                # 静态资源
│   └── workflows.json     # 工作流配置
├── .env.example           # 环境变量模板
├── next.config.js         # Next.js 配置
├── requirements.txt       # Python 依赖
├── tailwind.config.ts     # Tailwind 配置
├── tsconfig.json          # TypeScript 配置
└── vercel.json            # Vercel 部署配置
```

## 🔧 工作流配置

工作流配置存储在 `public/workflows.json`，格式如下：

```json
{
  "workflows": [
    {
      "name": "科技写作助手",
      "id": "tech_writer",
      "agents": [
        {
          "name": "Researcher",
          "role": "趋势研究员",
          "goal": "分析AI热点",
          "prompt": "请收集与主题相关的最新科技趋势。"
        }
      ],
      "tasks": [
        {
          "description": "研究主题 {topic}",
          "agent": "Researcher"
        }
      ]
    }
  ]
}
```

## 🎨 自定义主题

修改 `app/globals.css` 中的 CSS 变量来自定义主题颜色：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --primary: 0 0% 0%;
  /* ... */
}
```

## 📝 API 接口

### GET `/api/workflows`
获取可用工作流列表

### POST `/api/run_crew`
执行工作流
```json
{
  "topic": "AI 改变教育",
  "workflow_id": "tech_writer"
}
```

### GET `/api/config`
获取工作流配置

### POST `/api/config`
更新工作流配置（需要管理员密码）

### POST `/api/auth`
管理员认证

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [CrewAI](https://github.com/joaomdmoura/crewAI)
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)

