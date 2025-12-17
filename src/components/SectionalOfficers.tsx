
import React from 'react';
import { User, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const officers = [
  'DSTE - I', 
  'DSTE - II', 
  'DSTE SPL WKS', 
  'ADSTE ADI', 
  'ADSTE DHG', 
  'ADSTE GIM', 
  'ADSTE MSH', 
  'ADSTE RDHP'
];

const SectionalOfficers: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto mb-16 font-sans animate-enter">
        <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#005d8f] font-medium text-sm transition-colors pl-1">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
             {/* Header */}
             <div className="bg-[#005d8f] text-white p-8 text-center border-b-4 border-orange-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-2 relative z-10">Sectional Officers</h1>
                <h2 className="text-sm font-medium opacity-80 uppercase tracking-[0.2em] relative z-10">Administration & Leadership</h2>
            </div>

            <div className="p-8 md:p-12">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {officers.map((officer) => (
                        <div key={officer} className="bg-slate-50 border border-slate-200 p-6 rounded-xl hover:border-[#005d8f] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default flex flex-col items-center justify-center text-center gap-4 group">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-[#005d8f] transition-colors duration-300">
                                <ShieldCheck className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-700 group-hover:text-[#005d8f] transition-colors">{officer}</h3>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide font-medium">S&T Department</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                <p className="text-sm text-slate-500">Ahmedabad Division • Western Railway</p>
            </div>
        </div>
    </div>
  );
};

export default SectionalOfficers;
