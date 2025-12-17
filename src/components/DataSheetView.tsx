
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Table, Search } from 'lucide-react';
import type { FailureReport, RelayRoomLog, MaintenanceReport, IPSReport, ACFailureReport, DisconnectionReport, MovementReport, JPCReport } from '../types';
import { IPS_COMPANIES, IPS_MODULES } from '../constants';

interface DataSheetViewProps {
  data: (FailureReport | RelayRoomLog | MaintenanceReport | IPSReport | ACFailureReport | DisconnectionReport | MovementReport | JPCReport)[];
  type: 'failure' | 'relay' | 'maintenance' | 'ips' | 'ac' | 'disconnection' | 'movement' | 'jpc';
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
      case 'failure': return 'Fire Alarm Position (ADI Division)';
      case 'relay': return 'Relay Room Opening Position';
      case 'maintenance': return 'Maintenance Activity (Daily)';
      case 'ips': return 'IPS Module Position (2025-2026)';
      case 'ac': return 'AC Unit Failures (Weekly)';
      case 'disconnection': return 'Daily Disconnection Position';
      case 'movement': return 'Daily movement of SSE & JE Signal (ADI-Division)';
      case 'jpc': return 'JPC Inspection Position (ADI Div)';
    }
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return { h: '-', m: '-' };
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    
    let totalMins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (totalMins < 0) totalMins += 24 * 60; // Handle over midnight check
    
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    
    const formattedHours = `${hours}:${mins.toString().padStart(2, '0')}`;
    return { h: formattedHours, m: totalMins };
  };

  // Helper for status background colors
  const getStatusColor = (report: FailureReport) => {
      if (report.status === 'Resolved') return 'bg-green-100 text-green-900';
      return 'bg-red-100 text-red-900';
  };

  const getStatusContent = (report: FailureReport) => {
      if (report.status === 'Resolved') return 'OK';
      const dateStr = new Date(report.failureDateTime).toLocaleDateString('en-GB');
      const reasons = report.reason.join(', ');
      return `${dateStr} ${reasons} ${report.remarks}`;
  };

  const renderSimpleTable = () => {
      let headers: string[] = [];
      
      if (type === 'failure') {
          headers = ['Sr.No', 'Station', 'Route', 'Provided (Yes/No)', 'Date of Installation', 'Make', 'Failed Date & Remark'];
      } else if (type === 'maintenance') {
          headers = ['Date', 'Section', 'Type', 'Asset Nos', 'Work Done', 'Officer', 'Remarks'];
      } else if (type === 'ac') {
          headers = ['Date', 'Location', 'AC Type', 'Total Units', 'Failed', 'Fail Date/Time', 'AMC', 'Remarks'];
      } else if (type === 'movement') {
          headers = ['Sr. No.', 'Date', 'Name', 'Designation', 'From', 'To', 'Work Done'];
      } else if (type === 'jpc') {
          headers = ['JPC Date', 'Station', 'Total Points', 'Inspected Today', 'Total Cum.', 'Pending', 'Insp. By', 'Name'];
      }

      return (
        <table className="w-full text-sm text-left text-slate-600 border-collapse border border-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold text-xs uppercase">
                <tr>
                    {type === 'failure' && (
                        <th colSpan={7} className="px-4 py-2 border border-slate-300 text-center bg-[#005d8f] text-white text-lg">
                            Fire alarm Position {new Date().toLocaleDateString('en-GB')}
                        </th>
                    )}
                    {type === 'movement' && (
                        <th colSpan={7} className="px-4 py-2 border border-slate-300 text-center bg-yellow-50 text-sm">
                            Daily movement of SSE & JE Signal of ADI-Division
                        </th>
                    )}
                </tr>
                
                {/* Specific Header for Movement */}
                {type === 'movement' && (
                    <tr className="bg-slate-100">
                        <th rowSpan={2} className="px-4 py-2 border border-slate-300 w-16 text-center">Sr. No.</th>
                        <th rowSpan={2} className="px-4 py-2 border border-slate-300">Date</th>
                        <th rowSpan={2} className="px-4 py-2 border border-slate-300">Name</th>
                        <th rowSpan={2} className="px-4 py-2 border border-slate-300">Designation</th>
                        <th colSpan={2} className="px-4 py-1 border border-slate-300 text-center">Movement</th>
                        <th rowSpan={2} className="px-4 py-2 border border-slate-300 w-1/3">Work Done</th>
                    </tr>
                )}

                <tr>
                    {type === 'movement' ? (
                        <>
                            <th className="px-4 py-1 border border-slate-300 text-center text-[10px]">From</th>
                            <th className="px-4 py-1 border border-slate-300 text-center text-[10px]">To</th>
                        </>
                    ) : (
                        headers.map((h, i) => (
                            <th key={i} className="px-4 py-3 border border-slate-300 whitespace-nowrap bg-blue-100 text-black font-bold text-center">{h}</th>
                        ))
                    )}
                </tr>
            </thead>
            <tbody>
                {filteredData.length > 0 ? (
                    filteredData.map((item: any, index) => {
                        const rowClass = "px-4 py-2 border border-slate-300 hover:bg-slate-50 transition-colors text-center";
                        
                        if (type === 'failure') {
                            return (
                                <tr key={index}>
                                    <td className={rowClass}>{index + 1}</td>
                                    <td className={rowClass}>{item.postingStationCode}</td>
                                    <td className={rowClass}>{item.route} <span className="text-[10px] text-slate-500">(EI)</span></td>
                                    <td className={rowClass}>Yes</td>
                                    <td className={rowClass}>{item.date}</td>
                                    <td className={rowClass}>{item.make}</td>
                                    <td className={`${rowClass} ${getStatusColor(item)} font-medium`}>{getStatusContent(item)}</td>
                                </tr>
                            );
                        } else if (type === 'ac') {
                            return (
                                <tr key={index}>
                                    <td className={rowClass}>{item.date}</td>
                                    <td className={rowClass + " font-bold text-slate-700"}>{item.locationCode}</td>
                                    <td className={rowClass}>{item.acType}</td>
                                    <td className={rowClass}>{item.totalACUnits}</td>
                                    <td className={rowClass + " text-red-600 font-bold"}>{item.totalFailCount}</td>
                                    <td className={rowClass}>{new Date(item.failureDateTime).toLocaleString('en-GB', { hour12: false })}</td>
                                    <td className={rowClass}>{item.underAMC}</td>
                                    <td className={rowClass + " truncate max-w-xs italic text-slate-500 text-left"}>{item.remarks}</td>
                                </tr>
                            );
                        } else if (type === 'movement') {
                            return (
                                <tr key={index} className="hover:bg-slate-50">
                                    <td className={`${rowClass} font-medium`}>{index + 1}</td>
                                    <td className={`${rowClass}`}>{item.date}</td>
                                    <td className={`${rowClass} font-bold uppercase`}>{item.name}</td>
                                    <td className={`${rowClass}`}>{item.designation}</td>
                                    <td className={`${rowClass}`}>{item.moveFrom}</td>
                                    <td className={`${rowClass}`}>{item.moveTo}</td>
                                    <td className={`${rowClass} text-left`}>{item.workDone}</td>
                                </tr>
                            );
                        } else if (type === 'jpc') {
                            return (
                                <tr key={index}>
                                    <td className={rowClass}>{item.jpcDate}</td>
                                    <td className={rowClass + " font-bold text-slate-800"}>{item.station}</td>
                                    <td className={rowClass}>{item.totalPoints}</td>
                                    <td className={rowClass + " text-green-600 font-bold"}>+{item.inspectedToday}</td>
                                    <td className={rowClass}>{item.totalInspectedCum}</td>
                                    <td className={rowClass + " text-orange-600 font-medium"}>{item.pendingPoints}</td>
                                    <td className={rowClass}>{item.inspectionBy}</td>
                                    <td className={rowClass + " font-medium"}>{item.inspectorName}</td>
                                </tr>
                            );
                        } else {
                            return (
                                <tr key={index}>
                                    <td className={rowClass}>{item.date}</td>
                                    <td className={rowClass + " font-bold text-slate-700"}>{item.section}</td>
                                    <td className={rowClass}>
                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold uppercase">{item.maintenanceType}</span>
                                    </td>
                                    <td className={rowClass + " text-xs font-mono text-slate-800"}>
                                         {item.assetNumbers || "-"}
                                    </td>
                                    <td className={rowClass + " truncate max-w-xs text-xs text-left"}>{item.workDescription || "-"}</td>
                                    <td className={rowClass}>{item.sectionalOfficer}</td>
                                    <td className={rowClass + " truncate max-w-xs text-left"}>{item.remarks}</td>
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

  const renderRelayTable = () => {
      // Matches PDF: Sr No | Date | Station | Open | Close | Dur(Hrs) | Dur(Min) | Reason | CSI | SrNo Open | SrNo Close | D/L Open | D/L Close | Code
      const headers = [
          'Sr No', 'Date', 'Station', 'Opening Time', 'Closing Time', 'Duration in Hours', 'Duration in Min', 'Reason for opening', 'CSI', 'Sr.No For Open', 'Sr.No For Close', 'As per D/L Opening', 'As per D/L Closing', 'CODES for reasons'
      ];

      return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse text-slate-700 min-w-[1400px]">
                <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-300">
                        {headers.map((h, i) => (
                            <th key={i} className="p-3 border-r border-slate-300 whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {(filteredData as RelayRoomLog[]).map((item, index) => {
                        const duration = calculateDuration(item.openingTime, item.closingTime);
                        return (
                            <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                <td className="p-2 border-r border-slate-200 font-bold">{index + 1}</td>
                                <td className="p-2 border-r border-slate-200">{item.date}</td>
                                <td className="p-2 border-r border-slate-200 font-bold text-slate-900">{item.location}</td>
                                <td className="p-2 border-r border-slate-200 font-mono text-green-700">{item.openingTime}</td>
                                <td className="p-2 border-r border-slate-200 font-mono text-red-700">{item.closingTime}</td>
                                <td className="p-2 border-r border-slate-200 font-mono">{duration.h}</td>
                                <td className="p-2 border-r border-slate-200 font-mono">{duration.m}</td>
                                <td className="p-2 border-r border-slate-200 text-left max-w-xs truncate" title={item.remarks}>{item.remarks}</td>
                                <td className="p-2 border-r border-slate-200">{item.csi}</td>
                                <td className="p-2 border-r border-slate-200 font-bold">{item.snOpening}</td>
                                <td className="p-2 border-r border-slate-200 font-bold">{item.snClosing}</td>
                                <td className="p-2 border-r border-slate-200 bg-slate-50"></td> {/* Empty D/L Open */}
                                <td className="p-2 border-r border-slate-200 bg-slate-50"></td> {/* Empty D/L Close */}
                                <td className="p-2 border-r border-slate-200 bg-slate-100 text-[10px] font-bold text-slate-600">{item.openingCode}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      );
  };

  const renderDisconnectionTable = () => {
      // Group table by Reports because structure is nested
      if (filteredData.length === 0) {
          return <div className="p-12 text-center text-slate-400">No Disconnection Reports found.</div>;
      }

      return (
          <div className="space-y-8 p-6">
              {(filteredData as DisconnectionReport[]).map((report, rIndex) => (
                  <div key={report.id} className="border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-slate-100 p-3 border-b border-slate-300 flex justify-between items-center text-sm">
                          <div>
                              <span className="font-bold text-slate-700 uppercase mr-4">{report.csi}</span>
                              <span className="text-slate-500">Date: <span className="font-medium text-slate-800">{report.date}</span></span>
                          </div>
                          <div className="text-xs text-slate-400">Report #{rIndex + 1}</div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-center border-collapse text-slate-700 min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-300">
                                    <th rowSpan={2} className="px-2 py-2 border-r border-slate-300 w-12">Sr. No.</th>
                                    <th rowSpan={2} className="px-2 py-2 border-r border-slate-300 w-32 text-left">Section SI</th>
                                    <th colSpan={3} className="px-2 py-1 border-r border-slate-300 border-b border-slate-200">A (Replacement)</th>
                                    <th colSpan={3} className="px-2 py-1 border-r border-slate-300 border-b border-slate-200">B (Engg. Work)</th>
                                    <th colSpan={3} className="px-2 py-1 border-r border-slate-300 border-b border-slate-200">C (Maintenance)</th>
                                    <th colSpan={3} className="px-2 py-1 border-r border-slate-300 border-b border-slate-200">D (Failure)</th>
                                    <th colSpan={3} className="px-2 py-1 bg-slate-100 border-b border-slate-300">Total</th>
                                </tr>
                                <tr className="bg-white text-[10px] text-slate-600 font-medium border-b border-slate-300">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <React.Fragment key={i}>
                                            <th className="px-1 py-1 border-r border-slate-200 w-10">D</th>
                                            <th className="px-1 py-1 border-r border-slate-200 w-10">A</th>
                                            <th className={`px-1 py-1 border-r border-slate-300 w-10 ${i===5 ? 'bg-slate-50':''}`}>N</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {report.entries.map((entry, idx) => {
                                    const rowTotal = {
                                        d: entry.catA.d + entry.catB.d + entry.catC.d + entry.catD.d,
                                        a: entry.catA.a + entry.catB.a + entry.catC.a + entry.catD.a,
                                        n: entry.catA.n + entry.catB.n + entry.catC.n + entry.catD.n,
                                    };
                                    return (
                                        <tr key={entry.id || idx} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="border-r border-slate-200 text-slate-400">{idx + 1}</td>
                                            <td className="px-2 py-2 border-r border-slate-200 text-left font-bold text-slate-700">{entry.siName}</td>
                                            
                                            {/* A */}
                                            <td className="border-r border-slate-200">{entry.catA.d || '-'}</td>
                                            <td className="border-r border-slate-200">{entry.catA.a || '-'}</td>
                                            <td className="border-r border-slate-200 bg-red-50 text-red-700">{entry.catA.n || '-'}</td>
                                            {/* B */}
                                            <td className="border-r border-slate-200">{entry.catB.d || '-'}</td>
                                            <td className="border-r border-slate-200">{entry.catB.a || '-'}</td>
                                            <td className="border-r border-slate-200 bg-red-50 text-red-700">{entry.catB.n || '-'}</td>
                                            {/* C */}
                                            <td className="border-r border-slate-200">{entry.catC.d || '-'}</td>
                                            <td className="border-r border-slate-200">{entry.catC.a || '-'}</td>
                                            <td className="border-r border-slate-200 bg-red-50 text-red-700">{entry.catC.n || '-'}</td>
                                            {/* D */}
                                            <td className="border-r border-slate-200">{entry.catD.d || '-'}</td>
                                            <td className="border-r border-slate-200">{entry.catD.a || '-'}</td>
                                            <td className="border-r border-slate-200 bg-red-50 text-red-700">{entry.catD.n || '-'}</td>
                                            
                                            {/* Total */}
                                            <td className="border-r border-slate-200 bg-slate-50 font-bold">{rowTotal.d}</td>
                                            <td className="border-r border-slate-200 bg-slate-50 font-bold">{rowTotal.a}</td>
                                            <td className="bg-slate-50 font-bold text-red-700">{rowTotal.n}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  const renderIPSTable = () => {
      const grandTotals: Record<string, number> = {};
      const colKeys = IPS_COMPANIES.flatMap(c => [`${c}-def`, `${c}-spare`, `${c}-spareAMC`, `${c}-defAMC`]);
      colKeys.forEach(k => grandTotals[k] = 0);
      let grandTotalDef = 0;
      let grandTotalSpare = 0;
      let grandTotalSpareAMC = 0;
      let grandTotalDefAMC = 0;

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
                                    {IPS_MODULES.map((module, mIndex) => {
                                        let rowDef = 0, rowSpare = 0, rowSpareAMC = 0, rowDefAMC = 0;
                                        return (
                                            <tr key={`${report.id}-${module}`} className="border-b border-slate-100 hover:bg-yellow-50">
                                                {mIndex === 0 && (
                                                    <>
                                                        <td rowSpan={8} className="p-2 border-r border-slate-300 bg-white font-bold align-middle">{rIndex + 1}</td>
                                                        <td rowSpan={8} className="p-2 border-r border-slate-300 bg-white font-bold align-middle">{report.csi}</td>
                                                    </>
                                                )}
                                                
                                                <td className="p-2 text-left border-r border-slate-300 font-medium bg-slate-50">{module}</td>
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
                                                <td className="p-1 border-r border-slate-200 bg-slate-100 font-bold">{rowDef}</td>
                                                <td className="p-1 border-r border-slate-200 bg-slate-100 font-bold">{rowSpare}</td>
                                                <td className="p-1 border-r border-slate-200 bg-slate-100 font-bold">{rowSpareAMC}</td>
                                                <td className="p-1 border-r border-slate-300 bg-slate-100 font-bold">{rowDefAMC}</td>
                                            </tr>
                                        );
                                    })}
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
        {type === 'ips' ? renderIPSTable() : type === 'relay' ? renderRelayTable() : type === 'disconnection' ? renderDisconnectionTable() : (
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
