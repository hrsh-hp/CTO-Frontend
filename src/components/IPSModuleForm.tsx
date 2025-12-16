
import React, { useState, useEffect, useMemo } from 'react';
import { useMasterData } from '../contexts/MasterDataContext';
import type { IPSReport, IPSModuleEntry } from '../types';
import { Save, ArrowLeft, Loader2, Zap, Plus, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchableSelect from './SearchableSelect';

interface IPSFormProps {
  onSubmit: (report: Omit<IPSReport, 'id' | 'submittedAt' | 'type'>) => void;
}

const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#005d8f] focus:ring-4 focus:ring-[#005d8f]/10 outline-none text-slate-700 placeholder:text-slate-400 text-sm transition-all duration-200";
const labelClass = "block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

// Helper to get CSRF token from Django cookies
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

const IPSModuleForm: React.FC<IPSFormProps> = ({ onSubmit }) => {
  // Use Context for dynamic data (populated from API or Constants)
  const { 
    officerHierarchy, 
    flatOfficers, 
    ipsModules, 
    ipsCompanies 
  } = useMasterData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Header State
  const [submissionDate, setSubmissionDate] = useState('');
  const [weekFrom, setWeekFrom] = useState('');
  const [weekTo, setWeekTo] = useState('');
  
  // Filtering & Location
  const [sectionalOfficerFilter, setSectionalOfficerFilter] = useState('');
  const [csi, setCsi] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // Entry State
  const [entries, setEntries] = useState<IPSModuleEntry[]>([]);
  
  // Current Line Item State
  const [currentModule, setCurrentModule] = useState(ipsModules[0]);
  const [currentCompany, setCurrentCompany] = useState(ipsCompanies[0]);
  const [currentCounts, setCurrentCounts] = useState({
    def: '',
    spare: '',
    spareAMC: '',
    defAMC: ''
  });

  // Auto-calculate Week range when Submission Date (Monday) changes
  useEffect(() => {
    if (submissionDate) {
      const date = new Date(submissionDate);
      if (date.getDay() !== 1) {
         // Validation handled in change handler or render
      } else {
        const from = new Date(date);
        const to = new Date(date);
        to.setDate(to.getDate() + 6);
        setWeekFrom(from.toISOString().split('T')[0]);
        setWeekTo(to.toISOString().split('T')[0]);
      }
    }
  }, [submissionDate]);

  // Dynamic CSI List based on hierarchy
  const availableCSIs = useMemo(() => {
    if (!sectionalOfficerFilter) return [];
    const officerNode = officerHierarchy.find(o => o.name === sectionalOfficerFilter);
    return officerNode ? officerNode.csis.map(c => c.name) : [];
  }, [sectionalOfficerFilter, officerHierarchy]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    const date = new Date(dateStr);
    if (date.getDay() !== 1) {
      alert("Submission Date must be a Monday.");
      setSubmissionDate('');
      setWeekFrom('');
      setWeekTo('');
      return;
    }
    setSubmissionDate(dateStr);
  };

  const handleOfficerChange = (e: { target: { value: string } }) => {
    setSectionalOfficerFilter(e.target.value);
    setCsi(''); // Reset CSI when filter changes
  };

  const handleAddEntry = () => {
    if (!currentModule || !currentCompany) return;
    
    // Check if entry exists to update instead of add
    const existingIndex = entries.findIndex(e => e.moduleType === currentModule && e.company === currentCompany);
    
    const qtyDef = parseInt(currentCounts.def || '0');
    const qtySpare = parseInt(currentCounts.spare || '0');
    const qtySpareAMC = parseInt(currentCounts.spareAMC || '0');
    const qtyDefAMC = parseInt(currentCounts.defAMC || '0');

    if (qtyDef < 0 || qtySpare < 0 || qtySpareAMC < 0 || qtyDefAMC < 0) {
      alert("Counts cannot be negative.");
      return;
    }

    const newEntry: IPSModuleEntry = {
      id: existingIndex >= 0 ? entries[existingIndex].id : Math.random().toString(36).substr(2, 9),
      moduleType: currentModule,
      company: currentCompany,
      qtyDefective: qtyDef,
      qtySpare: qtySpare,
      qtySpareAMC: qtySpareAMC,
      qtyDefectiveAMC: qtyDefAMC
    };

    if (existingIndex >= 0) {
        const newEntries = [...entries];
        newEntries[existingIndex] = newEntry;
        setEntries(newEntries);
    } else {
        setEntries(prev => [...prev, newEntry]);
    }
    setCurrentCounts({ def: '', spare: '', spareAMC: '', defAMC: '' });
  };

  // Matrix Helper: Get Data for Cell
  const getCellData = (module: string, company: string) => {
      return entries.find(e => e.moduleType === module && e.company === company);
  };

  // Calculate Column Totals (per Company)
  const columnTotals = useMemo(() => {
      const totals: Record<string, { def: number, spare: number, spareAMC: number, defAMC: number }> = {};
      ipsCompanies.forEach(comp => {
          totals[comp] = { def: 0, spare: 0, spareAMC: 0, defAMC: 0 };
          entries.filter(e => e.company === comp).forEach(e => {
              totals[comp].def += e.qtyDefective;
              totals[comp].spare += e.qtySpare;
              totals[comp].spareAMC += e.qtySpareAMC;
              totals[comp].defAMC += e.qtyDefectiveAMC;
          });
      });
      return totals;
  }, [entries, ipsCompanies]);

  // Calculate Row Totals (Grand Total Column)
  const getRowTotal = (module: string) => {
      const rowEntries = entries.filter(e => e.moduleType === module);
      return rowEntries.reduce((acc, curr) => ({
          def: acc.def + curr.qtyDefective,
          spare: acc.spare + curr.qtySpare,
          spareAMC: acc.spareAMC + curr.qtySpareAMC,
          defAMC: acc.defAMC + curr.qtyDefectiveAMC
      }), { def: 0, spare: 0, spareAMC: 0, defAMC: 0 });
  };

  // Grand Totals (Bottom Right)
  const grandTotal = entries.reduce((acc, curr) => ({
      def: acc.def + curr.qtyDefective,
      spare: acc.spare + curr.qtySpare,
      spareAMC: acc.spareAMC + curr.qtySpareAMC,
      defAMC: acc.defAMC + curr.qtyDefectiveAMC
  }), { def: 0, spare: 0, spareAMC: 0, defAMC: 0 });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionDate || !csi) {
      alert("Please fill in all required header fields.");
      return;
    }

    setIsSubmitting(true);

    // 1. Prepare data for internal React state (camelCase)
    const reportDataForApp = {
        submissionDate,
        weekFrom,
        weekTo,
        csi,
        remarks,
        entries
    };

    // 2. Prepare payload for Backend API (snake_case)
    const apiPayload = {
      submission_date: submissionDate,
      week_from: weekFrom,
      week_to: weekTo,
      csi: csi, // Backend expects Name (SlugRelatedField)
      remarks: remarks,
      entries: entries.map(entry => ({
        module_type: entry.moduleType,
        company: entry.company,
        qty_defective: entry.qtyDefective,
        qty_spare: entry.qtySpare,
        qty_spare_amc: entry.qtySpareAMC,
        qty_defective_amc: entry.qtyDefectiveAMC
      }))
    };

    try {
      const csrftoken = getCookie('csrftoken');
      
      // 3. Attempt to POST to the Python Backend
      const response = await fetch('/api/forms/ips-reports/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken || '',
        },
        credentials: 'include', // Important to send cookies/session
        body: JSON.stringify(apiPayload),
      });

      if (response.ok) {
        console.log("✅ Report successfully saved to Database via API.");
      } else {
        const errText = await response.text();
        console.warn(`⚠️ API Submission failed (${response.status}). Falling back to local state.`, errText);
      }
    } catch (error) {
      console.error("❌ Network error while submitting to API:", error);
    }

    // 4. Always update local UI (Optimistic update or offline fallback)
    setTimeout(() => {
        onSubmit(reportDataForApp);
        setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="max-w-[1400px] mx-auto mb-16 font-sans">
       <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#005d8f] mb-6 font-medium text-sm transition-colors pl-1 animate-enter">
        <ArrowLeft className="w-4 h-4" /> Back to Sectional Positions
      </Link>

      <div className="bg-white rounded-lg shadow-xl border border-slate-200 animate-enter delay-100 relative">
        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-y-10 translate-x-10 overflow-hidden rounded-lg">
            <Zap className="w-96 h-96 text-purple-600" />
        </div>

        <div className="bg-[#005d8f] text-white p-6 text-center border-b-4 border-orange-500 relative overflow-hidden rounded-t-lg">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-1 relative z-10">Western Railway</h1>
            <h2 className="text-xs md:text-sm font-medium opacity-80 uppercase tracking-[0.2em] relative z-10">Ahmedabad Division - S&T Department</h2>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between relative z-10">
            <h3 className="font-bold text-slate-700 uppercase flex items-center gap-2.5 text-sm md:text-base">
                <div className="p-1.5 bg-purple-50 rounded-md text-purple-600 border border-purple-100">
                    <Zap className="w-4 h-4" />
                </div>
                IPS Modules Position (WEEKLY)
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">FORM-IPS-03</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 relative z-10">
          {/* Section 1: Reporting Period */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-[#005d8f] border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#005d8f]"></span>
              1. Reporting Period & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="form-group">
                <label className={labelClass}>Submission Date (Monday) <span className="text-red-500">*</span></label>
                <input 
                    type="date" 
                    required 
                    className={inputClass} 
                    value={submissionDate} 
                    onChange={handleDateChange} 
                />
              </div>

              <div className="form-group">
                <label className={labelClass}>Week From</label>
                <input type="date" disabled className={`${inputClass} bg-slate-100 text-slate-500 cursor-not-allowed`} value={weekFrom} />
              </div>

              <div className="form-group">
                <label className={labelClass}>Week To</label>
                <input type="date" disabled className={`${inputClass} bg-slate-100 text-slate-500 cursor-not-allowed`} value={weekTo} />
              </div>

              <div className="form-group">
                <label className={labelClass}>Sectional Officer <span className="text-slate-400 text-[10px]">(Filter)</span></label>
                <SearchableSelect 
                  name="sectionalOfficerFilter" 
                  value={sectionalOfficerFilter} 
                  options={flatOfficers} 
                  onChange={handleOfficerChange} 
                  required={false}
                  placeholder="Filter CSIs..."
                />
              </div>

              <div className="form-group">
                <label className={labelClass}>CSI <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="csi" 
                  value={csi} 
                  options={availableCSIs} 
                  onChange={(e) => setCsi(e.target.value)} 
                  required 
                  placeholder={sectionalOfficerFilter ? "Select CSI..." : "Select Officer First"}
                />
              </div>

              <div className="form-group lg:col-span-3">
                <label className={labelClass}>Remarks / Action Plan (Non-AMC/ARC)</label>
                <textarea 
                    rows={1} 
                    className={inputClass} 
                    value={remarks} 
                    onChange={(e) => setRemarks(e.target.value)} 
                    placeholder="Enter details for equipment not covered under AMC..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Data Entry & Preview */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-purple-600 border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              2. Module Data Entry
            </h3>
            
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-8">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add / Update Entry
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3">
                        <label className={labelClass}>Module Type</label>
                        <SearchableSelect name="mod" value={currentModule} options={ipsModules} onChange={(e) => setCurrentModule(e.target.value)} />
                    </div>
                    <div className="md:col-span-3">
                        <label className={labelClass}>Company</label>
                        <SearchableSelect name="comp" value={currentCompany} options={ipsCompanies} onChange={(e) => setCurrentCompany(e.target.value)} />
                    </div>
                    <div className="md:col-span-1">
                        <label className={labelClass}>Def.</label>
                        <input type="number" min="0" className={inputClass} placeholder="0" value={currentCounts.def} onChange={(e) => setCurrentCounts(p => ({...p, def: e.target.value}))} />
                    </div>
                    <div className="md:col-span-1">
                        <label className={labelClass}>Spare</label>
                        <input type="number" min="0" className={inputClass} placeholder="0" value={currentCounts.spare} onChange={(e) => setCurrentCounts(p => ({...p, spare: e.target.value}))} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass} title="Good spare modules under AMC/ARC">Spare (AMC)</label>
                        <input type="number" min="0" className={inputClass} placeholder="0" value={currentCounts.spareAMC} onChange={(e) => setCurrentCounts(p => ({...p, spareAMC: e.target.value}))} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass} title="Defective modules under AMC/ARC">Def. (AMC)</label>
                        <input type="number" min="0" className={inputClass} placeholder="0" value={currentCounts.defAMC} onChange={(e) => setCurrentCounts(p => ({...p, defAMC: e.target.value}))} />
                    </div>
                    <div className="md:col-span-12 flex justify-end">
                        <button type="button" onClick={handleAddEntry} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                            <Plus className="w-4 h-4" /> Add to Sheet
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-300 shadow-sm bg-white">
                <div className="min-w-[1200px]">
                    <div className="bg-[#f0f9ff] border-b border-slate-300 p-2 text-center text-xs font-bold text-[#005d8f] uppercase tracking-widest">
                        Preview: IPS Modules Defective & Spare Position
                    </div>
                    <table className="w-full text-xs text-center border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300">
                                <th rowSpan={2} className="px-2 py-2 border-r border-slate-300 bg-slate-50 w-32">Module Details</th>
                                {ipsCompanies.map(company => (
                                    <th key={company} colSpan={4} className="px-2 py-1 border-r border-slate-300 border-b border-slate-200">
                                        {company}
                                    </th>
                                ))}
                                <th colSpan={4} className="px-2 py-1 bg-slate-200 border-b border-slate-300">TOTAL</th>
                            </tr>
                            <tr className="bg-slate-50 text-[10px] text-slate-600 font-medium border-b border-slate-300">
                                {ipsCompanies.map(company => (
                                    <React.Fragment key={company + '-subs'}>
                                        <th className="px-1 py-1 border-r border-slate-200 w-10">Def.</th>
                                        <th className="px-1 py-1 border-r border-slate-200 w-10">Spare</th>
                                        <th className="px-1 py-1 border-r border-slate-200 w-10">Sp AMC</th>
                                        <th className="px-1 py-1 border-r border-slate-300 w-10">Def AMC</th>
                                    </React.Fragment>
                                ))}
                                <th className="px-1 py-1 border-r border-slate-200 bg-slate-100 font-bold w-10">Def.</th>
                                <th className="px-1 py-1 border-r border-slate-200 bg-slate-100 font-bold w-10">Spare</th>
                                <th className="px-1 py-1 border-r border-slate-200 bg-slate-100 font-bold w-10">Sp AMC</th>
                                <th className="px-1 py-1 bg-slate-100 font-bold w-10">Def AMC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ipsModules.map((module, rowIndex) => {
                                const rowTotal = getRowTotal(module);
                                return (
                                    <tr key={module} className="border-b border-slate-200 hover:bg-yellow-50">
                                        <td className="px-2 py-2 font-bold text-left bg-slate-50 border-r border-slate-300 text-[11px] whitespace-nowrap">
                                            {module}
                                        </td>
                                        {ipsCompanies.map(company => {
                                            const data = getCellData(module, company);
                                            return (
                                                <React.Fragment key={`${module}-${company}`}>
                                                    <td className={`px-1 py-1 border-r border-slate-200 ${data?.qtyDefective ? 'text-red-600 font-bold bg-red-50' : 'text-slate-400'}`}>
                                                        {data?.qtyDefective || 0}
                                                    </td>
                                                    <td className={`px-1 py-1 border-r border-slate-200 ${data?.qtySpare ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-400'}`}>
                                                        {data?.qtySpare || 0}
                                                    </td>
                                                    <td className={`px-1 py-1 border-r border-slate-200 ${data?.qtySpareAMC ? 'text-green-700 font-bold bg-green-50' : 'text-slate-400'}`}>
                                                        {data?.qtySpareAMC || 0}
                                                    </td>
                                                    <td className={`px-1 py-1 border-r border-slate-300 ${data?.qtyDefectiveAMC ? 'text-orange-600 font-bold bg-orange-50' : 'text-slate-400'}`}>
                                                        {data?.qtyDefectiveAMC || 0}
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                        <td className="px-1 py-1 border-r border-slate-200 bg-slate-100 font-bold text-slate-800">{rowTotal.def}</td>
                                        <td className="px-1 py-1 border-r border-slate-200 bg-slate-100 font-bold text-slate-800">{rowTotal.spare}</td>
                                        <td className="px-1 py-1 border-r border-slate-200 bg-slate-100 font-bold text-slate-800">{rowTotal.spareAMC}</td>
                                        <td className="px-1 py-1 bg-slate-100 font-bold text-slate-800">{rowTotal.defAMC}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-slate-200 font-bold text-slate-800 border-t-2 border-slate-400">
                            <tr>
                                <td className="px-2 py-2 text-right uppercase text-[10px] tracking-wider border-r border-slate-400">TOTAL</td>
                                {ipsCompanies.map(company => (
                                    <React.Fragment key={company + '-foot'}>
                                        <td className="px-1 py-1 border-r border-slate-300 text-slate-800">{columnTotals[company].def}</td>
                                        <td className="px-1 py-1 border-r border-slate-300 text-slate-800">{columnTotals[company].spare}</td>
                                        <td className="px-1 py-1 border-r border-slate-300 text-slate-800">{columnTotals[company].spareAMC}</td>
                                        <td className="px-1 py-1 border-r border-slate-400 text-slate-800">{columnTotals[company].defAMC}</td>
                                    </React.Fragment>
                                ))}
                                <td className="px-1 py-1 border-r border-slate-300 bg-slate-300">{grandTotal.def}</td>
                                <td className="px-1 py-1 border-r border-slate-300 bg-slate-300">{grandTotal.spare}</td>
                                <td className="px-1 py-1 border-r border-slate-300 bg-slate-300">{grandTotal.spareAMC}</td>
                                <td className="px-1 py-1 bg-slate-300">{grandTotal.defAMC}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-100 p-2 rounded">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <p>This table previews the report. <strong>0</strong> is recorded for any empty cell.</p>
            </div>
          </div>

          <div className="pt-2">
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#005d8f] hover:bg-[#004a73] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-md shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
            >
              {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting IPS Report...
                  </>
              ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Submit IPS Report
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IPSModuleForm;
