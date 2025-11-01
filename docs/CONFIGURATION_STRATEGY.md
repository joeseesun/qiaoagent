# 配置策略说明

## 🎯 设计理念

本项目采用**分离式配置策略**，将敏感信息和非敏感配置分开管理：

- **敏感信息**（API Keys）→ 环境变量
- **非敏感配置**（URLs, Models）→ JSON 配置文件
- **灵活覆盖** → 环境变量可以覆盖 JSON 配置

## 📋 配置层级

### 1. API Keys（必须使用环境变量）

**为什么？**
- ✅ 安全：不会被提交到 Git
- ✅ 灵活：不同环境使用不同的 keys
- ✅ 标准：符合 12-factor app 原则

**配置方式：**
```bash
# .env 文件
TUZI_API_KEY=sk-your-real-key-here
KIMI_API_KEY=sk-your-real-key-here
DEEPSEEK_API_KEY=sk-your-real-key-here
ZHIPU_API_KEY=your-real-key-here
```

### 2. Base URLs（推荐使用 JSON 配置）

**为什么？**
- ✅ 非敏感：可以安全地提交到 Git
- ✅ 可维护：团队成员可以看到和修改
- ✅ 版本控制：URL 变更有历史记录

**配置方式：**
```json
// config/llm-providers.json
{
  "id": "tuzi",
  "baseURL": "https://api.tu-zi.com/v1",
  "apiKey": "your-tuzi-api-key-here"  // 占位符，实际值从环境变量读取
}
```

### 3. Base URLs 覆盖（可选，使用环境变量）

**为什么？**
- ✅ 灵活：临时切换到测试环境
- ✅ 方便：不需要修改 JSON 文件
- ✅ 隔离：不影响其他开发者

**配置方式：**
```bash
# .env 文件（可选）
TUZI_API_BASE=https://test-api.tu-zi.com/v1
KIMI_API_BASE=https://your-proxy.com/kimi/v1
```

## 🔄 优先级规则

### API Key 优先级

```
1. {PROVIDER_ID}_API_KEY     (最高优先级)
   ↓
2. OPENAI_API_KEY            (仅用于 tuzi，向后兼容)
   ↓
3. JSON 配置文件中的值        (最低优先级，应该是占位符)
```

**示例：**
```bash
# 环境变量
TUZI_API_KEY=sk-real-key-123
OPENAI_API_KEY=sk-real-key-456

# 结果：tuzi 使用 sk-real-key-123
```

### Base URL 优先级

```
1. {PROVIDER_ID}_API_BASE    (最高优先级，环境变量覆盖)
   ↓
2. OPENAI_API_BASE           (仅用于 tuzi，向后兼容)
   ↓
3. JSON 配置文件中的值        (默认值)
```

**示例：**
```bash
# 环境变量
TUZI_API_BASE=https://test-api.tu-zi.com/v1

# JSON 配置
{
  "baseURL": "https://api.tu-zi.com/v1"
}

# 结果：使用 https://test-api.tu-zi.com/v1
```

## 📝 配置示例

### 场景 1: 生产环境（推荐）

**环境变量（.env 或 Vercel）：**
```bash
# 只配置 API Keys
TUZI_API_KEY=sk-prod-key-xxx
KIMI_API_KEY=sk-prod-key-yyy
DEEPSEEK_API_KEY=sk-prod-key-zzz
ZHIPU_API_KEY=prod-key-www
ADMIN_PASSWORD=strong-password-123
```

**JSON 配置（config/llm-providers.json）：**
```json
[
  {
    "id": "tuzi",
    "baseURL": "https://api.tu-zi.com/v1",
    "apiKey": "your-tuzi-api-key-here",
    "models": ["claude-sonnet-4-5-20250929"],
    "defaultModel": "claude-sonnet-4-5-20250929"
  }
]
```

**结果：**
- API Key: 从环境变量读取 `sk-prod-key-xxx`
- Base URL: 从 JSON 读取 `https://api.tu-zi.com/v1`

### 场景 2: 开发环境（使用测试端点）

**环境变量（.env）：**
```bash
# API Keys
TUZI_API_KEY=sk-dev-key-xxx

# 覆盖 Base URL 到测试环境
TUZI_API_BASE=https://test-api.tu-zi.com/v1
```

**JSON 配置：**
```json
// 保持不变
{
  "id": "tuzi",
  "baseURL": "https://api.tu-zi.com/v1"
}
```

**结果：**
- API Key: `sk-dev-key-xxx`
- Base URL: `https://test-api.tu-zi.com/v1`（环境变量覆盖）

### 场景 3: 使用代理

**环境变量（.env）：**
```bash
# API Keys
KIMI_API_KEY=sk-real-key-yyy

# 通过代理访问
KIMI_API_BASE=https://your-proxy.com/kimi/v1
```

**结果：**
- 所有请求通过代理发送
- 不需要修改 JSON 配置
- 其他开发者不受影响

### 场景 4: 多环境部署

**开发环境（.env.development）：**
```bash
TUZI_API_KEY=sk-dev-key
TUZI_API_BASE=https://dev-api.tu-zi.com/v1
```

