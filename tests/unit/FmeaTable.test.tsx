import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FmeaTable } from '../../components/FmeaTable';
import { FmeaType } from '../../types';

describe('FmeaTable组件测试', () => {
  const mockData = {
    title: '刹车系统FMEA',
    type: FmeaType.DFMEA,
    rows: [
      {
        id: '1',
        s2_item: '刹车系统',
        s2_step: 'B-001',
        s2_element: '主缸',
        s3_func_item: '提供制动力',
        s3_func_step: '施加踏板力',
        s3_func_element: '液压传递',
        s4_effect: '制动力不足',
        s4_severity: 8,
        s4_mode: '密封失效',
        s4_cause: '密封圈老化',
        s5_prev_control: '材料选择',
        s5_occurrence: 5,
        s5_det_control: '压力测试',
        s5_detection: 4,
        s5_ap: 'H',
        s6_prev_action: '更换密封圈材料',
        s6_det_action: '增加泄漏检测',
        s6_resp_person: '张三',
        s6_target_date: '2024-01-15',
        s6_status: '进行中',
        s6_action_taken: '新材料测试',
        s6_completion_date: '2024-01-20',
        s6_severity_new: 5,
        s6_occurrence_new: 3,
        s6_detection_new: 3,
        s6_ap_new: 'M',
        remarks: '需要进一步验证'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染FMEA表格', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText(/设计失效模式及影响分析/i)).toBeInTheDocument();
  });

  it('应该显示项目标题', () => {
    const { container } = render(<FmeaTable data={mockData} />);
    
    expect(screen.getByDisplayValue('刹车系统FMEA')).toBeInTheDocument();
    
    const cells = container.querySelectorAll('td');
    const brakeSystemCell = Array.from(cells).find(cell => cell.textContent === '刹车系统');
    const brakeForceCell = Array.from(cells).find(cell => cell.textContent === '制动力不足');
    expect(brakeSystemCell).toBeInTheDocument();
    expect(brakeForceCell).toBeInTheDocument();
  });

  it('应该显示DFMEA标题', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText(/设计失效模式及影响分析/i)).toBeInTheDocument();
  });

  it('应该显示PFMEA标题', () => {
    const pfmeaData = { ...mockData, type: FmeaType.PFMEA };
    render(<FmeaTable data={pfmeaData} />);
    
    expect(screen.getByText(/过程失效模式及影响分析/i)).toBeInTheDocument();
  });

  it('应该显示结构分析步骤', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText(/Step 2 - Structure Analysis.*结构分析/i)).toBeInTheDocument();
  });

  it('应该显示功能分析步骤', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText(/Step 3 - Functional Analysis.*功能分析/i)).toBeInTheDocument();
  });

  it('应该显示失效分析步骤', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText(/Step 4 - Failure Analysis.*失效分析/i)).toBeInTheDocument();
  });

  it('应该显示风险分析步骤', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText(/Step 5 - Risk Analysis.*风险分析/i)).toBeInTheDocument();
  });

  it('应该显示优化步骤', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText(/Step 6 - Optimization.*优化/i)).toBeInTheDocument();
  });

  it('应该显示严重度值', () => {
    const { container } = render(<FmeaTable data={mockData} />);
    
    const severityCells = container.querySelectorAll('td');
    const severityCell = Array.from(severityCells).find(cell => cell.textContent === '8');
    expect(severityCell).toBeInTheDocument();
  });

  it('应该显示发生度值', () => {
    const { container } = render(<FmeaTable data={mockData} />);
    
    const occurrenceCells = container.querySelectorAll('td');
    const occurrenceCell = Array.from(occurrenceCells).find(cell => cell.textContent === '5');
    expect(occurrenceCell).toBeInTheDocument();
  });

  it('应该显示探测度值', () => {
    const { container } = render(<FmeaTable data={mockData} />);
    
    const detectionCells = container.querySelectorAll('td');
    const detectionCell = Array.from(detectionCells).find(cell => cell.textContent === '4');
    expect(detectionCell).toBeInTheDocument();
  });

  it('应该显示AP值', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText('H')).toBeInTheDocument();
  });

  it('应该显示优化后的严重度值', () => {
    const { container } = render(<FmeaTable data={mockData} />);
    
    const severityNewCells = container.querySelectorAll('td');
    const severityNewCell = Array.from(severityNewCells).filter(cell => cell.textContent === '5');
    expect(severityNewCell.length).toBeGreaterThan(0);
  });

  it('应该显示优化后的发生度值', () => {
    const { container } = render(<FmeaTable data={mockData} />);
    
    const occurrenceNewCells = container.querySelectorAll('td');
    const occurrenceNewCell = Array.from(occurrenceNewCells).filter(cell => cell.textContent === '3');
    expect(occurrenceNewCell.length).toBeGreaterThan(0);
  });

  it('应该显示优化后的探测度值', () => {
    const { container } = render(<FmeaTable data={mockData} />);
    
    const detectionNewCells = container.querySelectorAll('td');
    const detectionNewCell = Array.from(detectionNewCells).filter(cell => cell.textContent === '3');
    expect(detectionNewCell.length).toBeGreaterThan(0);
  });

  it('应该显示优化后的AP值', () => {
    render(<FmeaTable data={mockData} />);
    
    const apValues = screen.getAllByText('M');
    expect(apValues.length).toBeGreaterThan(0);
  });

  it('应该显示责任人', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText('张三')).toBeInTheDocument();
  });

  it('应该显示状态', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText('进行中')).toBeInTheDocument();
  });

  it('应该显示目标完成日期', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('应该显示完成日期', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText('2024-01-20')).toBeInTheDocument();
  });

  it('应该显示备注', () => {
    render(<FmeaTable data={mockData} />);
    
    expect(screen.getByText('需要进一步验证')).toBeInTheDocument();
  });

  it('应该处理空数据', () => {
    const emptyData = {
      title: '空FMEA',
      type: FmeaType.DFMEA,
      rows: []
    };
    
    render(<FmeaTable data={emptyData} />);
    
    const titleInput = screen.getByDisplayValue('空FMEA');
    expect(titleInput).toBeInTheDocument();
  });

  it('应该显示导出按钮', () => {
    render(<FmeaTable data={mockData} />);
    
    const exportButton = screen.getByText('导出 Excel 报表');
    expect(exportButton).toBeInTheDocument();
  });

  it('应该能够打开导出菜单', async () => {
    const user = userEvent.setup();
    render(<FmeaTable data={mockData} />);
    
    const exportButton = screen.getByText('导出 Excel 报表');
    await user.click(exportButton);
    
    expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument();
    expect(screen.getByText('PDF / Print')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
  });

  it('应该显示打印选项', async () => {
    const user = userEvent.setup();
    render(<FmeaTable data={mockData} />);
    
    const exportButton = screen.getByText('导出 Excel 报表');
    await user.click(exportButton);
    
    expect(screen.getByText('PDF / Print')).toBeInTheDocument();
  });

  it('应该显示多行数据', () => {
    const multiRowData = {
      ...mockData,
      rows: [
        ...mockData.rows,
        {
          id: '2',
          s2_item: '转向系统',
          s2_step: 'S-001',
          s2_element: '转向机',
          s3_func_item: '提供转向力',
          s3_func_step: '转动方向盘',
          s3_func_element: '齿轮传动',
          s4_effect: '转向困难',
          s4_severity: 7,
          s4_mode: '齿轮磨损',
          s4_cause: '润滑不足',
          s5_prev_control: '定期润滑',
          s5_occurrence: 4,
          s5_det_control: '转向力测试',
          s5_detection: 3,
          s5_ap: 'M',
          s6_prev_action: '改进润滑方案',
          s6_det_action: '增加润滑检查',
          s6_resp_person: '李四',
          s6_target_date: '2024-01-20',
          s6_status: '已完成',
          s6_action_taken: '新润滑方案实施',
          s6_completion_date: '2024-01-18',
          s6_severity_new: 4,
          s6_occurrence_new: 2,
          s6_detection_new: 2,
          s6_ap_new: 'L',
          remarks: '效果良好'
        }
      ]
    };
    
    render(<FmeaTable data={multiRowData} />);
    
    expect(screen.getByText('刹车系统')).toBeInTheDocument();
    expect(screen.getByText('转向系统')).toBeInTheDocument();
  });
});