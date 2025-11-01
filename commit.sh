#!/bin/bash

cd /Users/joe/Dropbox/code/claude/qiaoagent

git add -A
git commit -m "docs: 更新部署说明，添加 Railway/Render/Docker 支持

- 移除 Vercel 一键部署按钮（不支持 Python 子进程）
- 添加 Railway 部署配置（railway.json）
- 添加 Render 部署配置（render.yaml）
- 添加 Dockerfile 和 .dockerignore
- 更新 README 部署指南，包含 4 种部署方式
- 配置 Next.js standalone 输出模式
- 删除 vercel.json 配置文件"

git push origin main

echo "✅ 提交完成！"

