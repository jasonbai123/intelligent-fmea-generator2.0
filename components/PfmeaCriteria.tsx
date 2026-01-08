import React from 'react';

const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th className={`p-2 border border-slate-300 bg-emerald-700 text-white font-bold text-xs ${className || ''}`}>
    {children}
  </th>
);

const TableCell: React.FC<{ children: React.ReactNode; className?: string; rowSpan?: number; colSpan?: number }> = ({ children, className, rowSpan, colSpan }) => (
  <td rowSpan={rowSpan} colSpan={colSpan} className={`p-2 border border-slate-300 text-xs text-slate-700 align-top whitespace-pre-wrap ${className || ''}`}>
    {children}
  </td>
);

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-4">
    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
      <span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
      {title}
    </h3>
    {subtitle && <p className="text-xs text-slate-500 ml-3.5 mt-1">{subtitle}</p>}
  </div>
);

export const PfmeaCriteria: React.FC = () => {
  // Define the detailed AP table structure strictly according to AIAG & VDA 1st Edition
  const apTableData = [
    {
      impact: "对产品或工厂的影响度 非常高",
      s: "9-10",
      oGroups: [
        { prediction: "非常高", o: "8-10", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "H" },
          { ability: "中", d: "5-6", ap: "H" },
          { ability: "高", d: "2-4", ap: "H" },
          { ability: "非常高", d: "0-1", ap: "H" }
        ]},
        { prediction: "高", o: "6-7", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "H" },
          { ability: "中", d: "5-6", ap: "H" },
          { ability: "高", d: "2-4", ap: "H" },
          { ability: "非常高", d: "0-1", ap: "H" }
        ]},
        { prediction: "中", o: "4-5", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "H" },
          { ability: "中", d: "5-6", ap: "H" },
          { ability: "高", d: "2-4", ap: "H" },
          { ability: "非常高", d: "0-1", ap: "M" }
        ]},
        { prediction: "低", o: "2-3", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "H" },
          { ability: "中", d: "5-6", ap: "M" },
          { ability: "高", d: "2-4", ap: "L" },
          { ability: "非常高", d: "0-1", ap: "L" }
        ]},
        { prediction: "非常低", o: "0-1", dRows: [
          { ability: "非常高 - 非常低", d: "1-10", ap: "L" }
        ]}
      ]
    },
    {
      impact: "对产品或工厂的影响度 高",
      s: "7-8",
      oGroups: [
        { prediction: "非常高", o: "8-10", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "H" },
          { ability: "中", d: "5-6", ap: "H" },
          { ability: "高", d: "2-4", ap: "H" },
          { ability: "非常高", d: "0-1", ap: "H" }
        ]},
        { prediction: "高", o: "6-7", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "H" },
          { ability: "中", d: "5-6", ap: "H" },
          { ability: "高", d: "2-4", ap: "H" },
          { ability: "非常高", d: "0-1", ap: "M" }
        ]},
        { prediction: "中", o: "4-5", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "H" },
          { ability: "中", d: "5-6", ap: "M" },
          { ability: "高", d: "2-4", ap: "M" },
          { ability: "非常高", d: "0-1", ap: "M" }
        ]},
        { prediction: "低", o: "2-3", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "M" },
          { ability: "中", d: "5-6", ap: "M" },
          { ability: "高", d: "2-4", ap: "L" },
          { ability: "非常高", d: "0-1", ap: "L" }
        ]},
        { prediction: "非常低", o: "0-1", dRows: [
          { ability: "非常高 - 非常低", d: "1-10", ap: "L" }
        ]}
      ]
    },
    {
      impact: "对产品或工厂的影响度 中等",
      s: "4-6",
      oGroups: [
        { prediction: "非常高", o: "8-10", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "H" },
          { ability: "中", d: "5-6", ap: "H" },
          { ability: "高", d: "2-4", ap: "M" },
          { ability: "非常高", d: "0-1", ap: "M" }
        ]},
        { prediction: "高", o: "6-7", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "M" },
          { ability: "中", d: "5-6", ap: "M" },
          { ability: "高", d: "2-4", ap: "M" },
          { ability: "非常高", d: "0-1", ap: "L" }
        ]},
        { prediction: "中", o: "4-5", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "M" },
          { ability: "中", d: "5-6", ap: "L" },
          { ability: "高", d: "2-4", ap: "L" },
          { ability: "非常高", d: "0-1", ap: "L" }
        ]},
        { prediction: "低", o: "2-3", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "L" },
          { ability: "中", d: "5-6", ap: "L" },
          { ability: "高", d: "2-4", ap: "L" },
          { ability: "非常高", d: "0-1", ap: "L" }
        ]},
        { prediction: "非常低", o: "0-1", dRows: [
          { ability: "非常高 - 非常低", d: "1-10", ap: "L" }
        ]}
      ]
    },
    {
      impact: "对产品或工厂的影响度 低",
      s: "2-3",
      oGroups: [
        { prediction: "非常高", o: "8-10", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "M" },
          { ability: "中", d: "5-6", ap: "M" },
          { ability: "高", d: "2-4", ap: "L" },
          { ability: "非常高", d: "0-1", ap: "L" }
        ]},
        { prediction: "高", o: "6-7", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "L" },
          { ability: "中", d: "5-6", ap: "L" },
          { ability: "高", d: "2-4", ap: "L" },
          { ability: "非常高", d: "0-1", ap: "L" }
        ]},
        { prediction: "中", o: "4-5", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "L" },
          { ability: "中", d: "5-6", ap: "L" },
          { ability: "高", d: "2-4", ap: "L" },
          { ability: "非常高", d: "0-1", ap: "L" }
        ]},
        { prediction: "低", o: "2-3", dRows: [
          { ability: "低 - 非常低", d: "7-10", ap: "L" },
          { ability: "中", d: "5-6", ap: "L" },
          { ability: "高", d: "2-4", ap: "L" },
          { ability: "非常高", d: "0-1", ap: "L" }
        ]},
        { prediction: "非常低", o: "0-1", dRows: [
          { ability: "非常高 - 非常低", d: "1-10", ap: "L" }
        ]}
      ]
    },
    {
      impact: "没有可察觉到的影响",
      s: "0-1",
      oGroups: [
        { prediction: "非常低 - 非常高", o: "1-10", dRows: [
          { ability: "非常高 - 非常低", d: "1-10", ap: "L" }
        ]}
      ]
    }
  ];

  return (
    <div className="animate-fade-in space-y-12 pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">PFMEA 评分准则 (AIAG & VDA 1st Edition)</h2>
        <p className="text-slate-500 mt-2 text-sm">
          以下准则用于过程失效模式及影响分析（PFMEA）的风险评估，包含严重度 (S)、频度 (O)、探测度 (D) 及措施优先级 (AP)。
        </p>
      </header>

      {/* 1. Severity Table */}
      <section>
        <SectionHeader title="PFMEA SEVERITY - 过程一般评估标准-严重度 (S)" subtitle="对失效影响后果的评价" />
        <div className="overflow-x-auto shadow-sm rounded-lg">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr>
                <TableHeader className="w-12">S</TableHeader>
                <TableHeader className="w-16">影响</TableHeader>
                <TableHeader className="w-48">对您的工厂的影响</TableHeader>
                <TableHeader className="w-48">对发运至工厂的影响<br/>(在已知情况下)</TableHeader>
                <TableHeader className="w-48">对最终用户的影响</TableHeader>
                <TableHeader>公司或产品系列示例</TableHeader>
              </tr>
            </thead>
            <tbody>
              <tr>
                <TableCell className="text-center font-bold bg-red-50">10</TableCell>
                <TableCell className="bg-red-50" rowSpan={2}>极高</TableCell>
                <TableCell className="bg-red-50">失效可能会导致从事生产或组装作业的工人面临健康和/或安全风险。</TableCell>
                <TableCell className="bg-red-50">失效可能会导致从事生产或组装作业的工人面临健康和/或安全风险。</TableCell>
                <TableCell className="bg-red-50">影响到车辆和/或其他车辆的操作安全，驾驶员、乘客、交通参与者或行人的健康状况。</TableCell>
                <TableCell className="bg-red-50 italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold bg-red-50">9</TableCell>
                <TableCell className="bg-red-50">失效可能会导致厂内不符合法规。</TableCell>
                <TableCell className="bg-red-50">失效可能会导致厂内不符合法规。</TableCell>
                <TableCell className="bg-red-50">不符合法规。</TableCell>
                <TableCell className="bg-red-50 italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">8</TableCell>
                <TableCell rowSpan={2}>较高</TableCell>
                <TableCell>生产运行100%会受到影响，产品不得不报废。</TableCell>
                <TableCell>生产停止工超过一个完整的班次；可能停止发货；需要使用现场返修或更换（装配线到终端用户），并且不符合相关法规。</TableCell>
                <TableCell>在预期使用寿命内，失去正常驾驶所必需的车辆主要功能。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">7</TableCell>
                <TableCell>产品可能需要进行分拣，其中一部分 (少于 100%) 会报废；主要过程有偏差；生产过程速度降低或增加劳动力。</TableCell>
                <TableCell>生产线停工从1小时起到一个完整的班次；可能停止发货；需要使用现场返修或更换（装配线到终端用户），并且不符合法规。</TableCell>
                <TableCell>在预期使用寿命内，降低正常驾驶所必需的车辆主要功能。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">6</TableCell>
                <TableCell rowSpan={2}>较低</TableCell>
                <TableCell>100%的产品可能需要线下返工后才能被接受。</TableCell>
                <TableCell>生产线停工超过一个小时。</TableCell>
                <TableCell>失去车辆次要功能。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">5</TableCell>
                <TableCell>部分产品可能需要线下返工后才能被接受。</TableCell>
                <TableCell>少于100%的受到影响；极有可能出现额外的缺陷产品；需要分拣；生产线没有停工。</TableCell>
                <TableCell>降低车辆次要功能。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">4</TableCell>
                <TableCell rowSpan={3}>低</TableCell>
                <TableCell>100%的产品可能需要在工位上返工后才能继续加工。</TableCell>
                <TableCell>缺陷产品缺陷产品会触发重大应对计划的启动；可能不会出现额外的缺陷产品；不需要分拣。</TableCell>
                <TableCell>外观、声音、振动、粗糙度或触感令人感觉非常不舒服。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">3</TableCell>
                <TableCell>部分产品可能需要在工位上返工后才能继续加工。</TableCell>
                <TableCell>缺陷产品会触发次要应对计划的启动；可能不会出现额外的缺陷产品；不需要分拣。</TableCell>
                <TableCell>外观、声音、振动、粗糙度或触感令人感觉一般性的不舒服。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">2</TableCell>
                <TableCell>会导致过程、操作或操作人员的不方便。</TableCell>
                <TableCell>缺陷产品不会触发应对计划的启动；可能不会出现额外的缺陷产品；不需要分拣；需要向供应商提供反馈。</TableCell>
                <TableCell>外观、声音、振动、粗糙度或触感令人略微感觉不舒服。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold bg-green-50">1</TableCell>
                <TableCell className="bg-green-50">非常低</TableCell>
                <TableCell className="bg-green-50">没有可察觉到的影响。</TableCell>
                <TableCell className="bg-green-50">没有可察觉到的影响或没有影响。</TableCell>
                <TableCell className="bg-green-50">没有可察觉到的影响。</TableCell>
                <TableCell className="bg-green-50 italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Occurrence Table - STRICTLY MATCHING SCREENSHOT */}
      <section>
        <SectionHeader title="PFMEA OCCURRENCE - 过程的潜在频度 (O)" subtitle="对失效起因发生可能性的预测" />
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-xs text-slate-600 mb-4 leading-relaxed">
          根据以下标准对潜在失效起因进行评级。在确定最佳预估频度时应考虑预防控制。频度是在评估时进行的预估定性评级，可能不能反映真实的频度。频度评级分是在 FMEA (正在评估的过程) 范围内进行的相对评级数值。针对多个频度评级中的预防控制而言，可以使用最能反映控制有效性的评级。
        </div>
        <div className="overflow-x-auto shadow-sm rounded-lg">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr>
                <TableHeader className="w-12">O</TableHeader>
                <TableHeader className="w-24">对失效起因发生的预测</TableHeader>
                <TableHeader className="w-32">每千件产品/车辆的故障率</TableHeader>
                <TableHeader className="w-24">基于时间的失效起因</TableHeader>
                <TableHeader className="w-24">控制类型</TableHeader>
                <TableHeader>预防控制</TableHeader>
                <TableHeader className="w-32">公司或产品系列示例</TableHeader>
              </tr>
            </thead>
            <tbody>
              <tr>
                <TableCell className="text-center font-bold bg-red-50">10</TableCell>
                <TableCell className="bg-red-50">极高</TableCell>
                <TableCell className="bg-red-50">≥ 100/1000<br/>≥ 1/10</TableCell>
                <TableCell className="bg-red-50">每次</TableCell>
                <TableCell className="bg-red-50">无</TableCell>
                <TableCell className="bg-red-50">没有预防控制</TableCell>
                <TableCell className="bg-red-50 italic text-slate-400" rowSpan={10}>空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">9</TableCell>
                <TableCell rowSpan={2}>非常高</TableCell>
                <TableCell>50/1000<br/>1/20</TableCell>
                <TableCell>几乎每次</TableCell>
                <TableCell rowSpan={2}>行为控制</TableCell>
                <TableCell rowSpan={2}>预防控制在防止失效起因出现的方面起到的作用很小</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">8</TableCell>
                <TableCell>20/1000<br/>1/50</TableCell>
                <TableCell>每班超过一次</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">7</TableCell>
                <TableCell rowSpan={2}>高</TableCell>
                <TableCell>10/1000<br/>1/100</TableCell>
                <TableCell>每日超过一次</TableCell>
                <TableCell rowSpan={2}>行为或技术控制</TableCell>
                <TableCell rowSpan={2}>预防控制在防止失效起因出现的方面可以起到一定的作用</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">6</TableCell>
                <TableCell>2/1000<br/>1/500</TableCell>
                <TableCell>每周超过一次</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">5</TableCell>
                <TableCell rowSpan={2}>中</TableCell>
                <TableCell>0.5/1000<br/>1/2000</TableCell>
                <TableCell>每月超过一次</TableCell>
                <TableCell rowSpan={2}></TableCell>
                <TableCell rowSpan={2}>预防控制在防止失效起因出现的方面可以起到有效的作用</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">4</TableCell>
                <TableCell>0.1/1000<br/>1/10000</TableCell>
                <TableCell>每年超过一次</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">3</TableCell>
                <TableCell rowSpan={2}>低</TableCell>
                <TableCell>0.01/1000<br/>1/100000</TableCell>
                <TableCell>每年一次</TableCell>
                <TableCell rowSpan={2}>最佳实践：行为或技术控制</TableCell>
                <TableCell rowSpan={2}>预防控制在防止失效起因出现的方面可以起到高度有效的作用</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">2</TableCell>
                <TableCell>非常低</TableCell>
                <TableCell>≤ 0.001/1000<br/>1/1000000</TableCell>
                <TableCell>每年少于一次</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold bg-green-50">1</TableCell>
                <TableCell className="bg-green-50">极低</TableCell>
                <TableCell className="bg-green-50">通过预防控制避免失效</TableCell>
                <TableCell className="bg-green-50">从未发生</TableCell>
                <TableCell className="bg-green-50">技术控制</TableCell>
                <TableCell className="bg-green-50">
                  预防控制在预防失效起因设计（例如：零件形状）或过程（如夹具或模具设计）而发生的失效起因方面极其有效。<br/>
                  预防控制目的-失效模式不会因失效起因而实际发生
                </TableCell>
              </tr>
            </tbody>
          </table>
          <div className="bg-slate-50 p-3 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed">
            <strong>预防控制的有效性：</strong>在确定预防控制的有效性时，应考虑预防控制是否为技术措施（依靠机械设备、工具寿命、工具材料等），或应用最佳实践（夹具、工装设计、校准程序、防错验证、定期检修、工作说明、统计流程控制表、过程监视、产品设计等），或行为措施（依靠持有证书或未持有证书的操作人员、技术工人、团队领导等）。
          </div>
        </div>
      </section>

      {/* 3. Detection Table - STRICTLY MATCHING SCREENSHOT */}
      <section>
        <SectionHeader title="PFMEA DETECTION - 用于过程设计验证的潜在探测 (D)" subtitle="根据探测方法成熟度和探测机会对探测控制进行评级" />
        <div className="overflow-x-auto shadow-sm rounded-lg">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr>
                <TableHeader className="w-12">D</TableHeader>
                <TableHeader className="w-24">探测能力</TableHeader>
                <TableHeader>探测方法成熟度</TableHeader>
                <TableHeader className="w-48">探测机会</TableHeader>
                <TableHeader className="w-32">公司或产品系列示例</TableHeader>
              </tr>
            </thead>
            <tbody>
              <tr>
                <TableCell className="text-center font-bold bg-red-50">10</TableCell>
                <TableCell className="bg-red-50" rowSpan={2}>非常低</TableCell>
                <TableCell className="bg-red-50">尚未建立或有已知的测试或检验方法。</TableCell>
                <TableCell className="bg-red-50">不能或无法探测到失效模式。</TableCell>
                <TableCell className="bg-red-50 italic text-slate-400" rowSpan={10}>空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold bg-red-50">9</TableCell>
                <TableCell className="bg-red-50">测试或检验方法不可能探测到失效模式。</TableCell>
                <TableCell className="bg-red-50">通过任意或不定时的审核很难探测到失效模式。</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">8</TableCell>
                <TableCell rowSpan={2}>低</TableCell>
                <TableCell rowSpan={2}>测试或检验方法尚未经过实践证明为有效和可靠 (例如: 工厂在测试或检验方法方面没有或很少有经验，有关类似过程或本程序的测量可重复性和再现性分析结果接近边界值等)</TableCell>
                <TableCell>可以探测失效模式或失效起因的人工检验（视觉、触觉、听觉）方法，或使用人工检验（计数型或计量型）方式</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">7</TableCell>
                <TableCell>以设备为基础的检验方式（采用光学、蜂鸣器等装置的自动化或半自动化方式），或使用可以探测失效模式或失效起因的检验设备，例如坐标测量机</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">6</TableCell>
                <TableCell rowSpan={2}>中</TableCell>
                <TableCell rowSpan={2}>测试或检验方法已经经过实践证明为有效和可靠 (例如: 工厂在测试或检验方法方面具有经验，有关类似过程或本程序的测量可重复性和再现性结果可以接受等)</TableCell>
                <TableCell>可以检验失效模式或失效起因（包括产品样本检验）的人工检验（视觉、触觉、听觉）方法，或使用人工测量（计数型或计量型）方式</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">5</TableCell>
                <TableCell>以设备为基础的检验方式（采用光学、蜂鸣器等装置的半自动化方式），或使用可以探测失效模式或失效起因（包括产品样本检验）的检验设备，例如坐标测量机</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">4</TableCell>
                <TableCell rowSpan={3}>高</TableCell>
                <TableCell rowSpan={2}>已经过实践证明为有效或可靠的系统（例如：工厂在关于相同过程或本程序的测试或探测方法方面具备经验），测量可重复性和再现性结果可以接受等</TableCell>
                <TableCell>以设备为基础的自动化探测方法，其可以在下游探测到失效模式，进而避免进一步加工，或系统可以识别差异产品，并允许其在过程中自动前进，直到达到指定的不合格品卸载区。差异产品将在一个有效的系统内受到监视，避免这些产品从工厂内流出</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">3</TableCell>
                <TableCell>以设备为基础的自动化探测方法，其可以在工位上探测到失效模式，进而避免进一步加工，或系统可以识别差异产品并允许其在过程中自动前进，直到达到指定的不合格品卸载区。差异产品将在一个有效的系统内受到监视，避免这些产品从工厂内流出</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">2</TableCell>
                <TableCell>探测方法已经经过实践证明为有效或可靠 (例如:工厂在探测方法、防错确认措施方面具备经验等)</TableCell>
                <TableCell>以设备为基础的探测方法，其可以探测失效起因并避免出现失效模式（差异零件）</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold bg-green-50">1</TableCell>
                <TableCell className="bg-green-50">非常高</TableCell>
                <TableCell className="bg-green-50" colSpan={2}>根据设计或加工过程而不会实际出现失效模式，或者探测方法经过实践验证总是能够探测到失效模式或失效起因</TableCell>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. AP Table */}
      <section>
        <SectionHeader title="ACTION PRIORITY (AP) - 措施优先级" subtitle="基于 S, O, D 组合的风险优先级 (适用于 DFMEA 和 PFMEA)" />
        <div className="overflow-x-auto shadow-sm rounded-lg">
          <table className="w-full border-collapse bg-white text-center text-xs">
            <thead>
              <tr className="bg-emerald-700 text-white">
                <TableHeader className="w-24 bg-emerald-700 border-emerald-800">影响</TableHeader>
                <TableHeader className="w-12 bg-emerald-700 border-emerald-800">S</TableHeader>
                <TableHeader className="w-24 bg-emerald-600 border-emerald-700">对失效起因发生的预测</TableHeader>
                <TableHeader className="w-12 bg-emerald-600 border-emerald-700">O</TableHeader>
                <TableHeader className="w-24 bg-emerald-700 border-emerald-800">探测能力</TableHeader>
                <TableHeader className="w-12 bg-emerald-700 border-emerald-800">D</TableHeader>
                <TableHeader className="w-16 bg-emerald-600 border-emerald-700">措施优先级<br/>(AP)</TableHeader>
                <TableHeader className="w-16 bg-emerald-600 border-emerald-700">备注</TableHeader>
              </tr>
            </thead>
            <tbody>
              {apTableData.map((group, sIndex) => (
                <React.Fragment key={`s-group-${sIndex}`}>
                  {group.oGroups.map((oGroup, oIndex) => (
                    <React.Fragment key={`o-group-${sIndex}-${oIndex}`}>
                      {oGroup.dRows.map((dRow, dIndex) => (
                        <tr key={`d-row-${sIndex}-${oIndex}-${dIndex}`} className="hover:bg-slate-50">
                          {/* S Columns - Render only for the first row of the S group */}
                          {oIndex === 0 && dIndex === 0 && (
                            <>
                              <TableCell rowSpan={group.oGroups.reduce((acc, g) => acc + g.dRows.length, 0)} className="align-middle font-medium bg-slate-50">
                                {group.impact}
                              </TableCell>
                              <TableCell rowSpan={group.oGroups.reduce((acc, g) => acc + g.dRows.length, 0)} className="align-middle font-bold text-center bg-slate-50">
                                {group.s}
                              </TableCell>
                            </>
                          )}
                          
                          {/* O Columns - Render only for the first row of the O group */}
                          {dIndex === 0 && (
                            <>
                              <TableCell rowSpan={oGroup.dRows.length} className="align-middle text-center">
                                {oGroup.prediction}
                              </TableCell>
                              <TableCell rowSpan={oGroup.dRows.length} className="align-middle text-center font-medium">
                                {oGroup.o}
                              </TableCell>
                            </>
                          )}

                          {/* D Columns */}
                          <TableCell className="text-center">{dRow.ability}</TableCell>
                          <TableCell className="text-center">{dRow.d}</TableCell>
                          <TableCell className="text-center font-bold align-middle">
                            <span className={`inline-block w-6 h-6 leading-6 rounded-full text-xs
                              ${dRow.ap === 'H' ? 'bg-red-100 text-red-700' : 
                                dRow.ap === 'M' ? 'bg-yellow-100 text-yellow-700' : 
                                'bg-green-100 text-green-700'}`}>
                              {dRow.ap}
                            </span>
                          </TableCell>
                          <TableCell className="text-center"></TableCell>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500 px-2">
            注：本表严格遵循 AIAG & VDA FMEA 手册第一版 (2019) 标准。
            空白栏由使用人员填写。
          </p>
        </div>
      </section>
    </div>
  );
};
