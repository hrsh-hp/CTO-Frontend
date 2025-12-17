
import React, { useState, useMemo, useEffect } from 'react';
import { useMasterData } from '../contexts/MasterDataContext';
import type { ACFailureReport } from '../types';
import { Save, ArrowLeft, Loader2, ThermometerSnowflake, Fan } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchableSelect from './SearchableSelect';

interface ACFormProps {
  onSubmit: (report: Omit<ACFailureReport, 'id' | 'submittedAt' | 'type'>) => void;
}

const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#005d8f] focus:ring-4 focus:ring-[#005d8f]/10 outline-none text-slate-700 placeholder:text-slate-400 text-sm transition-all duration-200";
const labelClass = "block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

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

const ACReportForm: React.FC<ACFormProps> = ({ onSubmit }) => {
  const { flatOfficers, flatCSIs, flatStations, designations } = useMasterData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    sectionalOfficer: '',
    csi: '',
    date: new Date().toISOString().split('T')[0],
    
    locationCode: '',
    totalACUnits: '',
    acType: 'Split' as 'Split' | 'Window',
    
    totalFailCount: '', 
    failureDateTime: '',
    underWarranty: 'No' as 'Yes' | 'No',
    underAMC: 'Yes' as 'Yes' | 'No',
    remarks: '',
  });

  // --- Dynamic Dropdown Logic ---
  const availableCSIs = useMemo(() => {
    if (formData.sectionalOfficer) {
      return flatCSIs.filter(c => c.parentOfficer === formData.sectionalOfficer).map(c => c.name);
    }
    return flatCSIs.map(c => c.name);
  }, [formData.sectionalOfficer, flatCSIs]);

  const availableStations = useMemo(() => {
    if (formData.csi) {
      return flatStations.filter(s => s.parentCSI === formData.csi).map(s => s.code);
    }
    if (formData.sectionalOfficer) {
      return flatStations.filter(s => s.parentOfficer === formData.sectionalOfficer).map(s => s.code);
    }
    return flatStations.map(s => s.code);
  }, [formData.sectionalOfficer, formData.csi, flatStations]);

  // Dynamic Fail Counts: 0 to Total Units
  const failCountOptions = useMemo(() => {
    const total = parseInt(formData.totalACUnits);
    
    // If total is not a valid number or 0, return empty or default
    if (isNaN(total) || total < 0) return [];
    
    // Generate array ["0", "1", ..., "total"]
    return Array.from({ length: total + 1 }, (_, i) => i.toString());
  }, [formData.totalACUnits]);

  // Reset fail count if it exceeds total units
  useEffect(() => {
    const total = parseInt(formData.totalACUnits);
    const currentFail = parseInt(formData.totalFailCount);
    
    if (!isNaN(total) && !isNaN(currentFail)) {
        if (currentFail > total) {
            setFormData(prev => ({ ...prev, totalFailCount: '' }));
        }
    }
  }, [formData.totalACUnits, formData.totalFailCount]);

  const handleChange = (e: { target: { name: string; value: string } } | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'sectionalOfficer') {
        setFormData(prev => ({
            ...prev,
            sectionalOfficer: value,
            csi: '',              
            locationCode: '' 
        }));
    } else if (name === 'date') {
        const date = new Date(value);
        if (date.getUTCDay() !== 1) {
            alert("Please select a Monday for the Weekly Report.");
            setFormData(prev => ({ ...prev, date: '' }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    } else if (name === 'csi') {
        setFormData(prev => ({
            ...prev,
            csi: value,
            locationCode: '' 
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isZeroFailures = formData.totalFailCount === '0';

    if (!formData.name || !formData.designation || !formData.locationCode) {
        alert("Please fill in all mandatory fields.");
        return;
    }

    if (!isZeroFailures && !formData.failureDateTime) {
        alert("Please fill in all mandatory fields.");
        return;
    }
    
    if (!formData.totalFailCount) {
        alert("Please select the number of failed units.");
        return;
    }

    setIsSubmitting(true);
    
    // 1. Prepare Backend Payload (snake_case)
    const apiPayload = {
        reporter_name: formData.name,
        designation: formData.designation,
        sectional_officer: formData.sectionalOfficer,
        csi: formData.csi,
        date: formData.date,
        location_code: formData.locationCode,
        total_ac_units: parseInt(formData.totalACUnits) || 0,
        ac_type: formData.acType,
        total_fail_count: formData.totalFailCount,
        failure_date_time: isZeroFailures ? null : formData.failureDateTime,
        under_warranty: formData.underWarranty,
        under_amc: formData.underAMC,
        remarks: formData.remarks
    };

    // 2. Send to API
    try {
        const csrftoken = getCookie('csrftoken');
        const response = await fetch('/api/forms/ac-reports/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken || '',
            },
            credentials: 'include',
            body: JSON.stringify(apiPayload)
        });

        if (response.ok) {
            console.log("✅ AC Report saved to DB.");
        } else {
            console.warn("⚠️ API Error:", await response.text());
        }
    } catch (err) {
        console.error("❌ Network Error:", err);
    }

    // 3. Update React State (Optimistic)
    const submissionPayload = {
        ...formData,
        totalACUnits: parseInt(formData.totalACUnits) || 0
    };

    setTimeout(() => {
        onSubmit(submissionPayload);
        setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto mb-16 font-sans">
       <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#005d8f] mb-6 font-medium text-sm transition-colors pl-1 animate-enter">
        <ArrowLeft className="w-4 h-4" /> Back to Sectional Positions
      </Link>

      <div className="bg-white rounded-lg shadow-xl border border-slate-200 animate-enter delay-100 relative">
        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-y-10 translate-x-10 overflow-hidden rounded-lg">
            <Fan className="w-96 h-96 text-cyan-600" />
        </div>

        <div className="bg-[#005d8f] text-white p-6 text-center border-b-4 border-orange-500 relative overflow-hidden rounded-t-lg">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-1 relative z-10">Western Railway</h1>
            <h2 className="text-xs md:text-sm font-medium opacity-80 uppercase tracking-[0.2em] relative z-10">Ahmedabad Division - S&T Department</h2>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between relative z-10">
            <h3 className="font-bold text-slate-700 uppercase flex items-center gap-2.5 text-sm md:text-base">
                <div className="p-1.5 bg-cyan-50 rounded-md text-cyan-600 border border-cyan-100">
                    <ThermometerSnowflake className="w-4 h-4" />
                </div>
                AC Unit Position (WEEKLY)
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">FORM-AC-04</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 relative z-10">
          
          {/* Section 1: Staff & Location */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-[#005d8f] border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#005d8f]"></span>
              1. Staff & Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="form-group">
                <label className={labelClass}>Reporting Date (Monday) <span className="text-red-500">*</span></label>
                <input type="date" name="date" required className={inputClass} value={formData.date} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className={labelClass}>Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" required className={inputClass} value={formData.name} onChange={handleChange} placeholder="Enter full name" />
              </div>

              <div className="form-group">
                <label className={labelClass}>Designation <span className="text-red-500">*</span></label>
                <SearchableSelect name="designation" value={formData.designation} options={designations} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className={labelClass}>Sectional Officer <span className="text-red-500">*</span></label>
                <SearchableSelect name="sectionalOfficer" value={formData.sectionalOfficer} options={flatOfficers} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className={labelClass}>CSI <span className="text-red-500">*</span></label>
                <SearchableSelect name="csi" value={formData.csi} options={availableCSIs} onChange={handleChange} required placeholder={formData.sectionalOfficer ? "Select..." : "Select Officer First"} />
              </div>

              <div className="form-group">
                <label className={labelClass}>Name of Station/Location (Faulty At) <span className="text-red-500">*</span></label>
                <SearchableSelect name="locationCode" value={formData.locationCode} options={availableStations} onChange={handleChange} required placeholder="Select Location..." />
              </div>
            </div>
          </div>

          {/* Section 2: AC Details */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-cyan-600 border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
              2. Unit & Failure Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                    <label className={labelClass}>Total Number of AC Units</label>
                    <input type="number" name="totalACUnits" className={inputClass} value={formData.totalACUnits} onChange={handleChange} placeholder="0" min="0" />
                </div>

                <div className="form-group">
                    <label className={labelClass}>Type of AC <span className="text-red-500">*</span></label>
                    <div className="flex gap-4 mt-2">
                        {['Split', 'Window'].map(t => (
                            <label key={t} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="acType" value={t} checked={formData.acType === t} onChange={handleChange} className="accent-cyan-600 w-4 h-4" />
                                <span className="text-sm text-slate-700">{t}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className={labelClass}>Total Number of AC Unit Fail <span className="text-red-500">*</span></label>
                    <SearchableSelect 
                        name="totalFailCount" 
                        value={formData.totalFailCount} 
                        options={failCountOptions} 
                        onChange={handleChange} 
                        required 
                        placeholder={formData.totalACUnits ? "Select Count..." : "Enter Total Units First"}
                    />
                </div>

                <div className="form-group">
                    <label className={labelClass}>Date & Time of Failure {formData.totalFailCount !== '0' && <span className="text-red-500">*</span>}</label>
                    <input 
                        type="datetime-local" 
                        name="failureDateTime" 
                        required={formData.totalFailCount !== '0'} 
                        disabled={formData.totalFailCount === '0'}
                        className={`${inputClass} ${formData.totalFailCount === '0' ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                        value={formData.failureDateTime} 
                        onChange={handleChange} 
                        step="60" 
                    />
                </div>

                <div className="form-group">
                    <label className={labelClass}>Under Warranty? <span className="text-red-500">*</span></label>
                    <div className="flex gap-4 mt-2">
                        {['Yes', 'No'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="underWarranty" value={opt} checked={formData.underWarranty === opt} onChange={handleChange} className="accent-cyan-600 w-4 h-4" />
                                <span className="text-sm text-slate-700">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className={labelClass}>Under AMC? <span className="text-red-500">*</span></label>
                    <div className="flex gap-4 mt-2">
                        {['Yes', 'No'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="underAMC" value={opt} checked={formData.underAMC === opt} onChange={handleChange} className="accent-cyan-600 w-4 h-4" />
                                <span className="text-sm text-slate-700">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group md:col-span-2">
                    <label className={labelClass}>Remarks</label>
                    <textarea name="remarks" rows={2} className={inputClass} value={formData.remarks} onChange={handleChange} placeholder="Any specific issues..."></textarea>
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
                    Submit AC Position Report
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ACReportForm;
