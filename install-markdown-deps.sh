#!/bin/bash

# 安装 Markdown 渲染依赖
# Install Markdown rendering dependencies

echo "📦 安装 Markdown 渲染依赖..."
echo "Installing Markdown rendering dependencies..."
echo ""

# 尝试使用 npm 安装
echo "尝试使用 npm 安装..."
npm install react-markdown@9.0.1 remark-gfm@4.0.0 rehype-highlight@7.0.0 highlight.js@11.9.0

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 依赖安装成功！"
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "现在需要启用 Markdown 渲染功能："
    echo "Now you need to enable Markdown rendering:"
    echo ""
    echo "1. 编辑 app/page.tsx"
    echo "   Edit app/page.tsx"
    echo ""
    echo "2. 取消注释第 12 行："
    echo "   Uncomment line 12:"
    echo "   // import { MarkdownRenderer } from '@/components/markdown-renderer'"
    echo "   改为："
    echo "   Change to:"
    echo "   import { MarkdownRenderer } from '@/components/markdown-renderer'"
    echo ""
    echo "3. 替换第 387-391 行的 <pre> 标签为："
    echo "   Replace lines 387-391 <pre> tag with:"
    echo "   <MarkdownRenderer content={result.article} />"
    echo ""
    echo "4. 重启开发服务器"
    echo "   Restart the development server"
    echo ""
else
    echo ""
    echo "❌ 安装失败！"
    echo "❌ Installation failed!"
    echo ""
    echo "请尝试以下方法："
    echo "Please try the following:"
    echo ""
    echo "1. 删除 node_modules 和 package-lock.json："
    echo "   Delete node_modules and package-lock.json:"
    echo "   rm -rf node_modules package-lock.json"
    echo ""
    echo "2. 重新安装所有依赖："
    echo "   Reinstall all dependencies:"
    echo "   npm install"
    echo ""
    echo "3. 再次运行此脚本："
    echo "   Run this script again:"
    echo "   ./install-markdown-deps.sh"
    echo ""
fi

