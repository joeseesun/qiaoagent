# 🤝 贡献指南

感谢你对 AI 创作工作流助手的关注！我们欢迎各种形式的贡献。

## 📋 贡献方式

### 1. 报告 Bug

如果你发现了 Bug，请：

1. 在 GitHub Issues 中搜索是否已有相同问题
2. 如果没有，创建新 Issue，包含：
   - Bug 描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（操作系统、Node.js 版本、Python 版本等）
   - 截图（如果适用）

### 2. 提出新功能

如果你有新功能建议：

1. 在 GitHub Issues 中创建 Feature Request
2. 描述功能的用途和价值
3. 提供使用场景示例
4. 如果可能，提供设计草图或原型

### 3. 提交代码

#### 准备工作

1. Fork 本仓库
2. Clone 到本地
3. 创建新分支

```bash
git checkout -b feature/your-feature-name
```

#### 开发规范

**前端代码（TypeScript/React）**

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用函数式组件 + Hooks
- 使用 Tailwind CSS 进行样式设计
- 保持组件单一职责

**后端代码（Python）**

- 遵循 PEP 8 规范
- 使用类型注解
- 编写文档字符串
- 保持函数简洁（< 50 行）

**提交信息**

使用语义化提交信息：

```
feat: 添加新功能
fix: 修复 Bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建/工具链更新
```

示例：
```
feat: 添加视频脚本生成工作流
fix: 修复管理后台保存配置失败的问题
docs: 更新部署指南
```

#### 测试

在提交前，请确保：

1. 代码可以正常运行
2. 没有 TypeScript 错误
3. 没有 ESLint 警告
4. API 接口正常工作

```bash
# 运行开发服务器
npm run dev

# 测试 API
./test_api.sh
```

#### 提交 Pull Request

1. 推送到你的 Fork

```bash
git push origin feature/your-feature-name
```

2. 在 GitHub 上创建 Pull Request
3. 填写 PR 描述，包括：
   - 改动内容
   - 相关 Issue
   - 测试结果
   - 截图（如果适用）

4. 等待 Review

## 🎨 设计规范

### UI/UX 原则

- **极简主义** - 黑白灰配色，避免过多装饰
- **一致性** - 使用 shadcn/ui 组件保持风格统一
- **响应式** - 支持移动端和桌面端
- **可访问性** - 遵循 WCAG 2.1 标准

### 组件命名

- 使用 PascalCase：`UserProfile.tsx`
- 文件名与组件名一致
- 一个文件一个组件（除非是紧密相关的小组件）

### 样式规范

- 优先使用 Tailwind CSS 工具类
- 避免内联样式
- 使用 CSS 变量定义主题颜色
- 保持类名简洁

## 📁 项目结构

```
.
├── api/              # FastAPI 后端
├── app/              # Next.js 页面
├── components/       # React 组件
├── crew/             # CrewAI 工作流
├── lib/              # 工具函数
└── public/           # 静态资源
```

### 添加新功能的位置

- **新页面** → `app/`
- **新组件** → `components/`
- **新 API** → `api/`
- **新工作流** → 编辑 `public/workflows.json`
- **新工具函数** → `lib/`

## 🧪 测试指南

### 手动测试清单

在提交 PR 前，请测试：

- [ ] 用户端可以正常选择工作流
- [ ] 用户端可以正常生成内容
- [ ] 管理端可以正常登录
- [ ] 管理端可以编辑和保存配置
- [ ] API 接口返回正确数据
- [ ] 移动端显示正常
- [ ] 没有控制台错误

### API 测试

```bash
./test_api.sh http://localhost:3000
```

## 📝 文档

如果你的改动涉及：

- **新功能** → 更新 README.md
- **API 变更** → 更新 API 文档
- **部署流程** → 更新 DEPLOYMENT.md
- **使用方法** → 更新 QUICKSTART.md

## 🐛 调试技巧

### 前端调试

1. 使用 Chrome DevTools
2. 查看 Console 和 Network 标签
3. 使用 React DevTools

### 后端调试

1. 查看终端日志
2. 在代码中添加 `print()` 语句
3. 使用 Python 调试器

```python
import pdb; pdb.set_trace()
```

## 💬 交流

- **GitHub Issues** - 报告问题和讨论功能
- **Pull Requests** - 代码审查和讨论

## 📜 许可证

通过贡献代码，你同意你的贡献将在 MIT 许可证下发布。

## 🙏 致谢

感谢所有贡献者！你们的贡献让这个项目变得更好。

