
import React, { useState } from 'react';
import { Search, Menu, X, TrainFront } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    // Exact match for root, startsWith for others to handle sub-routes if any
    if (path === '/' && location.pathname !== '/') return 'hover:bg-[#004a73]/50 hover:text-white';
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
      ? 'bg-[#004a73] text-white shadow-inner' 
      : 'hover:bg-[#004a73]/50 hover:text-white';
  };

  const navLinks = [
    { name: 'Office of Sr. DSTE', path: '/' },
    { name: 'Dashboard', path: '/admin' }, 
    { name: 'Sectional Officers', path: '/sectional-officers' },
    { name: 'Policy Letters & Drawings', path: '/policies' },
  ];

  return (
    <header className="bg-[#005d8f] text-slate-100 shadow-md sticky top-0 z-50 font-sans border-b-4 border-orange-500">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white p-1.5 rounded-full text-[#005d8f] shadow-lg group-hover:scale-105 transition-transform duration-300 hover-train">
               <TrainFront className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
                <span className="text-xl font-bold tracking-wide leading-none group-hover:text-white transition-colors">
                S&T ADI
                </span>
                <span className="text-[10px] uppercase tracking-widest opacity-80 font-medium">Western Railway</span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-1 text-[13px] font-medium tracking-wide">
          {navLinks.map((link) => {
             return (
                <Link 
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded transition-all duration-200 flex items-center gap-2 ${isActive(link.path)}`}
                >
                {isActive(link.path).includes('bg-[#004a73]') && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>}
                {link.name}
                </Link>
             );
          })}
          <div className="ml-2 p-2 hover:bg-[#004a73] rounded-full cursor-pointer transition-colors text-white/80 hover:text-white">
            <Search className="w-5 h-5" />
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="xl:hidden p-2 hover:bg-[#004a73] rounded text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {isMenuOpen && (
        <div className="xl:hidden bg-[#005d8f] border-t border-[#004a73] absolute w-full shadow-lg animate-enter">
          <div className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path}
                className={`py-3 px-4 rounded ${isActive(link.path)}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
