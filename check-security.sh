#!/bin/bash

# 安全检查脚本
# 用于在推送代码前检查是否有敏感信息泄露

set -e

echo "🔒 安全检查脚本"
echo "================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
ERRORS=0
WARNINGS=0

# 检查函数
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

echo "1️⃣  检查 .env 文件..."
if [ -f .env ]; then
    check_warn ".env 文件存在（这是正常的，但确保它在 .gitignore 中）"
else
    check_warn ".env 文件不存在（部署前需要创建）"
fi

echo ""
echo "2️⃣  检查 .gitignore..."
if grep -q "^\.env$" .gitignore; then
    check_pass ".env 在 .gitignore 中"
else
    check_fail ".env 不在 .gitignore 中！"
fi

echo ""
echo "3️⃣  检查 Git 状态..."
if [ -d .git ]; then
    if git ls-files --error-unmatch .env 2>/dev/null; then
        check_fail ".env 文件在 Git 仓库中！请立即移除！"
    else
        check_pass ".env 文件不在 Git 仓库中"
    fi
else
    check_warn "未初始化 Git 仓库"
fi

echo ""
echo "4️⃣  检查配置文件中的 API keys..."

# 检查 config/llm-providers.json
if [ -f config/llm-providers.json ]; then
    if grep -q "sk-[A-Za-z0-9]\{40,\}" config/llm-providers.json; then
        check_fail "config/llm-providers.json 包含真实的 API keys！"
    else
        check_pass "config/llm-providers.json 不包含真实的 API keys"
    fi
else
    check_warn "config/llm-providers.json 不存在"
fi

echo ""
echo "5️⃣  检查 .env.example..."
if [ -f .env.example ]; then
    if grep -q "sk-[A-Za-z0-9]\{40,\}" .env.example; then
        check_fail ".env.example 包含真实的 API keys！"
    else
        check_pass ".env.example 不包含真实的 API keys"
    fi
    
    if grep -q "your-.*-key\|your-.*-password" .env.example; then
        check_pass ".env.example 使用了占位符"
    else
        check_warn ".env.example 可能没有使用正确的占位符"
    fi
else
    check_fail ".env.example 不存在！"
fi

echo ""
echo "6️⃣  检查其他文件中的敏感信息..."

# 检查所有 Python 文件
if grep -r "sk-[A-Za-z0-9]\{40,\}" --include="*.py" . 2>/dev/null | grep -v "node_modules" | grep -v ".venv" | grep -v "__pycache__"; then
    check_fail "Python 文件中发现可能的 API keys！"
else
    check_pass "Python 文件中未发现 API keys"
fi

# 检查所有 TypeScript/JavaScript 文件
if grep -r "sk-[A-Za-z0-9]\{40,\}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v "node_modules"; then
    check_fail "TypeScript/JavaScript 文件中发现可能的 API keys！"
else
    check_pass "TypeScript/JavaScript 文件中未发现 API keys"
fi

# 检查 Markdown 文件
if grep -r "sk-[A-Za-z0-9]\{40,\}" --include="*.md" . 2>/dev/null | grep -v "node_modules" | grep -v "示例" | grep -v "example"; then
    check_warn "Markdown 文件中发现可能的 API keys（可能是文档示例）"
fi

echo ""
echo "7️⃣  检查必需文件..."

required_files=(
    "README.md"
    "README_DEPLOYMENT.md"
    "SECURITY.md"
    "QUICKSTART_DEPLOY.md"
    ".env.example"
    ".gitignore"
    "vercel.json"
    "deploy.sh"
    "deploy.bat"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file 存在"
    else
        check_warn "$file 不存在"
    fi
done

echo ""
echo "8️⃣  检查部署脚本权限..."
if [ -x deploy.sh ]; then
    check_pass "deploy.sh 有执行权限"
else
    check_warn "deploy.sh 没有执行权限（运行: chmod +x deploy.sh）"
fi

echo ""
echo "================================"
echo "📊 检查结果汇总"
echo "================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 完美！所有检查都通过了！${NC}"
    echo ""
    echo "你可以安全地推送代码到 GitHub 和部署到 Vercel。"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  有 $WARNINGS 个警告${NC}"
    echo ""
    echo "建议检查警告项，但可以继续部署。"
    exit 0
else
    echo -e "${RED}❌ 发现 $ERRORS 个错误和 $WARNINGS 个警告${NC}"
    echo ""
    echo "请修复所有错误后再推送代码！"
    exit 1
fi

