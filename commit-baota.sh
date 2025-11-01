#!/bin/bash

cd /Users/joe/Dropbox/code/claude/qiaoagent

git add -A

git commit -m "docs: 添加宝塔面板部署指南

- 添加 docs/BAOTA_DEPLOYMENT.md（宝塔完整部署指南）
- 添加 BAOTA_QUICKSTART.md（5 分钟快速部署）
- 更新 README.md，突出宝塔部署方式
- 提供图文并茂的宝塔操作步骤
- 包含域名配置、SSL 证书、反向代理等高级功能
- 添加常见问题解答和性能优化建议

宝塔用户现在可以：
- 5 分钟完成部署
- 使用可视化界面管理容器
- 轻松配置域名和 HTTPS
- 通过面板查看日志和状态"

git push origin main

echo "✅ 提交完成！"

