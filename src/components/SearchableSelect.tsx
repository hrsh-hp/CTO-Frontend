import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface SearchableSelectProps {
  label?: string;
  name: string;
  value: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
  onChange: (e: { target: { name: string; value: string } }) => void;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  name,
  value,
  options = [],
  placeholder = "Select...",
  required,
  onChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
        searchInputRef.current.focus();
    }
    if (!isOpen) {
        // slight delay to clear search after animation closes
        setTimeout(() => setSearchTerm(""), 200);
    }
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange({ target: { name, value: option } });
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ target: { name, value: "" } });
    setSearchTerm("");
  };

  const filteredOptions = options.filter(opt => 
    typeof opt === 'string' && opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* The "Input" view */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-md cursor-pointer flex items-center justify-between transition-all duration-200 text-sm ${
          isOpen 
            ? "border-[#005d8f] ring-4 ring-[#005d8f]/10 bg-white" 
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className={value ? "text-slate-700" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-2">
            {value && (
                <div onClick={handleClear} className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                </div>
            )}
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* The Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden animate-enter origin-top">
          
          {/* Search Bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
            <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-[#005d8f] placeholder:text-slate-400 text-slate-700"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
          </div>

          <ul className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    value === option
                      ? "bg-[#005d8f]/10 text-[#005d8f] font-medium"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option}
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-sm text-slate-400 text-center italic flex flex-col items-center gap-1">
                <span className="text-slate-300 font-semibold text-xs uppercase tracking-wide">No Matches</span>
                Try a different search term
              </li>
            )}
          </ul>
        </div>
      )}
      
      {/* Hidden input for HTML5 form validation */}
      <input 
        type="text" 
        name={name} 
        value={value} 
        required={required} 
        className="opacity-0 absolute bottom-0 left-0 h-0 w-full pointer-events-none" 
        readOnly
      />
    </div>
  );
};

export default SearchableSelect;