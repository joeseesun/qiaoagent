# 安全改进 - 变更说明

本文档记录了为提高项目安全性而进行的所有更改。

## 📅 更新日期

2025-11-01

## 🎯 改进目标

1. ✅ 移除所有硬编码的 API keys
2. ✅ 使用环境变量管理敏感信息
3. ✅ 提供完整的部署文档
4. ✅ 创建自动化部署脚本
5. ✅ 确保代码可以安全地推送到 GitHub 和部署到 Vercel

## 📝 主要变更

### 1. 配置文件更新

#### `config/llm-providers.json`
**变更前：**
```json
{
  "apiKey": "sk-SOZK3nDcfF2Q56sb9xFiTTWFHEJkFZepIy9hN1KJK4S6lYmT"
}
```

**变更后：**
```json
{
  "apiKey": "your-tuzi-api-key-here"
}
```

**说明：** 所有真实的 API keys 已替换为占位符。真实的 keys 应通过环境变量提供。

#### `.env.example`
**变更前：**
```bash
OPENAI_API_KEY=sk-SOZK3nDcfF2Q56sb9xFiTTWFHEJkFZepIy9hN1KJK4S6lYmT
ADMIN_PASSWORD=ai_admin_2025
```

**变更后：**
```bash
# API Configuration
OPENAI_API_BASE=https://api.tu-zi.com/v1
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL_NAME=claude-sonnet-4-5-20250929

# Admin Password (IMPORTANT: Change this in production!)
ADMIN_PASSWORD=your-secure-password-here
```

**说明：** 添加了注释和更清晰的占位符。

### 2. 代码更新

#### `crew/llm_config.py`
**主要改进：**

1. **支持环境变量覆盖 API keys**
   ```python
   # 从环境变量读取 API key（如果可用）
   env_key = f"{provider_id.upper()}_API_KEY"
   if os.getenv(env_key):
       p['apiKey'] = os.getenv(env_key)
   ```

2. **向后兼容**
   ```python
   # 支持 OPENAI_API_KEY 用于 tuzi provider
   elif provider_id == 'tuzi' and os.getenv('OPENAI_API_KEY'):
       p['apiKey'] = os.getenv('OPENAI_API_KEY')
   ```

3. **默认值使用环境变量**
   ```python
   provider = {
       'baseURL': os.getenv('OPENAI_API_BASE', 'https://api.tu-zi.com/v1'),
       'apiKey': os.getenv('OPENAI_API_KEY', ''),
       'defaultModel': os.getenv('OPENAI_MODEL_NAME', 'claude-sonnet-4.5'),
   }
   ```

### 3. 新增文档

#### `README_DEPLOYMENT.md`
完整的部署指南，包括：
- 环境要求
- 环境变量配置详解
- 本地开发步骤
- Vercel 部署步骤（多种方式）
- 其他平台部署指南
- 安全最佳实践
- 常见问题解答

#### `SECURITY.md`
安全策略文档，包括：
- 敏感信息保护指南
- 环境变量命名规范
- 安全检查清单
- 泄露应对措施
- 最佳实践建议

#### `QUICKSTART_DEPLOY.md`
快速开始指南，包括：
- 5 分钟快速部署流程
- 自动化脚本使用说明
- 手动部署步骤
- 常用命令参考
- 常见问题快速解答

#### `CHANGES_SECURITY.md`（本文档）
记录所有安全相关的变更。

### 4. 新增脚本

#### `deploy.sh` (macOS/Linux)
自动化部署脚本，功能包括：
- ✅ 检查依赖（Git, Node.js, npm）
- ✅ 检查环境变量配置
- ✅ 检查敏感信息泄露
- ✅ Git 状态检查和提交
- ✅ 推送到 GitHub
- ✅ 部署到 Vercel
- ✅ 交互式菜单

#### `deploy.bat` (Windows)
Windows 版本的部署脚本，功能与 `deploy.sh` 相同。

### 5. README 更新

在主 README.md 中添加了：
- ⚠️ 安全提示
- 📚 快速链接到部署文档
- 🔗 相关文档链接

## 🔐 环境变量支持

