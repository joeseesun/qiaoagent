#!/bin/bash

cd /Users/joe/Dropbox/code/claude/qiaoagent

git add -A

git commit -m "feat: 添加完整的 Docker 部署支持

- 优化 Dockerfile（多阶段构建，支持 Python 依赖）
- 添加 docker-compose.yml 配置文件
- 添加 .env.production.example 环境变量模板
- 添加 docker-deploy.sh 一键部署脚本
- 添加 docs/DOCKER_DEPLOYMENT.md 详细部署文档
- 添加 DOCKER_QUICKSTART.md 快速入门指南
- 更新 README.md，突出 Docker 部署方式
- 配置 Next.js standalone 输出模式
- 添加 Railway 和 Render 部署配置
- 删除 vercel.json（不支持 Vercel 部署）

现在支持：
- Docker 一键部署（推荐）
- Railway 平台部署
- Render 平台部署
- 本地开发环境"

git push origin main

echo "✅ 提交完成！"

