# 安全策略

## 敏感信息保护

本项目使用环境变量来管理所有敏感信息。请遵循以下安全准则：

### ✅ 应该做的事

1. **使用环境变量**
   - 所有 API keys 必须通过环境变量配置
   - 管理员密码必须通过 `ADMIN_PASSWORD` 环境变量设置
   - 在生产环境使用强密码

2. **保护 .env 文件**
   - `.env` 文件已在 `.gitignore` 中
   - 永远不要将 `.env` 文件提交到版本控制
   - 不要在公共场合分享 `.env` 文件内容

3. **配置文件安全**
   - `config/llm-providers.json` 应该只包含占位符 API keys
   - 真实的 API keys 通过环境变量覆盖
   - 定期审查配置文件，确保没有敏感信息

4. **部署平台安全**
   - 在 Vercel/Netlify 等平台的环境变量设置中配置敏感信息
   - 使用平台提供的加密存储功能
   - 限制对环境变量的访问权限

### ❌ 不应该做的事

1. **永远不要**在代码中硬编码 API keys
2. **永远不要**将 `.env` 文件提交到 Git
3. **永远不要**在 Issue、PR 或讨论中分享真实的 API keys
4. **永远不要**在截图中暴露敏感信息
5. **永远不要**在公共文档中包含真实凭证

## 环境变量命名规范

本项目支持以下环境变量：

### 主要配置
- `OPENAI_API_BASE` - API 基础 URL
- `OPENAI_API_KEY` - 默认 API key
- `OPENAI_MODEL_NAME` - 默认模型名称
- `ADMIN_PASSWORD` - 管理员密码

### LLM 提供商 API Keys
- `TUZI_API_KEY` - Tu-Zi API key
- `KIMI_API_KEY` - Kimi API key
- `DEEPSEEK_API_KEY` - DeepSeek API key
- `ZHIPU_API_KEY` - 智谱 AI API key

## 如果不小心泄露了敏感信息

如果你不小心将敏感信息提交到了 Git：

1. **立即轮换凭证**
   - 立即更改所有泄露的 API keys
   - 更改管理员密码
   - 在相关平台撤销旧的 API keys

2. **清理 Git 历史**
   ```bash
   # 使用 git filter-branch 或 BFG Repo-Cleaner
   # 注意：这会重写历史，需要强制推送
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # 强制推送（谨慎操作）
   git push origin --force --all
   ```

3. **通知相关方**
   - 如果是团队项目，通知所有成员
   - 如果是公开仓库，考虑发布安全公告

## 报告安全问题

如果你发现了安全漏洞，请通过以下方式报告：

1. **不要**在公开的 Issue 中报告安全漏洞
2. 通过私密方式联系项目维护者
3. 提供详细的漏洞描述和复现步骤

## 安全检查清单

在部署前，请确认：

- [ ] `.env` 文件不在版本控制中
- [ ] `config/llm-providers.json` 不包含真实 API keys
- [ ] 所有敏感信息通过环境变量配置
- [ ] 生产环境使用强密码
- [ ] 已在部署平台配置所有必需的环境变量
- [ ] 已审查 Git 历史，确保没有敏感信息泄露
- [ ] 已启用 HTTPS
- [ ] 已配置适当的访问控制

## 最佳实践

1. **定期轮换凭证**
   - 每 90 天更换一次 API keys
   - 每 30 天更换一次管理员密码

2. **使用密码管理器**
   - 使用 1Password、LastPass 等工具管理密码
   - 生成强随机密码

3. **监控 API 使用**
   - 定期检查 API 使用情况
   - 设置使用量警报
   - 监控异常活动

4. **最小权限原则**
   - 只授予必要的 API 权限
   - 限制 API key 的访问范围
   - 使用不同的 API keys 用于开发和生产

## 参考资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Vercel Security](https://vercel.com/docs/security)

