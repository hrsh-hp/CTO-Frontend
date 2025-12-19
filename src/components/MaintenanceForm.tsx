
import React, { useState, useMemo } from 'react';
import { MAINTENANCE_TYPES } from '../constants';
import { useMasterData } from '../contexts/MasterDataContext';
import type { MaintenanceReport } from '../types';
import { Wrench, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchableSelect from './SearchableSelect';

interface MaintenanceFormProps {
  onSubmit: (report: Omit<MaintenanceReport, 'id' | 'submittedAt' | 'type'>) => void;
}

const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#005d8f] focus:ring-4 focus:ring-[#005d8f]/10 outline-none text-slate-700 placeholder:text-slate-400 text-sm transition-all duration-200";
const labelClass = "block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ onSubmit }) => {
  const { flatOfficers, flatCSIs, flatStations, designations } = useMasterData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    stationPosted: '',
    sectionalOfficer: '',
    csi: '',
    date: new Date().toISOString().split('T')[0],
    section: '',
    assetNumbers: '',
    maintenanceType: '',
    workDescription: '',
    remarks: '',
  });

  // --- Dynamic Dropdown Logic ---
  
  // 1. Available CSIs
  const availableCSIs = useMemo(() => {
    if (formData.sectionalOfficer) {
        return flatCSIs.filter(c => c.parentOfficer === formData.sectionalOfficer).map(c => c.name);
    }
    return flatCSIs.map(c => c.name);
  }, [formData.sectionalOfficer, flatCSIs]);

  // 2. Available Stations
  const availableStations = useMemo(() => {
    if (formData.csi) {
        return flatStations.filter(s => s.parentCSI === formData.csi).map(s => s.code);
    }
    if (formData.sectionalOfficer) {
        return flatStations.filter(s => s.parentOfficer === formData.sectionalOfficer).map(s => s.code);
    }
    return flatStations.map(s => s.code);
  }, [formData.sectionalOfficer, formData.csi, flatStations]);

  const handleChange = (e: { target: { name: string; value: string } } | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Cascading Reset Logic
    if (name === 'sectionalOfficer') {
        setFormData(prev => ({
            ...prev,
            sectionalOfficer: value,
            csi: '',              
            stationPosted: '' 
        }));
    } else if (name === 'csi') {
        setFormData(prev => ({
            ...prev,
            csi: value,
            stationPosted: '' 
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Helper to get CSRF token
  const getCookie = (name: string) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const csrftoken = getCookie('csrftoken');
      const response = await fetch('/api/forms/maintenance-reports/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken || '',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn('⚠️ API Submission failed:', errText);
        alert(`Failed to save to server (HTTP ${response.status}). This report is NOT shared across devices.\n\n${errText}`);
        setIsSubmitting(false);
        return;
      }

      onSubmit(formData);
    } catch (error) {
      console.error('❌ Network error while submitting to API:', error);
      alert('Network error while saving to server. This report is NOT shared across devices.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-16 font-sans">
       <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#005d8f] mb-6 font-medium text-sm transition-colors pl-1 animate-enter">
        <ArrowLeft className="w-4 h-4" /> Back to Sectional Positions
      </Link>

      <div className="bg-white rounded-lg shadow-xl border border-slate-200 animate-enter delay-100 relative">
        {/* Background Watermark */}
        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-y-10 translate-x-10 overflow-hidden rounded-lg">
            <Wrench className="w-96 h-96 text-amber-600" />
        </div>

        {/* Official Header Strip */}
        <div className="bg-[#005d8f] text-white p-6 text-center border-b-4 border-orange-500 relative overflow-hidden rounded-t-lg">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-1 relative z-10">Western Railway</h1>
            <h2 className="text-xs md:text-sm font-medium opacity-80 uppercase tracking-[0.2em] relative z-10">Ahmedabad Division - S&T Department</h2>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between relative z-10">
            <h3 className="font-bold text-slate-700 uppercase flex items-center gap-2.5 text-sm md:text-base">
                <div className="p-1.5 bg-amber-50 rounded-md text-amber-600 border border-amber-100">
                    <Wrench className="w-4 h-4" />
                </div>
                Daily Maintenance Activity (DAILY)
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">FORM-MA-05</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 relative z-10">
           {/* Section 1: Staff Details */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-[#005d8f] border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#005d8f]"></span>
              1. Staff Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="form-group">
                <label className={labelClass}>Staff Name <span className="text-red-500">*</span></label>
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
                <label className={labelClass}>Station (Posted) <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="stationPosted" 
                  value={formData.stationPosted} 
                  options={availableStations} 
                  onChange={handleChange} 
                  required 
                  placeholder={formData.csi ? "Select Station..." : "Select (All Available)"}
                />
              </div>
              
              <div className="form-group">
                <label className={labelClass}>Date <span className="text-red-500">*</span></label>
                <input type="date" name="date" required className={inputClass} value={formData.date} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Section 2: Work Details */}
           <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-amber-600 border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              2. Work Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className={labelClass}>Section / Station (Code) <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="section" 
                    required 
                    className={inputClass} 
                    value={formData.section} 
                    onChange={handleChange} 
                    placeholder="e.g. ADI or ADI-GER" 
                />
              </div>

              <div className="form-group">
                <label className={labelClass}>Maintenance Type <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="maintenanceType" 
                  value={formData.maintenanceType} 
                  options={MAINTENANCE_TYPES} 
                  onChange={handleChange} 
                  required 
                  placeholder="Select..."
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className={labelClass}>Asset Numbers (e.g. Signal Nos, Point Nos)</label>
                <input 
                    type="text" 
                    name="assetNumbers" 
                    className={inputClass} 
                    value={formData.assetNumbers} 
                    onChange={handleChange} 
                    placeholder="e.g. S-22, Pt-101" 
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className={labelClass}>Work Description <span className="text-red-500">*</span></label>
                <textarea name="workDescription" required rows={4} className={inputClass} value={formData.workDescription} onChange={handleChange} placeholder="Details of work carried out..."></textarea>
              </div>

              <div className="form-group md:col-span-2">
                <label className={labelClass}>Remarks</label>
                <textarea name="remarks" rows={2} className={inputClass} value={formData.remarks} onChange={handleChange} placeholder="Any pending issues or additional notes..."></textarea>
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
                    Submit Maintenance Report
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;