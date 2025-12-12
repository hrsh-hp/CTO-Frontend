
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Table, Search } from 'lucide-react';
import type { FailureReport, RelayRoomLog, MaintenanceReport, IPSReport } from '../types';
import { IPS_COMPANIES, IPS_MODULES } from '../constants';

interface DataSheetViewProps {
  data: (FailureReport | RelayRoomLog | MaintenanceReport | IPSReport)[];
  type: 'failure' | 'relay' | 'maintenance' | 'ips';
}

const DataSheetView: React.FC<DataSheetViewProps> = ({ data, type }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerTerm = searchTerm.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerTerm)
      )
    );
  }, [data, searchTerm]);

  const getTitle = () => {
    switch (type) {
      case 'failure': return 'Fire Alarm Position (Weekly)';
      case 'relay': return 'Relay Room Register (Daily)';
      case 'maintenance': return 'Maintenance Activity (Daily)';
      case 'ips': return 'IPS Module Position (2025-2026)';
    }
  };

  // --- Renderers for Simple Reports (Failure, Relay, Maintenance) ---
  const renderSimpleTable = () => {
      const headers = type === 'failure' 
        ? ['Date', 'Station', 'Make', 'Failure Reason', 'Officer', 'Status']
        : type === 'relay'
        ? ['Date', 'Station', 'Open Time', 'Close Time', 'Staff', 'Reason']
        : ['Date', 'Station', 'Type', 'Work Description', 'Staff', 'Officer'];

      return (
        <table className="w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs border-b border-slate-200">
                <tr>
                    {headers.map((h, i) => (
                        <th key={i} className="px-6 py-4 whitespace-nowrap">{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {filteredData.length > 0 ? (
                    filteredData.map((item: any, index) => {
                        const rowClass = "px-6 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors";
                        if (type === 'failure') {
                            return (
                                <tr key={index}>
                                    <td className={rowClass}>{item.date}</td>
                                    <td className={rowClass + " font-bold text-slate-700"}>{item.postingStationCode}</td>
                                    <td className={rowClass}>{item.make}</td>
                                    <td className={rowClass}>{Array.isArray(item.reason) ? item.reason.join(', ') : item.reason}</td>
                                    <td className={rowClass}>{item.sectionalOfficer}</td>
                                    <td className={rowClass}>
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${item.status === 'Open' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{item.status}</span>
                                    </td>
                                </tr>
                            );
                        } else if (type === 'relay') {
                            return (
                                <tr key={index}>
                                    <td className={rowClass}>{item.date}</td>
                                    <td className={rowClass + " font-bold text-slate-700"}>{item.location}</td>
                                    <td className={rowClass + " font-mono text-xs text-green-700"}>{item.openingTime}</td>
                                    <td className={rowClass + " font-mono text-xs text-red-700"}>{item.closingTime}</td>
                                    <td className={rowClass}>{item.name}</td>
                                    <td className={rowClass + " italic text-slate-500 truncate max-w-xs"}>{item.remarks}</td>
                                </tr>
                            );
                        } else {
                            return (
                                <tr key={index}>
                                    <td className={rowClass}>{item.date}</td>
                                    <td className={rowClass + " font-bold text-slate-700"}>{item.stationMaintained}</td>
                                    <td className={rowClass}>
                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold uppercase">{item.maintenanceType}</span>
                                    </td>
                                    <td className={rowClass + " truncate max-w-xs"}>{item.workDescription}</td>
                                    <td className={rowClass}>{item.name}</td>
                                    <td className={rowClass}>{item.sectionalOfficer}</td>
                                </tr>
                            );
                        }
                    })
                ) : (
                    <tr><td colSpan={headers.length} className="px-6 py-12 text-center text-slate-400">No data found.</td></tr>
                )}
            </tbody>
        </table>
      );
  };

  // --- Renderer for IPS Master Table ---
  const renderIPSTable = () => {
      // Helper to calculate grand totals for the footer
      const grandTotals: Record<string, number> = {};
      const colKeys = IPS_COMPANIES.flatMap(c => [`${c}-def`, `${c}-spare`, `${c}-spareAMC`, `${c}-defAMC`]);
      // Initialize totals
      colKeys.forEach(k => grandTotals[k] = 0);
      let grandTotalDef = 0;
      let grandTotalSpare = 0;
      let grandTotalSpareAMC = 0;
      let grandTotalDefAMC = 0;

      // Calculate totals based on filteredData
      (filteredData as IPSReport[]).forEach(report => {
          report.entries.forEach(entry => {
              grandTotals[`${entry.company}-def`] += entry.qtyDefective;
              grandTotals[`${entry.company}-spare`] += entry.qtySpare;
              grandTotals[`${entry.company}-spareAMC`] += entry.qtySpareAMC;
              grandTotals[`${entry.company}-defAMC`] += entry.qtyDefectiveAMC;
              
              grandTotalDef += entry.qtyDefective;
              grandTotalSpare += entry.qtySpare;
              grandTotalSpareAMC += entry.qtySpareAMC;
              grandTotalDefAMC += entry.qtyDefectiveAMC;
          });
      });

      return (
        <div className="overflow-x-auto pb-4">
            <table className="w-full text-[10px] md:text-xs text-center border-collapse text-slate-700 min-w-[1500px]">
                <thead>
                    {/* Header Row 1: Companies */}
                    <tr className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-300">
                        <th rowSpan={2} className="p-2 border-r border-slate-300 w-10">Sr No</th>
                        <th rowSpan={2} className="p-2 border-r border-slate-300 w-24">CSI</th>
                        <th rowSpan={2} className="p-2 border-r border-slate-300 w-48 text-left">Details of faulty modules</th>
                        {IPS_COMPANIES.map(company => (
                            <th key={company} colSpan={4} className="p-2 border-r border-slate-300 border-b border-slate-200">
                                {company}
                            </th>
                        ))}
                        <th colSpan={4} className="p-2 border-r border-slate-300 bg-slate-200">TOTAL</th>
                        <th rowSpan={2} className="p-2 w-48 bg-slate-50">Remarks / Action Plan</th>
                    </tr>
                    {/* Header Row 2: Sub-columns */}
                    <tr className="bg-slate-50 text-[9px] font-bold text-slate-600 border-b border-slate-400">
                        {IPS_COMPANIES.map(company => (
                            <React.Fragment key={`${company}-sub`}>
                                <th className="p-1 border-r border-slate-200 w-10" title="Defective">Def.</th>
                                <th className="p-1 border-r border-slate-200 w-10" title="Spare">Spare</th>
                                <th className="p-1 border-r border-slate-200 w-10" title="Spare under AMC">Sp AMC</th>
                                <th className="p-1 border-r border-slate-300 w-10" title="Defective Mod under AMC">Df AMC</th>
                            </React.Fragment>
                        ))}
                        <th className="p-1 border-r border-slate-200 bg-slate-100">Def.</th>
                        <th className="p-1 border-r border-slate-200 bg-slate-100">Spare</th>
                        <th className="p-1 border-r border-slate-200 bg-slate-100">Sp AMC</th>
                        <th className="p-1 border-r border-slate-300 bg-slate-100">Df AMC</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length === 0 ? (
                        <tr><td colSpan={IPS_COMPANIES.length * 4 + 7} className="p-8 text-center text-slate-400 italic">No IPS Reports Found</td></tr>
                    ) : (
                        (filteredData as IPSReport[]).map((report, rIndex) => {
                            // Calculate report-level totals
                            const reportTotals = IPS_COMPANIES.map(c => ({
                                def: report.entries.filter(e => e.company === c).reduce((a, b) => a + b.qtyDefective, 0),
                                spare: report.entries.filter(e => e.company === c).reduce((a, b) => a + b.qtySpare, 0),
                                spareAMC: report.entries.filter(e => e.company === c).reduce((a, b) => a + b.qtySpareAMC, 0),
                                defAMC: report.entries.filter(e => e.company === c).reduce((a, b) => a + b.qtyDefectiveAMC, 0)
                            }));
                            
                            const reportGrandTotal = report.entries.reduce((acc, curr) => ({
                                def: acc.def + curr.qtyDefective,
                                spare: acc.spare + curr.qtySpare,
                                spareAMC: acc.spareAMC + curr.qtySpareAMC,
                                defAMC: acc.defAMC + curr.qtyDefectiveAMC
                            }), { def: 0, spare: 0, spareAMC: 0, defAMC: 0 });

                            return (
                                <React.Fragment key={report.id}>
                                    {/* Render Module Rows */}
                                    {IPS_MODULES.map((module, mIndex) => {
                                        // Calculate Row Total (Horizontal)
                                        let rowDef = 0, rowSpare = 0, rowSpareAMC = 0, rowDefAMC = 0;
                                        
                                        return (
                                            <tr key={`${report.id}-${module}`} className="border-b border-slate-100 hover:bg-yellow-50">
                                                {/* Merged Cells for CSI and Sr No */}
                                                {mIndex === 0 && (
                                                    <>
                                                        <td rowSpan={8} className="p-2 border-r border-slate-300 bg-white font-bold align-middle">{rIndex + 1}</td>
                                                        <td rowSpan={8} className="p-2 border-r border-slate-300 bg-white font-bold align-middle">{report.csi}</td>
                                                    </>
                                                )}
                                                
                                                <td className="p-2 text-left border-r border-slate-300 font-medium bg-slate-50">{module}</td>
                                                
                                                {/* Data Cells */}
                                                {IPS_COMPANIES.map(company => {
                                                    const entry = report.entries.find(e => e.moduleType === module && e.company === company);
                                                    const def = entry?.qtyDefective || 0;
                                                    const spare = entry?.qtySpare || 0;
                                                    const spareAMC = entry?.qtySpareAMC || 0;
                                                    const defAMC = entry?.qtyDefectiveAMC || 0;
                                                    
                                                    rowDef += def;
                                                    rowSpare += spare;
                                                    rowSpareAMC += spareAMC;
                                                    rowDefAMC += defAMC;

                                                    return (
                                                        <React.Fragment key={`${report.id}-${module}-${company}`}>
                                                            <td className={`p-1 border-r border-slate-200 ${def > 0 ? 'text-red-600 font-bold bg-red-50' : 'text-slate-300'}`}>{def}</td>
                                                            <td className={`p-1 border-r border-slate-200 ${spare > 0 ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-300'}`}>{spare}</td>
                                                            <td className={`p-1 border-r border-slate-200 ${spareAMC > 0 ? 'text-green-700 font-bold bg-green-50' : 'text-slate-300'}`}>{spareAMC}</td>
                                                            <td className={`p-1 border-r border-slate-300 ${defAMC > 0 ? 'text-orange-600 font-bold bg-orange-50' : 'text-slate-300'}`}>{defAMC}</td>
                                                        </React.Fragment>
                                                    );
                                                })}
                                                
                                                {/* Row Totals */}
                                                <td className="p-1 border-r border-slate-200 bg-slate-100 font-bold">{rowDef}</td>
                                                <td className="p-1 border-r border-slate-200 bg-slate-100 font-bold">{rowSpare}</td>
                                                <td className="p-1 border-r border-slate-200 bg-slate-100 font-bold">{rowSpareAMC}</td>
                                                <td className="p-1 border-r border-slate-300 bg-slate-100 font-bold">{rowDefAMC}</td>
                                                
                                                {/* Merged Remarks */}
                                                {mIndex === 0 && (
                                                    <td rowSpan={8} className="p-2 text-left align-middle text-[10px] text-slate-500 italic bg-white border-l border-slate-300 max-w-xs break-words">
                                                        {report.remarks}
                                                        <div className="mt-1 text-[9px] text-slate-400 not-italic">Date: {report.submissionDate}</div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                    
                                    {/* Report Summary Row (The 8th row in block) */}
                                    <tr className="bg-slate-200 font-bold text-slate-800 border-b-4 border-slate-400">
                                        <td className="p-2 border-r border-slate-300 text-right uppercase tracking-wider">TOTAL</td>
                                        {reportTotals.map((tot, idx) => (
                                            <React.Fragment key={`rep-tot-${report.id}-${idx}`}>
                                                <td className="p-1 border-r border-slate-300">{tot.def}</td>
                                                <td className="p-1 border-r border-slate-300">{tot.spare}</td>
                                                <td className="p-1 border-r border-slate-300">{tot.spareAMC}</td>
                                                <td className="p-1 border-r border-slate-400">{tot.defAMC}</td>
                                            </React.Fragment>
                                        ))}
                                        <td className="p-1 border-r border-slate-300 bg-slate-300">{reportGrandTotal.def}</td>
                                        <td className="p-1 border-r border-slate-300 bg-slate-300">{reportGrandTotal.spare}</td>
                                        <td className="p-1 border-r border-slate-300 bg-slate-300">{reportGrandTotal.spareAMC}</td>
                                        <td className="p-1 border-r border-slate-300 bg-slate-300">{reportGrandTotal.defAMC}</td>
                                    </tr>
                                </React.Fragment>
                            );
                        })
                    )}
                </tbody>
                {/* Grand Footer */}
                {filteredData.length > 0 && (
                    <tfoot className="bg-[#005d8f] text-white font-bold border-t-4 border-orange-500">
                        <tr>
                            <td colSpan={3} className="p-3 text-right uppercase tracking-widest text-xs border-r border-white/20">Grand Total</td>
                            {IPS_COMPANIES.map(company => (
                                <React.Fragment key={`grand-${company}`}>
                                    <td className="p-2 border-r border-white/20">{grandTotals[`${company}-def`]}</td>
                                    <td className="p-2 border-r border-white/20">{grandTotals[`${company}-spare`]}</td>
                                    <td className="p-2 border-r border-white/20">{grandTotals[`${company}-spareAMC`]}</td>
                                    <td className="p-2 border-r border-white/30">{grandTotals[`${company}-defAMC`]}</td>
                                </React.Fragment>
                            ))}
                            <td className="p-2 border-r border-white/20 bg-orange-500">{grandTotalDef}</td>
                            <td className="p-2 border-r border-white/20 bg-orange-500">{grandTotalSpare}</td>
                            <td className="p-2 border-r border-white/20 bg-orange-500">{grandTotalSpareAMC}</td>
                            <td className="p-2 border-r border-white/20 bg-orange-500">{grandTotalDefAMC}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
      );
  };

  return (
    <div className="max-w-[1600px] mx-auto mb-16 font-sans animate-enter px-4">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#005d8f] font-medium text-sm transition-colors pl-1">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#005d8f] text-white p-6 border-b-4 border-orange-500 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
           
           <div className="flex items-center gap-4 relative z-10">
               <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                   <Table className="w-6 h-6 text-white" />
               </div>
               <div>
                   <h1 className="text-xl font-bold uppercase tracking-wider">{getTitle()}</h1>
                   <p className="text-xs opacity-80 uppercase tracking-widest">Master Data Sheet</p>
               </div>
           </div>

           <div className="relative z-10 w-full md:w-auto">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search data..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-md bg-white text-slate-700 text-sm focus:ring-2 focus:ring-orange-400 outline-none w-full md:w-64 shadow-lg text-slate-800"
                    />
                </div>
           </div>
        </div>

        {/* Table Container */}
        {type === 'ips' ? renderIPSTable() : (
            <div className="overflow-x-auto">
                {renderSimpleTable()}
            </div>
        )}
        
        <div className="bg-slate-50 p-3 border-t border-slate-200 text-xs text-slate-400 flex justify-between items-center">
            <span>Showing {filteredData.length} records</span>
            <span>Western Railway • Ahmedabad Division</span>
        </div>
      </div>
    </div>
  );
};

export default DataSheetView;
