
import React, { useState, useMemo } from 'react';
import { useMasterData } from '../contexts/MasterDataContext';
import type { DisconnectionReport, DisconnectionEntry } from '../types';
import { Save, ArrowLeft, Loader2, Plus, Activity, Train, Trash2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchableSelect from './SearchableSelect';

interface DisconnectionFormProps {
  onSubmit: (report: Omit<DisconnectionReport, 'id' | 'submittedAt' | 'type'>) => void;
}

const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#005d8f] focus:ring-4 focus:ring-[#005d8f]/10 outline-none text-slate-700 placeholder:text-slate-400 text-sm transition-all duration-200";
const labelClass = "block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";
const smallInputClass = "w-full px-2 py-1.5 bg-white border border-slate-300 rounded focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-slate-700 text-center font-medium text-sm";

const DisconnectionForm: React.FC<DisconnectionFormProps> = ({ onSubmit }) => {
  const { flatOfficers, flatCSIs, flatSIs } = useMasterData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Header State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sectionalOfficerFilter, setSectionalOfficerFilter] = useState('');
  const [csi, setCsi] = useState('');
  
  // Entry State (The List)
  const [entries, setEntries] = useState<DisconnectionEntry[]>([]);

  // Current Entry Input State
  const [currentSI, setCurrentSI] = useState('');
  const [currentData, setCurrentData] = useState({
      catA: { d: '', a: '', n: '' },
      catB: { d: '', a: '', n: '' },
      catC: { d: '', a: '', n: '' },
      catD: { d: '', a: '', n: '' },
  });

  // Filter Logic for CSI
  const availableCSIs = useMemo(() => {
    if (sectionalOfficerFilter) {
      return flatCSIs.filter(c => c.parentOfficer === sectionalOfficerFilter).map(c => c.name);
    }
    return flatCSIs.map(c => c.name);
  }, [sectionalOfficerFilter, flatCSIs]);

  // Filter Logic for SIs based on CSI
  const availableSIs = useMemo(() => {
      if (!csi) return [];
      return flatSIs.filter(si => si.parentCSI === csi).map(s => s.name);
  }, [csi, flatSIs]);

  // Helper to handle input changes for categories
  const handleCountChange = (category: 'catA' | 'catB' | 'catC' | 'catD', field: 'd' | 'a' | 'n', val: string) => {
      setCurrentData(prev => ({
          ...prev,
          [category]: { ...prev[category], [field]: val }
      }));
  };

  const handleAddEntry = () => {
      if (!currentSI) {
          alert("Please select a Section SI.");
          return;
      }

      // Check if entry exists to update
      const existingIndex = entries.findIndex(e => e.siName === currentSI);

      const parseVal = (val: string) => Math.max(0, parseInt(val) || 0);

      const newEntry: DisconnectionEntry = {
          id: existingIndex >= 0 ? entries[existingIndex].id : Math.random().toString(36).substr(2, 9),
          siName: currentSI,
          catA: { d: parseVal(currentData.catA.d), a: parseVal(currentData.catA.a), n: parseVal(currentData.catA.n) },
          catB: { d: parseVal(currentData.catB.d), a: parseVal(currentData.catB.a), n: parseVal(currentData.catB.n) },
          catC: { d: parseVal(currentData.catC.d), a: parseVal(currentData.catC.a), n: parseVal(currentData.catC.n) },
          catD: { d: parseVal(currentData.catD.d), a: parseVal(currentData.catD.a), n: parseVal(currentData.catD.n) },
      };

      if (existingIndex >= 0) {
          const updated = [...entries];
          updated[existingIndex] = newEntry;
          setEntries(updated);
      } else {
          setEntries(prev => [...prev, newEntry]);
      }

      // Reset inputs but keep SI for quick successive entry or clear? 
      // Usually clearing SI forces user to pick next.
      setCurrentSI('');
      setCurrentData({
          catA: { d: '', a: '', n: '' },
          catB: { d: '', a: '', n: '' },
          catC: { d: '', a: '', n: '' },
          catD: { d: '', a: '', n: '' },
      });
  };

  const handleDeleteEntry = (siName: string) => {
      setEntries(prev => prev.filter(e => e.siName !== siName));
  };

  // Calculations for Footer Totals
  const colTotals = useMemo(() => {
      const totals = {
          catA: { d: 0, a: 0, n: 0 },
          catB: { d: 0, a: 0, n: 0 },
          catC: { d: 0, a: 0, n: 0 },
          catD: { d: 0, a: 0, n: 0 },
          grand: { d: 0, a: 0, n: 0 }
      };

      entries.forEach(e => {
          (['catA', 'catB', 'catC', 'catD'] as const).forEach(cat => {
              totals[cat].d += e[cat].d;
              totals[cat].a += e[cat].a;
              totals[cat].n += e[cat].n;
              
              totals.grand.d += e[cat].d;
              totals.grand.a += e[cat].a;
              totals.grand.n += e[cat].n;
          });
      });
      return totals;
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !csi) {
        alert("Please select Date and CSI.");
        return;
    }
    
    if (entries.length === 0) {
        if (!confirm("No entries added. Submit empty report?")) return;
    }
    
    setIsSubmitting(true);
    
    const officer = sectionalOfficerFilter || flatCSIs.find(c => c.name === csi)?.parentOfficer || '';

    const report: Omit<DisconnectionReport, 'id' | 'submittedAt' | 'type'> = {
        date,
        csi,
        sectionalOfficer: officer,
        entries
    };

    setTimeout(() => {
        onSubmit(report);
        setIsSubmitting(false);
    }, 1000);
  };

  const getRowTotal = (entry: DisconnectionEntry) => {
      return {
          d: entry.catA.d + entry.catB.d + entry.catC.d + entry.catD.d,
          a: entry.catA.a + entry.catB.a + entry.catC.a + entry.catD.a,
          n: entry.catA.n + entry.catB.n + entry.catC.n + entry.catD.n,
      };
  };

  return (
    <div className="max-w-[1400px] mx-auto mb-16 font-sans">
       <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#005d8f] mb-6 font-medium text-sm transition-colors pl-1 animate-enter">
        <ArrowLeft className="w-4 h-4" /> Back to Sectional Positions
      </Link>

      <div className="bg-white rounded-lg shadow-xl border border-slate-200 animate-enter delay-100 relative">
        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-y-10 translate-x-10 overflow-hidden rounded-lg">
            <Train className="w-96 h-96 text-orange-600" />
        </div>

        <div className="bg-[#005d8f] text-white p-6 text-center border-b-4 border-orange-500 relative overflow-hidden rounded-t-lg">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-1 relative z-10">Western Railway</h1>
            <h2 className="text-xs md:text-sm font-medium opacity-80 uppercase tracking-[0.2em] relative z-10">Ahmedabad Division - S&T Department</h2>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between relative z-10">
            <h3 className="font-bold text-slate-700 uppercase flex items-center gap-2.5 text-sm md:text-base">
                <div className="p-1.5 bg-orange-50 rounded-md text-orange-600 border border-orange-100">
                    <Activity className="w-4 h-4" />
                </div>
                Daily Disconnection Position (DAILY)
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">FORM-DD-06</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 relative z-10">
          
          {/* Section 1: Filters */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-[#005d8f] border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#005d8f]"></span>
              1. Date & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-group">
                <label className={labelClass}>Date <span className="text-red-500">*</span></label>
                <input type="date" required className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label className={labelClass}>Sectional Officer <span className="text-slate-400 text-[10px]">(Filter)</span></label>
                <SearchableSelect 
                  name="sectionalOfficerFilter" 
                  value={sectionalOfficerFilter} 
                  options={flatOfficers} 
                  onChange={(e) => { setSectionalOfficerFilter(e.target.value); setCsi(''); }} 
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
            </div>
          </div>

          {/* Section 2: Data Entry (Manual Add) */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-orange-600 border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-600"></span>
              2. Data Entry
            </h3>

            {/* Input Box */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add / Update Entry
                    </h4>
                    {!csi && <span className="text-xs text-red-500 font-medium">* Select CSI First</span>}
                </div>

                {csi ? (
                    <div className="space-y-6">
                        {/* SI Select */}
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <label className={labelClass}>Section SI <span className="text-red-500">*</span></label>
                            <SearchableSelect 
                                name="currentSI" 
                                value={currentSI} 
                                options={availableSIs} 
                                onChange={(e) => setCurrentSI(e.target.value)} 
                                placeholder="Select Section SI..."
                            />
                        </div>

                        {/* Counts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-slate-50 rounded-md border border-slate-100">
                            {/* Cat A */}
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-[#005d8f] block border-b border-slate-200 pb-1">A (Replacement)</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <div><label className="text-[10px] text-slate-400 block text-center mb-0.5">Applied</label><input type="number" min="0" placeholder="0" className={smallInputClass} value={currentData.catA.d} onChange={e => handleCountChange('catA', 'd', e.target.value)} /></div>
                                    <div><label className="text-[10px] text-slate-400 block text-center mb-0.5">Allowed</label><input type="number" min="0" placeholder="0" className={smallInputClass} value={currentData.catA.a} onChange={e => handleCountChange('catA', 'a', e.target.value)} /></div>
                                    <div><label className="text-[10px] text-slate-400 block text-center mb-0.5">Not</label><input type="number" min="0" placeholder="0" className={smallInputClass} value={currentData.catA.n} onChange={e => handleCountChange('catA', 'n', e.target.value)} /></div>
                                </div>
                            </div>
                            
                            {/* Cat B */}
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-[#005d8f] block border-b border-slate-200 pb-1">B (Engg. Work)</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <div><label className="text-[10px] text-slate-400 block text-center mb-0.5">Applied</label><input type="number" min="0" placeholder="0" className={smallInputClass} value={currentData.catB.d} onChange={e => handleCountChange('catB', 'd', e.target.value)} /></div>
                                    <div><label className="text-[10px] text-slate-400 block text-center mb-0.5">Allowed</label><input type="number" min="0" placeholder="0" className={smallInputClass} value={currentData.catB.a} onChange={e => handleCountChange('catB', 'a', e.target.value)} /></div>
                                    <div><label className="text-[10px] text-slate-400 block text-center mb-0.5">Not</label><input type="number" min="0" placeholder="0" className={smallInputClass} value={currentData.catB.n} onChange={e => handleCountChange('catB', 'n', e.target.value)} /></div>
                                </div>
                            </div>

                            {/* Cat C */}
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-[#005d8f] block border-b border-slate-200 pb-1">C (Maintenance)</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <div><label className="text-[10px] text-slate-400 block text-center mb-0.5">Applied</label><input type="number" min="0" placeholder="0" className={smallInputClass} value={currentData.catC.d} onChange={e => handleCountChange('catC', 'd', e.target.value)} /></div>
                                    <div><label className="text-[10px] text-slate-400 block text-center mb-0.5">Allowed</label><input type="number" min="0" placeholder="0" className={smallInputClass} value={currentData.catC.a} onChange={e => handleCountChange('catC', 'a', e.target.value)} /></div>
                                    <div><label className="text-[10px] text-slate-400 block text-center mb-0.5">Not</label><input type="number" min="0" placeholder="0" className={smallInputClass} value={currentData.catC.n} onChange={e => handleCountChange('catC', 'n', e.target.value)} /></div>
                                </div>
                            </div>

                            {/* Cat D */}
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-[#005d8f] block border-b border-slate-200 pb-1">D (Failure)</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <div><label className="text-[10px] text-slate-400 block text-center mb-0.5">Applied</label><input type="number" min="0" placeholder="0" className={smallInputClass} value={currentData.catD.d} onChange={e => handleCountChange('catD', 'd', e.target.value)} /></div>
                                    <div><label className="text-[10px] text-slate-400 block text-center mb-0.5">Allowed</label><input type="number" min="0" placeholder="0" className={smallInputClass} value={currentData.catD.a} onChange={e => handleCountChange('catD', 'a', e.target.value)} /></div>
                                    <div><label className="text-[10px] text-slate-400 block text-center mb-0.5">Not</label><input type="number" min="0" placeholder="0" className={smallInputClass} value={currentData.catD.n} onChange={e => handleCountChange('catD', 'n', e.target.value)} /></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={handleAddEntry} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-md shadow-md transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                                <Plus className="w-4 h-4" /> Add to Table
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8 bg-slate-50 rounded border border-dashed border-slate-300 text-slate-400 text-sm">
                        Select a CSI above to enable data entry.
                    </div>
                )}
            </div>

            {/* Table */}
            {entries.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-slate-300 shadow-sm bg-white">
                    <div className="min-w-[1200px]">
                        <div className="bg-[#fff7ed] border-b border-slate-300 p-2 text-center text-xs font-bold text-orange-800 uppercase tracking-widest flex items-center justify-center gap-2">
                            <Train className="w-3 h-3" /> Report Preview
                        </div>
                        <table className="w-full text-xs text-center border-collapse">
                            <thead>
                                <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300">
                                    <th rowSpan={2} className="px-2 py-2 border-r border-slate-300 bg-slate-50 w-12">Sr. No.</th>
                                    <th rowSpan={2} className="px-2 py-2 border-r border-slate-300 bg-slate-50 w-32 text-left">Section SI</th>
                                    <th colSpan={3} className="px-2 py-1 border-r border-slate-300 border-b border-slate-200">A (Replacement)</th>
                                    <th colSpan={3} className="px-2 py-1 border-r border-slate-300 border-b border-slate-200">B (Engg. Work)</th>
                                    <th colSpan={3} className="px-2 py-1 border-r border-slate-300 border-b border-slate-200">C (Maintenance)</th>
                                    <th colSpan={3} className="px-2 py-1 border-r border-slate-300 border-b border-slate-200">D (Failure)</th>
                                    <th colSpan={3} className="px-2 py-1 bg-slate-200 border-b border-slate-300">Total</th>
                                    <th rowSpan={2} className="px-2 py-1 bg-white border-b border-slate-300 w-10">Act</th>
                                </tr>
                                <tr className="bg-slate-50 text-[10px] text-slate-600 font-medium border-b border-slate-300">
                                    {[1, 2, 3, 4].map(i => (
                                        <React.Fragment key={i}>
                                            <th className="px-1 py-1 border-r border-slate-200 w-12">D</th>
                                            <th className="px-1 py-1 border-r border-slate-200 w-12">A</th>
                                            <th className="px-1 py-1 border-r border-slate-300 w-12">N</th>
                                        </React.Fragment>
                                    ))}
                                    <th className="px-1 py-1 border-r border-slate-200 bg-slate-100 font-bold w-12">D</th>
                                    <th className="px-1 py-1 border-r border-slate-200 bg-slate-100 font-bold w-12">A</th>
                                    <th className="px-1 py-1 bg-slate-100 font-bold w-12">N</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, idx) => {
                                    const rowTotal = getRowTotal(entry);
                                    return (
                                        <tr key={entry.siName} className="border-b border-slate-200 hover:bg-yellow-50 group">
                                            <td className="border-r border-slate-300 font-medium text-slate-500">{idx + 1}</td>
                                            <td className="px-3 py-2 border-r border-slate-300 text-left font-bold text-slate-700 bg-slate-50">{entry.siName}</td>
                                            
                                            <td className="border-r border-slate-200 text-slate-600">{entry.catA.d}</td>
                                            <td className="border-r border-slate-200 text-slate-600">{entry.catA.a}</td>
                                            <td className="border-r border-slate-300 text-slate-400">{entry.catA.n}</td>

                                            <td className="border-r border-slate-200 text-slate-600">{entry.catB.d}</td>
                                            <td className="border-r border-slate-200 text-slate-600">{entry.catB.a}</td>
                                            <td className="border-r border-slate-300 text-slate-400">{entry.catB.n}</td>

                                            <td className="border-r border-slate-200 text-slate-600">{entry.catC.d}</td>
                                            <td className="border-r border-slate-200 text-slate-600">{entry.catC.a}</td>
                                            <td className="border-r border-slate-300 text-slate-400">{entry.catC.n}</td>

                                            <td className="border-r border-slate-200 text-slate-600">{entry.catD.d}</td>
                                            <td className="border-r border-slate-200 text-slate-600">{entry.catD.a}</td>
                                            <td className="border-r border-slate-300 text-slate-400">{entry.catD.n}</td>

                                            <td className="border-r border-slate-200 bg-slate-100 font-bold text-slate-800">{rowTotal.d}</td>
                                            <td className="border-r border-slate-200 bg-slate-100 font-bold text-slate-800">{rowTotal.a}</td>
                                            <td className="bg-slate-100 font-bold text-slate-800">{rowTotal.n}</td>
                                            
                                            <td className="text-center">
                                                <button type="button" onClick={() => handleDeleteEntry(entry.siName)} className="text-red-400 hover:text-red-600 p-1">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-slate-200 font-bold text-slate-800 border-t-2 border-slate-400">
                                <tr>
                                    <td colSpan={2} className="px-2 py-2 text-right uppercase text-[10px] tracking-wider border-r border-slate-400">TOTAL</td>
                                    
                                    <td className="border-r border-slate-300">{colTotals.catA.d}</td>
                                    <td className="border-r border-slate-300">{colTotals.catA.a}</td>
                                    <td className="border-r border-slate-300">{colTotals.catA.n}</td>

                                    <td className="border-r border-slate-300">{colTotals.catB.d}</td>
                                    <td className="border-r border-slate-300">{colTotals.catB.a}</td>
                                    <td className="border-r border-slate-300">{colTotals.catB.n}</td>

                                    <td className="border-r border-slate-300">{colTotals.catC.d}</td>
                                    <td className="border-r border-slate-300">{colTotals.catC.a}</td>
                                    <td className="border-r border-slate-300">{colTotals.catC.n}</td>

                                    <td className="border-r border-slate-300">{colTotals.catD.d}</td>
                                    <td className="border-r border-slate-300">{colTotals.catD.a}</td>
                                    <td className="border-r border-slate-300">{colTotals.catD.n}</td>

                                    <td className="border-r border-slate-300 bg-slate-300">{colTotals.grand.d}</td>
                                    <td className="border-r border-slate-300 bg-slate-300">{colTotals.grand.a}</td>
                                    <td className="bg-slate-300">{colTotals.grand.n}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
            
            {entries.length === 0 && csi && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 p-2 rounded mt-4">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <p>No entries added yet. Use the form above to add disconnection data for this CSI.</p>
                </div>
            )}
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
                    Submitting Disconnection Report...
                  </>
              ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Submit Disconnection Report
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisconnectionForm;
