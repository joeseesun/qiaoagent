# 添加新的 LLM 提供商指南

本指南将教你如何添加新的 LLM 提供商，如 OpenRouter、火山引擎等。

## 🎯 系统支持

我们的系统**完全通用**，支持任何兼容 OpenAI API 格式的提供商：

- ✅ OpenRouter
- ✅ 火山引擎 (Volcengine)
- ✅ 阿里云百炼
- ✅ 腾讯混元
- ✅ OpenAI
- ✅ Azure OpenAI
- ✅ 任何其他兼容 OpenAI API 的服务

## 📝 添加步骤

### 步骤 1: 在 JSON 配置中添加提供商

编辑 `config/llm-providers.json`，添加新的提供商配置：

```json
{
  "id": "openrouter",
  "name": "OpenRouter",
  "type": "custom",
  "baseURL": "https://openrouter.ai/api/v1",
  "apiKey": "your-openrouter-api-key-here",
  "models": [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4-turbo",
    "google/gemini-pro"
  ],
  "defaultModel": "anthropic/claude-3.5-sonnet",
  "enabled": true,
  "description": "OpenRouter - 统一访问多个 LLM 提供商"
}
```

### 步骤 2: 配置环境变量

在 `.env` 文件中添加 API Key：

```bash
# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-your-real-key-here

# 可选：覆盖 Base URL
# OPENROUTER_API_BASE=https://openrouter.ai/api/v1
```

### 步骤 3: 部署到 Vercel

在 Vercel Dashboard 中添加环境变量：
- `OPENROUTER_API_KEY` = `sk-or-v1-your-real-key-here`

### 步骤 4: 重新部署

```bash
vercel --prod
```

## 🔥 常见提供商配置示例

### OpenRouter

```json
{
  "id": "openrouter",
  "name": "OpenRouter",
  "type": "custom",
  "baseURL": "https://openrouter.ai/api/v1",
  "apiKey": "your-openrouter-api-key-here",
  "models": [
    "anthropic/claude-3.5-sonnet",
    "anthropic/claude-3-opus",
    "openai/gpt-4-turbo",
    "openai/gpt-4",
    "google/gemini-pro-1.5",
    "meta-llama/llama-3.1-405b"
  ],
  "defaultModel": "anthropic/claude-3.5-sonnet",
  "enabled": true,
  "description": "OpenRouter - 统一访问多个 LLM 提供商"
}
```

**环境变量：**
```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 火山引擎 (Volcengine)

```json
{
  "id": "volcengine",
  "name": "火山引擎",
  "type": "custom",
  "baseURL": "https://ark.cn-beijing.volces.com/api/v3",
  "apiKey": "your-volcengine-api-key-here",
  "models": [
    "doubao-pro-32k",
    "doubao-lite-32k",
    "doubao-pro-4k",
    "doubao-lite-4k"
  ],
  "defaultModel": "doubao-pro-32k",
  "enabled": true,
  "description": "火山引擎 - 豆包大模型"
}
```

**环境变量：**
```bash
VOLCENGINE_API_KEY=your-volcengine-api-key-here
# 如果需要使用不同的区域
# VOLCENGINE_API_BASE=https://ark.cn-shanghai.volces.com/api/v3
```

### 阿里云百炼

```json
{
  "id": "aliyun",
  "name": "阿里云百炼",
  "type": "custom",
  "baseURL": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "apiKey": "your-aliyun-api-key-here",
  "models": [
    "qwen-max",
    "qwen-plus",
    "qwen-turbo",
    "qwen-long"
  ],
  "defaultModel": "qwen-max",
  "enabled": true,
  "description": "阿里云百炼 - 通义千问系列"
}
```

**环境变量：**
```bash
ALIYUN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 腾讯混元

```json
{
  "id": "tencent",
  "name": "腾讯混元",
  "type": "custom",
  "baseURL": "https://api.hunyuan.cloud.tencent.com/v1",
  "apiKey": "your-tencent-api-key-here",
  "models": [
    "hunyuan-pro",
    "hunyuan-standard",
    "hunyuan-lite"
  ],
  "defaultModel": "hunyuan-pro",
  "enabled": true,
  "description": "腾讯混元大模型"
}
```

**环境变量：**
```bash
TENCENT_API_KEY=your-tencent-api-key-here
```

### OpenAI 官方

```json
{
  "id": "openai",
  "name": "OpenAI",
  "type": "openai",
  "baseURL": "https://api.openai.com/v1",
  "apiKey": "your-openai-api-key-here",
  "models": [
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo"
  ],
  "defaultModel": "gpt-4-turbo",
  "enabled": true,
  "description": "OpenAI 官方 API"
}
```

