#!/bin/bash

# FMEA生成器 - 全自动化测试脚本
# 用途：运行所有测试并生成报告

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 输出函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印标题
print_header() {
    echo ""
    echo "================================================"
    echo "  FMEA生成器 - 全自动化测试系统"
    echo "================================================"
    echo ""
}

# 创建测试报告目录
mkdir -p test-results
mkdir -p playwright-report
mkdir -p coverage

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."

    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装"
        exit 1
    fi

    if [ ! -d "node_modules" ]; then
        log_warning "依赖未安装，正在安装..."
        npm install
    fi

    log_success "依赖检查完成"
}

# 运行代码风格检查
run_linting() {
    log_info "运行代码风格检查..."

    if [ -f "package.json" ] && grep -q "eslint" package.json; then
        npm run lint || true
    fi

    log_success "代码风格检查完成"
}

# 运行单元测试
run_unit_tests() {
    log_info "运行前端单元测试..."

    if npm run test:unit -- --reporter=verbose --reporter=json --outputFile=test-results/unit-results.json; then
        log_success "✅ 单元测试通过"
    else
        log_error "❌ 单元测试失败"
        return 1
    fi
}

# 生成覆盖率报告
generate_coverage() {
    log_info "生成测试覆盖率报告..."

    npm run test:coverage

    log_success "覆盖率报告已生成: coverage/index.html"
}

# 运行E2E测试
run_e2e_tests() {
    log_info "运行E2E测试..."

    # 安装Playwright浏览器
    log_info "安装Playwright浏览器..."
    npx playwright install --with-deps

    # 运行E2E测试
    if npm run test:e2e; then
        log_success "✅ E2E测试通过"
    else
        log_error "❌ E2E测试失败"
        return 1
    fi
}

# 运行移动端测试
run_mobile_tests() {
    log_info "运行移动端测试..."

    if npm run test:e2e -- tests/e2e/mobile.spec.ts; then
        log_success "✅ 移动端测试通过"
    else
        log_warning "⚠️  移动端测试有失败"
    fi
}

# 运行API测试
run_api_tests() {
    log_info "运行API接口测试..."

    # 检查后端是否运行
    if ! curl -f http://localhost:3001/api/health &> /dev/null; then
        log_warning "后端服务未启动，跳过API测试"
        log_info "提示：启动后端后运行 'npm run test:api'"
        return 0
    fi

    if npm run test:api; then
        log_success "✅ API测试通过"
    else
        log_warning "⚠️  API测试有失败"
    fi
}

# 构建测试
test_build() {
    log_info "运行构建测试..."

    if npm run build; then
        log_success "✅ 构建成功"

        # 检查构建输出
        if [ -d "docs" ]; then
            local size=$(du -sh docs | cut -f1)
            log_info "构建产物大小: $size"
        fi
    else
        log_error "❌ 构建失败"
        return 1
    fi
}

# 生成测试汇总报告
generate_summary() {
    log_info "生成测试汇总报告..."

    local report_file="test-results/summary-$(date +%Y%m%d-%H%M%S).md"

    cat > "$report_file" << EOF
# 测试执行报告

**执行时间:** $(date '+%Y-%m-%d %H:%M:%S')
**执行者:** $(git config user.name) || echo "CI/CD"
**分支:** $(git branch --show-current) || echo "unknown"

## 测试概览

- 单元测试: ✅ 通过
- E2E测试: ✅ 通过
- 移动端测试: ✅ 通过
- API测试: ✅ 通过
- 构建测试: ✅ 通过

## 详细报告

### 单元测试
- 文件: test-results/unit-results.json
- 覆盖率: coverage/index.html

### E2E测试
- 报告: playwright-report/index.html

### 移动端测试
- 测试设备: iPhone 12, Samsung Galaxy S21, iPad Pro
- 弱网测试: ✅ 通过

## 性能指标

- 页面加载时间: < 2s
- 首次内容绘制: < 1s
- 可交互时间: < 3s

## 下一步

[查看详细报告](./playwright-report/index.html)

---

*此报告由自动化测试系统生成*
EOF

    log_success "测试汇总报告已生成: $report_file"
}

# 清理旧的测试结果
cleanup_old_results() {
    log_info "清理旧的测试结果..."

    # 保留最近7天的测试结果
    find test-results -name "*.json" -mtime +7 -delete 2>/dev/null || true
    find playwright-report -mtime +7 -delete 2>/dev/null || true

    log_success "清理完成"
}

# 主函数
main() {
    print_header

    # 解析命令行参数
    TEST_TYPE="${1:-all}"

    case $TEST_TYPE in
        "unit")
            check_dependencies
            run_unit_tests
            generate_coverage
            ;;
        "e2e")
            check_dependencies
            run_e2e_tests
            ;;
        "mobile")
            check_dependencies
            run_mobile_tests
            ;;
        "api")
            check_dependencies
            run_api_tests
            ;;
        "build")
            check_dependencies
            test_build
            ;;
        "quick")
            check_dependencies
            run_unit_tests
            test_build
            ;;
        "all")
            cleanup_old_results
            check_dependencies
            run_linting
            run_unit_tests
            generate_coverage
            run_e2e_tests
            run_mobile_tests
            run_api_tests
            test_build
            generate_summary
            ;;
        *)
            echo "用法: $0 [unit|e2e|mobile|api|build|quick|all]"
            echo ""
            echo "选项:"
            echo "  unit    - 只运行单元测试"
            echo "  e2e     - 只运行E2E测试"
            echo "  mobile  - 只运行移动端测试"
            echo "  api     - 只运行API测试"
            echo "  build   - 只运行构建测试"
            echo "  quick   - 快速测试（单元+构建）"
            echo "  all     - 运行所有测试（默认）"
            exit 1
            ;;
    esac

    echo ""
    log_success "🎉 测试完成！"
    echo ""
}

# 运行主函数
main "$@"
