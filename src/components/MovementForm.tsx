
import React, { useState, useMemo } from 'react';
import { MOVEMENT_DESIGNATIONS } from '../constants';
import { useMasterData } from '../contexts/MasterDataContext';
import type { MovementReport } from '../types';
import { Save, ArrowLeft, Loader2, FileText, User, Navigation, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchableSelect from './SearchableSelect';

interface MovementFormProps {
  onSubmit: (report: Omit<MovementReport, 'id' | 'submittedAt' | 'type'>) => void;
}

const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#005d8f] focus:ring-4 focus:ring-[#005d8f]/10 outline-none text-slate-700 placeholder:text-slate-400 text-sm transition-all duration-200";
const labelClass = "block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

const MovementForm: React.FC<MovementFormProps> = ({ onSubmit }) => {
  const { flatOfficers, flatCSIs, flatStations } = useMasterData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    designationRank: '', // JE, SSE, etc.
    stationPosted: '',   // VTA, ADI, etc.
    sectionalOfficer: '',
    csi: '',
    moveFrom: '',
    moveTo: '',
    workDone: '',
  });

  // --- Dynamic Dropdown Logic ---
  const availableCSIs = useMemo(() => {
    if (formData.sectionalOfficer) {
      return flatCSIs.filter(c => c.parentOfficer === formData.sectionalOfficer).map(c => c.name);
    }
    return flatCSIs.map(c => c.name);
  }, [formData.sectionalOfficer, flatCSIs]);

  const availableStations = useMemo(() => flatStations.map(s => s.code), [flatStations]);

  const handleChange = (e: { target: { name: string; value: string } } | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'sectionalOfficer') {
        setFormData(prev => ({
            ...prev,
            sectionalOfficer: value,
            csi: '',              
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Required fields check
    if (!formData.name || !formData.designationRank || !formData.stationPosted || !formData.csi || !formData.workDone) {
        alert("Please fill in all mandatory fields marked with *");
        return;
    }

    setIsSubmitting(true);
    
    const designationCombined = `${formData.designationRank}/${formData.stationPosted}`;

    const reportPayload: Omit<MovementReport, 'id' | 'submittedAt' | 'type'> = {
        date: formData.date,
        name: formData.name,
        designation: designationCombined,
        sectionalOfficer: formData.sectionalOfficer,
        csi: formData.csi,
        moveFrom: formData.moveFrom,
        moveTo: formData.moveTo,
        workDone: formData.workDone
    };
    
    setTimeout(() => {
        onSubmit(reportPayload);
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
            <FileText className="w-96 h-96 text-indigo-600" />
        </div>

        <div className="bg-[#005d8f] text-white p-6 text-center border-b-4 border-orange-500 relative overflow-hidden rounded-t-lg">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-1 relative z-10">Western Railway</h1>
            <h2 className="text-xs md:text-sm font-medium opacity-80 uppercase tracking-[0.2em] relative z-10">Ahmedabad Division - S&T Department</h2>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between relative z-10">
            <h3 className="font-bold text-slate-700 uppercase flex items-center gap-2.5 text-sm md:text-base">
                <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600 border border-indigo-100">
                    <Navigation className="w-4 h-4" />
                </div>
                Daily Movement of SSE & JE (Signal)
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">FORM-MV-07</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 relative z-10">
          
          {/* Section 1: Staff Details */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-[#005d8f] border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#005d8f]"></span>
              1. Staff Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="form-group">
                <label className={labelClass}>Date <span className="text-red-500">*</span></label>
                <input type="date" required className={inputClass} value={formData.date} onChange={handleChange} name="date" />
              </div>

              <div className="form-group">
                <label className={labelClass}>Name <span className="text-red-500">*</span></label>
                <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input type="text" name="name" required className={`${inputClass} pl-10`} value={formData.name} onChange={handleChange} placeholder="Enter Name" />
                </div>
              </div>

              <div className="form-group">
                <label className={labelClass}>Designation (Rank) <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="designationRank" 
                  value={formData.designationRank} 
                  options={MOVEMENT_DESIGNATIONS} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. SSE, JE"
                />
              </div>

              <div className="form-group">
                <label className={labelClass}>Station (HQ/Posted) <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="stationPosted" 
                  value={formData.stationPosted} 
                  options={availableStations} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. ADI, VTA"
                />
                <p className="text-[10px] text-slate-400 mt-1">This creates designation like: {formData.designationRank ? formData.designationRank : 'Rank'}/{formData.stationPosted ? formData.stationPosted : 'Station'}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Hierarchy */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-[#005d8f] border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#005d8f]"></span>
              2. Reporting Hierarchy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className={labelClass}>Sectional Officer</label>
                <SearchableSelect 
                  name="sectionalOfficer" 
                  value={formData.sectionalOfficer} 
                  options={flatOfficers} 
                  onChange={handleChange} 
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
                  placeholder="Select CSI..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Movement Details */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-indigo-600 border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              3. Movement & Work Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                    <label className={labelClass}>Movement From</label>
                    <input 
                        type="text"
                        name="moveFrom"
                        className={inputClass}
                        value={formData.moveFrom} 
                        onChange={handleChange}
                        placeholder="e.g. VTA or LEAVE"
                    />
                </div>

                <div className="form-group">
                    <label className={labelClass}>Movement To</label>
                    <input 
                        type="text"
                        name="moveTo"
                        className={inputClass}
                        value={formData.moveTo} 
                        onChange={handleChange}
                        placeholder="e.g. GER SECTION"
                    />
                </div>

                <div className="form-group md:col-span-2">
                    <label className={labelClass}>Work Done / Remarks <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <textarea 
                            name="workDone" 
                            rows={3} 
                            className={`${inputClass} pl-10`} 
                            value={formData.workDone} 
                            onChange={handleChange} 
                            required
                            placeholder="e.g. LC 308 Inspection note observation attended..."
                        ></textarea>
                    </div>
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
                    Submitting Movement Report...
                  </>
              ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Submit Movement Report
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovementForm;
