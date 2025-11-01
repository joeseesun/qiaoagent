# 🚀 从这里开始

欢迎！这个文档将帮助你快速开始使用本项目。

## 📋 你现在的位置

你的项目已经完成了安全改进，所有硬编码的 API keys 已被移除。现在你可以安全地：
- ✅ 推送代码到 GitHub
- ✅ 部署到 Vercel
- ✅ 与团队分享代码

## 🎯 接下来做什么？

### 选项 1: 我想立即部署（推荐）

**最快的方式 - 使用自动化脚本：**

**macOS/Linux:**
```bash
./deploy.sh
```

**Windows:**
```bash
deploy.bat
```

脚本会引导你完成所有步骤！

---

**或者查看快速指南：**
📖 [5 分钟快速部署指南](./QUICKSTART_DEPLOY.md)

### 选项 2: 我想先在本地测试

1. **创建环境变量文件：**
   ```bash
   cp .env.example .env
   ```

2. **编辑 .env 文件，填入你的真实 API keys：**
   ```bash
   # macOS/Linux
   nano .env
   
   # Windows
   notepad .env
   ```

3. **安装依赖：**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

4. **启动开发服务器：**
   ```bash
   npm run dev
   ```

5. **访问应用：**
   打开浏览器访问 http://localhost:3000

### 选项 3: 我想了解更多细节

查看完整文档：
- 📖 [完整部署文档](./README_DEPLOYMENT.md)
- 🔒 [安全策略](./SECURITY.md)
- 📝 [变更记录](./CHANGES_SECURITY.md)
- 📊 [部署总结](./DEPLOYMENT_SUMMARY.md)

## 🔍 快速检查

在推送代码前，运行安全检查：

```bash
./check-security.sh
```

这会检查：
- ✅ .env 文件是否在 .gitignore 中
- ✅ 配置文件中是否有硬编码的 API keys
- ✅ 所有必需的文件是否存在

## 📚 文档导航

### 快速开始
- 🚀 **[START_HERE.md](./START_HERE.md)** ← 你在这里
- ⚡ [QUICKSTART_DEPLOY.md](./QUICKSTART_DEPLOY.md) - 5 分钟快速部署

### 详细指南
- 📖 [README_DEPLOYMENT.md](./README_DEPLOYMENT.md) - 完整部署文档
- 🔒 [SECURITY.md](./SECURITY.md) - 安全策略
- 📝 [CHANGES_SECURITY.md](./CHANGES_SECURITY.md) - 变更记录
- 📊 [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - 部署总结

### 主要文档
- 📘 [README.md](./README.md) - 项目主文档

## 🛠️ 可用的工具

### 自动化脚本
- `deploy.sh` - macOS/Linux 部署脚本
- `deploy.bat` - Windows 部署脚本
- `check-security.sh` - 安全检查脚本

### 配置文件
- `.env.example` - 环境变量模板
- `config/llm-providers.json` - LLM 提供商配置
- `vercel.json` - Vercel 部署配置

## ⚠️ 重要提醒

### 必须做的事
1. ✅ 创建 `.env` 文件并填入真实的 API keys
2. ✅ 在 Vercel 中配置环境变量
3. ✅ 使用强密码作为 `ADMIN_PASSWORD`

### 永远不要做的事
1. ❌ 不要将 `.env` 文件提交到 Git
2. ❌ 不要在代码中硬编码 API keys
3. ❌ 不要在公开场合分享真实的 API keys

## 🎯 常见任务

### 本地开发
```bash
# 1. 创建 .env 文件
cp .env.example .env

# 2. 编辑 .env 文件（填入真实 API keys）
nano .env

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
```

### 推送到 GitHub
```bash
# 使用自动化脚本
./deploy.sh

# 或手动操作
git add .
git commit -m "Your message"
git push
```

### 部署到 Vercel
```bash
# 使用自动化脚本
./deploy.sh

# 或使用 Vercel CLI
vercel --prod
```

## 🆘 需要帮助？

### 常见问题
查看 [README_DEPLOYMENT.md](./README_DEPLOYMENT.md#常见问题) 中的常见问题部分。

### 快速问题解答

**Q: 我的 API key 在哪里？**
A: 在你的 LLM 提供商的控制台中获取（如 Tu-Zi、Kimi 等）。

**Q: 如何配置多个 LLM 提供商？**
A: 在 Vercel 中添加对应的环境变量（如 `TUZI_API_KEY`、`KIMI_API_KEY` 等）。

**Q: 部署后 API 调用失败？**
A: 检查 Vercel 中的环境变量是否正确配置，然后重新部署。

**Q: 如何查看部署日志？**
A: 运行 `vercel logs` 或在 Vercel Dashboard 中查看。

## 📞 获取更多帮助

1. 查看完整文档
2. 检查 Vercel 日志
3. 运行安全检查脚本
4. 查看 GitHub Actions 运行结果

## 🎉 准备好了吗？

选择你的路径：

1. **快速部署** → 运行 `./deploy.sh` 或 `deploy.bat`
2. **本地测试** → 创建 `.env` 文件，运行 `npm run dev`
3. **了解更多** → 阅读 [完整部署文档](./README_DEPLOYMENT.md)

---

**祝你使用愉快！** 🚀

有问题？查看 [QUICKSTART_DEPLOY.md](./QUICKSTART_DEPLOY.md) 或 [README_DEPLOYMENT.md](./README_DEPLOYMENT.md)

