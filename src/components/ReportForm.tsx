
import React, { useState, useMemo } from 'react';
import { 
  DESIGNATIONS, ROUTES, MAKES, REASONS 
} from '../constants';
import { useMasterData } from '../contexts/MasterDataContext';
import type { FailureReport } from '../types';
import { Send, Save, CheckSquare, Square, ArrowLeft, Loader2, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchableSelect from './SearchableSelect';

interface ReportFormProps {
  onSubmit: (report: Omit<FailureReport, 'id' | 'status' | 'submittedAt' | 'type'>) => void;
}

const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#005d8f] focus:ring-4 focus:ring-[#005d8f]/10 outline-none text-slate-700 placeholder:text-slate-400 text-sm transition-all duration-200";
const labelClass = "block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

const ReportForm: React.FC<ReportFormProps> = ({ onSubmit }) => {
  const { 
    flatOfficers, 
    flatCSIs, 
    flatStations,
    designations, // from context (dynamic)
    makes,        // from context (dynamic)
    reasons       // from context (dynamic)
  } = useMasterData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    sectionalOfficer: '',
    csi: '',
    designation: '',
    postingStationCode: '',
    toLocation: '',
    route: '',
    make: 'Ravel' as 'Ravel' | 'Vighnharta',
    failureDateTime: '',
    reason: [] as string[],
    remarks: '',
    amc: 'No' as 'Yes' | 'No',
    warranty: 'No' as 'Yes' | 'No',
  });

  // --- Dynamic Dropdown Logic ---
  
  // 1. Available CSIs
  // If Officer selected -> Filter CSIs by Officer
  // If NO Officer selected -> Show ALL CSIs (Logic from user request)
  const availableCSIs = useMemo(() => {
    if (formData.sectionalOfficer) {
      return flatCSIs
        .filter(c => c.parentOfficer === formData.sectionalOfficer)
        .map(c => c.name);
    }
    // Return ALL CSIs if no officer is selected
    return flatCSIs.map(c => c.name);
  }, [formData.sectionalOfficer, flatCSIs]);

  // 2. Available Stations
  // If CSI selected -> Filter by CSI
  // If Officer selected (but no CSI) -> Filter by Officer
  // If NOTHING selected -> Show ALL Stations (Logic: Direct station selection)
  const availableStations = useMemo(() => {
    if (formData.csi) {
      return flatStations
        .filter(s => s.parentCSI === formData.csi)
        .map(s => s.code);
    }
    if (formData.sectionalOfficer) {
      return flatStations
        .filter(s => s.parentOfficer === formData.sectionalOfficer)
        .map(s => s.code);
    }
    // Return ALL Stations if no filters applied
    return flatStations.map(s => s.code);
  }, [formData.sectionalOfficer, formData.csi, flatStations]);

  // 3. To Location (Affected Location) - Usually same logic as Available Stations
  const allLocationCodes = useMemo(() => flatStations.map(s => s.code), [flatStations]);


  const handleChange = (e: { target: { name: string; value: string } } | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Cascading Reset Logic
    if (name === 'sectionalOfficer') {
        setFormData(prev => ({
            ...prev,
            sectionalOfficer: value,
            csi: '',              // Reset CSI
            postingStationCode: '' // Reset Station
        }));
    } else if (name === 'csi') {
        setFormData(prev => ({
            ...prev,
            csi: value,
            postingStationCode: '' // Reset Station
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleReasonToggle = (reason: string) => {
    setFormData(prev => {
      const currentReasons = prev.reason;
      if (currentReasons.includes(reason)) {
        return { ...prev, reason: currentReasons.filter(r => r !== reason) };
      } else {
        return { ...prev, reason: [...currentReasons, reason] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.reason.length === 0) {
      alert("Please select at least one reason for failure.");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
        onSubmit(formData);
        setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto mb-16 font-sans">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#005d8f] mb-6 font-medium text-sm transition-colors pl-1 animate-enter">
        <ArrowLeft className="w-4 h-4" /> Back to Sectional Positions
      </Link>

      <div className="bg-white rounded-lg shadow-xl border border-slate-200 animate-enter delay-100 relative">
        {/* Background Watermark */}
        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-y-10 translate-x-10 overflow-hidden rounded-lg">
            <Activity className="w-96 h-96 text-[#005d8f]" />
        </div>

        {/* Official Header Strip */}
        <div className="bg-[#005d8f] text-white p-6 text-center border-b-4 border-orange-500 relative overflow-hidden rounded-t-lg">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-1 relative z-10">Western Railway</h1>
            <h2 className="text-xs md:text-sm font-medium opacity-80 uppercase tracking-[0.2em] relative z-10">Ahmedabad Division - S&T Department</h2>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between relative z-10">
            <h3 className="font-bold text-slate-700 uppercase flex items-center gap-2.5 text-sm md:text-base">
                <div className="p-1.5 bg-red-50 rounded-md text-red-600 border border-red-100">
                  <Send className="w-4 h-4" />
                </div>
                Position of Fire Alarm (WEEKLY)
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">FORM-FA-01</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 relative z-10">
          {/* Section 1: Personal / Location */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-[#005d8f] border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#005d8f]"></span>
              1. Staff & Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="form-group">
                <label className={labelClass}>Reporting Staff Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" required className={inputClass} value={formData.name} onChange={handleChange} placeholder="Enter full name" />
              </div>

              <div className="form-group">
                <label className={labelClass}>Designation <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="designation" 
                  value={formData.designation} 
                  options={designations} 
                  onChange={handleChange} 
                  required 
                  placeholder="Select..."
                />
              </div>

              {/* HIERARCHY START */}
              <div className="form-group">
                <label className={labelClass}>Sectional Officer <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="sectionalOfficer" 
                  value={formData.sectionalOfficer} 
                  options={flatOfficers} 
                  onChange={handleChange} 
                  required 
                  placeholder="Select Officer..."
                />
              </div>

              <div className="form-group">
                <label className={labelClass}>CSI <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="csi" 
                  value={formData.csi} 
                  options={availableCSIs} 
                  onChange={handleChange} 
                  required 
                  placeholder={formData.sectionalOfficer ? "Select CSI..." : "Select (All Available)"}
                />
              </div>

               <div className="form-group">
                <label className={labelClass}>Posted Station <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="postingStationCode" 
                  value={formData.postingStationCode} 
                  options={availableStations} 
                  onChange={handleChange} 
                  required 
                  placeholder={formData.csi ? "Select Station..." : "Select (All Available)"}
                />
              </div>
              {/* HIERARCHY END */}

               <div className="form-group">
                <label className={labelClass}>Date <span className="text-red-500">*</span></label>
                <input type="date" name="date" required className={inputClass} value={formData.date} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Section 2: Failure Details */}
           <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-red-600 border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red-600 signal-live"></div>
              2. Defect / Failure Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="form-group">
                <label className={labelClass}>Affected Location <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="toLocation" 
                  value={formData.toLocation} 
                  options={allLocationCodes} 
                  onChange={handleChange} 
                  required 
                  placeholder="Select..."
                />
              </div>

               <div className="form-group">
                <label className={labelClass}>Route <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="route" 
                  value={formData.route} 
                  options={ROUTES} 
                  onChange={handleChange} 
                  required 
                  placeholder="Select..."
                />
              </div>

              <div className="form-group">
                <label className={labelClass}>System Make <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="make" 
                  value={formData.make} 
                  options={makes} 
                  onChange={handleChange} 
                  required 
                  placeholder="Select..."
                />
              </div>

              <div className="form-group">
                <label className={labelClass}>Failure Date & Time <span className="text-red-500">*</span></label>
                <input type="datetime-local" name="failureDateTime" required className={inputClass} value={formData.failureDateTime} onChange={handleChange} />
              </div>

              <div className="form-group md:col-span-2">
                <label className={labelClass}>Reason for Failure (Check all that apply) <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {reasons.map(r => {
                    const isSelected = formData.reason.includes(r);
                    return (
                      <div 
                        key={r} 
                        onClick={() => handleReasonToggle(r)}
                        className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all duration-200 ${isSelected ? 'bg-red-50 border-red-200 shadow-sm transform scale-[1.01]' : 'bg-white border-slate-200 hover:border-[#005d8f] hover:bg-slate-50'}`}
                      >
                        {isSelected ? <CheckSquare className="w-5 h-5 text-red-600 flex-shrink-0" /> : <Square className="w-5 h-5 text-slate-300 flex-shrink-0" />}
                        <span className={`text-sm ${isSelected ? 'text-red-900 font-medium' : 'text-slate-600'}`}>{r}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-group md:col-span-2">
                <label className={labelClass}>Remarks / Description</label>
                <textarea name="remarks" rows={3} className={inputClass} value={formData.remarks} onChange={handleChange} placeholder="Enter any additional details..."></textarea>
              </div>

              <div className="form-group">
                <label className={labelClass}>Under AMC?</label>
                <div className="flex gap-6 mt-2">
                   {['Yes', 'No'].map(opt => (
                       <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                           <input type="radio" name="amc" value={opt} checked={formData.amc === opt} onChange={handleChange} className="w-4 h-4 accent-[#005d8f] cursor-pointer" />
                           <span className="text-sm text-slate-700 group-hover:text-[#005d8f] transition-colors">{opt}</span>
                       </label>
                   ))}
                </div>
              </div>

              <div className="form-group">
                <label className={labelClass}>Under Warranty?</label>
                 <div className="flex gap-6 mt-2">
                   {['Yes', 'No'].map(opt => (
                       <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                           <input type="radio" name="warranty" value={opt} checked={formData.warranty === opt} onChange={handleChange} className="w-4 h-4 accent-[#005d8f] cursor-pointer" />
                           <span className="text-sm text-slate-700 group-hover:text-[#005d8f] transition-colors">{opt}</span>
                       </label>
                   ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#005d8f] hover:bg-[#004a73] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-md shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
            >
              {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Report...
                  </>
              ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Submit Failure Report
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
