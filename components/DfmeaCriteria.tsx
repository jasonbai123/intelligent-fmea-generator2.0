import React from 'react';

const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th className={`p-2 border border-slate-300 bg-amber-600 text-white font-bold text-xs ${className || ''}`}>
    {children}
  </th>
);

const TableCell: React.FC<{ children: React.ReactNode; className?: string; rowSpan?: number }> = ({ children, className, rowSpan }) => (
  <td rowSpan={rowSpan} className={`p-2 border border-slate-300 text-xs text-slate-700 align-top whitespace-pre-wrap ${className || ''}`}>
    {children}
  </td>
);

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-4">
    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
      <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
      {title}
    </h3>
    {subtitle && <p className="text-xs text-slate-500 ml-3.5 mt-1">{subtitle}</p>}
  </div>
);

export const DfmeaCriteria: React.FC = () => {
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
        <h2 className="text-2xl font-bold text-slate-900">DFMEA 评分准则 (AIAG & VDA 1st Edition)</h2>
        <p className="text-slate-500 mt-2 text-sm">
          以下准则用于产品设计失效模式及影响分析（DFMEA）的风险评估，包含严重度 (S)、频度 (O)、探测度 (D) 及措施优先级 (AP)。
        </p>
      </header>

      {/* 1. Severity Table */}
      <section>
        <SectionHeader title="DFMEA SEVERITY - 严重度 (S)" subtitle="对失效影响最严重后果的评价" />
        <div className="overflow-x-auto shadow-sm rounded-lg">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr>
                <TableHeader className="w-12">S</TableHeader>
                <TableHeader className="w-24">影响</TableHeader>
                <TableHeader>严重度标准</TableHeader>
                <TableHeader className="w-48">公司或产品线示例</TableHeader>
              </tr>
            </thead>
            <tbody>
              <tr>
                <TableCell className="text-center font-bold bg-red-50">10</TableCell>
                <TableCell className="bg-red-50" rowSpan={2}>非常高</TableCell>
                <TableCell className="bg-red-50">影响到车辆和/或其他车辆的操作安全，驾驶员、乘客、道路使用者或行人的健康状况。（无预警）</TableCell>
                <TableCell className="bg-red-50 italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold bg-red-50">9</TableCell>
                <TableCell className="bg-red-50">不符合法规。（有预警）</TableCell>
                <TableCell className="bg-red-50 italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">8</TableCell>
                <TableCell rowSpan={2}>高</TableCell>
                <TableCell>在预期使用寿命内，失去正常驾驶所必需的车辆主要功能。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">7</TableCell>
                <TableCell>在预期使用寿命内，降低正常驾驶所必需的车辆主要功能。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">6</TableCell>
                <TableCell rowSpan={2}>中</TableCell>
                <TableCell>失去车辆次要功能。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">5</TableCell>
                <TableCell>降低车辆次要功能。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">4</TableCell>
                <TableCell rowSpan={3}>低</TableCell>
                <TableCell>外观、声音、振动、粗糙度或触感令人感觉非常不舒服。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">3</TableCell>
                <TableCell>外观、声音、振动、粗糙度或触感令人感觉中度的不舒服。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">2</TableCell>
                <TableCell>外观、声音、振动、粗糙度或触感令人略微感觉不舒服。</TableCell>
                <TableCell className="italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold bg-green-50">1</TableCell>
                <TableCell className="bg-green-50">非常低</TableCell>
                <TableCell className="bg-green-50">没有可察觉到的影响。</TableCell>
                <TableCell className="bg-green-50 italic text-slate-400">空白，由使用人员填写</TableCell>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Occurrence Table */}
      <section>
        <SectionHeader title="DFMEA OCCURRENCE - 频度 (O)" subtitle="对失效起因发生可能性的预测" />
        <div className="overflow-x-auto shadow-sm rounded-lg">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr>
                <TableHeader className="w-12">O</TableHeader>
                <TableHeader className="w-24">对失效起因发生的预测</TableHeader>
                <TableHeader className="w-32">每千件产品/车辆的故障率</TableHeader>
                <TableHeader className="w-24">基于时间的失效起因</TableHeader>
                <TableHeader>频度准则</TableHeader>
              </tr>
            </thead>
            <tbody>
              <tr>
                <TableCell className="text-center font-bold bg-red-50">10</TableCell>
                <TableCell className="bg-red-50">极高</TableCell>
                <TableCell className="bg-red-50">≥ 100/1000<br/>≥ 1/10</TableCell>
                <TableCell className="bg-red-50">每次</TableCell>
                <TableCell className="bg-red-50">在无操作经验和/或在运行条件不可控制的情形下的任何地方对新技术的首次应用。没有对产品进行验证和/或确认的经验。不存在标准，且尚未确定最佳实践。</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">9</TableCell>
                <TableCell rowSpan={2}>非常高</TableCell>
                <TableCell>50/1000<br/>1/20</TableCell>
                <TableCell>几乎每次</TableCell>
                <TableCell>在公司内首次应用具有技术创新或材料的设计。新应用，或工作周期/运行条件有改变。没有对产品进行验证和/或确认的经验。</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">8</TableCell>
                <TableCell>20/1000<br/>1/50</TableCell>
                <TableCell>每班超过一次</TableCell>
                <TableCell>在新应用内首次使用具备创新技术的设计产品或材料。新应用，或工作周期/运行条件有改变。没有对产品进行验证和/或确认的经验。</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">7</TableCell>
                <TableCell rowSpan={2}>高</TableCell>
                <TableCell>10/1000<br/>1/100</TableCell>
                <TableCell>每日超过一次</TableCell>
                <TableCell>根据相似技术和材料的新型设计。新应用，或工作周期/运行条件有改变。没有对产品进行验证和/或确认的经验。</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">6</TableCell>
                <TableCell>2/1000<br/>1/500</TableCell>
                <TableCell>每周超过一次</TableCell>
                <TableCell>应用现有技术和材料，与之设计相似。类似应用，工作周期或运行条件有改变。之前的测试或使用现场经验。存在标准和设计规则，但不足以确保不会出现失效起因。</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">5</TableCell>
                <TableCell rowSpan={2}>中</TableCell>
                <TableCell>0.5/1000<br/>1/2000</TableCell>
                <TableCell>每月超过一次</TableCell>
                <TableCell>应用成熟技术和材料，与之设计相比有细节上的变化。类似的应用，工作周期或运行条件。之前的测试或使用现场经验。</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">4</TableCell>
                <TableCell>0.1/1000<br/>1/10000</TableCell>
                <TableCell>每年超过一次</TableCell>
                <TableCell>与短期现场暴露几乎相同的设计。类似应用，工作周期或运行条件有细微变化。之前的测试或使用现场经验。之前设计和为新设计而进行的改变符合最佳实践、标准和规范要求。</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">3</TableCell>
                <TableCell>低</TableCell>
                <TableCell>0.01/1000<br/>1/100000</TableCell>
                <TableCell>每年一次</TableCell>
                <TableCell>对已知设计（相同应用，在工作周期或操作条件方面）和测试或类似运行条件下的现场经验的细微变化或成功测试程序的新设计。</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">2</TableCell>
                <TableCell>非常低</TableCell>
                <TableCell>≤ 0.001/1000<br/>1/1000000</TableCell>
                <TableCell>每年少于一次</TableCell>
                <TableCell>与长期现场暴露几乎相同的设计。相同应用，具备类似的工作周期或运行条件。在类似运行条件下的测试或使用现场经验。</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold bg-green-50">1</TableCell>
                <TableCell className="bg-green-50">极低</TableCell>
                <TableCell className="bg-green-50">通过预防控制避免失效</TableCell>
                <TableCell className="bg-green-50">从未发生</TableCell>
                <TableCell className="bg-green-50">失效通过预防控制消除，通过设计失效起因不可能发生。</TableCell>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Detection Table */}
      <section>
        <SectionHeader title="DFMEA DETECTION - 探测度 (D)" subtitle="用于产品设计验证的潜在探测能力" />
        <div className="overflow-x-auto shadow-sm rounded-lg">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr>
                <TableHeader className="w-12">D</TableHeader>
                <TableHeader className="w-24">探测能力</TableHeader>
                <TableHeader>探测方法成熟度</TableHeader>
                <TableHeader className="w-48">探测机会</TableHeader>
              </tr>
            </thead>
            <tbody>
              <tr>
                <TableCell className="text-center font-bold bg-red-50">10</TableCell>
                <TableCell className="bg-red-50" rowSpan={2}>非常低</TableCell>
                <TableCell className="bg-red-50">尚未制定测试过程。</TableCell>
                <TableCell className="bg-red-50">尚未确定测试方法</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold bg-red-50">9</TableCell>
                <TableCell className="bg-red-50">没有为探测失效模式或失效起因而特别设计测试方法。</TableCell>
                <TableCell className="bg-red-50">通过/不通过测试、失效测试、老化测试</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">8</TableCell>
                <TableCell rowSpan={2}>低</TableCell>
                <TableCell>新测试方法，尚未经过验证。</TableCell>
                <TableCell>通过/不通过测试、失效测试、老化测试</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">7</TableCell>
                <TableCell>新测试方法，尚未经过验证。</TableCell>
                <TableCell>通过/不通过测试</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">6</TableCell>
                <TableCell rowSpan={2}>中</TableCell>
                <TableCell>新的测试方法；未经验证；计划的时间足以在发布生产前修改生产工装。</TableCell>
                <TableCell>失效测试</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">5</TableCell>
                <TableCell>新的测试方法；未经验证。</TableCell>
                <TableCell>老化测试</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">4</TableCell>
                <TableCell rowSpan={3}>高</TableCell>
                <TableCell>已经验证的测试方法。</TableCell>
                <TableCell>通过/不通过测试</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">3</TableCell>
                <TableCell>已经验证的测试方法，该方法用于功能性验证或性能、质量、可靠性以及耐久性确认。</TableCell>
                <TableCell>失效测试</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold">2</TableCell>
                <TableCell>已经验证的测试方法。</TableCell>
                <TableCell>老化测试</TableCell>
              </tr>
              <tr>
                <TableCell className="text-center font-bold bg-green-50">1</TableCell>
                <TableCell className="bg-green-50">非常高</TableCell>
                <TableCell className="bg-green-50">之前测试证明不会出现失效模式或失效起因。</TableCell>
                <TableCell className="bg-green-50">或者探测方法经过实践验证总是能够探测到失效模式或失效起因。</TableCell>
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
              <tr className="bg-amber-700 text-white">
                <TableHeader className="w-24 bg-amber-700 border-amber-800">影响</TableHeader>
                <TableHeader className="w-12 bg-amber-700 border-amber-800">S</TableHeader>
                <TableHeader className="w-24 bg-amber-600 border-amber-700">对失效起因发生的预测</TableHeader>
                <TableHeader className="w-12 bg-amber-600 border-amber-700">O</TableHeader>
                <TableHeader className="w-24 bg-amber-700 border-amber-800">探测能力</TableHeader>
                <TableHeader className="w-12 bg-amber-700 border-amber-800">D</TableHeader>
                <TableHeader className="w-16 bg-amber-600 border-amber-700">措施优先级<br/>(AP)</TableHeader>
                <TableHeader className="w-16 bg-amber-600 border-amber-700">备注</TableHeader>
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
