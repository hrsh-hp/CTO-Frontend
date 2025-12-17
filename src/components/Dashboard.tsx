
import React, { useMemo, useState } from 'react';
import { INITIAL_FILTERS } from '../types';
import type { FailureReport, RelayRoomLog, MaintenanceReport, IPSReport, ACFailureReport, MovementReport, JPCReport, FilterState } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Filter, FileText, AlertTriangle, CheckCircle, MapPin, 
  RefreshCw, Key, Clock, AlertCircle, Wrench, ClipboardList, Download, Zap, ThermometerSnowflake, Navigation, FileCheck, Activity
} from 'lucide-react';
import { useMasterData } from '../contexts/MasterDataContext';
import SearchableSelect from './SearchableSelect';

interface DashboardProps {
  failures: FailureReport[];
  relayLogs: RelayRoomLog[];
  maintenanceLogs: MaintenanceReport[];
  ipsReports?: IPSReport[];
  acReports?: ACFailureReport[];
  movementReports?: MovementReport[];
  jpcReports?: JPCReport[];
}

const inputFilterClass = "w-full px-3 py-2 bg-white border border-slate-300 rounded focus:border-[#005d8f] focus:ring-1 focus:ring-[#005d8f] outline-none text-sm text-slate-700 transition-all";

const Dashboard: React.FC<DashboardProps> = ({ failures, relayLogs, maintenanceLogs, ipsReports = [], acReports = [], movementReports = [], jpcReports = [] }) => {
  const { 
    flatOfficers, flatCSIs, flatStations,
    makes, reasons, ipsModules, ipsCompanies 
  } = useMasterData();

  const [activeTab, setActiveTab] = useState<'failures' | 'relay' | 'maintenance' | 'ips' | 'ac' | 'movement' | 'jpc'>('failures');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // --- Helper: Calculate Duration ---
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

  // --- Dynamic Filter Logic ---
  
  const availableCSIs = useMemo(() => {
      if (filters.sectionalOfficer) {
          return flatCSIs.filter(c => c.parentOfficer === filters.sectionalOfficer).map(c => c.name);
      }
      return flatCSIs.map(c => c.name);
  }, [filters.sectionalOfficer, flatCSIs]);

  const availableStations = useMemo(() => {
    if (filters.csi) {
        return flatStations.filter(s => s.parentCSI === filters.csi).map(s => s.code);
    }
    if (filters.sectionalOfficer) {
        return flatStations.filter(s => s.parentOfficer === filters.sectionalOfficer).map(s => s.code);
    }
    return flatStations.map(s => s.code);
  }, [filters.sectionalOfficer, filters.csi, flatStations]);


  // --- Filter Logic ---
  const filteredFailures = useMemo(() => {
    return failures.filter(r => {
      if (filters.sectionalOfficer && r.sectionalOfficer !== filters.sectionalOfficer) return false;
      if (filters.csi && r.csi !== filters.csi) return false;
      if (filters.stationCode && r.postingStationCode !== filters.stationCode) return false;
      if (filters.route && r.route !== filters.route) return false;
      if (filters.make && r.make !== filters.make) return false;
      if (filters.reason && !r.reason.includes(filters.reason)) return false;
      if (filters.amc && r.amc !== filters.amc) return false;
      if (filters.warranty && r.warranty !== filters.warranty) return false;
      if (filters.dateRangeStart && r.date < filters.dateRangeStart) return false;
      if (filters.dateRangeEnd && r.date > filters.dateRangeEnd) return false;
      return true;
    });
  }, [failures, filters]);

  const filteredRelayLogs = useMemo(() => {
    return relayLogs.filter(r => {
      if (filters.sectionalOfficer && r.sectionalOfficer !== filters.sectionalOfficer) return false;
      if (filters.stationCode && r.location !== filters.stationCode) return false;
      if (filters.dateRangeStart && r.date < filters.dateRangeStart) return false;
      if (filters.dateRangeEnd && r.date > filters.dateRangeEnd) return false;
      if (filters.csi && r.csi !== filters.csi) return false;
      return true;
    });
  }, [relayLogs, filters]);

  const filteredMaintenanceLogs = useMemo(() => {
    return maintenanceLogs.filter(r => {
      if (filters.sectionalOfficer && r.sectionalOfficer !== filters.sectionalOfficer) return false;
      if (filters.stationCode && !r.section.includes(filters.stationCode)) return false;
      if (filters.dateRangeStart && r.date < filters.dateRangeStart) return false;
      if (filters.dateRangeEnd && r.date > filters.dateRangeEnd) return false;
      if (filters.csi && r.csi !== filters.csi) return false;
      return true;
    });
  }, [maintenanceLogs, filters]);

  const filteredIPSReports = useMemo(() => {
      return ipsReports.filter(r => {
        if (filters.csi && r.csi !== filters.csi) return false;
        if (filters.dateRangeStart && r.submissionDate < filters.dateRangeStart) return false;
        if (filters.dateRangeEnd && r.submissionDate > filters.dateRangeEnd) return false;
        return true;
      });
  }, [ipsReports, filters]);

  const filteredACReports = useMemo(() => {
    return acReports.filter(r => {
        if (filters.sectionalOfficer && r.sectionalOfficer !== filters.sectionalOfficer) return false;
        if (filters.csi && r.csi !== filters.csi) return false;
        if (filters.stationCode && r.locationCode !== filters.stationCode) return false;
        if (filters.dateRangeStart && r.date < filters.dateRangeStart) return false;
        if (filters.dateRangeEnd && r.date > filters.dateRangeEnd) return false;
        return true;
      });
  }, [acReports, filters]);

  const filteredMovementReports = useMemo(() => {
      return movementReports.filter(r => {
          if (filters.sectionalOfficer && r.sectionalOfficer !== filters.sectionalOfficer) return false;
          if (filters.csi && r.csi !== filters.csi) return false;
          // Filter by Move To or maybe extract station from designation? 
          // For now, let's filter by matching "Move To" with selected station
          if (filters.stationCode && r.moveTo !== filters.stationCode) return false;
          if (filters.dateRangeStart && r.date < filters.dateRangeStart) return false;
          if (filters.dateRangeEnd && r.date > filters.dateRangeEnd) return false;
          return true;
      });
  }, [movementReports, filters]);

  const filteredJPCReports = useMemo(() => {
      return jpcReports.filter(r => {
          if (filters.stationCode && r.station !== filters.stationCode) return false;
          if (filters.dateRangeStart && r.jpcDate < filters.dateRangeStart) return false;
          if (filters.dateRangeEnd && r.jpcDate > filters.dateRangeEnd) return false;
          return true;
      });
  }, [jpcReports, filters]);

  // --- Stats Calculation ---
  const failureStats = useMemo(() => {
    const total = filteredFailures.length;
    const amcCount = filteredFailures.filter(r => r.amc === 'Yes').length;
    const reasonCounts: Record<string, number> = {};
    filteredFailures.forEach(r => { 
      r.reason.forEach(reason => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
    });
    const commonReason = Object.entries(reasonCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const stationCounts: Record<string, number> = {};
    filteredFailures.forEach(r => { stationCounts[r.postingStationCode] = (stationCounts[r.postingStationCode] || 0) + 1 });
    const affectedStation = Object.entries(stationCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { total, amcCount, commonReason, affectedStation };
  }, [filteredFailures]);

   const relayStats = useMemo(() => {
     const total = filteredRelayLogs.length;
     const uniqueStations = new Set(filteredRelayLogs.map(r => r.location)).size;
     const csiCounts: Record<string, number> = {};
     filteredRelayLogs.forEach(r => { csiCounts[r.csi] = (csiCounts[r.csi] || 0) + 1 });
     const activeCSI = Object.entries(csiCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
     
     return { total, uniqueStations, activeCSI };
   }, [filteredRelayLogs]);

   const maintenanceStats = useMemo(() => {
      const total = filteredMaintenanceLogs.length;
      const typeCounts: Record<string, number> = {};
      filteredMaintenanceLogs.forEach(r => { typeCounts[r.maintenanceType] = (typeCounts[r.maintenanceType] || 0) + 1 });
      const mostCommonType = Object.entries(typeCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
      
      return { total, mostCommonType };
   }, [filteredMaintenanceLogs]);

   const acStats = useMemo(() => {
        const totalReports = filteredACReports.length;
        const underAMC = filteredACReports.filter(r => r.underAMC === 'Yes').length;
        const csiCounts: Record<string, number> = {};
        filteredACReports.forEach(r => { csiCounts[r.csi] = (csiCounts[r.csi] || 0) + 1 });
        const topCSI = Object.entries(csiCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
        return { totalReports, underAMC, topCSI };
   }, [filteredACReports]);

   const movementStats = useMemo(() => {
       const total = filteredMovementReports.length;
       const destCounts: Record<string, number> = {};
       filteredMovementReports.forEach(r => { destCounts[r.moveTo] = (destCounts[r.moveTo] || 0) + 1 });
       const topDest = Object.entries(destCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
       
       return { total, topDest };
   }, [filteredMovementReports]);

   const jpcStats = useMemo(() => {
       const totalReports = filteredJPCReports.length;
       const totalPoints = filteredJPCReports.reduce((acc, r) => acc + r.totalPoints, 0);
       const totalPending = filteredJPCReports.reduce((acc, r) => acc + r.pendingPoints, 0);
       const inspectedToday = filteredJPCReports.reduce((acc, r) => acc + r.inspectedToday, 0);
       return { totalReports, totalPoints, totalPending, inspectedToday };
   }, [filteredJPCReports]);


  const reasonData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredFailures.forEach(r => {
       r.reason.forEach(reason => {
        counts[reason] = (counts[reason] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredFailures]);

  const makeData = useMemo(() => {
      const counts: Record<string, number> = { Ravel: 0, Vighnharta: 0 };
      filteredFailures.forEach(r => counts[r.make] = (counts[r.make] || 0) + 1);
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredFailures]);

  // --- Handlers ---
  const handleFilterChange = (name: keyof FilterState, value: string) => {
    if (name === 'sectionalOfficer') {
         setFilters(prev => ({ ...prev, sectionalOfficer: value, csi: '', stationCode: '' }));
    } else if (name === 'csi') {
         setFilters(prev => ({ ...prev, csi: value, stationCode: '' }));
    } else {
         setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetFilters = () => setFilters(INITIAL_FILTERS);
  const toggleRow = (id: string) => setExpandedRow(expandedRow === id ? null : id);

  const handleExport = async () => {
    let url = '';
    const queryParams = new URLSearchParams();

    if (activeTab === 'ips') {
        if (filters.csi) queryParams.append('csi__name', filters.csi);
        if (filters.dateRangeStart) queryParams.append('submission_date__gte', filters.dateRangeStart);
        if (filters.dateRangeEnd) queryParams.append('submission_date__lte', filters.dateRangeEnd);
        url = `/api/forms/ips-reports/export-excel/?${queryParams.toString()}`;
    } else if (activeTab === 'relay') {
        if (filters.sectionalOfficer) queryParams.append('sectional_officer', filters.sectionalOfficer);
        if (filters.csi) queryParams.append('csi', filters.csi);
        if (filters.stationCode) queryParams.append('location__code', filters.stationCode);
        if (filters.dateRangeStart) queryParams.append('log_date__gte', filters.dateRangeStart);
        if (filters.dateRangeEnd) queryParams.append('log_date__lte', filters.dateRangeEnd);
        url = `/api/forms/relay-logs/export-excel/?${queryParams.toString()}`;
    } else if (activeTab === 'ac') {
        if (filters.sectionalOfficer) queryParams.append('sectional_officer', filters.sectionalOfficer);
        if (filters.csi) queryParams.append('csi', filters.csi);
        if (filters.stationCode) queryParams.append('location_code', filters.stationCode); 
        url = `/api/forms/ac-reports/export-excel/?${queryParams.toString()}`;
    } else if (activeTab === 'movement') {
        if (filters.sectionalOfficer) queryParams.append('sectional_officer', filters.sectionalOfficer);
        if (filters.csi) queryParams.append('csi', filters.csi);
        if (filters.dateRangeStart) queryParams.append('date__gte', filters.dateRangeStart);
        if (filters.dateRangeEnd) queryParams.append('date__lte', filters.dateRangeEnd);
        url = `/api/forms/movement-reports/export-excel/?${queryParams.toString()}`;
    } else if (activeTab === 'jpc') {
        if (filters.stationCode) queryParams.append('station', filters.stationCode);
        if (filters.dateRangeStart) queryParams.append('jpc_date__gte', filters.dateRangeStart);
        if (filters.dateRangeEnd) queryParams.append('jpc_date__lte', filters.dateRangeEnd);
        url = `/api/forms/jpc-reports/export-excel/?${queryParams.toString()}`;
    }

    if (url) {
        window.location.href = url;
        return;
    }

    // Default CSV Export for others
    let csvContent = '';
    let filename = '';
    
    if (activeTab === 'failures') {
      filename = `Failure_Reports_${new Date().toISOString().split('T')[0]}.csv`;
      const dataToExport = filteredFailures.map(r => ({
        ID: r.id,
        Date: r.date,
        Name: r.name,
        Designation: r.designation,
        Station: r.postingStationCode,
        Officer: r.sectionalOfficer,
        CSI: r.csi,
        To_Location: r.toLocation,
        Route: r.route,
        Make: r.make,
        Failure_Time: r.failureDateTime,
        Reasons: r.reason.join('; '),
        Remarks: r.remarks,
        AMC: r.amc,
        Warranty: r.warranty,
        Status: r.status
      }));
      if (!dataToExport.length) { alert("No data"); return; }
      const headers = Object.keys(dataToExport[0]);
      csvContent = [headers.join(','), ...dataToExport.map(row => headers.map(fieldName => `"${(row as any)[fieldName]?.toString().replace(/"/g, '""') || ''}"`).join(','))].join('\n');

    } else if (activeTab === 'maintenance') {
      filename = `Maintenance_Logs_${new Date().toISOString().split('T')[0]}.csv`;
      const dataToExport = filteredMaintenanceLogs.map(r => ({
        ID: r.id,
        Date: r.date,
        Officer: r.sectionalOfficer,
        CSI: r.csi,
        Section: r.section,
        Type: r.maintenanceType,
        Asset_Numbers: r.assetNumbers,
        Work_Description: r.workDescription,
        Remarks: r.remarks
      }));
      if (!dataToExport.length) { alert("No data"); return; }
      const headers = Object.keys(dataToExport[0]);
      csvContent = [headers.join(','), ...dataToExport.map(row => headers.map(fieldName => `"${(row as any)[fieldName]?.toString().replace(/"/g, '""') || ''}"`).join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const ipsGrandTotals = useMemo(() => {
      const totals: Record<string, number> = {};
      const colKeys = ipsCompanies.flatMap(c => [`${c}-def`, `${c}-spare`, `${c}-spareAMC`, `${c}-defAMC`]);
      colKeys.forEach(k => totals[k] = 0);
      
      let grandDef = 0;
      let grandSpare = 0;
      let grandSpareAMC = 0;
      let grandDefAMC = 0;

      filteredIPSReports.forEach(report => {
          report.entries.forEach(entry => {
              totals[`${entry.company}-def`] += entry.qtyDefective;
              totals[`${entry.company}-spare`] += entry.qtySpare;
              totals[`${entry.company}-spareAMC`] += entry.qtySpareAMC;
              totals[`${entry.company}-defAMC`] += entry.qtyDefectiveAMC;
              
              grandDef += entry.qtyDefective;
              grandSpare += entry.qtySpare;
              grandSpareAMC += entry.qtySpareAMC;
              grandDefAMC += entry.qtyDefectiveAMC;
          });
      });
      return { totals, grandDef, grandSpare, grandSpareAMC, grandDefAMC };
  }, [filteredIPSReports, ipsCompanies]);


  return (
    <div className="space-y-6 animate-enter font-sans pb-12">
      <div className="mb-6 border-b border-slate-200 pb-2 flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-light text-[#005d8f] uppercase tracking-wide">Office of Sr.DSTE</h2>
            <p className="text-slate-500 text-sm">Administrative Dashboard & Data Analysis</p>
        </div>
      </div>
      
      {/* Tab Selection */}
      <div className="flex justify-start md:justify-center mb-6 overflow-x-auto animate-enter delay-100 pb-2">
        <div className="bg-white p-1 rounded border border-slate-300 inline-flex whitespace-nowrap shadow-sm">
          <button 
            onClick={() => setActiveTab('failures')}
            className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-medium transition-all duration-300 ${activeTab === 'failures' ? 'bg-[#005d8f] text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <AlertCircle className="w-4 h-4" />
            Fire Alarm
          </button>
          <button 
             onClick={() => setActiveTab('relay')}
             className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-medium transition-all duration-300 ${activeTab === 'relay' ? 'bg-[#005d8f] text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Key className="w-4 h-4" />
            Relay Logs
          </button>
          <button 
             onClick={() => setActiveTab('maintenance')}
             className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-medium transition-all duration-300 ${activeTab === 'maintenance' ? 'bg-[#005d8f] text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Wrench className="w-4 h-4" />
            Maintenance
          </button>
           <button 
             onClick={() => setActiveTab('ips')}
             className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-medium transition-all duration-300 ${activeTab === 'ips' ? 'bg-[#005d8f] text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Zap className="w-4 h-4" />
            IPS Reports
          </button>
          <button 
             onClick={() => setActiveTab('ac')}
             className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-medium transition-all duration-300 ${activeTab === 'ac' ? 'bg-[#005d8f] text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <ThermometerSnowflake className="w-4 h-4" />
            AC Reports
          </button>
          <button 
             onClick={() => setActiveTab('movement')}
             className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-medium transition-all duration-300 ${activeTab === 'movement' ? 'bg-[#005d8f] text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Navigation className="w-4 h-4" />
            Movements
          </button>
          <button 
             onClick={() => setActiveTab('jpc')}
             className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-medium transition-all duration-300 ${activeTab === 'jpc' ? 'bg-[#005d8f] text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileCheck className="w-4 h-4" />
            JPC Done
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="relative z-30 bg-white rounded-lg shadow-sm border border-slate-200 animate-enter delay-200 mb-6">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-600" />
                <h3 className="font-semibold text-slate-700 text-sm uppercase">Data Filters</h3>
            </div>
            <div className="flex gap-2">
                 <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-[#005d8f] flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 rounded hover:shadow-sm transition-all">
                    <RefreshCw className="w-3 h-3" /> Reset
                </button>
                <button onClick={() => setIsFilterExpanded(!isFilterExpanded)} className="md:hidden text-[#005d8f] text-xs font-medium">
                  {isFilterExpanded ? 'Hide' : 'Show'}
                </button>
            </div>
        </div>
        
        <div className={`p-4 grid grid-cols-1 md:grid-cols-4 gap-3 ${isFilterExpanded ? 'block' : 'hidden md:grid'}`}>
            <SearchableSelect 
                name="sectionalOfficer"
                value={filters.sectionalOfficer}
                options={flatOfficers}
                onChange={e => handleFilterChange('sectionalOfficer', e.target.value)}
                placeholder="All Officers"
            />
             <SearchableSelect 
                name="csi"
                value={filters.csi}
                options={availableCSIs}
                onChange={e => handleFilterChange('csi', e.target.value)}
                placeholder="All CSIs"
            />
            <SearchableSelect 
                name="stationCode"
                value={filters.stationCode}
                options={availableStations}
                onChange={e => handleFilterChange('stationCode', e.target.value)}
                placeholder="All Stations"
            />
             <div className="col-span-1 md:col-span-1 grid grid-cols-2 gap-2">
               <input type="date" className={inputFilterClass} placeholder="Start Date" value={filters.dateRangeStart} onChange={e => handleFilterChange('dateRangeStart', e.target.value)} />
               <input type="date" className={inputFilterClass} placeholder="End Date" value={filters.dateRangeEnd} onChange={e => handleFilterChange('dateRangeEnd', e.target.value)} />
            </div>

            {activeTab === 'failures' && (
                <>
                    <SearchableSelect 
                        name="make"
                        value={filters.make}
                        options={makes}
                        onChange={e => handleFilterChange('make', e.target.value)}
                        placeholder="All Makes"
                    />
                    <SearchableSelect 
                        name="reason"
                        value={filters.reason}
                        options={reasons}
                        onChange={e => handleFilterChange('reason', e.target.value)}
                        placeholder="All Failure Types"
                    />
                    <select className={inputFilterClass} value={filters.amc} onChange={e => handleFilterChange('amc', e.target.value)}>
                        <option value="">AMC Status</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </>
            )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="relative z-10 animate-enter delay-200">
        {activeTab === 'failures' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Failures" value={failureStats.total} icon={<FileText className="text-red-600" />} subtext="Reported Incidents" />
                <StatCard title="Active AMC" value={failureStats.amcCount} icon={<CheckCircle className="text-green-600" />} subtext={`${failureStats.total > 0 ? ((failureStats.amcCount/failureStats.total)*100).toFixed(0) : 0}% Coverage`} />
                <StatCard title="Top Failure" value={failureStats.commonReason} icon={<AlertTriangle className="text-orange-500" />} isText />
                <StatCard title="Affected Station" value={failureStats.affectedStation} icon={<MapPin className="text-purple-600" />} isText />
            </div>
        )}
        {activeTab === 'relay' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Logs" value={relayStats.total} icon={<Key className="text-teal-600" />} subtext="Entries Recorded" />
                <StatCard title="Stations Accessed" value={relayStats.uniqueStations} icon={<MapPin className="text-blue-600" />} subtext="Unique Locations" />
                <StatCard title="Active CSI" value={relayStats.activeCSI} icon={<FileText className="text-purple-600" />} subtext="Most Active" isText />
                <StatCard title="Avg. Duration" value="45m" icon={<Clock className="text-orange-500" />} subtext="Est. Time Open" />
            </div>
        )}
        {activeTab === 'maintenance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Reports" value={maintenanceStats.total} icon={<ClipboardList className="text-amber-600" />} subtext="Work Logs" />
                <StatCard title="Top Activity" value={maintenanceStats.mostCommonType} icon={<Wrench className="text-blue-600" />} isText subtext="Most Frequent" />
                <StatCard title="Pending Review" value="0" icon={<Clock className="text-slate-400" />} subtext="All caught up" />
                <StatCard title="Compliance" value="100%" icon={<CheckCircle className="text-green-600" />} subtext="Up to date" />
            </div>
        )}
        {activeTab === 'ips' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Reports" value={filteredIPSReports.length} icon={<Zap className="text-purple-600" />} subtext="Weekly Submissions" />
                <StatCard title="Modules Tracked" value={ipsModules.length} icon={<FileText className="text-blue-600" />} subtext="Standard Types" />
                <StatCard title="Companies" value={ipsCompanies.length} icon={<CheckCircle className="text-green-600" />} subtext="Vendors Listed" />
            </div>
        )}
        {activeTab === 'ac' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Reports" value={acStats.totalReports} icon={<ThermometerSnowflake className="text-cyan-600" />} subtext="AC Fault Logs" />
                <StatCard title="AMC Covered" value={acStats.underAMC} icon={<CheckCircle className="text-green-600" />} subtext={`${acStats.totalReports > 0 ? ((acStats.underAMC/acStats.totalReports)*100).toFixed(0) : 0}% of faults`} />
                <StatCard title="Most Affected CSI" value={acStats.topCSI} icon={<AlertTriangle className="text-orange-500" />} isText />
            </div>
        )}
        {activeTab === 'movement' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Movements" value={movementStats.total} icon={<Navigation className="text-indigo-600" />} subtext="Logs Submitted" />
                <StatCard title="Top Destination" value={movementStats.topDest} icon={<MapPin className="text-green-600" />} isText />
                <StatCard title="Staff Active" value={new Set(filteredMovementReports.map(r => r.name)).size} icon={<FileText className="text-orange-500" />} subtext="Unique Persons" />
            </div>
        )}
        {activeTab === 'jpc' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Reports" value={jpcStats.totalReports} icon={<FileCheck className="text-blue-600" />} subtext="JPC Logs" />
                <StatCard title="Points Inspected" value={jpcStats.totalPoints} icon={<CheckCircle className="text-green-600" />} subtext="Total Tracked" />
                <StatCard title="Pending" value={jpcStats.totalPending} icon={<AlertTriangle className="text-orange-500" />} subtext="To be inspected" />
                <StatCard title="Done Today" value={jpcStats.inspectedToday} icon={<Activity className="text-purple-500" />} subtext="Daily Progress" />
            </div>
        )}
      </div>

      {/* Charts Row */}
      {activeTab === 'failures' && (
        <div className="relative z-0 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-enter delay-300">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 col-span-2 hover:border-[#005d8f] transition-colors">
                <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Top 5 Failure Reasons</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reasonData} layout="vertical" margin={{ left: 10, right: 30 }}>
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 10}} />
                            <Tooltip contentStyle={{ borderRadius: '4px' }} />
                            <Bar dataKey="value" fill="#005d8f" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1000} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-[#005d8f] transition-colors">
                <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Make Distribution</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={makeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" animationDuration={1000}>
                                {makeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'Ravel' ? '#005d8f' : '#f97316'} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}

      {/* Data Tables */}
      <div className="relative z-0 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden animate-enter delay-300">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-semibold text-slate-700 text-sm uppercase">
                {activeTab === 'failures' && 'Failure Reports'}
                {activeTab === 'relay' && 'Relay Room Logs'}
                {activeTab === 'maintenance' && 'Maintenance Logs'}
                {activeTab === 'ips' && 'Weekly IPS Reports'}
                {activeTab === 'ac' && 'AC Unit Reports'}
                {activeTab === 'movement' && 'SI/CSI Movement Reports'}
                {activeTab === 'jpc' && 'JPC Done Reports'}
                <span className="ml-2 text-slate-400 font-normal">
                    ({activeTab === 'failures' ? filteredFailures.length : 
                      activeTab === 'relay' ? filteredRelayLogs.length : 
                      activeTab === 'maintenance' ? filteredMaintenanceLogs.length : 
                      activeTab === 'ac' ? filteredACReports.length :
                      activeTab === 'movement' ? filteredMovementReports.length :
                      activeTab === 'jpc' ? filteredJPCReports.length :
                      filteredIPSReports.length})
                </span>
            </h3>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#005d8f] transition-all hover:-translate-y-0.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              {['ips', 'relay', 'ac', 'movement', 'jpc'].includes(activeTab) ? 'Export Excel' : 'Export CSV'}
            </button>
        </div>
        <div className="overflow-x-auto">
            {activeTab === 'failures' && (
                 <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Station</th>
                            <th className="px-6 py-3">Make</th>
                            <th className="px-6 py-3">Reasons</th>
                            <th className="px-6 py-3">Officer</th>
                            <th className="px-6 py-3 text-center">AMC</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFailures.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-8 text-slate-400">No reports found.</td></tr>
                        ) : (
                            filteredFailures.map((report) => (
                                <React.Fragment key={report.id}>
                                    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-500">#{report.id}</td>
                                        <td className="px-6 py-4">{report.date}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{report.postingStationCode}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-sm text-xs font-bold border ${report.make === 'Ravel' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                                {report.make}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={report.reason.join(', ')}>
                                            {report.reason.length > 1 ? `${report.reason[0]} +${report.reason.length - 1}` : report.reason[0]}
                                        </td>
                                        <td className="px-6 py-4">{report.sectionalOfficer}</td>
                                        <td className="px-6 py-4 text-center">
                                            {report.amc === 'Yes' ? <span className="text-green-600 font-bold text-xs">YES</span> : <span className="text-slate-400 text-xs">NO</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => toggleRow(report.id)} className="text-[#005d8f] hover:underline font-medium">
                                                {expandedRow === report.id ? 'Close' : 'View'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRow === report.id && (
                                        <tr className="bg-slate-50 border-b border-slate-200 animate-enter">
                                            <td colSpan={8} className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs">Reporter Details</h4>
                                                        <p><span className="text-slate-500">Name:</span> {report.name}</p>
                                                        <p><span className="text-slate-500">Desig:</span> {report.designation}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs">Incident Details</h4>
                                                        <p><span className="text-slate-500">Route:</span> {report.route}</p>
                                                        <p><span className="text-slate-500">Time:</span> {new Date(report.failureDateTime).toLocaleString('en-GB', { hour12: false })}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs">Remarks</h4>
                                                        <p className="italic text-slate-700">{report.remarks || 'None'}</p>
                                                        <p className="mt-2 text-xs text-slate-400">All reasons: {report.reason.join(', ')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            )}
            
            {activeTab === 'relay' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-center border-collapse text-slate-700 min-w-[1400px]">
                      <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-300">
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">Sr No</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">Date</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">Station</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">Opening Time</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">Closing Time</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">Dur (Hrs)</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">Dur (Min)</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">Reason for opening</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">CSI</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">Sr.No Open</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">Sr.No Close</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">D/L Open</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">D/L Close</th>
                              <th className="p-3 border-r border-slate-300 whitespace-nowrap">Code</th>
                          </tr>
                      </thead>
                      <tbody>
                          {(filteredRelayLogs).map((item, index) => {
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
                                      <td className="p-2 border-r border-slate-200 bg-slate-50"></td> 
                                      <td className="p-2 border-r border-slate-200 bg-slate-50"></td>
                                      <td className="p-2 border-r border-slate-200 bg-slate-100 text-[10px] font-bold text-slate-600">{item.openingCode}</td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
                </div>
            )}

            {activeTab === 'maintenance' && (
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Officer</th>
                            <th className="px-6 py-3">CSI</th>
                            <th className="px-6 py-3">Section</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Asset Nos.</th>
                            <th className="px-6 py-3">Work Done</th>
                            <th className="px-6 py-3">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                         {filteredMaintenanceLogs.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-8 text-slate-400">No maintenance logs found.</td></tr>
                        ) : (
                            filteredMaintenanceLogs.map((report) => (
                                <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-500">#{report.id}</td>
                                    <td className="px-6 py-4">{report.date}</td>
                                    <td className="px-6 py-4 text-slate-500">{report.sectionalOfficer}</td>
                                    <td className="px-6 py-4 text-slate-500">{report.csi}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{report.section}</td>
                                    <td className="px-6 py-4">
                                         <span className="px-2 py-1 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                            {report.maintenanceType}
                                         </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs text-xs font-mono text-slate-700">
                                        {report.assetNumbers || <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs text-xs text-slate-600">
                                        {report.workDescription || <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 truncate max-w-xs" title={report.remarks}>{report.remarks}</td>
                                </tr>
                            ))
                         )}
                    </tbody>
                </table>
            )}

             {activeTab === 'ips' && (
                <div className="overflow-x-auto pb-4">
                    <table className="w-full text-[10px] md:text-xs text-center border-collapse text-slate-700 min-w-[1500px]">
                        <thead>
                            <tr className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-300">
                                <th rowSpan={2} className="p-2 border-r border-slate-300 w-10">Sr No</th>
                                <th rowSpan={2} className="p-2 border-r border-slate-300 w-24">CSI</th>
                                <th rowSpan={2} className="p-2 border-r border-slate-300 w-48 text-left">Details of faulty modules</th>
                                {ipsCompanies.map(company => (
                                    <th key={company} colSpan={4} className="p-2 border-r border-slate-300 border-b border-slate-200">
                                        {company}
                                    </th>
                                ))}
                                <th colSpan={4} className="p-2 border-r border-slate-300 bg-slate-200">TOTAL</th>
                                <th rowSpan={2} className="p-2 w-48 bg-slate-50">Remarks</th>
                            </tr>
                            <tr className="bg-slate-50 text-[9px] font-bold text-slate-600 border-b border-slate-400">
                                {ipsCompanies.map(company => (
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
                            {filteredIPSReports.length === 0 ? (
                                <tr><td colSpan={ipsCompanies.length * 4 + 7} className="p-8 text-center text-slate-400 italic">No IPS Reports Found</td></tr>
                            ) : (
                                filteredIPSReports.map((report, rIndex) => {
                                    const reportTotals = ipsCompanies.map(c => ({
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
                                            {ipsModules.map((module, mIndex) => {
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
                                                        {ipsCompanies.map(company => {
                                                            const entry = report.entries.find(e => e.moduleType === module && e.company === company);
                                                            const def = entry?.qtyDefective || 0;
                                                            const spare = entry?.qtySpare || 0;
                                                            const spareAMC = entry?.qtySpareAMC || 0;
                                                            const defAMC = entry?.qtyDefectiveAMC || 0;
                                                            rowDef += def; rowSpare += spare; rowSpareAMC += spareAMC; rowDefAMC += defAMC;
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
                        {filteredIPSReports.length > 0 && (
                            <tfoot className="bg-[#005d8f] text-white font-bold border-t-4 border-orange-500">
                                <tr>
                                    <td colSpan={3} className="p-3 text-right uppercase tracking-widest text-xs border-r border-white/20">Grand Total</td>
                                    {ipsCompanies.map(company => (
                                        <React.Fragment key={`grand-${company}`}>
                                            <td className="p-2 border-r border-white/20">{ipsGrandTotals.totals[`${company}-def`]}</td>
                                            <td className="p-2 border-r border-white/20">{ipsGrandTotals.totals[`${company}-spare`]}</td>
                                            <td className="p-2 border-r border-white/20">{ipsGrandTotals.totals[`${company}-spareAMC`]}</td>
                                            <td className="p-2 border-r border-white/30">{ipsGrandTotals.totals[`${company}-defAMC`]}</td>
                                        </React.Fragment>
                                    ))}
                                    <td className="p-2 border-r border-white/20 bg-orange-500">{ipsGrandTotals.grandDef}</td>
                                    <td className="p-2 border-r border-white/20 bg-orange-500">{ipsGrandTotals.grandSpare}</td>
                                    <td className="p-2 border-r border-white/20 bg-orange-500">{ipsGrandTotals.grandSpareAMC}</td>
                                    <td className="p-2 border-r border-white/20 bg-orange-500">{ipsGrandTotals.grandDefAMC}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}

            {activeTab === 'ac' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Location</th>
                                <th className="px-6 py-3">AC Type</th>
                                <th className="px-6 py-3">Total Units</th>
                                <th className="px-6 py-3">Failed</th>
                                <th className="px-6 py-3">Failure Time</th>
                                <th className="px-6 py-3">AMC</th>
                                <th className="px-6 py-3">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredACReports.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-8 text-slate-400">No AC reports found.</td></tr>
                            ) : (
                                filteredACReports.map((report) => (
                                    <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">{report.date}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{report.locationCode}</td>
                                        <td className="px-6 py-4">{report.acType}</td>
                                        <td className="px-6 py-4">{report.totalACUnits}</td>
                                        <td className="px-6 py-4 text-red-600 font-bold">{report.totalFailCount}</td>
                                        <td className="px-6 py-4 text-xs">{new Date(report.failureDateTime).toLocaleString('en-GB', { hour12: false })}</td>
                                        <td className="px-6 py-4 text-center">
                                            {report.underAMC === 'Yes' ? <span className="text-green-600 font-bold text-xs">YES</span> : <span className="text-slate-400 text-xs">NO</span>}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate italic text-slate-500" title={report.remarks}>{report.remarks}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'movement' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Desig</th>
                                <th className="px-6 py-3">From</th>
                                <th className="px-6 py-3">To</th>
                                <th className="px-6 py-3">Work Done</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMovementReports.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No movement reports found.</td></tr>
                            ) : (
                                filteredMovementReports.map((report) => (
                                    <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-xs">{report.date}</td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{report.name}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{report.designation}</td>
                                        <td className="px-6 py-4 text-slate-600">{report.moveFrom}</td>
                                        <td className="px-6 py-4 font-bold text-indigo-700">{report.moveTo}</td>
                                        <td className="px-6 py-4 text-xs max-w-xs truncate" title={report.workDone}>{report.workDone}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'jpc' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-3">JPC Date</th>
                                <th className="px-6 py-3">Station</th>
                                <th className="px-6 py-3">Total Points</th>
                                <th className="px-6 py-3">Today</th>
                                <th className="px-6 py-3">Cumulated</th>
                                <th className="px-6 py-3">Pending</th>
                                <th className="px-6 py-3">Insp. By</th>
                                <th className="px-6 py-3">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJPCReports.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-8 text-slate-400">No JPC reports found.</td></tr>
                            ) : (
                                filteredJPCReports.map((report) => (
                                    <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">{report.jpcDate}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{report.station}</td>
                                        <td className="px-6 py-4">{report.totalPoints}</td>
                                        <td className="px-6 py-4 text-green-600 font-bold">+{report.inspectedToday}</td>
                                        <td className="px-6 py-4">{report.totalInspectedCum}</td>
                                        <td className="px-6 py-4 text-orange-600 font-medium">{report.pendingPoints}</td>
                                        <td className="px-6 py-4">{report.inspectionBy}</td>
                                        <td className="px-6 py-4 font-medium">{report.inspectorName}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ title, value, icon, subtext, isText = false }: { title: string, value: string | number, icon: React.ReactNode, subtext?: string, isText?: boolean }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-start justify-between hover:border-[#005d8f] hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
        <h3 className={`font-bold text-slate-800 ${isText ? 'text-lg leading-tight' : 'text-3xl'}`}>{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
    <div className="p-2 bg-slate-50 rounded border border-slate-100">{icon}</div>
  </div>
);

export default Dashboard;
