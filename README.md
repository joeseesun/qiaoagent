# 🧩 AI Creative Workflow

一个基于 CrewAI 的多 Agent 工作流编排平台，支持多 LLM 提供商。

> ⚠️ **部署说明**
> 本项目使用 **Next.js + Python (CrewAI)** 混合架构，需要同时运行 Node.js 和 Python 环境。
> **不支持 Vercel 一键部署**（Vercel 不支持 Python 子进程）。
> 推荐部署到：**Docker**（最简单） / **Railway** / **Render**。详见[部署指南](#-部署)。
>
> 🐳 **有服务器？**
> - 宝塔面板用户：[5 分钟快速部署](./BAOTA_QUICKSTART.md) | [宝塔完整指南](./docs/BAOTA_DEPLOYMENT.md)
> - 其他服务器：[Docker 部署指南](./docs/DOCKER_DEPLOYMENT.md)

> **🔒 安全提示：** 本项目使用环境变量管理所有敏感信息（API Keys、密码等），代码中不包含任何硬编码的密钥。
>
> 📚 **文档：** [架构设计](./docs/ARCHITECTURE.md) | [安全策略](./docs/SECURITY.md) | [贡献指南](./docs/CONTRIBUTING.md)

## ✨ 功能特性

- 🎯 **多工作流支持** - 预置科技写作、营销文案等多种工作流模板
- 🤖 **多 Agent 协作** - 通过 CrewAI 实现智能 Agent 协同工作
- 🔌 **多 LLM 提供商** - 支持 Tu-Zi、Kimi、DeepSeek、智谱 AI、Gemini 等多个 LLM
- ⚙️ **动态配置** - 后台可视化编辑 Agents、Tasks 和 LLM 提供商，无需重新部署
- 🔒 **安全优先** - 环境变量管理 API Keys，代码中无硬编码密钥
- 🎨 **极简设计** - 黑白灰配色，基于 shadcn/ui 的现代化界面
- 📱 **响应式布局** - 完美支持移动端和桌面端
- 🚀 **灵活部署** - 支持 Railway、Render、Docker 等多种部署方式

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
- **多 LLM 支持** - Tu-Zi (Claude)、Kimi、DeepSeek、智谱 AI、Gemini 等

## 🚀 部署

### 方法一：Docker 部署（推荐，适合有服务器）

#### 🎯 宝塔面板用户（最简单）

**只需 6 步，5 分钟完成：**

1. 宝塔 **软件商店** → 安装 **Docker 管理器**
2. 宝塔 **终端** → 克隆项目到 `/www/wwwroot/qiaoagent`
3. 宝塔 **文件** → 配置 `.env.production`（填入密码和 API Key）
4. 宝塔 **终端** → 运行 `./docker-deploy.sh`
5. 宝塔 **安全** → 开放端口 `3000`
6. 访问 `http://你的IP:3000` ✅

📖 **详细文档：** [宝塔 5 分钟快速部署](./BAOTA_QUICKSTART.md) | [宝塔完整指南](./docs/BAOTA_DEPLOYMENT.md)

#### 🐳 其他服务器

**一键部署脚本：**

```bash
# 1. 克隆项目
git clone https://github.com/joeseesun/qiaoagent.git
cd qiaoagent

# 2. 配置环境变量
cp .env.production.example .env.production
vim .env.production  # 填入 ADMIN_PASSWORD 和 OPENAI_API_KEY

# 3. 一键部署
chmod +x docker-deploy.sh
./docker-deploy.sh
```

**访问应用：** `http://your-server-ip:3000`

📖 **详细文档：** [Docker 部署完整指南](./docs/DOCKER_DEPLOYMENT.md)

---

### 方法二：本地开发

**1. 克隆项目**

```bash
git clone https://github.com/joeseesun/qiaoagent.git
cd qiaoagent
```

**2. 安装依赖**

```bash
npm install
pip install -r requirements.txt
```

**3. 配置环境变量**

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 API Keys
```

**4. 启动开发服务器**

```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用。

### 方法二：Docker 部署

**1. 构建镜像**

```bash
docker build -t qiaoagent .
```

**2. 运行容器**

```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your-api-key \
  -e ADMIN_PASSWORD=your-password \
  qiaoagent
```

### 方法三：Railway 部署（推荐生产环境）

1. Fork 本仓库到你的 GitHub 账号
2. 访问 [Railway](https://railway.app/)
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你 fork 的仓库
5. 配置环境变量（见下方）
6. Railway 会自动检测并部署 Next.js + Python 应用

**需要配置的环境变量：**

| 环境变量 | 说明 | 必需 |
|---------|------|------|
| `OPENAI_API_KEY` | 默认 LLM API Key | ✅ |
| `ADMIN_PASSWORD` | 管理后台密码 | ✅ |
| `TUZI_API_KEY` | Tu-Zi API Key | ❌ |
| `KIMI_API_KEY` | Kimi API Key | ❌ |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | ❌ |
| `ZHIPU_API_KEY` | 智谱 AI API Key | ❌ |
| `GEMINI_API_KEY` | Google Gemini API Key | ❌ |

> 💡 **提示：** 至少需要配置一个 LLM 提供商的 API Key。

### 方法四：Render 部署

1. Fork 本仓库
2. 访问 [Render](https://render.com/)
3. 创建新的 "Web Service"
4. 连接你的 GitHub 仓库
5. 配置：
   - **Build Command:** `npm install && pip install -r requirements.txt && npm run build`
   - **Start Command:** `npm start`
6. 添加环境变量（同上）

## 🎯 使用指南

### 访问应用

- **主页：** `/` - 工作流执行界面
- **管理后台：** `/admin` - 需要输入管理员密码
  - 工作流管理：`/admin/dashboard`
  - LLM 提供商管理：`/admin/llm-providers`
  - 模型配置：`/admin/workflow-models`

### 配置 LLM 提供商

1. 访问 `/admin/llm-providers`
2. 点击"添加提供商"或编辑现有提供商
3. 配置 Base URL 和模型列表
4. 在环境变量中设置对应的 API Key（如 `KIMI_API_KEY`）
5. 点击"测试连接"验证配置

### 创建工作流

1. 访问 `/admin/dashboard`
2. 点击"创建工作流"
3. 配置 Agents 和 Tasks
4. 为每个 Agent 选择 LLM 提供商和模型
5. 保存并测试工作流



## 📚 文档

- [架构设计](./docs/ARCHITECTURE.md) - 系统架构和设计理念
- [安全策略](./docs/SECURITY.md) - 安全最佳实践和环境变量管理
- [贡献指南](./docs/CONTRIBUTING.md) - 如何为项目做贡献
- [LLM 提供商配置](./docs/ADD_NEW_PROVIDER.md) - 添加新的 LLM 提供商
- [环境变量参考](./docs/ENV_VARS_REFERENCE.md) - 所有环境变量说明

## 🔒 安全

本项目遵循安全最佳实践：

- ✅ 所有敏感信息通过环境变量管理
- ✅ 代码中无硬编码的 API Keys
- ✅ `.env` 文件已在 `.gitignore` 中
- ✅ 支持多种 LLM 提供商的独立 API Key 配置

详见 [安全策略](./docs/SECURITY.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！请查看 [贡献指南](./docs/CONTRIBUTING.md)

## ☕ 支持项目

如果这个项目对你有帮助，欢迎通过以下方式支持：

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="./public/qr-codes/wechat-reward.jpg" width="200px" alt="微信打赏"/>
        <br/>
        <b>微信打赏</b>
      </td>
      <td align="center">
        <img src="./public/qr-codes/wechat-follow.jpg" width="200px" alt="关注公众号"/>
        <br/>
        <b>关注公众号</b>
      </td>
    </tr>
  </table>
</div>

## 📄 许可证

[MIT License](./LICENSE)

## 🙏 致谢

- [CrewAI](https://github.com/joaomdmoura/crewAI) - 多 Agent 工作流引擎
- [Next.js](https://nextjs.org/) - React 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Vercel](https://vercel.com/) - 部署平台
- [LangChain](https://www.langchain.com/) - LLM 集成框架

---

**Made with ❤️ by [joeseesun](https://github.com/joeseesun)**
