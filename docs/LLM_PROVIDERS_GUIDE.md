# LLM 提供商完整指南

## 📋 支持的提供商列表

### 1. **OpenAI**
- **Base URL**: `https://api.openai.com/v1`
- **模型**:
  - `gpt-4o` - 最新旗舰模型
  - `gpt-4o-mini` - 轻量级版本
  - `gpt-4-turbo` - 高性能版本
  - `o1` - 推理模型
  - `o1-mini` - 轻量推理模型
- **获取 API Key**: https://platform.openai.com/api-keys

### 2. **Anthropic (Claude)**
- **Base URL**: `https://api.anthropic.com/v1`
- **模型**:
  - `claude-opus-4-20250514` - 最强推理
  - `claude-sonnet-4-20250514` - 平衡性能
  - `claude-3-7-sonnet-20250219` - 3.7 版本
  - `claude-3-5-sonnet-20241022` - 3.5 版本
  - `claude-3-5-haiku-20241022` - 快速响应
- **获取 API Key**: https://console.anthropic.com/

### 3. **Google Gemini**
- **Base URL**: `https://generativelanguage.googleapis.com/v1beta`
- **模型**:
  - `gemini-2.0-flash-exp` - 最新实验版本
  - `gemini-1.5-pro` - 专业版（2M 上下文）
  - `gemini-1.5-flash` - 快速版
  - `gemini-1.5-flash-8b` - 轻量版
  - `gemini-1.0-pro` - 经典版
- **特点**: 多模态模型，支持超长上下文（2M tokens）
- **获取 API Key**: https://aistudio.google.com/app/apikey

### 4. **OpenRouter**
- **Base URL**: `https://openrouter.ai/api/v1`
- **特点**: 聚合多个 LLM 提供商，自动路由到最优价格
- **模型**:
  - `anthropic/claude-opus-4`
  - `anthropic/claude-sonnet-4`
  - `openai/gpt-4o`
  - `google/gemini-2.0-flash-exp`
  - `meta-llama/llama-3.3-70b-instruct`
  - `deepseek/deepseek-chat`
- **获取 API Key**: https://openrouter.ai/keys

### 4. **Groq**
- **Base URL**: `https://api.groq.com/openai/v1`
- **特点**: 超快推理速度（500+ tokens/s）
- **模型**:
  - `llama-3.3-70b-versatile`
  - `llama-3.1-70b-versatile`
  - `llama-3.1-8b-instant`
  - `mixtral-8x7b-32768`
  - `gemma2-9b-it`
- **获取 API Key**: https://console.groq.com/keys

### 5. **Together AI**
- **Base URL**: `https://api.together.xyz/v1`
- **特点**: 开源模型托管，高性价比
- **模型**:
  - `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo`
  - `meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo`
  - `mistralai/Mixtral-8x7B-Instruct-v0.1`
  - `Qwen/Qwen2.5-72B-Instruct-Turbo`
- **获取 API Key**: https://api.together.xyz/settings/api-keys

### 6. **Fireworks AI**
- **Base URL**: `https://api.fireworks.ai/inference/v1`
- **特点**: 快速推理，支持函数调用
- **模型**:
  - `accounts/fireworks/models/llama-v3p3-70b-instruct`
  - `accounts/fireworks/models/qwen2p5-72b-instruct`
  - `accounts/fireworks/models/deepseek-v3`
- **获取 API Key**: https://fireworks.ai/api-keys

### 7. **Perplexity**
- **Base URL**: `https://api.perplexity.ai`
- **特点**: 搜索增强的 LLM，实时联网
- **模型**:
  - `llama-3.1-sonar-large-128k-online` - 联网搜索
  - `llama-3.1-sonar-small-128k-online` - 轻量联网
  - `llama-3.1-sonar-large-128k-chat` - 纯对话
- **获取 API Key**: https://www.perplexity.ai/settings/api

### 8. **DeepSeek**
- **Base URL**: `https://api.deepseek.com/v1`
- **特点**: 国产高性价比模型
- **模型**:
  - `deepseek-chat` - 通用对话
  - `deepseek-coder` - 代码专用
- **获取 API Key**: https://platform.deepseek.com/api_keys

### 9. **Kimi (Moonshot AI)**
- **Base URL**: `https://api.moonshot.cn/v1`
- **特点**: K2 万亿参数 MoE 模型，超长上下文
- **模型**:
  - `kimi-k2` - 最新旗舰
  - `kimi-k2-0905-preview` - K2 0905版本
  - `kimi-latest` - 最新版本别名
  - `kimi-thinking-preview` - 长期思考
  - `moonshot-v1-128k` - 128K 上下文
- **获取 API Key**: https://platform.moonshot.cn/console/api-keys

### 10. **智谱 AI (GLM)**
- **Base URL**: `https://open.bigmodel.cn/api/paas/v4`
- **特点**: 国产多模态模型
- **模型**:
  - `glm-4.6` - 最新旗舰（355B 参数）
  - `glm-4.5-flash` - 免费模型
  - `glm-4.5-air` - 超高性价比
  - `glm-4.5v` - 100B 视觉模型
  - `glm-4v-flash` - 免费图片理解
  - `cogview-4` - 高清图片生成
  - `cogvideox-3` - 高质量视频
