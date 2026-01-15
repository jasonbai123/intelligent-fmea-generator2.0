import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { FmeaAnalysisResult, FmeaType } from '../types';
import { Download, AlertTriangle, CheckCircle, AlertOctagon, FileSpreadsheet, FileText, FileCode, Printer, ChevronDown, Edit3 } from 'lucide-react';

interface FmeaTableProps {
  data: FmeaAnalysisResult;
}

const ApBadge: React.FC<{ value: string | undefined }> = ({ value }) => {
  if (!value) return null;
  
  let colorClass = "bg-green-100 text-green-800 border-green-200";
  let Icon = CheckCircle;
  const ap = String(value).toUpperCase();

  if (ap.includes('H')) {
    colorClass = "bg-red-100 text-red-800 border-red-200";
    Icon = AlertOctagon;
  } else if (ap.includes('M')) {
    colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
    Icon = AlertTriangle;
  }

  return (
    <div className={`flex items-center justify-center gap-1 px-1 py-0.5 rounded border text-[10px] font-bold w-full mx-auto ${colorClass}`}>
      <Icon size={10} />
      {ap.charAt(0)}
    </div>
  );
};

// Keys that are part of the standard template
const STANDARD_KEYS = new Set([
  'id', 's2_item', 's2_step', 's2_element',
  's3_func_item', 's3_func_step', 's3_func_element',
  's4_effect', 's4_severity', 's4_mode', 's4_cause',
  's5_prev_control', 's5_occurrence', 's5_det_control', 's5_detection', 's5_ap',
  's6_prev_action', 's6_det_action', 's6_resp_person', 's6_target_date',
  's6_status', 's6_action_taken', 's6_completion_date',
  's6_severity_new', 's6_occurrence_new', 's6_detection_new', 's6_ap_new',
  'remarks'
]);

