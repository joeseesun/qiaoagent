#!/bin/bash

# AI 创作工作流助手 - 启动脚本

echo "🚀 AI 创作工作流助手"
echo "===================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js (>= 18.0.0)"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未检测到 Python，请先安装 Python (>= 3.8)"
    exit 1
fi

echo "✅ Python 版本: $(python3 --version)"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 检测到未安装 Node.js 依赖，开始安装..."
    npm install
    echo ""
fi

# 检查 Python 依赖
if ! python3 -c "import crewai" &> /dev/null; then
    echo "📦 检测到未安装 Python 依赖，开始安装..."
    pip install -r requirements.txt
    echo ""
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  未检测到 .env 文件，从 .env.example 复制..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件"
    echo ""
fi

echo "🎉 准备就绪！"
echo ""
echo "📝 访问地址："
echo "   - 用户端: http://localhost:3000"
echo "   - 管理端: http://localhost:3000/admin"
echo ""
echo "🔑 默认管理员密码: ai_admin_2025"
echo "⚠️  请在生产环境中修改密码！"
echo ""
echo "🚀 启动开发服务器..."
echo ""

# 启动 Next.js 开发服务器
npm run dev

