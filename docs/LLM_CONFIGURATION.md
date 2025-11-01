# LLM 多模型配置指南

## 概述

本系统支持配置多个 LLM 提供商，并可以为每个工作流和 Agent 指定使用不同的模型。

## 功能特性

- ✅ 支持多个 LLM 提供商（OpenAI、Kimi、Claude、通义千问、DeepSeek 等）
- ✅ 支持自定义 OpenAI 兼容的 API
- ✅ 工作流级别的默认模型配置
- ✅ Agent 级别的专属模型配置
- ✅ 可视化后台管理界面

## 支持的 LLM 提供商

### 1. OpenAI
- **Base URL**: `https://api.openai.com/v1`
- **模型**: gpt-4-turbo-preview, gpt-4, gpt-3.5-turbo

### 2. Kimi (Moonshot AI)
- **Base URL**: `https://api.moonshot.cn/v1`
- **模型**: moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k, kimi-k2-turbo-preview
- **特点**: 支持长上下文（最高 128k tokens）

### 3. Claude (Anthropic)
- **Base URL**: `https://api.anthropic.com/v1`
- **模型**: claude-3-opus, claude-3-sonnet, claude-3-haiku

### 4. 通义千问 (Qwen)
- **Base URL**: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- **模型**: qwen-turbo, qwen-plus, qwen-max

### 5. DeepSeek
- **Base URL**: `https://api.deepseek.com/v1`
- **模型**: deepseek-chat, deepseek-coder

### 6. 自定义 (Custom)
- 支持任何 OpenAI 兼容的 API

## 配置步骤

### 步骤 1: 配置 LLM 提供商

1. 访问后台管理: `http://localhost:3001/admin`
2. 登录后，点击 **"LLM 提供商"** 按钮
3. 点击 **"添加提供商"**
4. 填写以下信息：
   - **提供商类型**: 选择预设类型或自定义
   - **名称**: 给提供商起一个名字
   - **Base URL**: API 的基础 URL
   - **API Key**: 你的 API 密钥
   - **可用模型**: 每行一个模型名称
   - **默认模型**: 默认使用的模型
   - **启用**: 是否启用此提供商

5. 点击 **"保存"**

### 步骤 2: 配置工作流模型

1. 在后台管理页面，点击 **"模型配置"** 按钮
2. 为每个工作流配置：
   - **默认 LLM 提供商**: 该工作流默认使用的提供商
   - **默认模型**: 该工作流默认使用的模型
   - **Agent 专属配置**: 为特定 Agent 配置不同的模型（可选）

3. 点击 **"保存配置"**

## 使用示例

### 示例 1: 为整个工作流配置 Kimi

```
工作流: 微信爆款标题创作
默认提供商: Kimi (Moonshot AI)
默认模型: kimi-k2-turbo-preview
```

所有 Agent 都会使用 Kimi 的 `kimi-k2-turbo-preview` 模型。

### 示例 2: 为不同 Agent 配置不同模型

```
工作流: 微信爆款标题创作
默认提供商: Kimi (Moonshot AI)
默认模型: moonshot-v1-8k

Agent 专属配置:
- ContentAnalyzer: Kimi - kimi-k2-turbo-preview (使用更强大的模型分析内容)
- TitleCreator: Kimi - moonshot-v1-8k (使用默认模型)
- TitleOptimizer: Tu-Zi - claude-sonnet-4.5 (使用 Claude 优化标题)
```

这样可以根据每个 Agent 的任务特点，选择最合适的模型。

## 配置文件

配置文件存储在 `config/` 目录下：

### `config/llm-providers.json`

存储所有 LLM 提供商的配置：

```json
[
  {
    "id": "kimi",
    "name": "Kimi (Moonshot AI)",
    "type": "kimi",
    "baseURL": "https://api.moonshot.cn/v1",
    "apiKey": "sk-xxx",
    "models": ["moonshot-v1-8k", "kimi-k2-turbo-preview"],
    "defaultModel": "kimi-k2-turbo-preview",
    "enabled": true
  }
]
```

### `config/workflow-models.json`

存储每个工作流的模型配置：

```json
[
  {
    "workflowId": "wechat_title_creator",
    "defaultProviderId": "kimi",
    "defaultModel": "kimi-k2-turbo-preview",
    "agentConfigs": [
      {
        "agentName": "ContentAnalyzer",
        "providerId": "kimi",
        "model": "kimi-k2-turbo-preview"
      }
    ]
  }
]
```

## API 接口

### LLM 提供商管理

- `GET /api/llm-providers` - 获取所有提供商
- `POST /api/llm-providers` - 创建新提供商
- `PUT /api/llm-providers` - 更新提供商
- `DELETE /api/llm-providers?id={id}` - 删除提供商
- `GET /api/llm-providers/{id}` - 获取单个提供商（包含完整 API Key）

### 工作流模型配置

- `GET /api/workflow-models` - 获取所有配置
- `GET /api/workflow-models?workflowId={id}` - 获取特定工作流配置
- `POST /api/workflow-models` - 创建或更新配置
- `DELETE /api/workflow-models?workflowId={id}` - 删除配置

## 最佳实践

### 1. 根据任务选择模型

- **内容分析**: 使用长上下文模型（如 Kimi 128k）
- **创意生成**: 使用强大的模型（如 GPT-4、Claude Opus）
- **简单任务**: 使用经济型模型（如 GPT-3.5、Qwen Turbo）

### 2. 成本优化

- 为简单的 Agent 使用较便宜的模型
- 为关键的 Agent 使用更强大的模型
- 利用不同提供商的价格差异

### 3. 性能优化

- 使用流式输出提升用户体验
- 根据任务复杂度调整 `max_tokens`
- 合理设置 `temperature` 参数

## 故障排查

### 问题 1: API Key 无效

**症状**: 提示 "Unauthorized" 或 "Invalid API Key"

**解决方案**:
1. 检查 API Key 是否正确
2. 确认 API Key 有足够的额度
3. 检查 Base URL 是否正确

### 问题 2: 模型不可用

**症状**: 提示 "Model not found"

**解决方案**:
1. 确认模型名称拼写正确
2. 检查该提供商是否支持该模型
3. 查看提供商文档确认模型名称

### 问题 3: 请求超时

**症状**: 长时间无响应

**解决方案**:
1. 检查网络连接
2. 尝试使用其他提供商
3. 减少 `max_tokens` 参数

## 安全建议

1. **不要在代码中硬编码 API Key**
2. **使用环境变量存储敏感信息**
3. **定期轮换 API Key**
4. **限制 API Key 的权限范围**
5. **监控 API 使用量，防止滥用**

## 更新日志

### v1.0.0 (2025-01-01)
- ✅ 支持多 LLM 提供商配置
- ✅ 支持工作流级别和 Agent 级别的模型配置
- ✅ 可视化后台管理界面
- ✅ 支持 OpenAI、Kimi、Claude、通义千问、DeepSeek
- ✅ 支持自定义 OpenAI 兼容 API

