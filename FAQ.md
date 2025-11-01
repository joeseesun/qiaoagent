# ❓ 常见问题解答（FAQ）

## 🚀 安装和启动

### Q1: 如何快速启动项目？

**A:** 最简单的方法是使用启动脚本：

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```bash
start.bat
```

或者手动启动：
```bash
npm install
pip install -r requirements.txt
npm run dev
```

### Q2: `npm install` 失败怎么办？

**A:** 可能的原因和解决方案：

1. **Node.js 版本过低**
   ```bash
   node --version  # 需要 >= 18.0.0
   ```
   解决：升级 Node.js

2. **网络问题**
   ```bash
   npm install --registry=https://registry.npmmirror.com
   ```

3. **权限问题**
   ```bash
   sudo npm install  # macOS/Linux
   ```

### Q3: `pip install` 失败怎么办？

**A:** 建议使用虚拟环境：

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt
```

### Q4: 启动后访问 localhost:3000 显示错误？

**A:** 检查端口是否被占用：

```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 🎨 使用问题

### Q5: 生成内容需要多长时间？

**A:** 通常需要 30-60 秒，取决于：
- 主题复杂度
- Agent 数量
- 网络速度
- API 响应速度

### Q6: 生成失败怎么办？

**A:** 可能的原因：

1. **API Key 无效**
   - 检查 `.env` 文件中的 `OPENAI_API_KEY`
   - 确保 API Key 有效且有余额

2. **网络问题**
   - 检查网络连接
   - 尝试使用 VPN

3. **超时**
   - Vercel 免费版有 10 秒限制
   - 升级到 Pro 版（60 秒）

### Q7: 如何添加新的工作流？

**A:** 两种方法：

**方法一：通过后台（推荐）**
1. 访问 `/admin`
2. 输入密码
3. 点击"新建工作流"
4. 添加 Agents 和 Tasks
5. 保存配置

**方法二：手动编辑**
1. 编辑 `public/workflows.json`
2. 添加新的工作流对象
3. 保存文件
4. 刷新页面

### Q8: 如何修改管理员密码？

**A:** 修改 `.env` 文件：

```env
ADMIN_PASSWORD=your_new_password
```

重启服务器后生效。

## 🚀 部署问题

### Q9: 如何部署到 Vercel？

**A:** 详细步骤请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

简要步骤：
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 点击 Deploy

### Q10: Vercel 部署失败怎么办？

**A:** 常见原因：

1. **环境变量未配置**
   - 在 Vercel Dashboard 添加所有必需的环境变量

2. **依赖安装失败**
   - 检查 `package.json` 和 `requirements.txt`
   - 查看 Build Logs

3. **构建超时**
   - 优化依赖
   - 升级 Vercel 计划

### Q11: 部署后 API 返回 404？

**A:** 检查 `vercel.json` 配置：

```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" }
  ]
}
```

确保路由配置正确。

### Q12: 部署后生成超时？

**A:** Vercel 免费版有 10 秒执行时间限制。

解决方案：
1. 升级到 Vercel Pro（60 秒）
2. 减少 Agent 数量
3. 简化任务描述

## 🔧 配置问题

### Q13: 如何更换 AI 模型？

**A:** 修改 `.env` 文件：

```env
OPENAI_MODEL_NAME=gpt-4  # 或其他模型
```

确保 tu-zi.com 支持该模型。

### Q14: 如何使用其他 API 服务？

**A:** 修改 `.env` 文件：

```env
OPENAI_API_BASE=https://api.openai.com/v1
OPENAI_API_KEY=sk-your-openai-key
```

### Q15: 配置修改后不生效？

**A:** 可能的原因：

1. **未重启服务器**
   - 修改 `.env` 后需要重启

2. **缓存问题**
   - 清除浏览器缓存
   - 硬刷新（Ctrl+Shift+R）

3. **配置文件路径错误**
   - 确保 `.env` 在项目根目录

## 🎨 界面问题

### Q16: 界面显示不正常？

**A:** 可能的原因：

1. **CSS 未加载**
   - 检查浏览器控制台
   - 清除缓存

2. **浏览器兼容性**
   - 使用最新版 Chrome/Firefox/Safari

3. **移动端显示问题**
   - 检查响应式设计
   - 使用开发者工具测试

### Q17: 如何自定义主题颜色？

**A:** 编辑 `app/globals.css`：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --primary: 0 0% 0%;
  /* 修改这些值 */
}
```

## 🔒 安全问题

### Q18: 如何保护 API Key？

**A:** 

1. **使用环境变量**
   - 不要在代码中硬编码

2. **添加到 .gitignore**
   - 确保 `.env` 不被提交

3. **Vercel 环境变量**
   - 在 Dashboard 中配置

### Q19: 管理后台安全吗？

**A:** 

当前使用简单的密码验证，适合个人使用。

生产环境建议：
1. 使用强密码
2. 添加 IP 白名单
3. 使用 OAuth 认证
4. 添加访问日志

## 📊 性能问题

### Q20: 如何提高生成速度？

**A:** 

1. **减少 Agent 数量**
   - 3 个 Agent 通常足够

2. **优化提示词**
   - 简洁明确的提示词

3. **使用更快的模型**
   - 如 GPT-3.5 Turbo

4. **升级 Vercel 计划**
   - 更多资源和更长执行时间

### Q21: 如何减少 API 调用成本？

**A:** 

1. **缓存结果**
   - 相同主题不重复生成

2. **优化提示词**
   - 减少 token 使用

3. **使用更便宜的模型**
   - 根据需求选择合适的模型

## 🐛 调试问题

### Q22: 如何查看错误日志？

**A:** 

**本地开发：**
- 查看终端输出
- 查看浏览器控制台

**Vercel 部署：**
- Vercel Dashboard → Deployments → Function Logs

### Q23: 如何调试 Python 代码？

**A:** 

添加 print 语句：
```python
print(f"Debug: {variable}")
```

或使用调试器：
```python
import pdb; pdb.set_trace()
```

### Q24: 如何调试前端代码？

**A:** 

1. **使用 Chrome DevTools**
   - F12 打开开发者工具
   - 查看 Console 和 Network

2. **使用 React DevTools**
   - 安装 React DevTools 扩展

3. **添加 console.log**
   ```typescript
   console.log('Debug:', data)
   ```

## 📚 其他问题

### Q25: 如何贡献代码？

**A:** 请参考 [CONTRIBUTING.md](./CONTRIBUTING.md)

### Q26: 如何报告 Bug？

**A:** 在 GitHub Issues 中报告，包含：
- Bug 描述
- 复现步骤
- 环境信息
- 截图（如果适用）

### Q27: 支持哪些浏览器？

**A:** 

- ✅ Chrome（推荐）
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ IE 不支持

### Q28: 支持移动端吗？

**A:** 是的，完全支持移动端。使用响应式设计，在手机和平板上都能正常使用。

### Q29: 可以商用吗？

**A:** 本项目使用 MIT 许可证，可以自由使用、修改和商用。但请注意：
- 遵守 tu-zi.com API 使用条款
- 遵守 CrewAI 许可证
- 自行承担使用风险

### Q30: 如何获取更多帮助？

**A:** 

1. **查看文档**
   - [README.md](./README.md)
   - [QUICKSTART.md](./QUICKSTART.md)
   - [DEPLOYMENT.md](./DEPLOYMENT.md)

2. **GitHub Issues**
   - 搜索已有问题
   - 提交新问题

3. **社区支持**
   - CrewAI 社区
   - Next.js 社区

---

**还有其他问题？** 欢迎在 GitHub Issues 中提问！

