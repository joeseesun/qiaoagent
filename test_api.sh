#!/bin/bash

# API 测试脚本
# 用法: ./test_api.sh [BASE_URL]
# 示例: ./test_api.sh http://localhost:3000

BASE_URL=${1:-http://localhost:3000}

echo "🧪 测试 API 接口"
echo "基础 URL: $BASE_URL"
echo ""

# 测试 1: 获取工作流列表
echo "📋 测试 1: 获取工作流列表"
echo "GET $BASE_URL/api/workflows"
curl -s "$BASE_URL/api/workflows" | python3 -m json.tool
echo ""
echo ""

# 测试 2: 管理员认证（正确密码）
echo "🔐 测试 2: 管理员认证（正确密码）"
echo "POST $BASE_URL/api/auth"
curl -s -X POST "$BASE_URL/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"password":"ai_admin_2025"}' | python3 -m json.tool
echo ""
echo ""

# 测试 3: 管理员认证（错误密码）
echo "❌ 测试 3: 管理员认证（错误密码）"
echo "POST $BASE_URL/api/auth"
curl -s -X POST "$BASE_URL/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong_password"}' | python3 -m json.tool
echo ""
echo ""

# 测试 4: 获取配置
echo "⚙️ 测试 4: 获取配置"
echo "GET $BASE_URL/api/config"
curl -s "$BASE_URL/api/config" | python3 -m json.tool
echo ""
echo ""

# 测试 5: 运行工作流（需要较长时间）
echo "🚀 测试 5: 运行工作流"
echo "POST $BASE_URL/api/run_crew"
echo "⚠️  这可能需要 30-60 秒..."
curl -s -X POST "$BASE_URL/api/run_crew" \
  -H "Content-Type: application/json" \
  -d '{"topic":"人工智能的未来","workflow_id":"tech_writer"}' | python3 -m json.tool
echo ""
echo ""

echo "✅ 测试完成"

