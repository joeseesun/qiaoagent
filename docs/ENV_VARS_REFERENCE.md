# 环境变量快速参考

## 🎯 命名规则

### 自动生成规则

系统会根据 `config/llm-providers.json` 中的 `id` 字段自动生成环境变量名：

```
{PROVIDER_ID}_API_KEY      # API Key (必需)
{PROVIDER_ID}_API_BASE     # Base URL (可选，覆盖 JSON 配置)
```

**示例：**

| Provider ID | API Key 环境变量 | Base URL 环境变量 |
|-------------|------------------|-------------------|
| `tuzi` | `TUZI_API_KEY` | `TUZI_API_BASE` |
| `kimi` | `KIMI_API_KEY` | `KIMI_API_BASE` |
| `openrouter` | `OPENROUTER_API_KEY` | `OPENROUTER_API_BASE` |
| `volcengine` | `VOLCENGINE_API_KEY` | `VOLCENGINE_API_BASE` |

### 特殊规则

**Provider ID 转换：**
- 小写转大写：`tuzi` → `TUZI`
- 连字符转下划线：`my-provider` → `MY_PROVIDER`
- 数字保持不变：`provider123` → `PROVIDER123`

**示例：**
```json
// config/llm-providers.json
{
  "id": "my-custom-provider"
}
```

```bash
# .env
MY_CUSTOM_PROVIDER_API_KEY=your-key-here
MY_CUSTOM_PROVIDER_API_BASE=https://api.example.com/v1
```

## 📋 内置提供商环境变量

### Tu-Zi (Claude Sonnet 4.5)

```bash
# API Key (必需)
TUZI_API_KEY=your-tuzi-api-key-here

# Base URL (可选)
TUZI_API_BASE=https://api.tu-zi.com/v1

# 向后兼容 (Backward Compatibility)
OPENAI_API_KEY=your-tuzi-api-key-here
OPENAI_API_BASE=https://api.tu-zi.com/v1
OPENAI_MODEL_NAME=claude-sonnet-4-5-20250929
```

### Kimi (Moonshot AI)

```bash
# API Key (必需)
KIMI_API_KEY=your-kimi-api-key-here

# Base URL (可选)
KIMI_API_BASE=https://api.moonshot.cn/v1
```

### DeepSeek

```bash
# API Key (必需)
DEEPSEEK_API_KEY=your-deepseek-api-key-here

# Base URL (可选)
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
```

### 智谱 AI (Zhipu AI)

```bash
# API Key (必需)
ZHIPU_API_KEY=your-zhipu-api-key-here

# Base URL (可选)
ZHIPU_API_BASE=https://open.bigmodel.cn/api/paas/v4
```

## 🔥 常用第三方提供商

### OpenRouter

```bash
# API Key (必需)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Base URL (可选)
OPENROUTER_API_BASE=https://openrouter.ai/api/v1
```

**JSON 配置：**
```json
{
  "id": "openrouter",
  "name": "OpenRouter",
  "baseURL": "https://openrouter.ai/api/v1",
  "apiKey": "your-openrouter-api-key-here",
  "models": ["anthropic/claude-3.5-sonnet", "openai/gpt-4-turbo"],
  "defaultModel": "anthropic/claude-3.5-sonnet"
}
```

### 火山引擎 (Volcengine)

```bash
# API Key (必需)
VOLCENGINE_API_KEY=your-volcengine-api-key-here

# Base URL (可选，支持多区域)
VOLCENGINE_API_BASE=https://ark.cn-beijing.volces.com/api/v3
# VOLCENGINE_API_BASE=https://ark.cn-shanghai.volces.com/api/v3
```

**JSON 配置：**
```json
{
  "id": "volcengine",
  "name": "火山引擎",
  "baseURL": "https://ark.cn-beijing.volces.com/api/v3",
  "apiKey": "your-volcengine-api-key-here",
  "models": ["doubao-pro-32k", "doubao-lite-32k"],
  "defaultModel": "doubao-pro-32k"
}
```

### 阿里云百炼 (Aliyun)

```bash
# API Key (必需)
ALIYUN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Base URL (可选)
ALIYUN_API_BASE=https://dashscope.aliyuncs.com/compatible-mode/v1
```

**JSON 配置：**
```json
{
  "id": "aliyun",
  "name": "阿里云百炼",
  "baseURL": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "apiKey": "your-aliyun-api-key-here",
  "models": ["qwen-max", "qwen-plus", "qwen-turbo"],
  "defaultModel": "qwen-max"
}
```

### 腾讯混元 (Tencent)

```bash
# API Key (必需)
TENCENT_API_KEY=your-tencent-api-key-here

# Base URL (可选)
TENCENT_API_BASE=https://api.hunyuan.cloud.tencent.com/v1
```

**JSON 配置：**
```json
{
  "id": "tencent",
  "name": "腾讯混元",
  "baseURL": "https://api.hunyuan.cloud.tencent.com/v1",
  "apiKey": "your-tencent-api-key-here",
  "models": ["hunyuan-pro", "hunyuan-standard"],
  "defaultModel": "hunyuan-pro"
}
```

### OpenAI 官方