**测试环境（.env.staging）：**
```bash
TUZI_API_KEY=sk-staging-key
TUZI_API_BASE=https://staging-api.tu-zi.com/v1
```

**生产环境（Vercel 环境变量）：**
```bash
TUZI_API_KEY=sk-prod-key
# 不设置 TUZI_API_BASE，使用 JSON 中的默认值
```

## 🛠️ 实际操作

### 添加新的 LLM 提供商

**步骤 1: 更新 JSON 配置**
```json
// config/llm-providers.json
{
  "id": "newprovider",
  "name": "New Provider",
  "type": "custom",
  "baseURL": "https://api.newprovider.com/v1",
  "apiKey": "your-newprovider-api-key-here",  // 占位符
  "models": ["model-1", "model-2"],
  "defaultModel": "model-1",
  "enabled": true
}
```

**步骤 2: 配置环境变量**
```bash
# .env
NEWPROVIDER_API_KEY=sk-your-real-key-here
```

**步骤 3: （可选）覆盖 Base URL**
```bash
# .env（如果需要使用不同的端点）
NEWPROVIDER_API_BASE=https://custom-endpoint.com/v1
```

### 修改现有提供商的 URL

**方式 1: 修改 JSON（推荐，永久性修改）**
```json
// config/llm-providers.json
{
  "id": "tuzi",
  "baseURL": "https://new-api.tu-zi.com/v1"  // 直接修改
}
```

**方式 2: 使用环境变量（临时性修改）**
```bash
# .env
TUZI_API_BASE=https://new-api.tu-zi.com/v1
```

### 切换到备用端点

**场景：主端点故障，临时切换到备用端点**

```bash
# .env
# 添加这一行，不需要修改代码
TUZI_API_BASE=https://backup-api.tu-zi.com/v1

# 重启应用
npm run dev
```

## 📊 配置对比表

| 配置项 | 存储位置 | 是否敏感 | 可否提交 Git | 覆盖方式 |
|--------|----------|----------|--------------|----------|
| API Key | 环境变量 | ✅ 是 | ❌ 否 | 环境变量优先 |
| Base URL | JSON 配置 | ❌ 否 | ✅ 是 | 环境变量可覆盖 |
| Model Name | JSON 配置 | ❌ 否 | ✅ 是 | JSON 配置 |
| Enabled | JSON 配置 | ❌ 否 | ✅ 是 | JSON 配置 |

## ✅ 最佳实践

### DO（应该做）

1. ✅ **API Keys 始终使用环境变量**
   ```bash
   TUZI_API_KEY=sk-real-key
   ```

2. ✅ **Base URLs 在 JSON 中配置**
   ```json
   {"baseURL": "https://api.tu-zi.com/v1"}
   ```

3. ✅ **临时切换使用环境变量覆盖**
   ```bash
   TUZI_API_BASE=https://test-api.tu-zi.com/v1
   ```

4. ✅ **JSON 中的 apiKey 使用占位符**
   ```json
   {"apiKey": "your-tuzi-api-key-here"}
   ```

### DON'T（不应该做）

1. ❌ **不要在 JSON 中存储真实的 API Keys**
   ```json
   {"apiKey": "sk-real-key-xxx"}  // 错误！
   ```

2. ❌ **不要将 .env 文件提交到 Git**
   ```bash
   git add .env  // 错误！
   ```

3. ❌ **不要在代码中硬编码 API Keys**
   ```python
   api_key = "sk-real-key-xxx"  // 错误！
   ```

## 🔍 故障排查

### 问题：API 调用失败

**检查步骤：**

1. **验证 API Key**
   ```bash
   echo $TUZI_API_KEY
   # 应该输出真实的 key，不是占位符
   ```

2. **验证 Base URL**
   ```python
   # 在代码中打印
   print(provider['baseURL'])
   # 检查是否是正确的 URL
   ```

3. **检查优先级**
   ```bash
   # 如果同时设置了多个变量
   echo $TUZI_API_KEY      # 优先级最高
   echo $OPENAI_API_KEY    # 优先级较低
   ```

### 问题：环境变量不生效

**可能原因：**

1. 环境变量名称错误
   ```bash
   # 错误
   TUZI_KEY=xxx
   
   # 正确
   TUZI_API_KEY=xxx
   ```

2. 没有重启应用
   ```bash
   # 修改 .env 后需要重启
   npm run dev
   ```

3. 环境变量没有加载
   ```python
   # 确保代码中有
   from dotenv import load_dotenv
   load_dotenv()
   ```

## 📚 相关文档

- [部署文档](../README_DEPLOYMENT.md)
- [安全策略](../SECURITY.md)
- [环境变量示例](../.env.example)

## 🎓 总结

**核心原则：**
1. **敏感信息** → 环境变量（安全）
2. **非敏感配置** → JSON 文件（可维护）
3. **灵活覆盖** → 环境变量优先（方便）

**实际应用：**
- 生产环境：只配置 API Keys
- 开发环境：可以覆盖 Base URLs
- 团队协作：JSON 配置共享，API Keys 各自管理

这种设计既保证了安全性，又提供了灵活性！

