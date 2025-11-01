#!/bin/bash

# AI Creative Workflow - 部署脚本
# 用于快速部署到 Vercel

set -e

echo "🚀 AI Creative Workflow 部署脚本"
echo "================================"
echo ""

# 检查是否安装了必要的工具
check_dependencies() {
    echo "📋 检查依赖..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ 错误: 未安装 Git"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ 错误: 未安装 Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ 错误: 未安装 npm"
        exit 1
    fi
    
    echo "✅ 所有依赖已安装"
    echo ""
}

# 检查环境变量
check_env() {
    echo "🔍 检查环境变量..."
    
    if [ ! -f .env ]; then
        echo "⚠️  警告: 未找到 .env 文件"
        echo "请从 .env.example 创建 .env 文件并配置环境变量"
        read -p "是否继续? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "✅ 找到 .env 文件"
    fi
    echo ""
}

# 检查敏感信息
check_secrets() {
    echo "🔒 检查敏感信息..."
    
    # 检查 config/llm-providers.json 是否包含真实的 API keys
    if grep -q "sk-[A-Za-z0-9]\{40,\}" config/llm-providers.json 2>/dev/null; then
        echo "❌ 错误: config/llm-providers.json 包含真实的 API keys!"
        echo "请将真实的 API keys 移到环境变量中"
        exit 1
    fi
    
    # 检查 .env.example 是否包含真实的 API keys
    if grep -q "sk-[A-Za-z0-9]\{40,\}" .env.example 2>/dev/null; then
        echo "⚠️  警告: .env.example 可能包含真实的 API keys"
        read -p "是否继续? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    echo "✅ 未发现明显的敏感信息泄露"
    echo ""
}

# Git 检查
check_git() {
    echo "📦 检查 Git 状态..."
    
    if [ ! -d .git ]; then
        echo "⚠️  未初始化 Git 仓库"
        read -p "是否初始化 Git 仓库? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git init
            echo "✅ Git 仓库已初始化"
        fi
    else
        echo "✅ Git 仓库已存在"
    fi
    
    # 检查是否有未提交的更改
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        echo "⚠️  有未提交的更改"
        git status --short
        echo ""
        read -p "是否提交这些更改? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "请输入提交信息: " commit_msg
            git add .
            git commit -m "$commit_msg"
            echo "✅ 更改已提交"
        fi
    fi
    echo ""
}

# 推送到 GitHub
push_to_github() {
    echo "📤 推送到 GitHub..."
    
    # 检查是否有远程仓库
    if ! git remote | grep -q origin; then
        echo "⚠️  未配置远程仓库"
        read -p "请输入 GitHub 仓库 URL: " repo_url
        git remote add origin "$repo_url"
        echo "✅ 远程仓库已添加"
    fi
    
    # 推送
    echo "正在推送到 GitHub..."
    git push -u origin main || git push -u origin master
    echo "✅ 代码已推送到 GitHub"
    echo ""
}

# 部署到 Vercel
deploy_to_vercel() {
    echo "🚀 部署到 Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo "⚠️  未安装 Vercel CLI"
        read -p "是否安装 Vercel CLI? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm i -g vercel
            echo "✅ Vercel CLI 已安装"
        else
            echo "请手动安装: npm i -g vercel"
            exit 1
        fi
    fi
    
    # 登录 Vercel
    echo "请登录 Vercel..."
    vercel login
    
    # 部署
    echo "正在部署..."
    vercel --prod
    
    echo ""
    echo "✅ 部署完成!"
    echo ""
    echo "⚠️  重要提示:"
    echo "1. 请在 Vercel Dashboard 中配置环境变量"
    echo "2. 必需的环境变量:"
    echo "   - OPENAI_API_BASE"
    echo "   - OPENAI_API_KEY"
    echo "   - OPENAI_MODEL_NAME"
    echo "   - ADMIN_PASSWORD"
    echo "3. 配置完成后，重新部署以应用环境变量"
    echo ""
}

# 主菜单
main_menu() {
    echo "请选择操作:"
    echo "1) 完整部署流程 (检查 + Git + GitHub + Vercel)"
    echo "2) 仅检查 (不部署)"
    echo "3) 仅推送到 GitHub"
    echo "4) 仅部署到 Vercel"
    echo "5) 退出"
    echo ""
    read -p "请选择 (1-5): " choice
    
    case $choice in
        1)
            check_dependencies
            check_env
            check_secrets
            check_git
            push_to_github
            deploy_to_vercel
            ;;
        2)
            check_dependencies
            check_env
            check_secrets
            check_git
            echo "✅ 检查完成"
            ;;
        3)
            check_dependencies
            check_git
            push_to_github
            ;;
        4)
            check_dependencies
            deploy_to_vercel
            ;;
        5)
            echo "👋 再见!"
            exit 0
            ;;
        *)
            echo "❌ 无效选择"
            exit 1
            ;;
    esac
}

# 运行主菜单
main_menu

echo ""
echo "🎉 完成!"