export const FmeaTable: React.FC<FmeaTableProps> = ({ data }) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const isDfmea = data.type === FmeaType.DFMEA;
  const typeLabel = isDfmea ? 'DFMEA' : 'PFMEA';

  // Header Info State (Step 1)
  const [headerInfo, setHeaderInfo] = useState({
    companyName: '',
    location: '',
    customerName: '',
    modelYear: '',
    subject: data.title,
    startDate: new Date().toISOString().split('T')[0],
    revisionDate: '',
    team: 'Core Team',
    idNumber: `${typeLabel}-${new Date().getFullYear()}-001`,
    responsibility: '',
    confidentialLevel: 'Confidential (机密)'
  });

  const handleHeaderChange = (field: string, value: string) => {
    setHeaderInfo(prev => ({ ...prev, [field]: value }));
  };

  // Calculate dynamic columns (custom fields added by AI)
  const customColumns = useMemo(() => {
    const keys = new Set<string>();
    data.rows.forEach(row => {
      Object.keys(row).forEach(key => {
        if (!STANDARD_KEYS.has(key)) {
          keys.add(key);
        }
      });
    });
    return Array.from(keys);
  }, [data.rows]);

  // Bilingual Headers Definition
  const headers = {
    step1: {
      issue: 'Continuous improvement\nHistory / Change Authorization\n(As Applicable)\n持续改进\n历史 / 变更授权\n(适用时)'
    },
    step2: {
      title: 'Step 2 - Structure Analysis (结构分析)',
      col1: isDfmea 
        ? '1. Next Higher Level\n1.上一级级别' 
        : '1. Process Item\n1.过程项\nSystem, Subsystem, Part Element or Name of Process\n系统、子系统、零件要素或过程名称',
      col2: isDfmea 
        ? '2. Focus Element\n2.关注要素' 
        : '2. Process Step\n2.过程步骤\nStation No. and Name of Focus Element\n工位编号和关注要素名称',
      col3: isDfmea 
        ? '3. Next Lower Level or\nCharacteristic Type\n3.下一级级别或特性类型' 
        : '3. Work Element\n3.过程工作要素\n4M Type\n4M类型',
    },
    step3: {
      title: 'Step 3 - Functional Analysis (功能分析)',
      col1: isDfmea
        ? '1. Next Higher Level Function\nand Requirement\n1.上一较高级别功能及要求'
        : '1. Function of Process Item\n1.过程项的功能\nFunction of System, Subsystem, Part Element or Process\n系统、子系统、零件要素或过程的功能',
      col2: isDfmea
        ? '2. Focus Element Function and\nRequirement\n2.关注要素功能及要求'
        : '2. Function of Process Step\n2.过程步骤的功能和产品特性\nFunction of Focus Element and Product Characteristic\n(Value/Attributes)\n(量值为可选顶)',
      // DFMEA 只有 2 列，PFMEA 有 3 列
      ...(isDfmea ? {} : {
        col3: '3. Function of Work Element\n3.过程工作要素的功能和过程特性\nFunction of Work Element and Process Characteristic\n过程工作要素的功能和过程特性',
      })
    },
    step4: {
      title: 'Step 4 - Failure Analysis (失效分析)',
      col1: '1. Failure Effects (FE) to\nNext Higher Level Element\nand/or Vehicle End User\n1. 对于上一级与/或\n最终用户的失效影响 (FE)',
      col2: 'S',
      col3: '2. FAILURE MODE (FM) of the Focus\nElement\n2. 关注要素的失效模式 (FM)',
      col4: isDfmea
        ? '3. FAILURE CAUSE (FC) of the\nNext Lower Element or\nCharacteristic\n3. 下一级级别要素或特性的失效起\n因 (FC)'
        : '3. FAILURE CAUSE (FC) of the\nWork Element\n3. 工作要素的失效起因 (FC)',
    },
    step5: {
      title: 'Step 5 - Risk Analysis (风险分析)',
      col1: isDfmea
        ? 'Current Prevention Controls (PC)\nof FC\n当前预防控制 (PC)'
        : 'Current Prevention Control (PC)\n当前失效起因的预防控制 (PC)',
      col2: isDfmea
        ? 'Current Detection Controls (DC)\nof FC or FM\n当前探测控制 (DC)'
        : 'Current Detection Control (DC)\n对失效起因或失效模式的当前探测控制 (DC)',
      col3: 'Occ.\n(O)',
      col4: 'Det.\n(D)',
      ...(isDfmea ? {
        col5: 'Severity\n(S)',
        col6: 'RPN\n(O×D×S)',
        col7: 'AP'
      } : {
        col5: 'AP'
      })
    },
    step6: {
      title: 'Step 6 - Optimization (优化)',
      col1: 'Prevention Action\n预防措施',
      col2: 'Detection Action\n探测措施',
      col3: 'Responsible Person\'s Name\n责任人姓名',
      col4: 'Target Completion Date\n目标完成日期',
      col5: 'Status\n状态',
      col6: 'Action Taken with\nPointer to Evidence\n采取基于证据的措施',
      col7: 'Completion Date\n完成日期',
      col8: 'S',
      col9: 'O',
      col10: 'D',
      col11: 'AP',
      col12: 'Remarks\n备注'
    }
  };

  const handleExportExcel = async () => {
    // Using ExcelJS for advanced styling
    const workbook = new ExcelJS.Workbook();
    const sheetName = isDfmea ? 'DFMEA' : 'PFMEA';
    const ws = workbook.addWorksheet(sheetName, {
      views: [{ state: 'frozen', ySplit: 8, xSplit: 1 }]
    });

    // --- 1. DEFINITIONS ---
    const cBlack = 'FF000000';
    const cInfoGrey = 'FFD9D9D9'; // Light Grey for Step 1
    const cGroupGrey = 'FFD9D9D9';
    const cPink = 'FFFF99CC';  // Steps 2, 3, 4
    const cGreen = 'FF92D050'; // Step 5, Scores
    const cYellow = 'FFFFFF00'; // AP
    const cWhite = 'FFFFFFFF'; // Step 6
    const cTextWhite = 'FFFFFFFF';
    const cTextBlack = 'FF000000';

    // Styles
    const sBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    const sFontTitle: Partial<ExcelJS.Font> = { name: 'Arial', size: 14, bold: true, color: { argb: cTextWhite } };
    const sFontHeader: Partial<ExcelJS.Font> = { name: 'Arial', size: 9, bold: true, color: { argb: cTextBlack } };
    const sFontNormal: Partial<ExcelJS.Font> = { name: 'Arial', size: 9, color: { argb: cTextBlack } };
    
    const sAlignCenter: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true };
    const sAlignLeft: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'left', wrapText: true };

    // --- 2. COLUMNS SETUP ---
    // A: ID/History
    // B-D: S2
    // E-F/G: S3 (DFMEA: 2列, PFMEA: 3列)
    // H-K: S4
    // L-Q/P: S5 (DFMEA: 6列, PFMEA: 5列)
    // R-AC/AB: S6
    const dfmeaColumns = [
      { width: 15 }, // A (History)
      { width: 25 }, { width: 25 }, { width: 25 }, // B-D (S2)
      { width: 30 }, { width: 30 }, // E-F (S3) - DFMEA 只有 2 列
      { width: 35 }, { width: 4 }, { width: 35 }, { width: 35 }, // H-K (S4)
      { width: 30 }, { width: 30 }, { width: 4 }, { width: 30 }, { width: 4 }, { width: 5 }, // L-Q (S5) - DFMEA 6 列
      { width: 25 }, { width: 25 }, { width: 15 }, { width: 12 }, { width: 10 }, { width: 30 }, { width: 12 }, { width: 4 }, { width: 4 }, { width: 4 }, { width: 4 }, { width: 20 }, // R-AC (S6)
      ...customColumns.map(() => ({ width: 15 }))
    ];

    const pfmeaColumns = [
      { width: 15 }, // A (History)
      { width: 25 }, { width: 25 }, { width: 25 }, // B-D (S2)
      { width: 30 }, { width: 30 }, { width: 30 }, // E-G (S3)
      { width: 35 }, { width: 4 }, { width: 35 }, { width: 35 }, // H-K (S4)
      { width: 30 }, { width: 4 }, { width: 30 }, { width: 4 }, { width: 5 }, // L-P (S5)
      { width: 25 }, { width: 25 }, { width: 15 }, { width: 12 }, { width: 10 }, { width: 30 }, { width: 12 }, { width: 4 }, { width: 4 }, { width: 4 }, { width: 4 }, { width: 20 }, // Q-AB (S6)
      ...customColumns.map(() => ({ width: 15 }))
    ];

    ws.columns = isDfmea ? dfmeaColumns : pfmeaColumns;
    const totalCols = isDfmea ? 29 : 28 + customColumns.length; // DFMEA 多一列（S）

    // --- 3. ROW 1: TITLE (Black BG) ---
    ws.mergeCells(1, 1, 1, totalCols);
    const cellTitle = ws.getCell(1, 1);
    cellTitle.value = isDfmea 
      ? 'Design Failure Modes and Effects Analysis (DFMEA) 设计失效模式及影响分析' 
      : 'Process Failure Modes and Effects Analysis (PFMEA) 过程失效模式及影响分析';
    cellTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cBlack } };
    cellTitle.font = sFontTitle;
    cellTitle.alignment = sAlignLeft;

    // --- 4. ROW 2: System Analysis Step 1 Header ---
    ws.mergeCells(2, 1, 2, totalCols);
    const cellStep1 = ws.getCell(2, 1);
    cellStep1.value = "Planning and Preparation (STEP 1) 步骤1：规划和准备";
    cellStep1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } }; // Light Yellowish
    cellStep1.font = sFontHeader;
    cellStep1.alignment = sAlignLeft;
    cellStep1.border = sBorder;

    // --- 5. ROW 3-5: Project Info (Using State Values) ---
    // Dynamic labels based on type
    const lblCompany = "Company Name 公司名称";
    const lblSubject = "Subject 项目名称";
    const lblId = `${typeLabel} ID Number ${typeLabel} ID编号`;
    const lblLocation = "Engineering Location 工厂/工程地点";
    const lblStart = `${typeLabel} Start Date ${typeLabel}开始日期`;
    const lblResp = isDfmea ? "Design Responsibility 设计责任" : "Process Responsibility 过程责任";
    const lblCust = "Customer Name 顾客名称";
    const lblRev = `${typeLabel} Revision Date ${typeLabel}修订日期`;
    const lblConf = "Confidential Level 保密等级";
    const lblTeam = "Cross-Functional Team 跨职能小组";
    const lblModel = "Model Year/Program 车型/项目";

    // Row 3
    ws.getCell(3, 2).value = `${lblCompany}: ${headerInfo.companyName}`;
    ws.getCell(3, 5).value = `${lblSubject}: ${headerInfo.subject}`;
    ws.getCell(3, 12).value = `${lblId}: ${headerInfo.idNumber}`;
    
    // Row 4
    ws.getCell(4, 2).value = `${lblLocation}: ${headerInfo.location}`;
    ws.getCell(4, 5).value = `${lblStart}: ${headerInfo.startDate}`;
    ws.getCell(4, 12).value = `${lblResp}: ${headerInfo.responsibility}`;
    
    // Row 5
    ws.getCell(5, 2).value = `${lblCust}: ${headerInfo.customerName}`;
    ws.getCell(5, 5).value = `${lblRev}: ${headerInfo.revisionDate}`;
    ws.getCell(5, 12).value = `${lblConf}: ${headerInfo.confidentialLevel}`;

    // Row 5.5/Extra for Model/Team
    ws.getCell(3, 8).value = `${lblTeam}: ${headerInfo.team}`;
    ws.getCell(4, 8).value = `${lblModel}: ${headerInfo.modelYear}`;

    // Apply font to info block
    for(let r=3; r<=5; r++) {
        const row = ws.getRow(r);
        row.font = { name: 'Arial', size: 9 };
    }

    // --- 6. ROW 6: GROUP HEADERS ---
    const r6 = 6;
    ws.mergeCells(r6, 2, r6, 7);
    const cellSysAnalysis = ws.getCell(r6, 2);
    cellSysAnalysis.value = "STRUCTURE ANALYSIS (STEP 2) 结构分析   |   FUNCTION ANALYSIS (STEP 3) 功能分析"; // Simplified merge
    cellSysAnalysis.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cGroupGrey } };
    cellSysAnalysis.alignment = sAlignCenter;
    cellSysAnalysis.font = sFontHeader;
    cellSysAnalysis.border = sBorder;

    ws.mergeCells(r6, 8, r6, 28);
    const cellFailAnalysis = ws.getCell(r6, 8);
    cellFailAnalysis.value = "FAILURE ANALYSIS (STEP 4) 失效分析   |   RISK ANALYSIS (STEP 5) 风险分析   |   OPTIMIZATION (STEP 6) 优化";
    cellFailAnalysis.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cGroupGrey } };
    cellFailAnalysis.alignment = sAlignCenter;
    cellFailAnalysis.font = sFontHeader;
    cellFailAnalysis.border = sBorder;

    if (customColumns.length > 0) {
       ws.mergeCells(r6, 29, r6, totalCols);
       const cellExt = ws.getCell(r6, 29);
       cellExt.value = "Extended Columns 扩展列";
       cellExt.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cGroupGrey } };
       cellExt.font = sFontHeader;
       cellExt.border = sBorder;
       cellExt.alignment = sAlignCenter;
    }

    // --- 7. ROW 7: STEP HEADERS ---
    const r7 = 7;
    const steps = isDfmea ? [
        { title: headers.step2.title, start: 2, end: 4, color: cPink },
        { title: headers.step3.title, start: 5, end: 6, color: cPink }, // DFMEA Step 3: 2列
        { title: headers.step4.title, start: 7, end: 10, color: cPink },
        { title: headers.step5.title, start: 11, end: 16, color: cGreen }, // DFMEA Step 5: 6列 (PC, DC, O, D, S, AP)
        { title: headers.step6.title, start: 17, end: 28, color: cWhite },
    ] : [
        { title: headers.step2.title, start: 2, end: 4, color: cPink },
        { title: headers.step3.title, start: 5, end: 7, color: cPink }, // PFMEA Step 3: 3列
        { title: headers.step4.title, start: 8, end: 11, color: cPink },
        { title: headers.step5.title, start: 12, end: 16, color: cGreen }, // PFMEA Step 5: 5列
        { title: headers.step6.title, start: 17, end: 28, color: cWhite },
    ];

    ws.getCell(r7, 1).value = headers.step1.issue;
    ws.getCell(r7, 1).border = sBorder;
    ws.getCell(r7, 1).alignment = sAlignCenter;
    ws.getCell(r7, 1).font = { size: 8, bold: true };
    ws.getCell(r7, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };

    steps.forEach(step => {
        ws.mergeCells(r7, step.start, r7, step.end);
        const c = ws.getCell(r7, step.start);
        c.value = step.title;
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: step.color } };
        c.font = sFontHeader;
        c.alignment = sAlignLeft;
        c.border = sBorder;
    });

    // --- 8. ROW 8: COLUMN HEADERS ---
    const r8 = 8;
    const headerRow = ws.getRow(r8);
    headerRow.height = 100; // Taller for bilingual text

    const colHeaders = [
        "", // Col 1 is empty in this row technically (merged vertically often, but here just blank or same)
        headers.step2.col1, headers.step2.col2, headers.step2.col3,
        headers.step3.col1, headers.step3.col2, headers.step3.col3,
        headers.step4.col1, headers.step4.col2, headers.step4.col3, headers.step4.col4,
        headers.step5.col1, headers.step5.col2, headers.step5.col3, headers.step5.col4, headers.step5.col5,
        headers.step6.col1, headers.step6.col2, headers.step6.col3, headers.step6.col4, headers.step6.col5, headers.step6.col6, headers.step6.col7, headers.step6.col8, headers.step6.col9, headers.step6.col10, headers.step6.col11, headers.step6.col12,
        ...customColumns
    ];
    
    // Fix col 1 header (issue) typically spans rows 7-8 in some templates, but here we keep distinct
    headerRow.getCell(1).value = "(详细记录)"; 

    colHeaders.forEach((text, i) => {
        if(i===0) return; // skip col 1
        const c = headerRow.getCell(i + 1);
        c.value = text;
        c.font = sFontHeader;
        c.alignment = sAlignCenter;
        c.border = sBorder;
        
        // Colors
        if (i+1 >= 2 && i+1 <= 11) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cPink } };
        if (i+1 === 9) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cGreen } }; // S

        if (i+1 >= 12 && i+1 <= 16) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cGreen } };
        if (i+1 === 16) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cYellow } }; // AP

        if (i+1 >= 17 && i+1 <= 28) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cWhite } };
        if (i+1 >= 24 && i+1 <= 26) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cGreen } }; // S, O, D New
        if (i+1 === 27) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cYellow } }; // AP New

        if (i+1 >= 29) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cPink } };
    });

    // --- 9. DATA ---
    data.rows.forEach((row, idx) => {
        const r = 9 + idx;
        let rowData;

        if (isDfmea) {
            // DFMEA: Step 3 只有 2 列，Step 5 有 6 列（PC, DC, O, D, S, AP）
            rowData = [
                idx + 1,
                row.s2_item, row.s2_step, row.s2_element,
                row.s3_func_item, row.s3_func_step, // 只有 2 列
                row.s4_effect, row.s4_severity, row.s4_mode, row.s4_cause,
                row.s5_prev_control, row.s5_det_control, row.s5_occurrence, row.s5_detection, row.s4_severity, row.s5_ap,
                row.s6_prev_action, row.s6_det_action, row.s6_resp_person, row.s6_target_date, row.s6_status, row.s6_action_taken, row.s6_completion_date,
                row.s6_severity_new, row.s6_occurrence_new, row.s6_detection_new, row.s6_ap_new, row.remarks,
                ...customColumns.map(col => row[col] || '')
            ];
        } else {
            // PFMEA: Step 3 有 3 列，Step 5 有 5 列
            rowData = [
                idx + 1,
                row.s2_item, row.s2_step, row.s2_element,
                row.s3_func_item, row.s3_func_step, row.s3_func_element,
                row.s4_effect, row.s4_severity, row.s4_mode, row.s4_cause,
                row.s5_prev_control, row.s5_occurrence, row.s5_det_control, row.s5_detection, row.s5_ap,
                row.s6_prev_action, row.s6_det_action, row.s6_resp_person, row.s6_target_date, row.s6_status, row.s6_action_taken, row.s6_completion_date,
                row.s6_severity_new, row.s6_occurrence_new, row.s6_detection_new, row.s6_ap_new, row.remarks,
                ...customColumns.map(col => row[col] || '')
            ];
        }
        const currentRow = ws.getRow(r);
        currentRow.values = rowData;
        currentRow.font = sFontNormal;
        currentRow.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        currentRow.eachCell(cell => cell.border = sBorder);

        // Center scores
        [9, 13, 15, 16, 24, 25, 26, 27].forEach(c => {
             currentRow.getCell(c).alignment = { vertical: 'top', horizontal: 'center' };
        });

        // Color AP
        const ap1 = row.s5_ap?.toUpperCase();
        if (ap1?.includes('H')) currentRow.getCell(16).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
        else if (ap1?.includes('M')) currentRow.getCell(16).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
        else if (ap1?.includes('L')) currentRow.getCell(16).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
        
        const ap2 = row.s6_ap_new?.toUpperCase();
        if (ap2?.includes('H')) currentRow.getCell(27).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
        else if (ap2?.includes('M')) currentRow.getCell(27).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
        else if (ap2?.includes('L')) currentRow.getCell(27).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
    });

    // Save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.title}_${data.type}.xlsx`;
    link.click();
    setIsExportMenuOpen(false);
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.title}_${data.type}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  const handlePrintPDF = () => {
     window.print();
     setIsExportMenuOpen(false);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mt-6 animate-fade-in print:shadow-none print:border-none print:mt-0">
      
      {/* 1. Project Header (Step 1) - Editable */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 print:bg-white print:p-0">
        
        {/* Title Row */}
        <div className="bg-black text-white px-4 py-2 font-bold text-lg mb-0 flex justify-between items-center print:text-black print:bg-white print:border-b print:border-black print:text-xl">
           <span>{isDfmea ? 'Design Failure Modes and Effects Analysis (DFMEA) 设计失效模式及影响分析' : 'Process Failure Modes and Effects Analysis (PFMEA) 过程失效模式及影响分析'}</span>
           <span className="text-xs bg-white text-black px-2 py-0.5 rounded font-normal print:hidden">AIAG & VDA 1st Edition</span>
        </div>

        {/* Step 1 Label */}
        <div className="bg-yellow-100 text-slate-800 px-4 py-1.5 font-bold text-sm border-b border-slate-300 print:bg-slate-100">
           Planning and Preparation (STEP 1) 步骤1：规划和准备
        </div>

        {/* Header Grid Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 p-4 text-xs print:grid-cols-3 print:gap-x-4 print:p-2">
           {/* Left Column */}
           <div className="space-y-2">
              <div className="flex flex-col">
                <label className="font-bold text-slate-500 mb-0.5">Company Name 公司名称:</label>
                <input 
                   type="text" 
                   value={headerInfo.companyName}
                   onChange={e => handleHeaderChange('companyName', e.target.value)}
                   className="border-b border-slate-300 bg-transparent focus:border-blue-500 outline-none w-full print:border-none"
                   placeholder="输入公司名称..."
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-slate-500 mb-0.5">Engineering Location 工厂/工程地点:</label>
                <input 
                   type="text" 
                   value={headerInfo.location}
                   onChange={e => handleHeaderChange('location', e.target.value)}
                   className="border-b border-slate-300 bg-transparent focus:border-blue-500 outline-none w-full print:border-none"
                   placeholder="输入地点..."
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-slate-500 mb-0.5">Customer Name 顾客名称:</label>
                <input 
                   type="text" 
                   value={headerInfo.customerName}
                   onChange={e => handleHeaderChange('customerName', e.target.value)}
                   className="border-b border-slate-300 bg-transparent focus:border-blue-500 outline-none w-full print:border-none"
                   placeholder="输入顾客名称..."
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-slate-500 mb-0.5">Model Year/Program 车型/项目:</label>
                <input 
                   type="text" 
                   value={headerInfo.modelYear}
                   onChange={e => handleHeaderChange('modelYear', e.target.value)}
                   className="border-b border-slate-300 bg-transparent focus:border-blue-500 outline-none w-full print:border-none"
                   placeholder="输入车型/项目..."
                />
              </div>
           </div>

           {/* Middle Column */}
           <div className="space-y-2">
              <div className="flex flex-col">
                <label className="font-bold text-slate-500 mb-0.5">Subject 项目名称:</label>
                <input 
                   type="text" 
                   value={headerInfo.subject}
                   onChange={e => handleHeaderChange('subject', e.target.value)}
                   className="border-b border-slate-300 bg-transparent focus:border-blue-500 outline-none w-full print:border-none font-bold text-slate-800"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-slate-500 mb-0.5">{typeLabel} Start Date {typeLabel}开始日期:</label>
                <input 
                   type="date" 
                   value={headerInfo.startDate}
                   onChange={e => handleHeaderChange('startDate', e.target.value)}
                   className="border-b border-slate-300 bg-transparent focus:border-blue-500 outline-none w-full print:border-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-slate-500 mb-0.5">{typeLabel} Revision Date {typeLabel}修订日期:</label>
                <input 
                   type="text" 
                   value={headerInfo.revisionDate}
                   onChange={e => handleHeaderChange('revisionDate', e.target.value)}
                   className="border-b border-slate-300 bg-transparent focus:border-blue-500 outline-none w-full print:border-none"
                   placeholder="YYYY-MM-DD"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-slate-500 mb-0.5">Cross-Functional Team 跨职能小组:</label>
                <input 
                   type="text" 
                   value={headerInfo.team}
                   onChange={e => handleHeaderChange('team', e.target.value)}
                   className="border-b border-slate-300 bg-transparent focus:border-blue-500 outline-none w-full print:border-none"
                />
              </div>
           </div>

           {/* Right Column */}
           <div className="space-y-2">
              <div className="flex flex-col">
                <label className="font-bold text-slate-500 mb-0.5">{typeLabel} ID Number {typeLabel} ID编号:</label>
                <input 
                   type="text" 
                   value={headerInfo.idNumber}
                   onChange={e => handleHeaderChange('idNumber', e.target.value)}
                   className="border-b border-slate-300 bg-transparent focus:border-blue-500 outline-none w-full print:border-none font-mono"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-slate-500 mb-0.5">{isDfmea ? 'Design Responsibility 设计责任:' : 'Process Responsibility 过程责任:'}</label>
                <input 
                   type="text" 
                   value={headerInfo.responsibility}
                   onChange={e => handleHeaderChange('responsibility', e.target.value)}
                   className="border-b border-slate-300 bg-transparent focus:border-blue-500 outline-none w-full print:border-none"
                   placeholder="输入责任部门/人员..."
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-slate-500 mb-0.5">Confidential Level 保密等级:</label>
                <select 
                   value={headerInfo.confidentialLevel}
                   onChange={e => handleHeaderChange('confidentialLevel', e.target.value)}
                   className="border-b border-slate-300 bg-transparent focus:border-blue-500 outline-none w-full print:appearance-none print:border-none"
                >
                   <option>Confidential (机密)</option>
                   <option>Secret (秘密)</option>
                   <option>Internal (内部公开)</option>
                </select>
              </div>
           </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex justify-end print:hidden">
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm font-bold shadow-sm"
              >
                <Download size={16} />
                导出 Excel 报表
                <ChevronDown size={14} className={`transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-fade-in overflow-hidden">
                    <button onClick={handleExportExcel} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700 transition-colors border-b border-slate-100">
                        <FileSpreadsheet size={16} className="text-emerald-600" /> Excel (.xlsx)
                    </button>
                    <button onClick={handlePrintPDF} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700 transition-colors border-b border-slate-100">
                        <Printer size={16} className="text-slate-600" /> PDF / Print
                    </button>
                    <button onClick={handleExportJSON} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700 transition-colors">
                        <FileCode size={16} className="text-amber-600" /> JSON
                    </button>
                </div>
              )}
            </div>
        </div>
      </div>
      
      {/* 2. Main Table Area */}
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left text-xs border-collapse table-fixed print:table-auto">
          <colgroup className="print:hidden">
            {/* Step 1: Issue History */}
            <col className="w-[80px]" />
            {/* S2 */}
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            {/* S3 */}
            <col className="w-[110px]" />
            <col className="w-[110px]" />
            <col className="w-[110px]" />
            {/* S4 */}
            <col className="w-[130px]" />
            <col className="w-[30px]" />
            <col className="w-[130px]" />
            <col className="w-[130px]" />
            {/* S5 */}
            <col className="w-[120px]" />
            <col className="w-[30px]" />
            <col className="w-[120px]" />
            <col className="w-[30px]" />
            <col className="w-[40px]" />
            {/* S6 */}
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[80px]" />
            <col className="w-[80px]" />
            <col className="w-[60px]" />
            <col className="w-[180px]" /> 
            <col className="w-[80px]" />
            <col className="w-[30px]" />
            <col className="w-[30px]" />
            <col className="w-[30px]" />
            <col className="w-[40px]" />
            <col className="w-[80px]" />
            {/* Custom Columns */}
            {customColumns.map((_, i) => <col key={i} className="w-[100px]" />)}
          </colgroup>
          <thead>
            {/* Top Group Header */}
            <tr className="text-center text-slate-700 font-bold uppercase tracking-wider text-[11px]">
               <th className="bg-slate-100 border-r border-slate-300"></th>
               <th colSpan={3} className="bg-slate-200 border-r border-slate-300 py-1 px-1">Structure Analysis</th>
               <th colSpan={3} className="bg-slate-200 border-r border-slate-300 py-1 px-1">Function Analysis</th>
               <th colSpan={4} className="bg-slate-200 border-r border-slate-300 py-1 px-1">Failure Analysis</th>
               <th colSpan={5} className="bg-slate-200 border-r border-slate-300 py-1 px-1">Risk Analysis</th>
               <th colSpan={12} className="bg-slate-200 border-r border-slate-300 py-1 px-1">Optimization</th>
               {customColumns.length > 0 && <th colSpan={customColumns.length} className="bg-slate-200 py-1">Ext</th>}
            </tr>

            {/* Step Headers */}
            <tr className="text-center text-black font-bold uppercase tracking-wider text-[11px] print:text-[8px] print:text-black">
              <th rowSpan={2} className="bg-yellow-50 border-r border-slate-300 p-1 whitespace-pre-wrap text-[9px]">{headers.step1.issue}</th>
              
              <th colSpan={3} className="bg-fuchsia-200 border-r border-fuchsia-300 py-1 px-1">{headers.step2.title}</th>
              <th colSpan={isDfmea ? 2 : 3} className="bg-fuchsia-200 border-r border-fuchsia-300 py-1 px-1">{headers.step3.title}</th>
              <th colSpan={4} className="bg-fuchsia-200 border-r border-fuchsia-300 py-1 px-1">{headers.step4.title}</th>
              <th colSpan={isDfmea ? 6 : 5} className="bg-lime-300 border-r border-lime-400 py-1 px-1">{headers.step5.title}</th>
              <th colSpan={12} className="bg-white border-b border-r border-slate-300 py-1 px-1">{headers.step6.title}</th>
               {customColumns.length > 0 && (
                <th colSpan={customColumns.length} className="bg-purple-100 py-1 px-1">Extended</th>
              )}
            </tr>

            {/* Column Headers (Bilingual) */}
            <tr className="text-center bg-slate-100 text-slate-700 font-semibold border-b-2 border-slate-300 text-[10px]">
              {/* S2 */}
              <th className="p-1 border-r border-fuchsia-100 bg-fuchsia-50 whitespace-pre-wrap">{headers.step2.col1}</th>
              <th className="p-1 border-r border-fuchsia-100 bg-fuchsia-50 whitespace-pre-wrap">{headers.step2.col2}</th>
              <th className="p-1 border-r border-fuchsia-200 bg-fuchsia-50 whitespace-pre-wrap">{headers.step2.col3}</th>
              {/* S3 */}
              <th className="p-1 border-r border-fuchsia-100 bg-fuchsia-50 whitespace-pre-wrap">{headers.step3.col1}</th>
              <th className="p-1 border-r border-fuchsia-100 bg-fuchsia-50 whitespace-pre-wrap">{headers.step3.col2}</th>
              {!isDfmea && <th className="p-1 border-r border-fuchsia-200 bg-fuchsia-50 whitespace-pre-wrap">{headers.step3.col3}</th>}
              {/* S4 */}
              <th className="p-1 border-r border-fuchsia-100 bg-fuchsia-50 whitespace-pre-wrap">{headers.step4.col1}</th>
              <th className="p-1 border-r border-fuchsia-100 text-black font-bold bg-lime-300">{headers.step4.col2}</th>
              <th className="p-1 border-r border-fuchsia-100 bg-fuchsia-50 whitespace-pre-wrap">{headers.step4.col3}</th>
              <th className="p-1 border-r border-fuchsia-200 bg-fuchsia-50 whitespace-pre-wrap">{headers.step4.col4}</th>
              {/* S5 */}
              <th className="p-1 border-r border-lime-200 bg-lime-100 whitespace-pre-wrap">{headers.step5.col1}</th>
              <th className="p-1 border-r border-lime-200 bg-lime-100 whitespace-pre-wrap">{headers.step5.col2}</th>
              <th className="p-1 border-r border-lime-200 text-black font-bold bg-lime-300">{headers.step5.col3}</th>
              <th className="p-1 border-r border-lime-200 bg-lime-100 whitespace-pre-wrap">{headers.step5.col4}</th>
              <th className="p-1 border-r border-lime-200 text-black font-bold bg-lime-300">{headers.step5.col5}</th>
              {isDfmea && <th className="p-1 border-r border-lime-300 font-bold bg-yellow-300">{headers.step5.col6}</th>}
              <th className="p-1 border-r border-lime-300 font-bold bg-yellow-300">{isDfmea ? headers.step5.col7 : headers.step5.col5}</th>
              {/* S6 */}
              <th className="p-1 border-r border-slate-200 bg-white whitespace-pre-wrap">{headers.step6.col1}</th>
              <th className="p-1 border-r border-slate-200 bg-white whitespace-pre-wrap">{headers.step6.col2}</th>
              <th className="p-1 border-r border-slate-200 bg-white whitespace-pre-wrap">{headers.step6.col3}</th>
              <th className="p-1 border-r border-slate-200 bg-white whitespace-pre-wrap">{headers.step6.col4}</th>
              <th className="p-1 border-r border-slate-200 bg-white whitespace-pre-wrap">{headers.step6.col5}</th>
              <th className="p-1 border-r border-slate-200 bg-white whitespace-pre-wrap">{headers.step6.col6}</th>
              <th className="p-1 border-r border-slate-200 bg-white whitespace-pre-wrap">{headers.step6.col7}</th>
              <th className="p-1 border-r border-slate-200 bg-lime-300">{headers.step6.col8}</th>
              <th className="p-1 border-r border-slate-200 bg-lime-300">{headers.step6.col9}</th>
              <th className="p-1 border-r border-slate-200 bg-lime-300">{headers.step6.col10}</th>
              <th className="p-1 border-r border-slate-200 bg-yellow-300">{headers.step6.col11}</th>
              <th className="p-1 bg-white whitespace-pre-wrap border-r border-slate-200">{headers.step6.col12}</th>
              {/* Custom */}
              {customColumns.map((col, idx) => (
                <th key={col} className={`p-1 bg-purple-50 text-purple-900 font-medium whitespace-pre-wrap break-words ${idx < customColumns.length - 1 ? 'border-r border-slate-200' : ''}`}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.rows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-1 border-r border-slate-100 align-top text-center text-slate-400 text-[9px]">{idx + 1}</td>
                
                <td className="p-1 border-r border-slate-100 align-top text-slate-600 whitespace-pre-wrap break-words">{row.s2_item}</td>
                <td className="p-1 border-r border-slate-100 align-top font-medium text-slate-800 bg-slate-50/50 whitespace-pre-wrap break-words">{row.s2_step}</td>
                <td className="p-1 border-r border-slate-300 align-top text-slate-600 whitespace-pre-wrap break-words">{row.s2_element}</td>

                <td className="p-1 border-r border-slate-100 align-top text-slate-600 bg-blue-50/10 whitespace-pre-wrap break-words">{row.s3_func_item}</td>
                <td className="p-1 border-r border-slate-100 align-top text-slate-600 bg-blue-50/10 whitespace-pre-wrap break-words">{row.s3_func_step}</td>
                {!isDfmea && <td className="p-1 border-r border-slate-300 align-top text-slate-600 bg-blue-50/10 whitespace-pre-wrap break-words">{row.s3_func_element}</td>}

                <td className="p-1 border-r border-slate-100 align-top text-slate-700 bg-fuchsia-50/10 whitespace-pre-wrap break-words">{row.s4_effect}</td>
                <td className="p-1 border-r border-slate-100 align-top text-center font-bold text-red-700 bg-fuchsia-50/20">{row.s4_severity}</td>
                <td className="p-1 border-r border-slate-100 align-top font-medium text-red-900 bg-fuchsia-50/10 whitespace-pre-wrap break-words">{row.s4_mode}</td>
                <td className="p-1 border-r border-slate-300 align-top text-slate-700 bg-fuchsia-50/10 whitespace-pre-wrap break-words">{row.s4_cause}</td>

                <td className="p-1 border-r border-slate-100 align-top text-[10px] text-slate-600 bg-amber-50/10 whitespace-pre-wrap break-words">{row.s5_prev_control}</td>
                <td className="p-1 border-r border-slate-100 align-top text-[10px] text-slate-600 bg-amber-50/10 whitespace-pre-wrap break-words">{row.s5_det_control}</td>
                <td className="p-1 border-r border-slate-100 align-top text-center font-bold text-orange-700 bg-amber-50/20">{row.s5_occurrence}</td>
                <td className="p-1 border-r border-slate-100 align-top text-center font-bold text-blue-700 bg-amber-50/20">{row.s5_detection}</td>
                {isDfmea && <td className="p-1 border-r border-slate-100 align-top text-center font-bold text-red-700 bg-amber-50/20">{row.s4_severity}</td>}
                <td className="p-1 border-r border-slate-300 align-top text-center bg-amber-50/10">
                  <ApBadge value={row.s5_ap} />
                </td>

                <td className="p-1 border-r border-slate-100 align-top text-[10px] text-slate-600 bg-emerald-50/10 whitespace-pre-wrap break-words">{row.s6_prev_action}</td>
                <td className="p-1 border-r border-slate-100 align-top text-[10px] text-slate-600 bg-emerald-50/10 whitespace-pre-wrap break-words">{row.s6_det_action}</td>
                <td className="p-1 border-r border-slate-100 align-top text-[10px] text-slate-600 bg-emerald-50/10 whitespace-pre-wrap">{row.s6_resp_person}</td>
                <td className="p-1 border-r border-slate-100 align-top text-[10px] text-slate-500 bg-emerald-50/10 whitespace-nowrap">{row.s6_target_date}</td>
                <td className="p-1 border-r border-slate-100 align-top text-[10px] text-emerald-700 font-medium bg-emerald-50/10 whitespace-nowrap">{row.s6_status}</td>
                <td className="p-1 border-r border-slate-100 align-top text-[10px] text-slate-700 font-medium bg-emerald-50/20 whitespace-pre-wrap break-words">{row.s6_action_taken}</td>
                <td className="p-1 border-r border-slate-100 align-top text-[10px] text-slate-500 bg-emerald-50/10 whitespace-nowrap">{row.s6_completion_date}</td>
                <td className="p-1 border-r border-slate-100 align-top text-center font-bold text-slate-400 bg-emerald-50/10">{row.s6_severity_new}</td>
                <td className="p-1 border-r border-slate-100 align-top text-center font-bold text-emerald-600 bg-emerald-50/10">{row.s6_occurrence_new}</td>
                <td className="p-1 border-r border-slate-100 align-top text-center font-bold text-emerald-600 bg-emerald-50/10">{row.s6_detection_new}</td>
                <td className="p-1 border-r border-slate-100 align-top text-center bg-emerald-50/10">
                  <ApBadge value={row.s6_ap_new} />
                </td>
                <td className={`p-1 align-top text-[9px] text-slate-400 bg-emerald-50/5 ${customColumns.length > 0 ? 'border-r border-slate-100' : ''}`}>{row.remarks}</td>
                {customColumns.map((col, idx) => (
                   <td key={col} className={`p-1 align-top text-[9px] text-slate-700 bg-purple-50/5 whitespace-pre-wrap break-words ${idx < customColumns.length - 1 ? 'border-r border-slate-100' : ''}`}>
                     {row[col]}
                   </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};