- **获取 API Key**: https://open.bigmodel.cn/usercenter/apikeys

### 11. **通义千问 (Qwen)**
- **Base URL**: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- **特点**: 阿里云大模型
- **模型**:
  - `qwen-turbo` - 快速响应
  - `qwen-plus` - 平衡性能
  - `qwen-max` - 最强性能
  - `qwen-max-longcontext` - 长上下文
- **获取 API Key**: https://dashscope.console.aliyun.com/apiKey

### 12. **Ollama (本地部署)**
- **Base URL**: `http://localhost:11434/v1`
- **特点**: 本地部署开源模型，完全免费
- **模型**:
  - `llama3.3` - Meta Llama 3.3
  - `qwen2.5` - 通义千问 2.5
  - `deepseek-r1` - DeepSeek R1
  - `mistral` - Mistral
  - `gemma2` - Google Gemma 2
- **安装**: https://ollama.ai/download

---

## 🔧 配置步骤

### 1. 访问 LLM 提供商管理页面
```
http://localhost:3001/admin/llm-providers
```

### 2. 添加新提供商
1. 点击"添加提供商"按钮
2. 选择提供商类型（会自动填充配置）
3. 输入 API Key
4. 点击"测试连接"验证配置
5. 保存

### 3. 在工作流中使用
1. 访问工作流管理页面
2. 编辑 Agent 配置
3. 在"模型配置"中选择提供商和模型

---

## ✅ 测试连接功能

每个提供商配置都支持测试连接功能：

1. **自动验证**: 发送测试请求到 API
2. **实时反馈**: 显示连接成功或失败信息
3. **错误诊断**: 提供详细的错误信息

**测试内容**:
- API Key 是否有效
- Base URL 是否正确
- 模型是否可用
- 网络连接是否正常

---

## 💡 使用建议

### 性能优先
- **Groq**: 超快推理速度，适合实时应用
- **Fireworks AI**: 快速推理，支持函数调用

### 成本优先
- **GLM-4.5-Flash**: 完全免费
- **Ollama**: 本地部署，零成本
- **Together AI**: 开源模型，高性价比

### 质量优先
- **Claude Opus 4**: 最强推理能力
- **GPT-4o**: OpenAI 最新旗舰
- **GLM-4.6**: 国产最强模型

### 特殊需求
- **长上下文**: Kimi K2 (128K+)
- **联网搜索**: Perplexity Sonar Online
- **多模态**: GLM-4.5v, Claude 3.5 Sonnet
- **代码**: DeepSeek Coder, GPT-4o

---

## 🔐 安全建议

1. **API Key 保护**:
   - 不要在代码中硬编码 API Key
   - 使用环境变量或配置文件
   - 定期轮换 API Key

2. **访问控制**:
   - 限制 API Key 的权限范围
   - 设置使用配额和速率限制
   - 监控 API 使用情况

3. **数据隐私**:
   - 敏感数据使用本地模型（Ollama）
   - 了解各提供商的数据保留政策
   - 使用企业版 API 获得更好的隐私保护

---

## 📊 价格对比

| 提供商 | 模型 | 输入价格 | 输出价格 | 特点 |
|--------|------|----------|----------|------|
| OpenAI | GPT-4o | $2.5/1M | $10/1M | 最新旗舰 |
| Anthropic | Claude Opus 4 | $15/1M | $75/1M | 最强推理 |
| OpenRouter | 多种模型 | 动态定价 | 动态定价 | 自动路由 |
| Groq | Llama 3.3 70B | 免费额度 | 免费额度 | 超快速度 |
| DeepSeek | DeepSeek Chat | ¥1/1M | ¥2/1M | 高性价比 |
| Kimi | Kimi K2 | ¥12/1M | ¥12/1M | 长上下文 |
| 智谱 | GLM-4.6 | ¥5/1M | ¥5/1M | 国产旗舰 |
| 智谱 | GLM-4.5-Flash | 免费 | 免费 | 完全免费 |
| Ollama | 所有模型 | 免费 | 免费 | 本地部署 |

*价格仅供参考，请以官方最新价格为准*

---

## 🆘 常见问题

### Q: 测试连接失败怎么办？
A: 检查以下几点：
1. API Key 是否正确
2. Base URL 是否正确
3. 网络是否可以访问该 API
4. API Key 是否有足够的配额

### Q: 如何选择合适的模型？
A: 根据需求选择：
- 创意任务：Claude Opus 4, GPT-4o
- 代码任务：DeepSeek Coder, GPT-4o
- 快速响应：Groq, GLM-4.5-Flash
- 成本敏感：Ollama, GLM-4.5-Flash

### Q: 可以同时使用多个提供商吗？
A: 可以！系统支持配置多个提供商，在工作流中为不同 Agent 选择不同的提供商。

### Q: Ollama 如何配置？
A: 
1. 下载安装 Ollama: https://ollama.ai/download
2. 运行 `ollama pull llama3.3`
3. 在系统中添加 Ollama 提供商
4. Base URL 使用 `http://localhost:11434/v1`
5. API Key 可以留空或填写任意值

---

## 📚 相关文档

- [LLM 配置说明](./LLM_CONFIGURATION.md)
- [多 LLM 设置指南](./MULTI_LLM_SETUP.md)
- [快速开始](./QUICK_START_MULTI_LLM.md)

