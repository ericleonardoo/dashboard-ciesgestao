import React, { useState, useRef, useEffect } from 'react';
import { LeadStatus } from '@/lib/validation/lead-schema';
import { ChevronDown } from 'lucide-react';

interface LeadStatusSelectProps {
  value: LeadStatus;
  onChange: (newStatus: LeadStatus) => void;
  statusColors: Record<LeadStatus, string>;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  em_atendimento: 'Em Atendimento',
  matriculado: 'Matriculado',
  perdido: 'Perdido',
};

export default function LeadStatusSelect({ value, onChange, statusColors }: LeadStatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (status: LeadStatus) => {
    onChange(status);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none transition-colors cursor-pointer ${statusColors[value]} hover:opacity-80`}
      >
        <span>{STATUS_LABELS[value]}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1 animate-in fade-in zoom-in-95 duration-100">
          {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((status) => {
            const isActive = status === value;
            return (
              <div
                key={status}
                onClick={() => handleSelect(status)}
                className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  isActive 
                    ? statusColors[status] // Aplica a mesma cor do badge se tiver ativo
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {STATUS_LABELS[status]}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
