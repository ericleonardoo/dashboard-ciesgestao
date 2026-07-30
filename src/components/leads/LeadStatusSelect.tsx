'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LeadStatus, LEAD_STATUS_LABELS } from '@/lib/validation/lead-schema';
import { ChevronDown } from 'lucide-react';

interface LeadStatusSelectProps {
  value: LeadStatus;
  onChange: (newStatus: LeadStatus) => void;
  statusColors?: Record<LeadStatus, string>;
}

export default function LeadStatusSelect({ value, onChange, statusColors }: LeadStatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    
    function handleScroll() {
      if (isOpen) setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (status: LeadStatus) => {
    onChange(status);
    setIsOpen(false);
  };

  const currentLabel = LEAD_STATUS_LABELS[value]?.label || value;
  const colorClass = statusColors?.[value] || LEAD_STATUS_LABELS[value]?.color || 'bg-slate-100 text-slate-700';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none transition-colors cursor-pointer ${colorClass} hover:opacity-80`}
      >
        <span>{currentLabel}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="absolute w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-[9999] p-1 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto"
          style={{ top: coords.top, left: coords.left }}
        >
          {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((statusKey) => {
            const isActive = statusKey === value;
            const itemColor = statusColors?.[statusKey] || LEAD_STATUS_LABELS[statusKey].color;
            return (
              <div
                key={statusKey}
                onClick={() => handleSelect(statusKey)}
                className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  isActive 
                    ? itemColor
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {LEAD_STATUS_LABELS[statusKey].label}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
