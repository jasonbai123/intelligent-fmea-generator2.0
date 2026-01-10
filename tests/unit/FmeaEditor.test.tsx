import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FmeaTable } from '../../components/FmeaTable';
import { FmeaType } from '../../types';

vi.mock('exceljs', () => ({
  default: {
    Workbook: vi.fn().mockImplementation(() => ({
      addWorksheet: vi.fn(() => ({
        columns: [],
        getRow: vi.fn(() => ({
          height: 100,
          eachCell: vi.fn(),
          values: [],
          font: {},
          alignment: {},
          border: {},
          fill: {},
          getCell: vi.fn(() => ({
            value: '',
            font: {},
            alignment: {},
            border: {},
            fill: {},
          }))
        })),
        mergeCells: vi.fn(),
        getCell: vi.fn(() => ({
          value: '',
          font: {},
          alignment: {},
          border: {},
          fill: {},
        }))
      })),
      xlsx: {
        writeBuffer: vi.fn(() => Promise.resolve(Buffer.from('mock-excel-data')))
      }
    }))
  }
}));

describe('FmeaTable组件测试', () => {
  const mockFmeaData = {
    title: '刹车系统FMEA',
    type: FmeaType.DFMEA,
    rows: [
      {
        id: 'row-1',
        s2_item: '系统',
        s2_step: '刹车系统',
        s2_element: '主缸',
        s3_func_item: '提供制动力',
        s3_func_step: '踏板操作',
        s3_func_element: '液压传递',
        s4_effect: '车辆无法停止',
        s4_severity: 10,
        s4_mode: '制动力不足',
        s4_cause: '主缸泄漏',
        s5_prev_control: '定期检查',
        s5_occurrence: 5,
        s5_det_control: '压力测试',
        s5_detection: 3,
        s5_ap: 'H',
        s6_prev_action: '更换密封件',
        s6_det_action: '增加泄漏检测',
        s6_resp_person: '张三',
        s6_target_date: '2024-02-01',
        s6_status: '进行中',
        s6_action_taken: '已更换',
        s6_completion_date: '2024-01-15',
        s6_severity_new: 5,
        s6_occurrence_new: 2,
        s6_detection_new: 2,
        s6_ap_new: 'L',
        remarks: '需要持续监控'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('应该渲染FMEA表格', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getByDisplayValue('刹车系统FMEA')).toBeInTheDocument();
  });

  it('应该显示DFMEA标题', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getByText(/Design Failure Modes and Effects Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/设计失效模式及影响分析/i)).toBeInTheDocument();
  });

  it('应该显示PFMEA标题', () => {
    const pfmeaData = { ...mockFmeaData, type: FmeaType.PFMEA };
    render(<FmeaTable data={pfmeaData} />);
    
    expect(screen.getByText(/Process Failure Modes and Effects Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/过程失效模式及影响分析/i)).toBeInTheDocument();
  });

  it('应该显示步骤1标题', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getByText(/Planning and Preparation/i)).toBeInTheDocument();
    expect(screen.getByText(/步骤1：规划和准备/i)).toBeInTheDocument();
  });

  it('应该显示步骤2标题', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getAllByText(/Structure Analysis/i)).toBeTruthy();
    expect(screen.getAllByText(/结构分析/i)).toBeTruthy();
  });

  it('应该显示步骤3标题', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getAllByText(/Function Analysis/i)).toBeTruthy();
    expect(screen.getAllByText(/功能分析/i)).toBeTruthy();
  });

  it('应该显示步骤4标题', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getAllByText(/Failure Analysis/i)).toBeTruthy();
    expect(screen.getAllByText(/失效分析/i)).toBeTruthy();
  });

  it('应该显示步骤5标题', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getAllByText(/Risk Analysis/i)).toBeTruthy();
    expect(screen.getAllByText(/风险分析/i)).toBeTruthy();
  });

  it('应该显示步骤6标题', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getAllByText(/Optimization/i)).toBeTruthy();
    expect(screen.getAllByText(/优化/i)).toBeTruthy();
  });

  it('应该显示表头信息输入框', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    const companyLabel = screen.getByText(/Company Name/i);
    expect(companyLabel).toBeInTheDocument();
    
    const subjectLabel = screen.getByText(/Subject/i);
    expect(subjectLabel).toBeInTheDocument();
    
    const customerLabel = screen.getByText(/Customer Name/i);
    expect(customerLabel).toBeInTheDocument();
  });

  it('应该能够编辑公司名称', async () => {
    const user = userEvent.setup();
    render(<FmeaTable data={mockFmeaData} />);
    
    const companyLabel = screen.getByText(/Company Name/i);
    const companyInput = companyLabel.nextElementSibling as HTMLInputElement;
    
    await user.clear(companyInput);
    await user.type(companyInput, '测试公司');
    
    expect(companyInput).toHaveValue('测试公司');
  });

  it('应该能够编辑项目名称', async () => {
    const user = userEvent.setup();
    render(<FmeaTable data={mockFmeaData} />);
    
    const subjectLabel = screen.getByText(/Subject/i);
    const subjectInput = subjectLabel.nextElementSibling as HTMLInputElement;
    
    await user.clear(subjectInput);
    await user.type(subjectInput, '新项目名称');
    
    expect(subjectInput).toHaveValue('新项目名称');
  });

  it('应该显示数据行', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getByText('系统')).toBeInTheDocument();
    expect(screen.getByText('刹车系统')).toBeInTheDocument();
    expect(screen.getByText('主缸')).toBeInTheDocument();
  });

  it('应该显示失效信息', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getByText('车辆无法停止')).toBeInTheDocument();
    expect(screen.getByText('制动力不足')).toBeInTheDocument();
    expect(screen.getByText('主缸泄漏')).toBeInTheDocument();
  });

  it('应该显示风险分析数据', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getAllByText('5')).toBeTruthy();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('应该显示优化措施', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getByText('更换密封件')).toBeInTheDocument();
    expect(screen.getByText('增加泄漏检测')).toBeInTheDocument();
    expect(screen.getByText('张三')).toBeInTheDocument();
  });

  it('应该显示导出按钮', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    const exportButton = screen.getByText(/导出 Excel 报表/i);
    expect(exportButton).toBeInTheDocument();
  });

  it('应该能够打开导出菜单', async () => {
    const user = userEvent.setup();
    render(<FmeaTable data={mockFmeaData} />);
    
    const exportButton = screen.getByText(/导出 Excel 报表/i);
    await user.click(exportButton);
    
    expect(screen.getByText(/Excel \(\.xlsx\)/i)).toBeInTheDocument();
    expect(screen.getByText(/JSON/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF \/ Print/i)).toBeInTheDocument();
  });

  it('应该能够导出为Excel', async () => {
    const user = userEvent.setup();
    render(<FmeaTable data={mockFmeaData} />);
    
    const exportButton = screen.getByText(/导出 Excel 报表/i);
    await user.click(exportButton);
    
    const excelButton = screen.getByText(/Excel \(\.xlsx\)/i);
    await user.click(excelButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('应该能够导出为JSON', async () => {
    const user = userEvent.setup();
    render(<FmeaTable data={mockFmeaData} />);
    
    const exportButton = screen.getByText(/导出 Excel 报表/i);
    await user.click(exportButton);
    
    const jsonButton = screen.getByText(/JSON/i);
    await user.click(jsonButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('应该能够打印PDF', async () => {
    const user = userEvent.setup();
    window.print = vi.fn();
    
    render(<FmeaTable data={mockFmeaData} />);
    
    const exportButton = screen.getByText(/导出 Excel 报表/i);
    await user.click(exportButton);
    
    const printButton = screen.getByText(/PDF \/ Print/i);
    await user.click(printButton);
    
    expect(window.print).toHaveBeenCalled();
  });

  it('应该显示AP徽章', () => {
    render(<FmeaTable data={mockFmeaData} />);
    
    expect(screen.getByText('H')).toBeInTheDocument();
  });

  it('应该处理空数据', () => {
    const emptyData = {
      title: '空FMEA',
      type: FmeaType.DFMEA,
      rows: []
    };
    
    render(<FmeaTable data={emptyData} />);
    
    expect(screen.getByDisplayValue('空FMEA')).toBeInTheDocument();
  });
});
