
import React, { useState, useMemo } from 'react';
import { RELAY_AUTH_CODES } from '../constants';
import { useMasterData } from '../contexts/MasterDataContext';
import type { RelayRoomLog } from '../types';
import { Key, Save, ArrowLeft, Hash, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchableSelect from './SearchableSelect';

interface RelayRoomFormProps {
  onSubmit: (report: Omit<RelayRoomLog, 'id' | 'submittedAt' | 'type'>) => void;
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

const RelayRoomForm: React.FC<RelayRoomFormProps> = ({ onSubmit }) => {
  const { flatOfficers, flatCSIs, flatStations, designations } = useMasterData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    stationPosted: '',
    sectionalOfficer: '',
    csi: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    openingTime: '',
    closingTime: '',
    snOpening: '', // Manual Input
    snClosing: '', // Manual Input
    openingCode: '',
    remarks: '',
  });

  // --- Dynamic Dropdown Logic ---
  
  // 1. Available CSIs based on Selected Officer
  const availableCSIs = useMemo(() => {
    if (formData.sectionalOfficer) {
        return flatCSIs.filter(c => c.parentOfficer === formData.sectionalOfficer).map(c => c.name);
    }
    return flatCSIs.map(c => c.name);
  }, [formData.sectionalOfficer, flatCSIs]);

  // 2. Available Stations based on Selected CSI
  // Requirement: "put all the stations of that csi in station/location accessed"
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
     if (name === 'sectionalOfficer') {
        setFormData(prev => ({
            ...prev,
            sectionalOfficer: value,
            csi: '',              
            stationPosted: '',
            location: '' 
        }));
    } else if (name === 'csi') {
        setFormData(prev => ({
            ...prev,
            csi: value,
            stationPosted: '',
            location: '' 
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Prepare Backend Payload (snake_case)
    const apiPayload = {
        name: formData.name,
        designation: formData.designation,
        station_posted: formData.stationPosted,
        sectional_officer: formData.sectionalOfficer,
        csi: formData.csi,
        date: formData.date,
        location: formData.location,
        opening_time: formData.openingTime,
        closing_time: formData.closingTime,
        sn_opening: formData.snOpening,
        sn_closing: formData.snClosing,
        opening_code: formData.openingCode,
        remarks: formData.remarks
    };

    // 2. Prepare Frontend Payload (camelCase)
    const appPayload: Omit<RelayRoomLog, 'id' | 'submittedAt' | 'type'> = {
        ...formData
    };
    
    try {
        const csrftoken = getCookie('csrftoken');
        const response = await fetch('/api/forms/relay-logs/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken || '',
            },
            credentials: 'include',
            body: JSON.stringify(apiPayload)
        });

        if (response.ok) {
            console.log("✅ Relay Log saved to DB.");
        } else {
            console.warn("⚠️ API Error:", await response.text());
        }
    } catch (err) {
        console.error("❌ Network Error:", err);
    }

    // Optimistic Update
    setTimeout(() => {
        onSubmit(appPayload);
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
            <Key className="w-96 h-96 text-teal-600" />
        </div>

        <div className="bg-[#005d8f] text-white p-6 text-center border-b-4 border-orange-500 relative overflow-hidden rounded-t-lg">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-1 relative z-10">Western Railway</h1>
            <h2 className="text-xs md:text-sm font-medium opacity-80 uppercase tracking-[0.2em] relative z-10">Ahmedabad Division - S&T Department</h2>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between relative z-10">
            <h3 className="font-bold text-slate-700 uppercase flex items-center gap-2.5 text-sm md:text-base">
                <div className="p-1.5 bg-teal-50 rounded-md text-teal-600 border border-teal-100">
                   <Key className="w-4 h-4" />
                </div>
                Relay Room Opening Register (DAILY)
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">FORM-RR-02</span>
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
                  placeholder={formData.sectionalOfficer ? "Select CSI..." : "Select Officer First"}
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

          {/* Section 2: Access Details */}
          <div className="border border-slate-100 rounded-lg p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <h3 className="text-xs font-bold text-teal-600 border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              2. Access Log
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="form-group md:col-span-2 lg:col-span-4">
                <label className={labelClass}>Station / Location Accessed <span className="text-red-500">*</span></label>
                <SearchableSelect 
                  name="location" 
                  value={formData.location} 
                  options={availableStations} 
                  onChange={handleChange} 
                  required 
                  placeholder={formData.csi ? "Select Station..." : "Select CSI First"}
                />
              </div>

              <div className="form-group">
                <label className={labelClass}>Opening Time (HH:MM) <span className="text-red-500">*</span></label>
                <input type="time" name="openingTime" required className={inputClass} value={formData.openingTime} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className={labelClass}>Closing Time (HH:MM) <span className="text-red-500">*</span></label>
                <input type="time" name="closingTime" required className={inputClass} value={formData.closingTime} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className={labelClass}>Opening Serial No. <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="snOpening" 
                    required 
                    className={`${inputClass} font-mono`} 
                    value={formData.snOpening} 
                    onChange={handleChange} 
                    placeholder="Enter No."
                />
              </div>

              <div className="form-group">
                <label className={labelClass}>Closing Serial No. <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="snClosing" 
                    required 
                    className={`${inputClass} font-mono`} 
                    value={formData.snClosing} 
                    onChange={handleChange} 
                    placeholder="Enter No."
                />
              </div>

               <div className="form-group md:col-span-2 lg:col-span-2">
                <label className={labelClass}>Code for opening <span className="text-red-500">*</span></label>
                 <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-400 z-10" />
                    <div className="pl-6">
                      <SearchableSelect 
                        name="openingCode" 
                        value={formData.openingCode} 
                        options={RELAY_AUTH_CODES} 
                        onChange={handleChange} 
                        required 
                        placeholder="Select Code..."
                      />
                    </div>
                  </div>
              </div>
            </div>
          </div>

          <div className="form-group">
             <label className={labelClass}>Reason for opening (Remarks) <span className="text-red-500">*</span></label>
             <textarea name="remarks" required rows={3} className={inputClass} value={formData.remarks} onChange={handleChange} placeholder="Reason for accessing the relay room..."></textarea>
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
                    Logging Entry...
                  </>
              ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Log Relay Room Entry
                  </>
              )}
            </button>
          </div>
        </form>
       </div>
    </div>
  );
};

export default RelayRoomForm;