**环境变量：**
```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Azure OpenAI

```json
{
  "id": "azure",
  "name": "Azure OpenAI",
  "type": "azure",
  "baseURL": "https://your-resource.openai.azure.com/openai/deployments/your-deployment",
  "apiKey": "your-azure-api-key-here",
  "models": [
    "gpt-4",
    "gpt-35-turbo"
  ],
  "defaultModel": "gpt-4",
  "enabled": true,
  "description": "Azure OpenAI Service"
}
```

**环境变量：**
```bash
AZURE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Azure 可能需要特定的 Base URL
AZURE_API_BASE=https://your-resource.openai.azure.com/openai/deployments/your-deployment
```

## 🔧 环境变量命名规则

系统会自动根据 `id` 字段生成环境变量名：

| Provider ID | API Key 环境变量 | Base URL 环境变量 |
|-------------|------------------|-------------------|
| `openrouter` | `OPENROUTER_API_KEY` | `OPENROUTER_API_BASE` |
| `volcengine` | `VOLCENGINE_API_KEY` | `VOLCENGINE_API_BASE` |
| `aliyun` | `ALIYUN_API_KEY` | `ALIYUN_API_BASE` |
| `tencent` | `TENCENT_API_KEY` | `TENCENT_API_BASE` |
| `openai` | `OPENAI_API_KEY` | `OPENAI_API_BASE` |
| `azure` | `AZURE_API_KEY` | `AZURE_API_BASE` |

**规则：**
```
{PROVIDER_ID}_API_KEY      # API Key
{PROVIDER_ID}_API_BASE     # Base URL (可选)
```

## 📋 完整示例：添加 OpenRouter

### 1. 编辑 `config/llm-providers.json`

```json
[
  {
    "id": "tuzi",
    "name": "Tu-Zi (Claude Sonnet 4.5)",
    ...
  },
  {
    "id": "openrouter",
    "name": "OpenRouter",
    "type": "custom",
    "baseURL": "https://openrouter.ai/api/v1",
    "apiKey": "your-openrouter-api-key-here",
    "models": [
      "anthropic/claude-3.5-sonnet",
      "openai/gpt-4-turbo",
      "google/gemini-pro-1.5"
    ],
    "defaultModel": "anthropic/claude-3.5-sonnet",
    "enabled": true,
    "description": "OpenRouter - 统一访问多个 LLM 提供商",
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000
  }
]
```

### 2. 更新 `.env.example`

```bash
# OpenRouter
OPENROUTER_API_KEY=your-openrouter-api-key-here
# OPENROUTER_API_BASE=https://openrouter.ai/api/v1
```

### 3. 创建本地 `.env`

```bash
# 复制模板
cp .env.example .env

# 编辑 .env，添加真实的 API Key
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. 测试本地

```bash
npm run dev
# 访问 http://localhost:3000
# 在管理页面查看是否显示 OpenRouter
```

### 5. 部署到 Vercel

```bash
# 推送代码
git add .
git commit -m "Add OpenRouter provider"
git push

# 在 Vercel Dashboard 添加环境变量
# OPENROUTER_API_KEY = sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 重新部署
vercel --prod
```

## 🎨 在管理界面中使用

添加提供商后，你可以在管理界面（`/admin`）中：

1. 查看所有可用的提供商
2. 为不同的工作流配置不同的提供商
3. 为不同的 Agent 配置不同的模型

## 🔍 验证配置

### 检查提供商是否加载

在 Python 代码中：

```python
from crew.llm_config import llm_config_manager

# 查看所有加载的提供商
print(llm_config_manager.providers.keys())
# 输出: dict_keys(['tuzi', 'kimi', 'deepseek', 'zhipu', 'openrouter'])

# 查看特定提供商配置
print(llm_config_manager.providers['openrouter'])
```

### 测试 API 连接

```python
from crew.llm_config import llm_config_manager

# 获取 LLM 实例
llm = llm_config_manager.get_llm_for_agent(
    workflow_id='test',
    agent_name='test_agent'
)

# 测试调用
response = llm.invoke("Hello, world!")
print(response)
```

## ⚠️ 注意事项

### 1. API 兼容性

确保提供商的 API 兼容 OpenAI 格式：
- ✅ 支持 `/chat/completions` 端点
- ✅ 请求/响应格式与 OpenAI 一致
- ✅ 支持流式响应（streaming）

### 2. 模型名称

不同提供商的模型名称格式可能不同：
- OpenRouter: `anthropic/claude-3.5-sonnet`
- 火山引擎: `doubao-pro-32k`
- 阿里云: `qwen-max`

### 3. 认证方式

大多数提供商使用 Bearer Token：
```
Authorization: Bearer {API_KEY}
```

如果提供商使用不同的认证方式，可能需要修改代码。

### 4. 速率限制

不同提供商有不同的速率限制，注意：
- 请求频率限制
- Token 使用限制
- 并发请求限制

## 🚀 高级配置

### 使用代理

```bash
# .env
OPENROUTER_API_BASE=https://your-proxy.com/openrouter/v1
```

### 多区域支持

```bash
# 火山引擎 - 北京区域
VOLCENGINE_API_BASE=https://ark.cn-beijing.volces.com/api/v3

# 火山引擎 - 上海区域
# VOLCENGINE_API_BASE=https://ark.cn-shanghai.volces.com/api/v3
```

### 自定义端点

```bash
# 使用自建的 API 网关
OPENROUTER_API_BASE=https://api.your-company.com/llm/openrouter
```

## 📚 相关文档

- [配置策略说明](./CONFIGURATION_STRATEGY.md)
- [部署文档](../README_DEPLOYMENT.md)
- [安全策略](../SECURITY.md)

## 🎓 总结

添加新的 LLM 提供商只需要：

1. ✅ 在 JSON 中添加配置（非敏感信息）
2. ✅ 在环境变量中添加 API Key（敏感信息）
3. ✅ 重新部署

**系统会自动：**
- 🔄 加载新的提供商
- 🔑 从环境变量读取 API Key
- 🌐 支持 Base URL 覆盖
- 🎯 在管理界面中显示

**完全通用，无需修改代码！**

