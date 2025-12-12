
import React from 'react';
import { FileText, ArrowLeft, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const PolicyLetters: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto mb-16 font-sans animate-enter">
         <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#005d8f] font-medium text-sm transition-colors pl-1">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-h-[400px]">
             {/* Header */}
             <div className="bg-[#005d8f] text-white p-8 text-center border-b-4 border-orange-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-2 relative z-10">Policy Letters & Drawings</h1>
                <h2 className="text-sm font-medium opacity-80 uppercase tracking-[0.2em] relative z-10">Technical Documentation & Guidelines</h2>
            </div>

            <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-50 p-8 rounded-full mb-6">
                    <FileText className="w-16 h-16 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Documents Available</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    The repository for policy letters and technical drawings is currently being updated. Please check back later or contact the administration for specific files.
                </p>
            </div>
        </div>
    </div>
  );
};

export default PolicyLetters;
