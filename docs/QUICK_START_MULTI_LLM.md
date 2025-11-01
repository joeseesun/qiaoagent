# 快速开始：使用 Kimi 模型

## 🎯 目标

在 5 分钟内配置好 Kimi (Moonshot AI) 模型，并让你的工作流使用它。

## 📋 前提条件

- ✅ 项目已经启动（`./start.sh`）
- ✅ 浏览器访问 `http://localhost:3001`
- ✅ 已有 Kimi API Key（配置文件中已包含）

## 🚀 步骤 1: 查看 LLM 提供商配置

1. 访问 `http://localhost:3001/admin`
2. 点击右上角的 **"LLM 提供商"** 按钮
3. 你会看到两个预配置的提供商：
   - **Tu-Zi (Claude Sonnet 4.5)** - 默认提供商
   - **Kimi (Moonshot AI)** - 已配置好 API Key

## 🎨 步骤 2: 配置工作流使用 Kimi

1. 在后台管理页面，点击 **"模型配置"** 按钮
2. 找到 **"微信爆款标题创作"** 工作流
3. 配置如下：
   - **默认 LLM 提供商**: 选择 `Kimi (Moonshot AI)`
   - **默认模型**: 选择 `kimi-k2-turbo-preview`
4. 点击右上角的 **"保存配置"** 按钮

## ✅ 步骤 3: 测试

1. 返回首页 `http://localhost:3001`
2. 选择工作流：**微信爆款标题创作**
3. 输入内容：
   ```
   原来开发一个AI Agent比想象中简单。
   
   用CrewAI框架 + Nextjs，聊好需求，10分钟就开发好了。
   
   之前总觉得会很复杂。
   
   迈出第一步，才有迭代优化。
   ```
4. 点击 **"开始生成"**
5. 观察右侧的 Agent 执行过程

## 🎯 预期结果

你应该看到：
- ✅ ContentAnalyzer 使用 Kimi 模型分析内容
- ✅ TitleCreator 使用 Kimi 模型创作标题
- ✅ TitleOptimizer 使用 Kimi 模型优化标题
- ✅ 流式输出显示思考过程
- ✅ 最终生成 10 个爆款标题

## 🔧 高级配置：为不同 Agent 使用不同模型

如果你想让不同的 Agent 使用不同的模型（例如，让 TitleOptimizer 使用 Claude）：

1. 访问 `/admin/workflow-models`
2. 找到 **"微信爆款标题创作"** 工作流
3. 在 **"Agent 专属配置"** 部分：
   - 找到 `TitleOptimizer` 这一行
   - **LLM 提供商**: 选择 `Tu-Zi (Claude Sonnet 4.5)`
   - **模型**: 选择 `claude-sonnet-4.5`
4. 保存配置
5. 返回首页测试

现在：
- ContentAnalyzer 和 TitleCreator 使用 Kimi
- TitleOptimizer 使用 Claude

## 📊 配置说明

### 当前配置文件

#### `config/llm-providers.json`
```json
[
  {
    "id": "tuzi",
    "name": "Tu-Zi (Claude Sonnet 4.5)",
    "baseURL": "https://api.tu-zi.com/v1",
    "apiKey": "",
    "models": ["claude-sonnet-4.5"],
    "defaultModel": "claude-sonnet-4.5",
    "enabled": true
  },
  {
    "id": "kimi",
    "name": "Kimi (Moonshot AI)",
    "baseURL": "https://api.moonshot.cn/v1",
    "apiKey": "sk-fYmID3PPGRKWAavrsVRJR0yAnF6210ya4rAoc5TZZKFRDAH5",
    "models": [
      "moonshot-v1-8k",
      "moonshot-v1-32k",
      "moonshot-v1-128k",
      "kimi-k2-turbo-preview"
    ],
    "defaultModel": "kimi-k2-turbo-preview",
    "enabled": true
  }
]
```

### Kimi 模型说明

| 模型 | 上下文长度 | 适用场景 |
|------|-----------|---------|
| `moonshot-v1-8k` | 8,192 tokens | 短文本任务 |
| `moonshot-v1-32k` | 32,768 tokens | 中等长度文本 |
| `moonshot-v1-128k` | 131,072 tokens | 长文本分析 |
| `kimi-k2-turbo-preview` | 最新版本 | 推荐使用 |

## 🆘 故障排查

### 问题 1: 提示 "Unauthorized"

**原因**: API Key 无效或过期

**解决方案**:
1. 访问 `/admin/llm-providers`
2. 点击 Kimi 提供商的 "编辑" 按钮
3. 更新 API Key
4. 保存

### 问题 2: 没有使用配置的模型

**原因**: 配置未保存或未生效

**解决方案**:
1. 检查 `config/workflow-models.json` 文件是否存在
2. 确认配置已保存（点击 "保存配置" 按钮）
3. 重启服务器（`./start.sh`）

### 问题 3: 请求超时

**原因**: 网络问题或模型响应慢

**解决方案**:
1. 检查网络连接
2. 尝试使用较小的模型（如 `moonshot-v1-8k`）
3. 减少输入内容长度

## 🎉 成功！

现在你已经成功配置了多 LLM 提供商支持！

你可以：
- ✅ 添加更多 LLM 提供商
- ✅ 为不同工作流配置不同模型
- ✅ 为不同 Agent 配置专属模型
- ✅ 灵活切换和测试不同模型

## 📚 更多资源

- [完整配置指南](./LLM_CONFIGURATION.md)
- [实现总结](./MULTI_LLM_SETUP.md)
- [Kimi API 文档](https://platform.moonshot.cn/docs)

## 💡 提示

1. **成本优化**: 为简单任务使用 `moonshot-v1-8k`，为复杂任务使用 `kimi-k2-turbo-preview`
2. **性能对比**: 可以为同一个工作流创建多个配置，对比不同模型的效果
3. **混合使用**: 充分利用不同模型的优势，例如：
   - 内容分析：使用 Kimi 128k（长上下文）
   - 创意生成：使用 Claude（创意能力强）
   - 优化润色：使用 GPT-4（语言能力强）

