import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import ReportForm from './components/ReportForm';
import InspectionForm from './components/InspectionForm'; 
import MaintenanceForm from './components/MaintenanceForm';
import IPSModuleForm from './components/IPSModuleForm';
import ACReportForm from './components/ACReportForm';
import DisconnectionForm from './components/DisconnectionForm';
import MovementForm from './components/MovementForm';
import JPCForm from './components/JPCForm';
import Dashboard from './components/Dashboard';
import SectionalOfficers from './components/SectionalOfficers';
import PolicyLetters from './components/PolicyLetters';
import DataSheetView from './components/DataSheetView';
import type { FailureReport, RelayRoomLog, MaintenanceReport, IPSReport, ACFailureReport, DisconnectionReport, MovementReport, JPCReport } from './types';
import { MOCK_FAILURES, MOCK_RELAY_LOGS, MOCK_MAINTENANCE_LOGS, MOCK_IPS_REPORTS, MOCK_AC_REPORTS } from './constants';
import { CheckCircle, AlertOctagon, Copy } from 'lucide-react';
import { MasterDataProvider } from './contexts/MasterDataContext';

// Helper to get CSRF token
const getCookie = (name: string) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const MainLayout = () => {
  // --- State for Reports ---
  const [failures, setFailures] = useState<FailureReport[]>([]);
  const [relayLogs, setRelayLogs] = useState<RelayRoomLog[]>(() => {
    const saved = localStorage.getItem('firewatch_relay_logs');
    return saved ? JSON.parse(saved) : MOCK_RELAY_LOGS;
  });
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceReport[]>(() => {
    const saved = localStorage.getItem('firewatch_maintenance_logs');
    return saved ? JSON.parse(saved) : MOCK_MAINTENANCE_LOGS;
  });
  const [ipsReports, setIpsReports] = useState<IPSReport[]>([]);
  const [acReports, setACReports] = useState<ACFailureReport[]>(() => {
      const saved = localStorage.getItem('firewatch_ac_reports');
      return saved ? JSON.parse(saved) : MOCK_AC_REPORTS;
  });
  const [disconnectionReports, setDisconnectionReports] = useState<DisconnectionReport[]>([]);
  const [movementReports, setMovementReports] = useState<MovementReport[]>([]);
  const [jpcReports, setJpcReports] = useState<JPCReport[]>([]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- Persistence ---
  useEffect(() => { localStorage.setItem('firewatch_relay_logs', JSON.stringify(relayLogs)); }, [relayLogs]);
  useEffect(() => { localStorage.setItem('firewatch_maintenance_logs', JSON.stringify(maintenanceLogs)); }, [maintenanceLogs]);
  useEffect(() => { localStorage.setItem('firewatch_ac_reports', JSON.stringify(acReports)); }, [acReports]);

  // --- API Fetching ---
  useEffect(() => {
    // 1. Failures
    const fetchFailures = async () => {
      try {
        const response = await fetch('/api/forms/failure-reports/');
        if (response.ok) {
          const apiData = await response.json();
          setFailures(apiData.map((r: any) => ({
            id: r.id.toString(), type: 'failure', name: r.name, date: r.date, sectionalOfficer: r.sectional_officer, csi: r.csi, designation: r.designation, postingStationCode: r.posting_station_code, toLocation: r.to_location, route: r.route, make: r.make, failureDateTime: r.failure_date_time, reason: Array.isArray(r.reason) ? r.reason : [], remarks: r.remarks, amc: r.amc, warranty: r.warranty, status: r.status || 'Open', submittedAt: r.submitted_at
          })));
        } else {
          const saved = localStorage.getItem('firewatch_failures');
          setFailures(saved ? JSON.parse(saved) : MOCK_FAILURES);
        }
      } catch (error) {
        const saved = localStorage.getItem('firewatch_failures');
        setFailures(saved ? JSON.parse(saved) : MOCK_FAILURES);
      }
    };
    
    // 2. IPS
    const fetchIPSReports = async () => {
      try {
        const response = await fetch('/api/forms/ips-reports/');
        if (response.ok) {
          const apiData = await response.json();
          setIpsReports(apiData.map((r: any) => ({
            id: r.id.toString(), type: 'ips', submissionDate: r.submission_date, weekFrom: r.week_from, weekTo: r.week_to, csi: r.csi, remarks: r.remarks, submittedAt: r.submitted_at, entries: r.entries.map((e: any) => ({ id: e.id.toString(), moduleType: e.module_type, company: e.company, qtyDefective: e.qty_defective, qtySpare: e.qty_spare, qtySpareAMC: e.qty_spare_amc, qtyDefectiveAMC: e.qty_defective_amc }))
          })));
        } else {
          const saved = localStorage.getItem('firewatch_ips_reports');
          if (saved) setIpsReports(JSON.parse(saved));
          else setIpsReports(MOCK_IPS_REPORTS);
        }
      } catch (error) {
        const saved = localStorage.getItem('firewatch_ips_reports');
        if (saved) setIpsReports(JSON.parse(saved));
        else setIpsReports(MOCK_IPS_REPORTS);
      }
    };

    // 3. Movements
    const fetchMovements = async () => {
        try {
            const response = await fetch('/api/forms/movement-reports/');
            if (response.ok) {
                const apiData = await response.json();
                setMovementReports(apiData.map((r: any) => ({
                    id: r.id.toString(), type: 'movement', date: r.date, name: r.name, designation: r.designation, sectionalOfficer: r.sectional_officer, csi: r.csi, moveFrom: r.move_from, moveTo: r.move_to, workDone: r.work_done, submittedAt: r.submitted_at
                })));
            }
        } catch (error) { console.warn("Failed to fetch movements", error); }
    };

    // 4. JPC
    const fetchJPC = async () => {
        try {
            const response = await fetch('/api/forms/jpc-reports/');
            if (response.ok) {
                const apiData = await response.json();
                setJpcReports(apiData.map((r: any) => ({
                    id: r.id.toString(), type: 'jpc', station: r.station, totalPoints: r.total_points, inspectedToday: r.inspected_today, jpcDate: r.jpc_date, totalInspectedCum: r.total_inspected_cum, pendingPoints: r.pending_points, inspectionBy: r.inspection_by, inspectorName: r.inspector_name, submittedAt: r.submitted_at
                })));
            }
        } catch (error) { console.warn("Failed to fetch JPC reports", error); }
    };

    fetchFailures();
    fetchIPSReports();
    fetchMovements();
    fetchJPC();
  }, []);

  const navigate = useNavigate();
  
  // --- Success Modal State ---
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
      title: string;
      message: string;
      codes?: { label: string, value: string }[];
      warning?: string;
  } | null>(null);

  // --- Handlers ---
  const handleFailureSubmit = (data: Omit<FailureReport, 'id' | 'status' | 'submittedAt' | 'type'>) => {
    const newReport: FailureReport = { ...data, id: Math.floor(1000 + Math.random() * 9000).toString(), type: 'failure', status: 'Open', submittedAt: new Date().toISOString() };
    setFailures(prev => [newReport, ...prev]);
    triggerSuccess({ title: "Success", message: "Failure report submitted successfully." });
  };

  const handleMaintenanceSubmit = (data: Omit<MaintenanceReport, 'id' | 'submittedAt' | 'type'>) => {
    const newReport: MaintenanceReport = { ...data, id: Math.floor(7000 + Math.random() * 3000).toString(), type: 'maintenance', submittedAt: new Date().toISOString() };
    setMaintenanceLogs(prev => [newReport, ...prev]);
    triggerSuccess({ title: "Log Recorded", message: "Maintenance work has been successfully logged." });
  };

  const handleIPSSubmit = (data: Omit<IPSReport, 'id' | 'submittedAt' | 'type'>) => {
    const newReport: IPSReport = { ...data, id: 'temp-' + Math.random().toString(36).substr(2, 9), type: 'ips', submittedAt: new Date().toISOString() };
    setIpsReports(prev => [newReport, ...prev]);
    triggerSuccess({ title: "Report Submitted", message: "Weekly IPS module position has been successfully recorded." });
  };

  const handleACSubmit = (data: Omit<ACFailureReport, 'id' | 'submittedAt' | 'type'>) => {
      const newReport: ACFailureReport = { ...data, id: 'ac-' + Math.floor(9000 + Math.random() * 1000).toString(), type: 'ac', submittedAt: new Date().toISOString() };
      setACReports(prev => [newReport, ...prev]);
      triggerSuccess({ title: "Report Submitted", message: "AC Unit Position has been successfully logged." });
  };

  const handleDisconnectionSubmit = (data: Omit<DisconnectionReport, 'id' | 'submittedAt' | 'type'>) => {
      const newReport: DisconnectionReport = { ...data, id: 'dc-' + Math.floor(9000 + Math.random() * 1000).toString(), type: 'disconnection', submittedAt: new Date().toISOString() };
      setDisconnectionReports(prev => [newReport, ...prev]);
      triggerSuccess({ title: "Report Submitted", message: "Daily Disconnection Position has been successfully logged." });
  };

  const handleMovementSubmit = async (data: Omit<MovementReport, 'id' | 'submittedAt' | 'type'>) => {
      const apiPayload = { 
          date: data.date, 
          name: data.name, 
          designation: data.designation, 
          sectional_officer: data.sectionalOfficer, 
          csi: data.csi, 
          move_from: data.moveFrom, 
          move_to: data.moveTo, 
          work_done: data.workDone 
      };
      try {
          const csrftoken = getCookie('csrftoken');
          await fetch('/api/forms/movement-reports/', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken || '' }, credentials: 'include', body: JSON.stringify(apiPayload) });
      } catch (err) { console.error("Network Error:", err); }
      const newReport: MovementReport = { ...data, id: 'mv-' + Math.floor(9000 + Math.random() * 1000).toString(), type: 'movement', submittedAt: new Date().toISOString() };
      setMovementReports(prev => [newReport, ...prev]);
      triggerSuccess({ title: "Report Submitted", message: "Daily Movement Report has been successfully logged." });
  };

  const handleJPCSubmit = async (data: Omit<JPCReport, 'id' | 'submittedAt' | 'type'>) => {
      const apiPayload = { 
          station: data.station, 
          total_points: data.totalPoints, 
          inspected_today: data.inspectedToday, 
          jpc_date: data.jpcDate, 
          total_inspected_cum: data.totalInspectedCum, 
          pending_points: data.pendingPoints, 
          inspection_by: data.inspectionBy, 
          inspector_name: data.inspectorName 
      };
      try {
          const csrftoken = getCookie('csrftoken');
          await fetch('/api/forms/jpc-reports/', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken || '' }, credentials: 'include', body: JSON.stringify(apiPayload) });
      } catch (err) { console.error("Network Error:", err); }
      
      const newReport: JPCReport = { ...data, id: 'jpc-' + Math.floor(9000 + Math.random() * 1000).toString(), type: 'jpc', submittedAt: new Date().toISOString() };
      setJpcReports(prev => [newReport, ...prev]);
      triggerSuccess({ title: "Report Submitted", message: "JPC Report has been successfully logged." });
  };

  const handleRelaySubmit = (data: Omit<RelayRoomLog, 'id' | 'submittedAt' | 'type'>) => {
      const newReport: RelayRoomLog = { ...data, id: Math.floor(5000 + Math.random() * 4000).toString(), type: 'relayRoom', submittedAt: new Date().toISOString() };
      setRelayLogs(prev => [newReport, ...prev]);
      triggerSuccess({ title: "Log Recorded", message: "Relay room entry has been successfully logged.", warning: "Ensure these details match the physical register." });
  };

  const triggerSuccess = (data: typeof successData) => {
      setSuccessData(data);
      setShowSuccess(true);
      if (!data?.codes) { setTimeout(() => { handleDismiss(); }, 2000); }
  };

  const handleDismiss = () => {
      setShowSuccess(false);
      navigate('/'); 
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 font-sans">
      <Header />
      
      <main className="container mx-auto px-4 pt-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sectional-officers" element={<SectionalOfficers />} />
          <Route path="/policies" element={<PolicyLetters />} />
          
          <Route path="/report-failure" element={<ReportForm onSubmit={handleFailureSubmit} />} />
          <Route path="/report-inspection" element={<InspectionForm onSubmit={handleRelaySubmit} />} />
          <Route path="/report-maintenance" element={<MaintenanceForm onSubmit={handleMaintenanceSubmit} />} />
          <Route path="/report-ips" element={<IPSModuleForm onSubmit={handleIPSSubmit} />} />
          <Route path="/report-ac" element={<ACReportForm onSubmit={handleACSubmit} />} />
          <Route path="/report-disconnection" element={<DisconnectionForm onSubmit={handleDisconnectionSubmit} />} />
          <Route path="/report-movement" element={<MovementForm onSubmit={handleMovementSubmit} />} />
          <Route path="/report-jpc" element={<JPCForm onSubmit={handleJPCSubmit} />} />
          
          <Route path="/view-data/failure" element={<DataSheetView data={failures} type="failure" />} />
          <Route path="/view-data/relay" element={<DataSheetView data={relayLogs} type="relay" />} />
          <Route path="/view-data/maintenance" element={<DataSheetView data={maintenanceLogs} type="maintenance" />} />
          <Route path="/view-data/ips" element={<DataSheetView data={ipsReports} type="ips" />} />
          <Route path="/view-data/ac" element={<DataSheetView data={acReports} type="ac" />} />
          <Route path="/view-data/disconnection" element={<DataSheetView data={disconnectionReports} type="disconnection" />} />
          <Route path="/view-data/movement" element={<DataSheetView data={movementReports} type="movement" />} />
          <Route path="/view-data/jpc" element={<DataSheetView data={jpcReports} type="jpc" />} />

          <Route path="/admin" element={
            isAuthenticated ? (
              <Dashboard 
                  failures={failures} 
                  relayLogs={relayLogs} 
                  maintenanceLogs={maintenanceLogs} 
                  ipsReports={ipsReports}
                  acReports={acReports}
                  movementReports={movementReports}
                  jpcReports={jpcReports}
              />
            ) : (
              <Login onLogin={() => setIsAuthenticated(true)} />
            )
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Success Overlay */}
      {showSuccess && successData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-md w-full transform transition-all scale-100 overflow-hidden">
              
              <div className="w-full bg-slate-50 p-6 flex flex-col items-center border-b border-slate-100">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">{successData.title}</h3>
                  <p className="text-slate-500 mt-2">{successData.message}</p>
              </div>

              <div className="w-full p-6 bg-white space-y-6">
                    {successData.warning && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-left rounded-r-md">
                            <div className="flex items-start gap-3">
                                <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800 font-semibold leading-relaxed">
                                    {successData.warning}
                                </p>
                            </div>
                        </div>
                    )}

                  {successData.codes && (
                      <div className="grid grid-cols-2 gap-4">
                          {successData.codes.map((code, idx) => (
                              <div key={idx} className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col items-center">
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{code.label}</span>
                                  <span className="text-4xl font-mono font-bold text-slate-800">{code.value}</span>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              <div className="w-full p-4 bg-slate-50 border-t border-slate-100">
                    {successData.codes ? (
                        <button 
                            onClick={handleDismiss}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            I have noted these codes
                        </button>
                    ) : (
                        <p className="text-sm text-blue-600 font-medium">Redirecting to Home...</p>
                    )}
              </div>

          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <MasterDataProvider>
      <HashRouter>
        <MainLayout />
      </HashRouter>
    </MasterDataProvider>
  );
};

export default App;