```bash
# API Key (必需)
OPENAI_OFFICIAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Base URL (可选)
OPENAI_OFFICIAL_API_BASE=https://api.openai.com/v1
```

**JSON 配置：**
```json
{
  "id": "openai_official",
  "name": "OpenAI",
  "baseURL": "https://api.openai.com/v1",
  "apiKey": "your-openai-api-key-here",
  "models": ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
  "defaultModel": "gpt-4-turbo"
}
```

### Azure OpenAI

```bash
# API Key (必需)
AZURE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Base URL (必需，包含部署名称)
AZURE_API_BASE=https://your-resource.openai.azure.com/openai/deployments/your-deployment
```

**JSON 配置：**
```json
{
  "id": "azure",
  "name": "Azure OpenAI",
  "baseURL": "https://your-resource.openai.azure.com/openai/deployments/your-deployment",
  "apiKey": "your-azure-api-key-here",
  "models": ["gpt-4", "gpt-35-turbo"],
  "defaultModel": "gpt-4"
}
```

## 🔧 系统环境变量

### 管理员密码

```bash
# 管理员密码 (必需)
ADMIN_PASSWORD=your-secure-password-here
```

### 向后兼容变量

```bash
# 这些变量仅用于 tuzi provider 的向后兼容
OPENAI_API_KEY=your-tuzi-api-key-here
OPENAI_API_BASE=https://api.tu-zi.com/v1
OPENAI_MODEL_NAME=claude-sonnet-4-5-20250929
```

## 📊 优先级规则

### API Key 优先级

```
1. {PROVIDER_ID}_API_KEY     (最高优先级)
   ↓
2. OPENAI_API_KEY            (仅用于 tuzi，向后兼容)
   ↓
3. JSON 配置文件中的值        (最低优先级，应该是占位符)
```

### Base URL 优先级

```
1. {PROVIDER_ID}_API_BASE    (最高优先级)
   ↓
2. OPENAI_API_BASE           (仅用于 tuzi，向后兼容)
   ↓
3. JSON 配置文件中的值        (默认值)
```

## 🎯 使用场景

### 场景 1: 生产环境（推荐）

```bash
# 只配置 API Keys
TUZI_API_KEY=sk-prod-key-xxx
KIMI_API_KEY=sk-prod-key-yyy
ADMIN_PASSWORD=strong-password-123
```

### 场景 2: 开发环境（使用测试端点）

```bash
# API Keys
TUZI_API_KEY=sk-dev-key-xxx

# 覆盖 Base URL 到测试环境
TUZI_API_BASE=https://test-api.tu-zi.com/v1
```

### 场景 3: 使用代理

```bash
# API Keys
OPENROUTER_API_KEY=sk-or-v1-xxx

# 通过代理访问
OPENROUTER_API_BASE=https://your-proxy.com/openrouter/v1
```

### 场景 4: 多提供商

```bash
# 同时使用多个提供商
TUZI_API_KEY=sk-tuzi-key-xxx
KIMI_API_KEY=sk-kimi-key-yyy
OPENROUTER_API_KEY=sk-or-v1-zzz
VOLCENGINE_API_KEY=volcengine-key-www
```

## ✅ 验证环境变量

### 本地验证

```bash
# 查看环境变量
echo $TUZI_API_KEY
echo $TUZI_API_BASE

# 或使用 dotenv
node -e "require('dotenv').config(); console.log(process.env.TUZI_API_KEY)"
```

### Python 验证

```python
import os
from dotenv import load_dotenv

load_dotenv()

print(f"TUZI_API_KEY: {os.getenv('TUZI_API_KEY')}")
print(f"TUZI_API_BASE: {os.getenv('TUZI_API_BASE')}")
```

### Vercel 验证

```bash
# 查看 Vercel 环境变量
vercel env ls

# 拉取环境变量到本地
vercel env pull .env.local
```

## 🚨 常见错误

### 错误 1: 环境变量名称错误

```bash
# ❌ 错误
TUZI_KEY=xxx
TUZI-API-KEY=xxx

# ✅ 正确
TUZI_API_KEY=xxx
```

### 错误 2: Provider ID 不匹配

```json
// config/llm-providers.json
{
  "id": "my-provider"  // 注意：有连字符
}
```

```bash
# ❌ 错误
MY-PROVIDER_API_KEY=xxx

# ✅ 正确
MY_PROVIDER_API_KEY=xxx
```

### 错误 3: 忘记重启应用

```bash
# 修改 .env 后必须重启
npm run dev
```

## 📚 相关文档

- [添加新提供商指南](./ADD_NEW_PROVIDER.md)
- [配置策略说明](./CONFIGURATION_STRATEGY.md)
- [部署文档](../README_DEPLOYMENT.md)

## 🎓 快速参考

**添加新提供商的环境变量：**

1. 查看 JSON 配置中的 `id` 字段
2. 转换为大写并替换连字符为下划线
3. 添加 `_API_KEY` 后缀
4. （可选）添加 `_API_BASE` 后缀

**示例：**
```json
{"id": "my-new-provider"}
```
↓
```bash
MY_NEW_PROVIDER_API_KEY=your-key-here
MY_NEW_PROVIDER_API_BASE=https://api.example.com/v1
```

