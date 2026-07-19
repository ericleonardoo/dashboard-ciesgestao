import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: FilterOption[];
  icon?: React.ReactNode;
}

export default function FilterSelect({ value, onChange, options, icon }: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 px-3 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors h-[42px]"
      >
        {icon && (
          <div className="text-slate-500">
            {icon}
          </div>
        )}
        <div className="flex items-center justify-between space-x-2 min-w-[120px]">
          <span className="text-[13px] font-medium text-slate-700 whitespace-nowrap">
            {selectedOption?.label}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-full min-w-[180px] bg-white border border-gray-300 rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2.5 my-0.5 text-[13px] cursor-pointer flex items-center justify-between rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-slate-100 text-slate-900 font-bold' 
                    : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className="truncate pr-2">{opt.label}</span>
                {isActive && (
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-900 ml-1"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
