
  import React, { useState, useEffect } from 'react';
  import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
  import Header from './components/Header';
  import Home from './components/Home';
  import Login from './components/Login';
  import ReportForm from './components/ReportForm';
  import InspectionForm from './components/InspectionForm'; 
  import MaintenanceForm from './components/MaintenanceForm';
  import IPSModuleForm from './components/IPSModuleForm';
  import Dashboard from './components/Dashboard';
  import SectionalOfficers from './components/SectionalOfficers';
  import PolicyLetters from './components/PolicyLetters';
  import DataSheetView from './components/DataSheetView';
  import type { FailureReport, RelayRoomLog, MaintenanceReport, IPSReport } from './types';
  import { MOCK_FAILURES, MOCK_RELAY_LOGS, MOCK_MAINTENANCE_LOGS, MOCK_IPS_REPORTS } from './constants';
  import { CheckCircle, AlertOctagon, Copy } from 'lucide-react';
  import { MasterDataProvider } from './contexts/MasterDataContext';

  const MainLayout = () => {
    // --- State for Failure Reports ---
    const [failures, setFailures] = useState<FailureReport[]>(() => {
      const saved = localStorage.getItem('firewatch_failures');
      return saved ? JSON.parse(saved) : MOCK_FAILURES;
    });

    // --- State for Relay Room Logs ---
    const [relayLogs, setRelayLogs] = useState<RelayRoomLog[]>(() => {
      const saved = localStorage.getItem('firewatch_relay_logs');
      return saved ? JSON.parse(saved) : MOCK_RELAY_LOGS;
    });

    // --- State for Maintenance Logs ---
    const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceReport[]>(() => {
      const saved = localStorage.getItem('firewatch_maintenance_logs');
      return saved ? JSON.parse(saved) : MOCK_MAINTENANCE_LOGS;
    });

    // --- State for IPS Reports ---
    const [ipsReports, setIpsReports] = useState<IPSReport[]>(() => {
      const saved = localStorage.getItem('firewatch_ips_reports');
      return saved ? JSON.parse(saved) : MOCK_IPS_REPORTS;
    });

    // --- Auth State ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // --- Persistence ---
    useEffect(() => {
      localStorage.setItem('firewatch_failures', JSON.stringify(failures));
    }, [failures]);

    useEffect(() => {
      localStorage.setItem('firewatch_relay_logs', JSON.stringify(relayLogs));
    }, [relayLogs]);

    useEffect(() => {
      localStorage.setItem('firewatch_maintenance_logs', JSON.stringify(maintenanceLogs));
    }, [maintenanceLogs]);

    useEffect(() => {
      localStorage.setItem('firewatch_ips_reports', JSON.stringify(ipsReports));
    }, [ipsReports]);

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
      const newReport: FailureReport = {
        ...data,
        id: Math.floor(1000 + Math.random() * 9000).toString(),
        type: 'failure',
        status: 'Open',
        submittedAt: new Date().toISOString()
      };
      setFailures(prev => [newReport, ...prev]);
      triggerSuccess({
          title: "Success",
          message: "Failure report submitted successfully."
      });
    };

    const handleMaintenanceSubmit = (data: Omit<MaintenanceReport, 'id' | 'submittedAt' | 'type'>) => {
      const newReport: MaintenanceReport = {
        ...data,
        id: Math.floor(7000 + Math.random() * 3000).toString(),
        type: 'maintenance',
        submittedAt: new Date().toISOString()
      };
      setMaintenanceLogs(prev => [newReport, ...prev]);
      triggerSuccess({
          title: "Log Recorded",
          message: "Maintenance work has been successfully logged."
      });
    };

    const handleIPSSubmit = (data: Omit<IPSReport, 'id' | 'submittedAt' | 'type'>) => {
      const newReport: IPSReport = {
        ...data,
        id: Math.floor(8000 + Math.random() * 2000).toString(),
        type: 'ips',
        submittedAt: new Date().toISOString()
      };
      setIpsReports(prev => [newReport, ...prev]);
      triggerSuccess({
          title: "Report Submitted",
          message: "Weekly IPS module position has been successfully recorded."
      });
    };

    const handleRelaySubmit = (data: Omit<RelayRoomLog, 'id' | 'submittedAt' | 'type' | 'snOpening' | 'snClosing'>) => {
        // Logic to generate unique numbers between 1 and 150
        const dateLogs = relayLogs.filter(log => log.date === data.date);
        const usedSNs = new Set(dateLogs.flatMap(log => [log.snOpening, log.snClosing]));

        const generateUniqueSN = (): string => {
            let sn;
            let attempts = 0;
            do {
                // Generate number between 1 and 150
                sn = Math.floor(Math.random() * 150 + 1).toString(); 
                attempts++;
                if (attempts > 500) break; // Safety break
            } while (usedSNs.has(sn));
            
            usedSNs.add(sn); 
            return sn;
        };

        const snOpen = generateUniqueSN();
        const snClose = generateUniqueSN();

        const newReport: RelayRoomLog = {
            ...data,
            id: Math.floor(5000 + Math.random() * 4000).toString(),
            type: 'relayRoom',
            snOpening: snOpen,
            snClosing: snClose,
            submittedAt: new Date().toISOString()
        };
        setRelayLogs(prev => [newReport, ...prev]);
        
        triggerSuccess({
            title: "Log Recorded",
            message: "Relay room entry has been successfully logged.",
            codes: [
                { label: "Opening Serial No.", value: snOpen },
                { label: "Closing Serial No.", value: snClose }
            ],
            warning: "STRICT WARNING: Please record these serial numbers in the physical register immediately. Accuracy is mandatory."
        });
    };

    const triggerSuccess = (data: typeof successData) => {
        setSuccessData(data);
        setShowSuccess(true);
        
        // Only auto-dismiss if there are no codes to show (simple success)
        if (!data?.codes) {
            setTimeout(() => {
                handleDismiss();
            }, 2000);
        }
    };

    const handleDismiss = () => {
        setShowSuccess(false);
        // Navigate back to sectional positions list instead of admin dashboard for non-admin users
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
            
            <Route path="/view-data/failure" element={<DataSheetView data={failures} type="failure" />} />
            <Route path="/view-data/relay" element={<DataSheetView data={relayLogs} type="relay" />} />
            <Route path="/view-data/maintenance" element={<DataSheetView data={maintenanceLogs} type="maintenance" />} />
            <Route path="/view-data/ips" element={<DataSheetView data={ipsReports} type="ips" />} />

            <Route path="/admin" element={
              isAuthenticated ? (
                <Dashboard failures={failures} relayLogs={relayLogs} maintenanceLogs={maintenanceLogs} ipsReports={ipsReports} />
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

                {successData.codes && (
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

                        <div className="grid grid-cols-2 gap-4">
                            {successData.codes.map((code, idx) => (
                                <div key={idx} className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{code.label}</span>
                                    <span className="text-4xl font-mono font-bold text-slate-800">{code.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
