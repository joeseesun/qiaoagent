#!/bin/bash

echo "========================================="
echo "  推送 Docker 和宝塔部署文件到 GitHub"
echo "========================================="
echo ""

cd /Users/joe/Dropbox/code/claude/qiaoagent

echo "📋 检查待提交的文件..."
git add -A
git status --short

echo ""
echo "📝 提交更改..."

git commit -m "feat: 添加完整的 Docker 和宝塔部署支持

Docker 部署文件：
- Dockerfile（优化的多阶段构建）
- docker-compose.yml（Docker Compose 配置）
- .env.production.example（环境变量模板）
- docker-deploy.sh（一键部署脚本）
- DOCKER_QUICKSTART.md（Docker 快速指南）
- docs/DOCKER_DEPLOYMENT.md（Docker 完整文档）

宝塔部署文件：
- BAOTA_QUICKSTART.md（宝塔 5 分钟快速部署）
- docs/BAOTA_DEPLOYMENT.md（宝塔完整部署指南）

其他配置：
- railway.json（Railway 平台配置）
- render.yaml（Render 平台配置）
- 更新 README.md（突出 Docker 和宝塔部署）
- 更新 next.config.js（standalone 输出模式）

现在支持：
✅ Docker 一键部署（推荐）
✅ 宝塔面板 5 分钟部署（最简单）
✅ Railway 平台部署
✅ Render 平台部署
✅ 本地开发环境"

echo ""
echo "🚀 推送到 GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "  ✅ 推送成功！"
    echo "========================================="
    echo ""
    echo "查看提交："
    echo "https://github.com/joeseesun/qiaoagent/commits/main"
    echo ""
else
    echo ""
    echo "❌ 推送失败！请检查错误信息"
    exit 1
fi

