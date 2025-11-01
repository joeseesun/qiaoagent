#!/bin/bash

# QiaoAgent Docker 一键部署脚本
# 使用方法：chmod +x docker-deploy.sh && ./docker-deploy.sh

set -e

echo "========================================="
echo "  QiaoAgent Docker 部署脚本"
echo "========================================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误：未检测到 Docker，请先安装 Docker"
    echo "安装指南：https://docs.docker.com/engine/install/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误：未检测到 Docker Compose，请先安装"
    echo "安装指南：https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker 版本：$(docker --version)"
echo "✅ Docker Compose 版本：$(docker-compose --version)"
echo ""

# 检查环境变量文件
if [ ! -f .env.production ]; then
    echo "⚠️  未找到 .env.production 文件"
    echo "正在从模板创建..."
    
    if [ -f .env.production.example ]; then
        cp .env.production.example .env.production
        echo "✅ 已创建 .env.production 文件"
        echo ""
        echo "⚠️  请编辑 .env.production 文件，填入你的配置："
        echo "   - ADMIN_PASSWORD（管理员密码）"
        echo "   - OPENAI_API_KEY（至少一个 LLM API Key）"
        echo ""
        echo "编辑命令："
        echo "   vim .env.production"
        echo "   或"
        echo "   nano .env.production"
        echo ""
        read -p "按回车键继续，或按 Ctrl+C 退出去编辑配置文件..."
    else
        echo "❌ 错误：未找到 .env.production.example 模板文件"
        exit 1
    fi
fi

# 检查必需的环境变量
echo "🔍 检查环境变量配置..."
source .env.production

if [ -z "$ADMIN_PASSWORD" ]; then
    echo "❌ 错误：ADMIN_PASSWORD 未设置"
    echo "请编辑 .env.production 文件并设置管理员密码"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  警告：OPENAI_API_KEY 未设置"
    echo "请确保至少配置了一个 LLM 提供商的 API Key"
fi

echo "✅ 环境变量配置检查通过"
echo ""

# 询问是否重新构建
echo "📦 准备构建 Docker 镜像..."
read -p "是否重新构建镜像？(y/n，默认 y): " rebuild
rebuild=${rebuild:-y}

if [ "$rebuild" = "y" ] || [ "$rebuild" = "Y" ]; then
    echo "🔨 正在构建 Docker 镜像（这可能需要几分钟）..."
    docker-compose --env-file .env.production build --no-cache
    echo "✅ 镜像构建完成"
else
    echo "⏭️  跳过构建，使用现有镜像"
fi

echo ""

# 停止旧容器
if [ "$(docker ps -q -f name=qiaoagent)" ]; then
    echo "🛑 停止旧容器..."
    docker-compose --env-file .env.production down
    echo "✅ 旧容器已停止"
fi

echo ""

# 启动服务
echo "🚀 启动服务..."
docker-compose --env-file .env.production up -d

echo ""
echo "⏳ 等待服务启动（30秒）..."
sleep 30

# 检查服务状态
if [ "$(docker ps -q -f name=qiaoagent -f status=running)" ]; then
    echo ""
    echo "========================================="
    echo "  ✅ 部署成功！"
    echo "========================================="
    echo ""
    echo "📍 访问地址："
    echo "   http://localhost:3355"
    echo "   http://$(hostname -I | awk '{print $1}'):3355"
    echo ""
    echo "🔐 管理后台："
    echo "   http://localhost:3355/admin"
    echo ""
    echo "📊 查看日志："
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 停止服务："
    echo "   docker-compose down"
    echo ""
    echo "🔄 重启服务："
    echo "   docker-compose restart"
    echo ""
    echo "========================================="
else
    echo ""
    echo "❌ 部署失败！容器未正常启动"
    echo ""
    echo "查看错误日志："
    echo "   docker-compose logs"
    echo ""
    exit 1
fi

