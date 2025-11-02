#!/bin/bash

# 环境变量检查脚本
# 用于在启动前检查必需的环境变量

set -e

echo "🔍 环境变量检查"
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

# 加载环境变量
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    check_pass "已加载 .env 文件"
elif [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    check_pass "已加载 .env.production 文件"
else
    check_fail "未找到 .env 或 .env.production 文件"
fi

echo ""
echo "1️⃣  检查必需的环境变量..."

# 检查 ADMIN_PASSWORD
if [ -z "$ADMIN_PASSWORD" ]; then
    check_fail "ADMIN_PASSWORD 未设置"
else
    if [ "$ADMIN_PASSWORD" = "qiaomu" ] || [ "$ADMIN_PASSWORD" = "ai_admin_2025" ]; then
        check_warn "ADMIN_PASSWORD 使用默认值，建议修改为强密码"
    else
        check_pass "ADMIN_PASSWORD 已设置"
    fi
fi

# 检查 OPENAI_API_KEY
if [ -z "$OPENAI_API_KEY" ]; then
    check_fail "OPENAI_API_KEY 未设置"
else
    check_pass "OPENAI_API_KEY 已设置"
fi

echo ""
echo "2️⃣  检查可选的 LLM 提供商 API Keys..."

# 检查可选的 API keys
optional_keys=(
    "TUZI_API_KEY"
    "KIMI_API_KEY"
    "DEEPSEEK_API_KEY"
    "ZHIPU_API_KEY"
    "GEMINI_API_KEY"
)

for key in "${optional_keys[@]}"; do
    if [ -z "${!key}" ]; then
        echo "  ⚪ $key 未设置（可选）"
    else
        check_pass "$key 已设置"
    fi
done

echo ""
echo "================================"
echo "📊 检查结果汇总"
echo "================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 完美！所有检查都通过了！${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  有 $WARNINGS 个警告${NC}"
    echo ""
    echo "建议检查警告项，但可以继续运行。"
    exit 0
else
    echo -e "${RED}❌ 发现 $ERRORS 个错误和 $WARNINGS 个警告${NC}"
    echo ""
    echo "请修复所有错误后再启动应用！"
    exit 1
fi

