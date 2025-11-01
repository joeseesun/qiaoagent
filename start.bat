@echo off
REM AI 创作工作流助手 - Windows 启动脚本

echo 🚀 AI 创作工作流助手
echo ====================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js ^(^>= 18.0.0^)
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
node --version

REM 检查 Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Python，请先安装 Python ^(^>= 3.8^)
    pause
    exit /b 1
)

echo ✅ Python 已安装
python --version
echo.

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 📦 检测到未安装 Node.js 依赖，开始安装...
    call npm install
    echo.
)

REM 检查环境变量文件
if not exist ".env" (
    echo ⚠️  未检测到 .env 文件，从 .env.example 复制...
    copy .env.example .env
    echo ✅ 已创建 .env 文件
    echo.
)

echo 🎉 准备就绪！
echo.
echo 📝 访问地址：
echo    - 用户端: http://localhost:3000
echo    - 管理端: http://localhost:3000/admin
echo.
echo 🔑 默认管理员密码: ai_admin_2025
echo ⚠️  请在生产环境中修改密码！
echo.
echo 🚀 启动开发服务器...
echo.

REM 启动 Next.js 开发服务器
call npm run dev

