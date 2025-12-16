
import React, { useState, useEffect } from 'react';
import { JPC_STATIONS } from '../constants';
import type { JPCReport } from '../types';
import { Save, ArrowLeft, Loader2, FileCheck, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchableSelect from './SearchableSelect';

interface JPCFormProps {
  onSubmit: (report: Omit<JPCReport, 'id' | 'submittedAt' | 'type'>) => void;
}

const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#005d8f] focus:ring-4 focus:ring-[#005d8f]/10 outline-none text-slate-700 placeholder:text-slate-400 text-sm transition-all duration-200";
const labelClass = "block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

const JPCForm: React.FC<JPCFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    station: '',
    totalPoints: '',
    inspectedToday: '',
    jpcDate: new Date().toISOString().split('T')[0],
    totalInspectedCum: '',
    pendingPoints: '',
    inspectionBy: 'SI' as 'SI' | 'CSI',
    inspectorName: '',
  });

  // Auto-calculate Pending Points if needed, but keep editable
  useEffect(() => {
      const total = parseInt(formData.totalPoints) || 0;
      const cum = parseInt(formData.totalInspectedCum) || 0;
      if (total > 0) {
          const pending = Math.max(0, total - cum);
          setFormData(prev => ({ ...prev, pendingPoints: pending.toString() }));
      }
  }, [formData.totalPoints, formData.totalInspectedCum]);

  const handleChange = (e: { target: { name: string; value: string } } | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.station || !formData.totalPoints || !formData.inspectorName) {
        alert("Please fill in all mandatory fields.");
        return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
        const payload: Omit<JPCReport, 'id' | 'submittedAt' | 'type'> = {
            ...formData,
            totalPoints: parseInt(formData.totalPoints) || 0,
            inspectedToday: parseInt(formData.inspectedToday) || 0,
            totalInspectedCum: parseInt(formData.totalInspectedCum) || 0,
            pendingPoints: parseInt(formData.pendingPoints) || 0,
        };
        onSubmit(payload);
        setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto mb-16 font-sans">
       <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#005d8f] mb-6 font-medium text-sm transition-colors pl-1 animate-enter">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="bg-white rounded-lg shadow-xl border border-slate-200 animate-enter delay-100 relative">
        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-y-10 translate-x-10 overflow-hidden rounded-lg">
            <ClipboardCheck className="w-96 h-96 text-blue-600" />
        </div>

        <div className="bg-[#005d8f] text-white p-6 text-center border-b-4 border-orange-500 relative overflow-hidden rounded-t-lg">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-1 relative z-10">Western Railway</h1>
            <h2 className="text-xs md:text-sm font-medium opacity-80 uppercase tracking-[0.2em] relative z-10">Ahmedabad Division - S&T Department</h2>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between relative z-10">
            <h3 className="font-bold text-slate-700 uppercase flex items-center gap-2.5 text-sm md:text-base">
                <div className="p-1.5 bg-blue-50 rounded-md text-blue-600 border border-blue-100">
                    <FileCheck className="w-4 h-4" />
                </div>
                JPC Done Form (ADI Div)
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">FORM-JPC-08</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 relative z-10">
          
          {/* Section 1: Station & Date */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-[#005d8f] border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#005d8f]"></span>
              1. Location & Date
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                    <label className={labelClass}>Name of Station <span className="text-red-500">*</span></label>
                    <SearchableSelect 
                        name="station" 
                        value={formData.station} 
                        options={JPC_STATIONS} 
                        onChange={handleChange} 
                        required 
                        placeholder="Select Station..."
                    />
                </div>

                <div className="form-group">
                    <label className={labelClass}>JPC done on (Date) <span className="text-red-500">*</span></label>
                    <input 
                        type="date" 
                        required 
                        className={inputClass} 
                        value={formData.jpcDate} 
                        onChange={(e) => setFormData(p => ({...p, jpcDate: e.target.value}))} 
                    />
                </div>
            </div>
          </div>

          {/* Section 2: Inspection Data */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-blue-600 border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              2. Point Inspection Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="form-group">
                    <label className={labelClass}>Total Nos. of Points <span className="text-red-500">*</span></label>
                    <input 
                        type="number" 
                        name="totalPoints" 
                        min="0"
                        required 
                        className={inputClass} 
                        value={formData.totalPoints} 
                        onChange={handleChange}
                        placeholder="0" 
                    />
                </div>

                <div className="form-group">
                    <label className={labelClass}>Pts. Inspected (Today) <span className="text-red-500">*</span></label>
                    <input 
                        type="number" 
                        name="inspectedToday" 
                        min="0"
                        required 
                        className={inputClass} 
                        value={formData.inspectedToday} 
                        onChange={handleChange}
                        placeholder="0" 
                    />
                </div>

                <div className="form-group">
                    <label className={labelClass}>Total Pts. Inspected (Cumulative)</label>
                    <input 
                        type="number" 
                        name="totalInspectedCum" 
                        min="0"
                        className={inputClass} 
                        value={formData.totalInspectedCum} 
                        onChange={handleChange}
                        placeholder="0" 
                    />
                </div>

                <div className="form-group">
                    <label className={labelClass}>No. of Pts. Pending</label>
                    <input 
                        type="number" 
                        name="pendingPoints" 
                        min="0"
                        className={`${inputClass} bg-red-50 border-red-100 text-red-700 font-medium`} 
                        value={formData.pendingPoints} 
                        onChange={handleChange}
                        placeholder="0" 
                    />
                </div>
            </div>
          </div>

          {/* Section 3: Authority */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-[#005d8f] border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#005d8f]"></span>
              3. Inspection Authority
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                    <label className={labelClass}>Inspection Done By <span className="text-red-500">*</span></label>
                    <div className="flex gap-6 mt-2">
                        {['SI', 'CSI'].map(role => (
                            <label key={role} className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="inspectionBy" 
                                    value={role} 
                                    checked={formData.inspectionBy === role} 
                                    onChange={handleChange} 
                                    className="w-4 h-4 accent-[#005d8f] cursor-pointer" 
                                />
                                <span className="text-sm text-slate-700 group-hover:text-[#005d8f] transition-colors font-medium">{role}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className={labelClass}>Name of Inspector <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        name="inspectorName" 
                        required 
                        className={inputClass} 
                        value={formData.inspectorName} 
                        onChange={handleChange}
                        placeholder="Enter Name" 
                    />
                </div>
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
                    Submitting Report...
                  </>
              ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Submit JPC Report
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JPCForm;
