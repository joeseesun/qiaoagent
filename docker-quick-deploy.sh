#!/bin/bash

# 快速部署脚本 - 不重新构建镜像，只重启容器
# 适用于代码小改动的快速测试

set -e

echo "🚀 QiaoAgent 快速部署脚本"
echo "================================"
echo ""
echo "⚠️  注意：此脚本不会重新构建镜像"
echo "   只适用于代码小改动的快速测试"
echo "   如果修改了依赖（package.json 或 requirements.txt），请使用 ./docker-deploy.sh"
echo ""

# 检查环境变量文件
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    if [ -f ".env.production" ]; then
        ENV_FILE=".env.production"
    else
        echo "❌ 未找到环境配置文件"
        exit 1
    fi
fi

echo "📝 使用环境配置: $ENV_FILE"
echo ""

# 重启容器
echo "🔄 重启容器..."
docker-compose --env-file $ENV_FILE restart

echo ""
echo "✅ 快速部署完成！"
echo ""
echo "📍 访问地址："
echo "   http://localhost:3355"
echo "   http://$(hostname -I | awk '{print $1}'):3355"
echo ""
echo "📊 查看日志："
echo "   docker-compose logs -f"
echo ""