### 主要环境变量

| 变量名 | 用途 | 示例值 |
|--------|------|--------|
| `OPENAI_API_BASE` | API 基础 URL | `https://api.tu-zi.com/v1` |
| `OPENAI_API_KEY` | 默认 API key | `sk-your-key-here` |
| `OPENAI_MODEL_NAME` | 默认模型名称 | `claude-sonnet-4-5-20250929` |
| `ADMIN_PASSWORD` | 管理员密码 | `your-secure-password` |

### LLM 提供商特定的环境变量

| 变量名 | 用途 |
|--------|------|
| `TUZI_API_KEY` | Tu-Zi API key |
| `KIMI_API_KEY` | Kimi API key |
| `DEEPSEEK_API_KEY` | DeepSeek API key |
| `ZHIPU_API_KEY` | 智谱 AI API key |

### 环境变量优先级

1. **特定提供商的环境变量**（如 `TUZI_API_KEY`）
2. **通用环境变量**（如 `OPENAI_API_KEY`）
3. **配置文件中的值**（`config/llm-providers.json`）

## 📋 迁移指南

如果你已经有一个包含真实 API keys 的本地副本，请按以下步骤迁移：

### 步骤 1: 备份真实的 API keys

```bash
# 将真实的 API keys 保存到安全的地方
cp config/llm-providers.json config/llm-providers.json.backup
```

### 步骤 2: 创建 .env 文件

```bash
# 复制模板
cp .env.example .env

# 编辑 .env 文件，填入真实的 API keys
nano .env
```

### 步骤 3: 更新配置文件

```bash
# 拉取最新的更改（包含占位符的版本）
git pull origin main

# 或者手动替换 API keys 为占位符
```

### 步骤 4: 验证

```bash
# 本地测试
npm run dev

# 确认应用正常工作
```

### 步骤 5: 提交和推送

```bash
# 确认 .env 不在 Git 中
git status

# 提交更改
git add .
git commit -m "Update to use environment variables for API keys"
git push
```

## ✅ 安全检查清单

在推送代码或部署前，请确认：

- [ ] `.env` 文件在 `.gitignore` 中
- [ ] `config/llm-providers.json` 不包含真实的 API keys
- [ ] `.env.example` 只包含占位符
- [ ] 所有文档中没有真实的 API keys
- [ ] Git 历史中没有敏感信息
- [ ] 已在部署平台配置环境变量
- [ ] 已设置强密码作为 `ADMIN_PASSWORD`

## 🔍 如何检查敏感信息泄露

### 检查当前文件

```bash
# 检查配置文件
grep -r "sk-[A-Za-z0-9]\{40,\}" config/

# 检查示例文件
grep -r "sk-[A-Za-z0-9]\{40,\}" .env.example

# 检查所有文件（排除 node_modules）
grep -r "sk-[A-Za-z0-9]\{40,\}" . --exclude-dir=node_modules
```

### 检查 Git 历史

```bash
# 检查历史提交
git log --all --full-history --source -- .env

# 搜索敏感信息
git log -S "sk-" --all
```

## 📚 相关资源

- [README_DEPLOYMENT.md](./README_DEPLOYMENT.md) - 完整部署文档
- [SECURITY.md](./SECURITY.md) - 安全策略
- [QUICKSTART_DEPLOY.md](./QUICKSTART_DEPLOY.md) - 快速开始
- [.env.example](./.env.example) - 环境变量模板

## 🤝 贡献

如果你发现任何安全问题或有改进建议，请：

1. 不要在公开的 Issue 中报告安全漏洞
2. 通过私密方式联系项目维护者
3. 提供详细的问题描述

## 📝 更新日志

### 2025-11-01
- ✅ 移除所有硬编码的 API keys
- ✅ 更新 `crew/llm_config.py` 支持环境变量
- ✅ 创建完整的部署文档
- ✅ 添加自动化部署脚本
- ✅ 添加安全策略文档
- ✅ 更新 README 添加安全提示

---

**重要提示：** 如果你在此次更新之前已经将真实的 API keys 提交到了 Git，请立即轮换这些 keys，并考虑清理 Git 历史。

