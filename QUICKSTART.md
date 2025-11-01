# ⚡ 快速启动指南

5 分钟内启动 AI 创作工作流助手！

## 🎯 第一步：安装依赖

```bash
# 安装 Node.js 依赖
npm install

# 安装 Python 依赖
pip install -r requirements.txt
```

## 🔑 第二步：配置环境变量

项目已包含 `.env` 文件，默认配置如下：

```env
OPENAI_API_BASE=https://api.tu-zi.com/v1
OPENAI_API_KEY=sk-SOZK3nDcfF2Q56sb9xFiTTWFHEJkFZepIy9hN1KJK4S6lYmT
OPENAI_MODEL_NAME=claude-sonnet-4-5-20250929
ADMIN_PASSWORD=ai_admin_2025
```

**⚠️ 重要：** 在生产环境中，请修改 `ADMIN_PASSWORD` 为你自己的安全密码！

## 🚀 第三步：启动应用

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

## 🎨 第四步：体验功能

### 用户端（创作内容）

1. 打开浏览器访问 `http://localhost:3000`
2. 选择工作流（如"科技写作助手"）
3. 输入主题（如"AI 改变教育"）
4. 点击"开始生成"
5. 等待 30-60 秒，查看生成结果
6. 可以复制或下载生成的内容

### 管理端（配置工作流）

1. 访问 `http://localhost:3000/admin`
2. 输入密码：`ai_admin_2025`
3. 进入配置界面
4. 尝试编辑 Agent 或 Task
5. 点击"保存配置"
6. 返回首页测试修改后的工作流

## 🧪 第五步：测试 API（可选）

```bash
# 给脚本添加执行权限
chmod +x test_api.sh

# 运行测试
./test_api.sh
```

## 📝 常见问题

### Q1: `npm install` 失败？

**A:** 确保你的 Node.js 版本 >= 18.0.0

```bash
node --version
```

### Q2: `pip install` 失败？

**A:** 尝试使用虚拟环境：

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Q3: 启动后访问 localhost:3000 显示错误？

**A:** 检查端口是否被占用：

```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

### Q4: CrewAI 执行时间太长？

**A:** 这是正常的，AI 生成内容需要时间。可以：
- 减少 Agent 数量
- 简化任务描述
- 使用更快的模型

### Q5: API Key 无效？

**A:** 确保你的 tu-zi.com API Key 有效且有足够余额。

## 🎯 下一步

- 📖 阅读 [README.md](./README.md) 了解详细功能
- 🚀 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 学习如何部署到 Vercel
- 🔧 自定义工作流配置（编辑 `public/workflows.json`）
- 🎨 自定义主题样式（编辑 `app/globals.css`）

## 💡 提示

1. **首次运行可能较慢** - CrewAI 需要初始化和加载模型
2. **保持终端打开** - 可以看到实时日志
3. **使用 Chrome DevTools** - 查看网络请求和控制台日志
4. **备份配置文件** - 修改前先备份 `public/workflows.json`

## 🎉 开始创作吧！

现在你已经成功启动了 AI 创作工作流助手，尽情探索和创作吧！

