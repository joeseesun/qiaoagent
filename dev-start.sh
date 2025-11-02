#!/bin/bash

# 本地开发启动脚本
# 直接在本地运行，无需 Docker，适合快速开发调试

set -e

echo "🚀 QiaoAgent 本地开发环境启动"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 Python3，请先安装 Python 3.9+"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo "⚠️  未找到 .env 或 .env.local 文件"
    if [ -f ".env.production.example" ]; then
        echo "📝 正在创建 .env.local..."
        cp .env.production.example .env.local
        echo "✅ 已创建 .env.local，请编辑填入配置"
        echo ""
        read -p "按回车继续..."
    fi
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装 Node.js 依赖..."
    npm install
fi

# 检查 Python 依赖
if ! python3 -c "import crewai" 2>/dev/null; then
    echo "📦 安装 Python 依赖..."
    pip3 install -r requirements.txt
fi

echo ""
echo "✅ 环境检查完成"
echo ""
echo "🚀 启动开发服务器..."
echo ""

# 启动 Next.js 开发服务器
npm run dev

