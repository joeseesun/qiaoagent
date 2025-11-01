@echo off
REM AI Creative Workflow - Windows 部署脚本
REM 用于快速部署到 Vercel

echo ========================================
echo 🚀 AI Creative Workflow 部署脚本
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未安装 Node.js
    pause
    exit /b 1
)

REM 检查 npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未安装 npm
    pause
    exit /b 1
)

REM 检查 Git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未安装 Git
    pause
    exit /b 1
)

echo ✅ 所有依赖已安装
echo.

REM 检查 .env 文件
if not exist .env (
    echo ⚠️  警告: 未找到 .env 文件
    echo 请从 .env.example 创建 .env 文件并配置环境变量
    set /p continue="是否继续? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
)

echo.
echo 📋 主菜单
echo 1) 完整部署流程 (检查 + Git + GitHub + Vercel)
echo 2) 仅检查 (不部署)
echo 3) 仅推送到 GitHub
echo 4) 仅部署到 Vercel
echo 5) 退出
echo.

set /p choice="请选择 (1-5): "

if "%choice%"=="1" goto full_deploy
if "%choice%"=="2" goto check_only
if "%choice%"=="3" goto github_only
if "%choice%"=="4" goto vercel_only
if "%choice%"=="5" goto end
goto invalid_choice

:full_deploy
echo.
echo 📦 检查 Git 状态...
if not exist .git (
    echo ⚠️  未初始化 Git 仓库
    set /p init_git="是否初始化 Git 仓库? (y/n): "
    if /i "%init_git%"=="y" (
        git init
        echo ✅ Git 仓库已初始化
    )
)

echo.
echo 📤 推送到 GitHub...
git remote | findstr origin >nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  未配置远程仓库
    set /p repo_url="请输入 GitHub 仓库 URL: "
    git remote add origin %repo_url%
    echo ✅ 远程仓库已添加
)

echo.
set /p commit_msg="请输入提交信息: "
git add .
git commit -m "%commit_msg%"
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    git push -u origin master
)
echo ✅ 代码已推送到 GitHub

echo.
echo 🚀 部署到 Vercel...
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  未安装 Vercel CLI
    set /p install_vercel="是否安装 Vercel CLI? (y/n): "
    if /i "%install_vercel%"=="y" (
        npm i -g vercel
        echo ✅ Vercel CLI 已安装
    ) else (
        echo 请手动安装: npm i -g vercel
        pause
        exit /b 1
    )
)

echo 请登录 Vercel...
vercel login

echo 正在部署...
vercel --prod

echo.
echo ✅ 部署完成!
echo.
echo ⚠️  重要提示:
echo 1. 请在 Vercel Dashboard 中配置环境变量
echo 2. 必需的环境变量:
echo    - OPENAI_API_BASE
echo    - OPENAI_API_KEY
echo    - OPENAI_MODEL_NAME
echo    - ADMIN_PASSWORD
echo 3. 配置完成后，重新部署以应用环境变量
goto end

:check_only
echo.
echo 🔍 执行检查...
if exist .env (
    echo ✅ 找到 .env 文件
) else (
    echo ⚠️  未找到 .env 文件
)

if exist .git (
    echo ✅ Git 仓库已存在
) else (
    echo ⚠️  未初始化 Git 仓库
)

echo ✅ 检查完成
goto end

:github_only
echo.
echo 📤 推送到 GitHub...
git remote | findstr origin >nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  未配置远程仓库
    set /p repo_url="请输入 GitHub 仓库 URL: "
    git remote add origin %repo_url%
    echo ✅ 远程仓库已添加
)

set /p commit_msg="请输入提交信息: "
git add .
git commit -m "%commit_msg%"
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    git push -u origin master
)
echo ✅ 代码已推送到 GitHub
goto end

:vercel_only
echo.
echo 🚀 部署到 Vercel...
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  未安装 Vercel CLI
    set /p install_vercel="是否安装 Vercel CLI? (y/n): "
    if /i "%install_vercel%"=="y" (
        npm i -g vercel
        echo ✅ Vercel CLI 已安装
    ) else (
        echo 请手动安装: npm i -g vercel
        pause
        exit /b 1
    )
)

echo 请登录 Vercel...
vercel login

echo 正在部署...
vercel --prod

echo.
echo ✅ 部署完成!
echo.
echo ⚠️  重要提示:
echo 1. 请在 Vercel Dashboard 中配置环境变量
echo 2. 必需的环境变量:
echo    - OPENAI_API_BASE
echo    - OPENAI_API_KEY
echo    - OPENAI_MODEL_NAME
echo    - ADMIN_PASSWORD
echo 3. 配置完成后，重新部署以应用环境变量
goto end

:invalid_choice
echo ❌ 无效选择
pause
exit /b 1

:end
echo.
echo 🎉 完成!
pause

